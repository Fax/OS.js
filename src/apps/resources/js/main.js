/**
 * JavaScript Window Manager
 *
 * @package OSjs.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  // Override for browsers without console
  if (!window.console) console = {log:function() {}, info:function(){}, error:function(){}};
  if ( !window.console.group ) {
    window.console.group = function() { console.log(arguments); };
  }
  if ( !window.console.groupEnd ) {
    window.console.groupEnd = function() { console.log(arguments); };
  }

  /**
   * CSS
   */
  var ZINDEX_MENU         = 100000000;
  var ZINDEX_RECT         = 100000000;
  var ZINDEX_TOOLTIP      = 100000001;
  var ZINDEX_PANEL        = 1000000;
  var ZINDEX_WINDOW       = 10;
  var ZINDEX_WINDOW_MAX   = 88888889;
  var ZINDEX_WINDOW_ONTOP = 90000000;
  var ZINDEX_LOADING      = 1000100;

  /**
   * Local settings
   */
  var ENABLE_CACHE       = false;
  var SETTING_REVISION   = 20;
  var ENABLE_LOGIN       = false;
  var ANIMATION_SPEED    = 400;
  var TEMP_COUNTER       = 1;
  var TOOLTIP_TIMEOUT    = 300;

  /**
   * Compability
   */
  var SUPPORT_LSTORAGE = (('localStorage' in window) && window['localStorage'] !== null);
  var SUPPORT_SSTORAGE = (('sessionStorage' in window) && window['sessionStorage'] !== null);
  var SUPPORT_GSTORAGE = (('globalStorage' in window) && window['globalStorage'] !== null);
  var SUPPORT_DSTORAGE = (('openDatabase' in window) && window['openDatabase'] !== null);
  var SUPPORT_CANVAS   = (!!document.createElement('canvas').getContext);
  var SUPPORT_VIDEO    = (!!document.createElement('video').canPlayType);
  var SUPPORT_AUDIO    = (!!document.createElement('audio').canPlayType);
  var SUPPORT_SOCKET   = ('WebSocket' in window && window['WebSocket'] !== null);

  /**
   * Local references
   */
  var _Core            = null;
  var _Resources       = null;
  var _Settings        = null;
  var _Desktop         = null;
  var _Window          = null;
  var _Tooltip         = null;
  var _Processes       = [];
  var _TopIndex        = (ZINDEX_WINDOW + 1);
  var _OnTopIndex      = (ZINDEX_WINDOW_ONTOP + 1);


  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Application Crash Dialog handler
   */
  function CrashApplication(app_name, application, ex) {
    try {
      _Desktop.addWindow(new CrashDialog(application, ex.message, ex.stack, ex));
      try {
        application._running = true; // Workaround
        application.kill();
      } catch ( eee ) {}
    } catch ( ee ) {
      API.system.dialog("error", "Application '" + app_name + "' has crashed with error '" + ex + "'!");
    }
  }

  /**
   * Application Launch handler
   */
  function LaunchApplication(app_name, args, windows, callback, callback_error) {
    callback = callback || function() {};
    callback_error = callback_error || function() {};

    API.ui.cursor("wait");

    $.post("/", {'ajax' : true, 'action' : 'load', 'app' : app_name}, function(data) {
      if ( data.success ) {
        _Resources.addResources(data.result.resources, function() {

          if ( window[app_name] ) {
            var crashed = false;
            var application;

            try {
              application = new window[app_name](GtkWindow, Application, API, args, windows);
              application._uuid  = data.result.uuid;
              application._checkCompability();
            } catch ( ex ) {
              CrashApplication(app_name, application, ex);
              crashed = true;
            }

            if ( !crashed ) {
              setTimeout(function() {
                try {
                  application.run();
                } catch ( ex ) {
                  CrashApplication(app_name, application, ex);
                }
              }, 100);
            }
          } else {
            var error = "Application Script not found!";
            API.system.dialog("error", error);
            callback_error(error);
          }

          setTimeout(function() {
            API.ui.cursor("default");
          }, 50);
        });
      } else {
        API.system.dialog("error", data.error);
        callback_error(data.error);

        setTimeout(function() {
          API.ui.cursor("default");
        }, 50);
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Public API
   *
   * TODO: Deprecate api calls to dialogs. They are in application
   *
   * @object
   */
  var API = {

    'loading' : {
      'show' : function() {
        $("#Loading").show();
      },

      'hide' : function() {
        setTimeout(function() {
          $("#Loading").fadeOut(ANIMATION_SPEED);
        }, 100);
      },

      'progress' : function(v) {
        $("#LoadingBar").progressbar({
          value : v
        });
      }
    },

    //
    // API: USER INTEFACE
    //

    'ui' : {
      'windows' : {
        'tile' : function() {
          _Desktop.sortWindows('tile');
        }
      },

      'cursor' : (function() {
        var ccursor = "default";

        return function(c, el) {
          //var cname = sprintf("url('/img/cursors/%s.png'), %s", c, c);
          var cname = c;

          if ( el ) {
            $(el).css("cursor", cname);
            return;
          }

          if ( c !== ccursor ) {
            $("body").css("cursor", cname);
          }

          ccursor = c;
        };
      })(),

      'rectangle' : (function() {
        var startX   = -1;
        var startY   = -1;
        var rect     = false;
        var callback = function() {};

        // NOTE: Your 'mouseup' event must fire on global document object!!!
        return {
          'init' : function(ev, c) {
            if ( !rect ) {
              $("#ContextRectangle").css({
                'top'    : '-1000px',
                'left'   : '-1000px',
                'width'  : '0px',
                'height' : '0px'
              }).show();

              startX = ev.pageX;
              startY = ev.pageY;
              rect = true;
              callback = c || function() {};

              //ev.preventDefault();
            }
          },

          'hide' : function(ev) {
            if ( rect ) {
              var x = Math.min(ev.pageX, startX);
              var y = Math.min(ev.pageY, startY);
              var w = Math.abs(ev.pageX - startX);
              var h = Math.abs(ev.pageY - startY);

              callback(x, y, w, h);

              $("#ContextRectangle").css({
                'top'    : '-1000px',
                'left'   : '-1000px',
                'width'  : '0px',
                'height' : '0px'
              }).hide();

              startX = -1;
              startY = -1;
              rect = false;
            }
          },

          'update' : function(ev) {
            if ( rect ) {
              var x = Math.min(ev.pageX, startX);
              var y = Math.min(ev.pageY, startY);
              var w = Math.abs(ev.pageX - startX);
              var h = Math.abs(ev.pageY - startY);

              $("#ContextRectangle").css({
                'left'   : x + 'px',
                'top'    : y + 'px',
                'width'  : w + 'px',
                'height' : h + 'px'
              });

              //ev.preventDefault();
            }
          }

        };
      })()
    },

    //
    // API: SYSTEM
    //

    'system' : {
      'run' : function(path, mime) {
        if ( mime ) {
          if ( mime == "ajwm/application" ) {
            var expl = path.split("/");
            var name = expl[expl.length - 1];
            API.system.launch(name);
            return;
          }

          var apps = _Settings._get("system.app.registered", true);
          var found = [];
          var list = [];
          var inmime = mime.split("/");

          var app, check, mtype;
          for ( var i in apps ) {
            if ( apps.hasOwnProperty(i) ) {
              app = apps[i];
              app.name = i; // append
              if ( app.mime.length ) {
                for ( check in app.mime ) {
                  if ( app.mime.hasOwnProperty(check) ) {
                    mtype = app.mime[check].split("/");
                    if ( mtype[1] == "*" ) {
                      if ( mtype[0] == inmime[0] ) {
                        found.push(i);
                        list.push(app);
                      }
                    } else {
                      if ( app.mime[check] == mime ) {
                        found.push(i);
                        list.push(app);
                      }
                    }
                  }
                }
              }
            }
          }

          function __run(mapp) {
            API.system.launch(mapp, {'path' : path, 'mime' : mime});
          }

          var browse = [];
          if ( found.length ) {
            console.info("=> API found suited application(s) for", mime, ":", found);
            if ( found.length == 1 ) {
              __run(found[0]);
            } else {
              API.system.dialog_launch(list, function(mapp, set_default) {
                __run(mapp);
              });
            }
          } else {
            API.system.dialog("error", "Found no suiting application for '" + path + "' (" + mime + ")"); // TODO: Ask for app
          }
        }
      },

      'launch' : function(app_name, args, windows) {
        args = args || {};
        if ( args.length !== undefined && !args.length ) {
          args = {};
        }
        windows = windows || {};

        var wins = _Desktop.stack;
        for ( var i = 0; i < wins.length; i++ ) {
          if ( wins[i].app && wins[i].app._name == app_name ) {
            if ( wins[i]._is_orphan ) {
              console.info("=> API launch denied", "is_orphan");
              _Desktop.focusWindow(wins[i]);
              return;
            }
          }
        }

        console.info("=> API launching", app_name, args);
        LaunchApplication(app_name, args, windows);
      },

      'call' : function(method, argv, callback, show_alert) {
        show_alert = (show_alert === undefined) ? true : (show_alert ? true : false);

        $.post("/", {'ajax' : true, 'action' : 'call', 'method' : method, 'args' : argv}, function(data) {
          if ( data.success ) {
            callback(data.result, null);
          } else {
            if ( show_alert ) {
              API.system.dialog("error", data.error);
            }
            callback(null, data.error);
          }
        });

        console.info("=> API Call", method, argv);
      },

      'dialog' : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
        type = type || "error";
        message = message || "Unknown error";

        console.info("=> API Dialog", type);

        return _Desktop.addWindow(new Dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
      },

      'dialog_rename' : function(path, clb_finish) {
        console.info("=> API Rename Dialog");

        return _Desktop.addWindow(new RenameOperationDialog(path, clb_finish));
      },

      'dialog_upload' : function(path, clb_finish, clb_progress, clb_cancel) {
        console.info("=> API Upload Dialog");

        return _Desktop.addWindow(new UploadOperationDialog(path, clb_finish, clb_progress, clb_cancel));
      },

      'dialog_file' : function(clb_finish, mime_filter, type, cur_dir) {
        mime_filter = mime_filter || [];
        type = type || "open";
        cur_dir = cur_dir || "/";

        console.info("=> API File Dialog");

        return _Desktop.addWindow(new FileOperationDialog(type, mime_filter, clb_finish, cur_dir));
      },

      'dialog_launch' : function(list, clb_finish) {
        console.info("=> API Launch Dialog");

        return _Desktop.addWindow(new LaunchOperationDialog(list, clb_finish));
      },

      'dialog_color' : function(start_color, clb_finish) {
        console.info("=> API Color Dialog");

        return _Desktop.addWindow(new ColorOperationDialog(start_color, clb_finish));
      }


    },

    //
    // API: APPLICATION
    //

    'application' : {
      'context_menu' : (function() {

        var inited = false;
        var cm = null;

        function _destroy() {
          if ( cm !== null ) {
            cm.destroy();
          }

          cm = null;
        }

        return function(ev, items, where, which, mpos, mtop) {
          which = which || 3;
          mpos = mpos || false;
          mtop = mtop || 20;

          if ( inited === false ) {
            // $("#ContextMenu").hide()
            $(document).click(function(ev) {
              if ( !$(ev.target).filter(function(){ return $(this).parents(".Menu").length; }).length ) {
                _destroy();
              }
            });

            initied = true;
          }

          var ewhich = ev.which || 1;
          if ( ewhich === which ) {
            _destroy();

            cm = new Menu(where);
            forEach(items, function(i, it) {
              if ( it == "---" ) {
                cm.create_separator();
              } else {
                cm.create_item(it. title, it.icon, it.method, it.disabled, it.attribute);
              }
            });

            var off = mpos ? ({'left' : ev.pageX, 'top' : ev.pageY - 20}) : $(where).offset();
            $("#ContextMenu").css(
              {
                "left" :off.left + "px",
                "top" : off.top + mtop + "px"
              }
            ).html(cm.$element).show();

            var h = $("#ContextMenu").height();
            var m = $(document).height();

            if ( off.top + h > m ) {
              $("#ContextMenu").css({"top" : (m - h - 40) + "px"});
            }

            ev.stopPropagation();
            ev.preventDefault();

            _Tooltip.hide();

            return false;
          }

          return true;
        };

      })()
    },

    //
    // API: USER
    //

    'user' : {
      'settings' : {
        'save' : function(settings) {
          _Settings._apply(settings);
          _Desktop.applySettings();
        },

        'type' : function(k) {
          return _Settings.getType(k);
        },

        'get' : function(k) {
          return _Settings._get(k);
        },

        'options' : function(k) {
          if ( API.user.settings.type(k) == "array" ) {
            return _Settings._get(k, true);
          }
          return false;
        }
      },

      'logout' : function(save) {
        console.info("=> API logging out", save);

        API.session.save(save);

        API.session.shutdown();
      }
    },

    //
    // API: SESSION
    //

    'session' : {
      'processes' : function() {
        var now = (new Date()).getTime();
        var procs = [];

        var i = 0;
        var l = _Processes.length;
        var p, icon, title;
        if ( l ) {
          for ( i; i < l; i++ ) {
            p = _Processes[i];

            if ( p !== undefined ) {
              var ckill = (function(pp) {
                return function() {
                  return pp.kill();
                };
              })(p);

              procs.push({
                'pid'     : p._pid,
                'name'    : p._name,
                'uuid'    : p._uuid,
                'time'    : (now - p._started.getTime()),
                'icon'    : p._proc_icon,
                'title'   : p._proc_name,
                'locked'  : p._locked,
                //'windows' : (p instanceof Application ? p._windows : []),
                'kill'    : ckill
              });
            }
          }
        }

        return procs;
      },

      'save' : function(save) {
        save = save || false;
        var sess = save ? _Desktop.getSession() : {};

        console.info("=> API Session save");

        localStorage.setItem('session', JSON.stringify(sess));
      },

      'restore' : function() {

        if ( SUPPORT_LSTORAGE ) {
          var item = localStorage.getItem('session');
          if ( item ) {
            var session = JSON.parse(item);

            console.info("=> API restore session", session);

            var i = 0;
            var l = session.length;
            var s;

            for ( i; i < l; i++ ) {
              s = session[i];
              if ( s ) {
                API.system.launch(s.name, s.argv, s.windows);
              }
            }

          }
        }

      },

      'shutdown' : function() {
        var ssess = _Desktop.getSession();
        var ssett = _Settings.getSession();

        console.info("=> API Shutdown session");

        $.post("/", {'ajax' : true, 'action' : 'shutdown', 'session' : ssess, 'settings' : ssett}, function(data) {
          if ( data.success ) {
            setTimeout(function() {
              // FIXME: Do not use unload... make a safer way !
              $(window).unload();
            }, 100);
          } else {
            API.system.dialog("error", data.error);
          }
        });
      },

      'applications' : function() {
        return  _Settings._get("system.app.registered", true);
      }
    }

  };

  /////////////////////////////////////////////////////////////////////////////
  // Socket
  /////////////////////////////////////////////////////////////////////////////

  /**
   * WebSocket abstraction
   * @class
   */
  var Socket = Class.extend({

    /**
     * Constructor
     */
    init : function(uri) {
      this._socket = null;
      this._uri    = (uri = uri || "ws://localhost:8888");

      // Overrides
      this.on_open    = function(ev) {};
      this.on_message = function(ev, js, data, err) {};
      this.on_close   = function(ev) {};

      console.group("Socket::init()");
      console.log("Support", SUPPORT_SOCKET);
      console.log("URI", uri);
      console.groupEnd();

    },

    /**
     * Destructor
     */
    destroy : function() {
      if ( this._socket ) {
        try {
          this._socket.close();
        } catch ( e ) {} // FIXME
        this._socket = null;
      }
    },

    /**
     * Base onopen event
     * @return void
     */
    _on_open : function(ev) {
      console.log("Socket::open()", this);

      this.on_open(ev);
    },

    /**
     * Base onmessage event
     * @return void
     */
    _on_message : function(ev, data) {
      console.group("Socket::message()");
      console.log(this._uri);
      console.log(data);
      console.groupEnd();

      console.log(data.substr(0, 1));

      var js = null;
      var err = null;
      try {
        if ( data.substr(0, 1) !== "{" ) {
          data = data.substr(1, data.length);
        }
        js = JSON.parse(data);
      } catch ( e ) {
        err = e;
      } // FIXME

      this.on_message(ev, js, data, err);
    },

    /**
     * Base onclose event
     * @return void
     */
    _on_close : function(ev) {
      console.log("Socket::close()", this);

      this.on_close(ev);
    },

    /**
     * Connect
     * @return bool
     */
    connect : function() {
      var self = this;

      if ( SUPPORT_SOCKET ) {
        if ( !this._socket ) {
          console.log("Socket::connect()", this._uri);

          try {
            var ws = new WebSocket(this._uri);
            ws.onopen = function(ev) {
              self._on_open(ev);
            };
            ws.onmessage = function(ev) {
              self._on_message(ev, ev.data);
            };
            ws.onclose = function(ev) {
              self._on_close(ev);
            };

            this._socket = ws;
          } catch ( e ) {
            alert("Failed to create socket: " + e); // FIXME
          }

          return true;
        }
      }

      return false;
    },

    /**
     * Send message
     * @return void
     */
    send : function(msg) {
      if ( this._socket ) {
        console.group("Socket::send()");
        console.log(this._uri, msg);
        console.groupEnd();

        this._socket.send(msg);
      }
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // PROCESS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Process
   *
   * @class
   */
  var Process = Class.extend({

    /**
     * Constructor
     */
    init : function(name, icon, locked) {
      this._pid       = (_Processes.push(this) - 1);
      this._started   = new Date();
      this._proc_name = name || "(unknown)";
      this._proc_icon = icon || "mimetypes/exec.png";
      this._locked    = locked || false;
    },

    /**
     * Destructor
     */
    destroy : function() {
      if ( this._pid >= 0 ) {
        _Processes[this._pid] = undefined;
      }

      this._started = null;
    },

    /**
     * Kill process
     * @return bool
     */
    kill : function() {
      if ( !this._locked ) {
        this.destroy();

        return true;
      }
      return false;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // CORE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Main Process
   *
   * @class
   */
  var Core = Process.extend({

    /**
     * Constructor
     */
    init : function() {
      this._super("(Core)", "status/computer-fail.png", true);

      API.loading.show();
      API.loading.progress(5);

      _Resources = new ResourceManager();

      $.post("/", {'ajax' : true, 'action' : 'init'}, function(data) {
        if ( data.success ) {

          if ( data.result.config ) {
            ENABLE_CACHE = data.result.config.cache;
          }

          _Settings = new SettingsManager(data.result.settings);
          API.loading.progress(10);

          _Tooltip = new Tooltip();
          _Desktop = new Desktop();
          API.loading.progress(15);

          _Desktop.run();
        } else {
          alert(data.error);
        }

      });
    },


    /**
     * Destructor
     */
    destroy : function() {
      if ( _Tooltip ) {
        _Tooltip.destroy();
      }
      if ( _Desktop ) {
        _Desktop.destroy();
      }
      if ( _Settings ) {
        _Settings.destroy();
      }
      if ( _Resources ) {
        _Resources.destroy();
      }

      _Core       = null;
      _Resources  = null;
      _Settings   = null;
      _Desktop    = null;
      _Window     = null;
      _Tooltip    = null;
      _Processes  = [];
      _TopIndex   = 11;

      this._super();
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // MANAGERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Resource Manager
   * Takes care of CSS, JavaScript loading etc.
   *
   * @class
   */
  var ResourceManager = (function() {

    var _aResources = [];

    return Process.extend({

      /**
       * Constructor
       */
      init : function() {
        this.resources = [];
        this.links = [];

        /*
        window.addEventListener('offline', function() {
          if(navigator.onLine == false) {
            alert('We went offline');
          } else {
            alert('We are online again!');
          }
        }, true);
        */

        this._super("(ResourceManager)", "apps/system-software-install.png", true);
      },


      /**
       * Destructor
       */
      destroy : function() {
        forEach(this.links, function(i, el) {
          $(el).remove();
        });

        this.resources = null;
        this.links = null;

        this._super();
      },

      /**
       * Force MANIFEST update
       * @return void
       */
      updateManifest : function() {
        var cache = window.applicationCache;

        var updateCache = function() {
          cache.swapCache();
          setTimeout(function() {
            cache.removeEventListener('updateready', updateCache, false);
          }, 0);
        };

        // Swap cache with updated data
        cache.addEventListener('updateready', updateCache, false);

        // Update cached data and call updateready listener after
        if ( cache.status == cache.UPDATEREADY ) {
          cache.update();
        }

      },

      /**
       * Check if given resource is already loaded
       * @return bool
       */
      hasResource : function(res) {
        return in_array(res, this.resources);
      },

      /**
       * Add a resource (load)
       * @return void
       */
      addResource : function(res) {
        if ( this.hasResource(res) )
          return;

        var type = res.split(".");
        type = type[type.length - 1];

        var el = null;
        var ie = false;
        if ( type == "js" ) {
          el = $("<script type=\"text/javascript\" src=\"/?resource=" + res + "\"></script>");
        } else {
          if ( document.createStyleSheet ) {
            ie = true;
            el = document.createStyleSheet("/?resource=" + res);
          } else {
            el = $("<link rel=\"stylesheet\" type=\"text/css\" href=\"/?resource=" + res + "\" />");
          }
        }

        if ( !ie ) {
          $("head").append(el);
        }

        console.group("ResourceManager::addResource()");
        console.log(ie ? el : el.get(0));
        console.groupEnd();

        this.resources.push(res);
        this.links.push(el);
      },

      /**
       * Add an array with resources and call-back
       * @return void
       */
      addResources : function(res, callback) {
        var i = 0;
        var l = res.length;

        for ( i; i < l; i++ ) {
          this.addResource(res[i]);
        }

        callback();
      }
    });

  })();


  /**
   * SettingsManager
   * Uses localSettings (WebStorage) to handle session data
   *
   * @class
   */
  var SettingsManager = (function() {

    var _avail = {};
    var _stores = [];

    return Process.extend({

      /**
       * Constructor
       */
      init : function(defaults) {
        _avail = defaults;

        var rev = localStorage.getItem("SETTING_REVISION");
        var force = false;
        if ( parseInt(rev, 10) !== parseInt(SETTING_REVISION, 10) ) {
          force = true;
          localStorage.setItem("SETTING_REVISION", SETTING_REVISION);
        }

        if ( !localStorage.getItem("applications") ) {
          localStorage.setItem("applications", JSON.stringify({}));
        }

        for ( var i in _avail ) {
          if ( _avail.hasOwnProperty(i) ) {
            if ( !_avail[i].hidden ) {
              if ( force || !localStorage.getItem(i) ) {
                if ( _avail[i].type == "array" ) {
                  localStorage.setItem(i, (_avail[i].value === undefined) ? _avail[i].options : _avail[i].value);
                } else if ( _avail[i].type == "list" ) {
                  localStorage.setItem(i, JSON.stringify(_avail[i].items));
                } else {
                  localStorage.setItem(i, _avail[i].value);
                }
              }
              _stores.push(i);
            } else {
              if ( force ) {
                localStorage.removeItem(i);
              }
            }
          }
        }

        console.group("SettingsManager::init()");
        console.log(_avail);
        console.log(_stores);
        console.groupEnd();

        this._super("(SettingsManager)", "apps/system-software-update.png", true);
      },

      /**
       * Destructor
       */
      destroy : function() {
        _avail = null;

        this._super();
      },

      /**
       * Save application data
       * @return void
       */
      saveApp : function(name, props) {
        var storage = localStorage.getItem("applications");
        if ( !storage ) {
          storage = {};
        } else {
          try {
            storage = JSON.parse(storage);
          } catch ( e ) {
            storage = {};
          }
        }
        storage[name] = props;

        localStorage.setItem("applications", JSON.stringify(storage));
      },

      /**
       * Load application data
       * @return JSON
       */
      loadApp : function(name) {
        var storage = localStorage.getItem("applications");
        var res;
        if ( storage ) {
          try {
            res = JSON.parse(storage);
          } catch ( e ) {}
        }
        if ( (res instanceof Array) && (res instanceof Object) ) {
          if ( res[name] ) {
            return res[name];
          }
        }
        return {};
      },

      /**
       * Apply a changeset
       * @return void
       */
      _apply : function(settings) {
        for ( var i in settings ) {
          if ( settings.hasOwnProperty(i) ) {
            this._set(i, settings[i]);
          }
        }
      },

      /**
       * Set a storage item by key and value
       * @return void
       */
      _set : function(k, v) {
        if ( _avail[k] !== undefined ) {
          localStorage.setItem(k, v);
        }
        //  if (e == QUOTA_EXCEEDED_ERR) { (try/catch) // TODO
      },

      /**
       * Get a storage item by key
       * @return Mixed
       */
      _get : function(k, keys, jsn) {
        var ls = undefined;
        if ( _avail[k] !== undefined ) {
          if ( keys && _avail[k] ) {
            ls = _avail[k].options;
          } else {
            if ( _avail[k].hidden ) {
              ls = _avail[k].value;
            } else {
              ls = localStorage.getItem(k);
            }
          }
        }
        return jsn ? (ls ? (JSON.parse(ls)) : ls) : ls;
      },

      /**
       * Get storage item type by key
       * @return String
       */
      getType : function(key) {
        return (_avail[key] ? (_avail[key].type) : null);
      },

      /**
       * Get current Storage session data
       * @return JSON
       */
      getSession : function() {
        var exp = {};
        for ( var i = 0; i < _stores.length; i++ ) {
          exp[_stores[i]] = localStorage.getItem(_stores[i]);
        }
        return exp;
      }

    });

  })();

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Application
   * Basis for application (empty)
   *
   * @class
   */
  var Application = Process.extend({

    /**
     * Constructor
     */
    init : function(name, argv, restore) {
      this._argv         = argv || {};
      this._name         = name;
      this._uuid         = null;
      this._running      = false;
      this._root_window  = null;
      this._windows      = [];
      this._storage      = {};
      this._storage_on   = false;
      this._compability  = [];

      if ( restore === undefined || restore === true ) {
        this._restoreStorage();
      }

      console.log("Application::" + this._name + "::NULL::init()");

      this._super(name);
    },

    /**
     * Destructor
     */
    destroy : function() {
      var self = this;
      if ( this._running ) {
        if ( this._uuid ) {
          $.post("/", {'ajax' : true, 'action' : 'flush', 'uuid' : self._uuid}, function(data) {
            console.group("Application::" + self._name + "::" + self._uuid + "::destroy()");
            console.log("flushed", data);
            console.groupEnd();
          });
        }

        this._saveStorage();

        if ( this._root_window ) {
          setTimeout(function() { // NOTE: Required!
            for ( var i = 0; i < self._windows.length; i++ ) {
              self._windows[i].close();
            }

            self._root_window.close();
          }, 0);
        }

        console.log("Application::" + this._name + "::" + this._uuid + "::destroy()");

        this._running = false;
        this._storage = null;
      }

      this._super();
    },

    /**
     * Run application
     * @return void
     */
    run : function(root_window) {
      var self = this;

      if ( !this._running ) {
        if ( root_window instanceof Window ) {
          this._root_window = root_window;
          this._proc_icon = root_window._icon;

          root_window._bind("die", function() {
            self._stop();
          });
        }

        console.log("Application::" + this._name + "::" + this._uuid + "::run()");

        this._running = true;
      }
    },

    /**
     * Create Dialog: Message
     * @return void
     */
    createMessageDialog : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this._addWindow(API.system.dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
    },

    /**
     * Create Dialog: Color Chooser
     * @return void
     */
    createColorDialog : function(color, callback) {
      this._addWindow(API.system.dialog_color(color, function(rgb, hex) {
        callback(rgb, hex);
      }));
    },

    /**
     * Create Dialog: Upload File
     * @return void
     */
    createUploadDialog : function(dir, callback) {
      this._addWindow(API.system.dialog_upload(dir, function() {
        callback(dir);
      }));
    },

    /**
     * Create Dialog: File Operation Dialog
     * @return void
     */
    createFileDialog : function(callback, mimes, type, dir) {
      this._addWindow(API.system.dialog_file(function(file, mime) {
        callback(file, mime);
      }, mimes, type, dir));
    },

    /**
     * Create Dialog: Launch Application
     * @return void
     */
    createLaunchDialog : function(list, callback) {
      this._addWindow(API.system.dialog_launch(list, function(app, def) {
        callback(app, def);
      }));
    },

    /**
     * Create Dialog: Rename File
     * @return void
     */
    createRenameDialog : function(dir, callback) {
      this._addWindow(API.system.dialog_rename(dir, function(fname) {
        callback(fname);
      }));
    },

    /**
     * Check Application compabilty list and throw errors if any
     * @return void
     * @throws Exception
     */
    _checkCompability : (function() {

      function __check(key) {
        var error;

        switch ( key ) {
          case "canvas" :
            if ( !SUPPORT_CANVAS ) {
              error = "<canvas>";
            }
          break;
          case "audio" :
            if ( !SUPPORT_AUDIO ) {
              error = "<audio>";
            }
          break;
          case "video" :
            if ( !SUPPORT_VIDEO ) {
              error = "<video>";
            }
          break;

          case "localStorage" :
            if ( !SUPPORT_LSTORAGE ) {
              error = "localStorage()";
            }
          break;
          case "sessionStorage" :
            if ( !SUPPORT_SSTORAGE ) {
              error = "sessionStorage()";
            }
          break;
          case "globalStorage" :
            if ( !SUPPORT_GSTORAGE ) {
              error = "globalStorage()";
            }
          break;
          case "database" :
          case "databaseStorage" :
          case "openDatabase" :
            if ( !SUPPORT_DSTORAGE ) {
              error = "databaseStorage()";
            }
          break;

          case "ogg" :
            if ( SUPPORT_AUDIO ) {
              if ( !(!!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis')) ) {
                error = "<audio> does not support OGG/Vorbis";
              }
            } else {
              error = "<audio>";
            }
          break;

          case "mp3" :
            if ( SUPPORT_AUDIO ) {
              if ( !(!!document.createElement('audio').canPlayType('audio/mpeg')) ) {
                error = "<audio> does not support MP3";
              }
            } else {
              error = "<audio>";
            }
          break;

          case "socket" :
            if ( !SUPPORT_SOCKET ) {
              error = "WebSocket";
            }
          break;

          default :
            error = false;
          break;
        }

        return error;
      }

      return function(key) {
        var self = this;
        var error;

        if ( key ) {
          error = __check(key);
        } else {
          for ( var i = 0; i < this._compability.length; i++ ) {
            error = __check(this._compability[i]);
            if ( error ) {
              break;
            }
          }

          if ( error ) {
            throw ({'message' : "Your browser does not support '" + error + "'", 'stack' : "Application::_checkCompability(): Application name: " + self._name});
          }
        }

        return error;
      };
    })(),

    /**
     * Add a new window to application
     * @return void
     */
    _addWindow : function(win) {
      this._windows.push(win);
    },

    /**
     * Stop application
     * @return void
     */
    _stop : function() {
      if ( this._running ) {
        this.destroy();
      }
    },

    /**
     * Save Application Storage
     * @return void
     */
    _saveStorage : function() {
      if ( this._name && this._storage_on ) {
        _Settings.saveApp(this._name, this._storage);
      }
    },

    /**
     * Load Application Storage
     * @return void
     */
    _restoreStorage : function() {
      if ( this._name ) {
        this._storage = _Settings.loadApp(this._name);
        this._storage_on = true;
      }
    },

    /**
     * Clear Application Storage
     * @return void
     */
    _flushStorage : function() {
      if ( this._name ) {
        this._storage = {};

        _Settings.saveApp(this._name, this._storage);
      }
    },

    /**
     * Perform Application Event (AJAX-call to Server-Side)
     * @return void
     */
    _event : function(ev, args, callback) {
      var self = this;
      if ( this._uuid ) {
        var pargs = {'ajax' : true, 'action' : 'event', 'cname' : self._name ,'uuid' : self._uuid, 'instance' : {'name' : self._name, 'action' : ev, 'args' : args }};
        $.post("/", pargs, function(data) {

          console.group("Application::" + self._name + "::" + self._uuid + "::_event()");
          console.log(ev, args, data);
          console.groupEnd();

          callback(data.result, data.error);
        });
      }
    },

    /**
     * Get current Application session data
     * @return JSON
     */
    _getSession : function() {
      if ( this._root_window ) {
        var win = this._root_window._getSession();
        if ( win !== false ) {
          return {
            "name"    : this._name,
            "argv"    : this._argv,
            "windows" : [win]
          };
        }
      }

      return false;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // DESKTOP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Desktop
   * The desktop containing all elements
   *
   * @class
   */
  var Desktop = (function() {

    var _oldTheme = null;

    return Process.extend({

      /**
       * Constructor
       */
      init : function() {
        var self = this;

        this.$element = $("#Desktop");
        this.stack    = [];
        this.panel    = null;
        this.running  = false;
        this.bindings = {
          "window_add"     : [self.defaultHandler],
          "window_remove"  : [self.defaultHandler],
          "window_focus"   : [self.defaultHandler],
          "window_blur"    : [self.defaultHandler],
          "window_updated" : [self.defaultHandler]
        };

        $("#Desktop").mousedown(function(ev) {
          var t = ev.target || ev.srcElement;

          if ( !t || !t.id == "Desktop" ) {
            return true;
          }

          var ret = API.application.context_menu(ev, [
            {"title" : "Desktop", "disabled" : true, "attribute" : "header"},
            {"title" : "Change wallpaper", "method" : function() {
              var dir = _Settings._get("desktop.wallpaper.path");
              if ( dir ) {
                var tmp = dir.split("/");
                if ( tmp.length > 1 ) {
                  tmp.pop();
                }
                dir = tmp.join("/");
              } else {
                dir = "/";
              }
              API.system.dialog_file(function(fname) {
                _Settings._set("desktop.wallpaper.path", fname);
                _Desktop.applySettings();
              }, ["image/*"], "open", dir);
            }
          },
          {"title" : "Tile windows", "method" : function() { 
            API.ui.windows.tile();
          }}

          ], $(this), 3, true);

          if ( ev.which > 1 ) {
            ev.preventDefault();
          }

          return ret;
        });

        /*
        $("#Desktop").bind("dragover", function(ev) {
          ev.preventDefault();
          return false;
        });
        $("#Desktop").bind("dragleave", function(ev) {
          ev.preventDefault();
          return false;
        });
        $("#Desktop").bind("dragenter", function(ev) {
          ev.preventDefault();
          return false;
        });
        $("#Desktop").bind("drop", function(ev) {
          ev.preventDefault();
          var dt = ev.originalEvent.dataTransfer;
          console.log(dt, dt.getData('Text'));
          console.log(dt.getData('text/uri-list'));
          console.log(dt.getData('text/plain'));
          console.log(dt.getData('text/html'));
          return false;
        });
        */

        API.ui.cursor("default");

        this._super("(Desktop)", "places/desktop.png");
      },

      /**
       * Destructor
       */
      destroy : function() {
        try {
          $("*").unbind();
          $("*").die();
        } catch ( eee ) { }

        // Remove panel
        if ( this.panel ) {
          this.panel.destroy();
        }
        this.panel = null;

        // Remove bindings
        this.bindings = null;

        // Remove windows
        var i = 0;
        var l = this.stack.length;
        for ( i; i < l; i++ ) {
          if ( this.stack[i] ) {
            this.stack[i].destroy();
          }
        }
        this.stack = null;

        // Reset settings
        this.setWallpaper(null);

        this._super();
      },

      /**
       * Bind an event by name and callback
       * @return void
       */
      bind : function(mname, mfunc) {
        if ( this.bindings ) {
          if ( this.bindings[mname] ) {
            this.bindings[mname].push(mfunc);
          }
        }
      },

      /**
       * Call an event by name and arguments
       * @return void
       */
      call : function(mname, margs) {
        if ( this.bindings && this.bindings[mname] ) {
          var r;
          for ( var i = 0; i < this.bindings[mname].length; i++ ) {
            r = this.bindings[mname][i].call(this, mname, margs);
          }
        }
      },

      /**
       * Run DOM operations etc.
       * @return void
       */
      run : function() {
        var self = this;
        if ( this.running ) {
          return;
        }

        this.applySettings();

        API.loading.progress(30);

        // Create panel and items from localStorage
        this.panel = new Panel();
        var items = _Settings._get("desktop.panel.items", false, true);

        var el, iname, iargs, ialign;
        for ( var i = 0; i < items.length; i++ ) {
          el = items[i];
          iname  = el[0];
          iargs  = el[1];
          ialign = el[2] || "left";

          //var item = new PanelItem[iname]();
          var item;
          if ( window[iname] ) {
            item = new window[iname](_PanelItem, self, API, iargs);
          }

          if ( item ) {
            item._panel = this.panel;
            item._index = i;
            this.panel.addItem(item, ialign);
          }
        }

        API.loading.progress(40);

        API.session.restore();

        API.loading.progress(95);

        setTimeout(function() {
          API.loading.progress(100);
          API.loading.hide();
        },200);

        this.running = true;
      },

      // HANDLERS

      /**
       * Default event handler callback
       * @return bool
       */
      defaultHandler : function(ev, eargs) {
        if ( this.panel ) {
          if ( ev.match(/^window/) ) {
            this.panel.redraw(ev, eargs);
          }

          return true;
        }

        return false;
      },

      // WINDOWS

      /**
       * Add a window to the stack (and create)
       * @return Mixed
       */
      addWindow : function(win) {
        if ( win instanceof Window ) {
          var self = this;

          var AddWindowCallback = function(fresh) {
            if ( fresh ) {
              if ( !win._is_minimized && !win._is_maximized ) {
                setTimeout(function() {  // NOTE: Timeout required for Panel items to be
                                         // Correctly redrawed
                  self.focusWindow(win); // Always focus new windows
                }, 0);
              }
            }
          };

          win.create(("Window_" + this.stack.length), AddWindowCallback);

          this.stack.push(win);

          this.call("window_add", win);

          return win;
        }

        return false;
      },

      /**
       * Remove a window from the stack
       * @return void
       */
      removeWindow : function(win, destroy) {
        if ( win instanceof Window ) {
          if ( destroy ) {
            win.destroy();
          }

          var i = 0;
          var l = this.stack.length;
          var index = -1;
          for ( i; i < l; i++ ) {
            if ( this.stack[i] == win ) {
              index = i;
              break;
            }
          }

          if ( index >= 0 ) {
            this.call("window_remove", win);
            this.stack.splice(index, 1);
          }
        }
      },

      /**
       * Perform 'blur' on Window
       * @return void
       */
      blurWindow : function(win) {
        win._blur();

        this.call("window_blur", win);
      },

      /**
       * Perform 'focus' on Window
       * @return void
       */
      focusWindow : function(win) {
        if ( _Window !== null ) {
          if ( win != _Window ) {
            this.blurWindow(_Window);
          }
        }

        if ( _Window !== win ) {
          win._focus();

          this.call("window_focus", win);

          _Window = win;
        }
      },

      /**
       * Perform 'restore' on Window
       * @return void
       */
      restoreWindow : function(win) {
        this.focusWindow(win);
      },

      /**
       * Perform 'maximize' on Window
       * @return void
       */
      maximizeWindow : function(win) {
        this.focusWindow(win);
      },

      /**
       * Perform 'minimize' on Window
       * @return void
       */
      minimizeWindow : function(win) {
        this.blurWindow(win);
      },

      /**
       * Perform 'update' on Window
       * @return void
       */
      updateWindow : function(win) {
        this.call("window_updated", win);
      },

      /**
       * Sort windows on desktop (align)
       * @return void
       */
      sortWindows : function(method) {
        var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
        var top  = ppos == "top" ? 50 : 20;
        var left = 20;

        if ( method == "tile" ) {
          var last;
          for ( var i = 0; i < this.stack.length; i++ ) {
            last = this.stack[i];

            last.$element.css({
              'left' : left + 'px',
              'top'  : top + 'px'
            });
            last.left = left;
            last.top  = top;

            top += 20;
            left += 20;

            this.focusWindow(last); // FIXME
          }
        }
      },

      // SETTINGS \ SESSION

      /**
       * Apply changes from ResourceManger
       * @return void
       */
      applySettings : function() {
        var wp = _Settings._get('desktop.wallpaper.path');
        if ( wp ) {
          this.setWallpaper(wp);
        }
        var theme = _Settings._get('desktop.theme');
        if ( theme ) {
          this.setTheme(theme);
        }
        var font = _Settings._get('desktop.font');
        if ( font ) {
          this.setFont(font);
        }

        console.group("Applied used settings");
        console.log("wallpaper", wp);
        console.log("theme", theme);
        console.groupEnd();
      },

      /**
       * Set new wallpaper
       * @return void
       */
      setWallpaper : function(wp) {
        if ( wp ) {
          $("body").css("background", "url('/media" + wp + "') center center");
        } else {
          $("body").css("background", "url('/img/blank.gif')");
        }
      },

      /**
       * Set new theme
       * @return void
       */
      setTheme : function(theme) {
        var cname = "Theme" + theme.capitalize();
        var fname = "theme." + theme.toLowerCase() + ".css";

        _Resources.addResource(fname);

        if ( _oldTheme ) {
          $("body").removeClass(_oldTheme);
        }

        $("body").addClass(cname);
        _oldTheme = cname;
      },

      /**
       * Set font
       * @return void
       */
      setFont : function(font) {
        var css = $("head link[title=FontFace]");
        $(css).attr("href", "/?font=" + font);
      },

      /**
       * Get current Desktop session data
       * @return JSON
       */
      getSession : function() {
        var sess = [];

        var i = 0;
        var l = _Processes.length;
        var p, s;
        for ( i; i < l; i++ ) {
          p = _Processes[i];
          if ( p !== undefined && (p instanceof Application) ) {
            s = p._getSession();
            if ( s !== false ) {
              sess.push(s);
            }
          }
        }

        return sess;
      }


    });

  })();

  /////////////////////////////////////////////////////////////////////////////
  // TOOLTIP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Custom Tooltip Class
   *
   * @class
   */
  var Tooltip = Class.extend({

    /**
     * Constructor
     */
    init : function() {
      var self = this;
      this.$element = $("#Tooltip");

      $(document).click(function(ev) {
        self.hide();
      });

      this.ttimeout = null;
    },

    /**
     * Destructor
     */
    destroy : function() {
      // Element is in template
    },

    /**
     * Initialize a DOM-root for Tooltips
     * @return void
     */
    initRoot : function(root) {
      root.find(".TT").each(function() {
        var tip = $(this).attr("title");
        if ( tip ) {
          $(this).removeAttr("title");

          $(this).hover(function(ev) {
            _Tooltip.hoverOn(tip, this, ev);
          }, function(ev) {
            _Tooltip.hoverOff(this, ev);
          });
        }
      });
    },

    /**
     * Hover On
     * @return void
     */
    hoverOn : function(tip, el, ev) {
      if ( this.ttimeout ) {
        clearTimeout(this.ttimeout);
      }

      this.ttimeout = setTimeout(function() {
        _Tooltip.show(tip, null, ev);
      }, TOOLTIP_TIMEOUT);
    },

    /**
     * Hover Off
     * @return void
     */
    hoverOff : function(el, ev) {
      if ( this.ttimeout ) {
        clearTimeout(this.ttimeout);
      }

      this.ttimeout = setTimeout(function() {
        _Tooltip.hide();
      }, 0);
    },

    /**
     * Show tooltip
     * @return void
     */
    show : function(tip, el, ev) {
      var posX = 0;
      var posY = 0;

      if ( ev ) {
        posX = ev.pageX;
        posY = ev.pageY;
      } else if ( el ) {
        posX = $(el).offset()['left'];
        posY = $(el).offset()['top'];
      }

      this.$element.css({
        "top" : (posY + 10) + "px",
        "left" : (posX + 10) + "px"
      }).show().html(tip);
    },

    /**
     * Hide tooltip
     * @return void
     */
    hide : function() {
      this.$element.hide();
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // PANEL
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Panel
   * Panels can be added to desktop. Contains PanelItem(s) or Widgets
   *
   * @class
   */
  var Panel = Process.extend({

    /**
     * Constructor
     */
    init : function() {
      var self = this;

      this.pos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
      this.$element = $("#Panel").show();
      this.items = [];

      // Panel item dragging
      var oldPos = {'top' : 0, 'left' : 0};
      this.$element.draggable({
        axis : "y",
        snap : "body",
        snapMode : "inner",
        containment : "body",
        start : function() {
          self.$element.addClass("Blend");
          API.ui.cursor("move");
          oldPos = self.$element.offset();
        },
        stop : function() {
          self.$element.removeClass("Blend");
          API.ui.cursor("default");
          var middle = Math.round(($(document).height() - self.$element.height()) / 2);
          var bottom = $(document).height() - self.$element.height();
          var pos = self.$element.offset();

          if ( pos.top <= middle ) {
            _Settings._set("desktop.panel.position", "top");
            self.$element.removeClass("Bottom");
            self.$element.css({"top" : "0px"});
          } else {
            _Settings._set("desktop.panel.position", "bottom");
            self.$element.addClass("Bottom");
            self.$element.css({"top" : "auto", "bottom" : "0px"});
          }
        }
      });

      $(this.$element).bind("contextmenu",function(e) {
        e.preventDefault();
        return false;
      });

      this.$element.mousedown(function(ev) {

        var ret = API.application.context_menu(ev, [
          {"title" : "Panel", "disabled" : true, "attribute" : "header"},
          {"title" : "Add new item", "method" : function() {
            var pitem = new PanelItemOperationDialog(this, function(diag) {
              var items = _Settings._get("system.panel.registered", true);
              var current;
              var selected;

              for ( var name in items ) {
                if ( items.hasOwnProperty(name) ) {
                  var li = $("<li><img alt=\"/img/blank.gif\" /><div class=\"Inner\"><div class=\"Title\">Title</div><div class=\"Description\">Description</div></div></li>");
                  li.find("img").attr("src", items[name].icon);
                  li.find(".Title").html(items[name].title);
                  li.find(".Description").html(items[name].description);

                  (function(litem, iname, iitem) {
                    litem.click(function() {
                      if ( current && current != this ) {
                        $(current).removeClass("Current");
                      }
                      $(this).addClass("Current");
                      current = this;
                      selected = iname;

                      //diag.$element.find(".DialogButtons .Ok").removeAttr("disabled");
                    });
                  })(li, name, items[name]);

                  diag.$element.find(".DialogContent ul").append(li);
                }
              }

              diag.$element.find(".DialogButtons .Close").show();
              diag.$element.find(".DialogButtons .Ok").show().click(function() {
                if ( selected ) {
                  if ( window[selected] ) {
                    var item = new window[selected](_PanelItem, self, API, []);
                    item._panel = self;
                    item._index = self.items.length;
                    self.addItem(item, "left");
                  }
                }
              }).attr("disabled", "disabled");

            }, function() {
              self.reload();
            }, "Add new panel item", $("#OperationDialogPanelItemAdd"));

            pitem.height = 300;
            pitem._gravity = "center";
            pitem.icon = "categories/applications-utilities.png";

            _Desktop.addWindow(pitem);
          }}

        ], $(this), 3, true);

        ev.preventDefault();

        return ret;
      });

      if ( this.pos == "bottom" ) {
        this.$element.addClass("Bottom");
      } else {
        this.$element.removeClass("Bottom");
      }

      this._super("Panel");
    },

    /**
     * Destructor
     */
    destroy : function() {
      for ( var i = 0; i < this.items.length; i++ ) {
        this.items[i].destroy();
      }
      this.items = null;
      this.$element.empty().remove();

      this._super();
    },

    /**
     * Redraw PanelItems
     * @return void
     */
    redraw : function(ev, eargs) {
      var pi;
      for ( var i = 0; i < this.items.length; i++ ) {
        pi = this.items[i];
        if ( pi._redrawable ) {
          pi.redraw(ev, eargs);
        }
      }
    },

    /**
     * Add a new PanelItem
     * @return Mixed
     */
    addItem : function(i, pos) {
      if ( i instanceof _PanelItem ) {

        console.group("Panel::addItem()");
        console.log(i._name, i);
        console.groupEnd();

        var el = i.create(pos);
        if ( el ) {
          el.attr("id", "PanelItem" + this.items.length);
          this.$element.find("ul").first().append(el);

          i.run();

          this.items.push(i);

          return i;
        }
      }

      return false;
    },

    /**
     * FIXME
     */
    moveItem : function(x, p) {
      var y = (p > 0) ? x._index + 1 : x._index - 1;
      var del = this.items[y];
      if ( del ) {
        if ( p > 0 ) {
          $(x.$element).insertAfter(this.items[y].$element);
          return 0;
        } else {
          $(x.$element).insertBefore(this.items[y].$element);
        }
        return true;
      }
      return false;
    },

    /**
     * Remove a PanelItem
     * @return bool
     */
    removeItem : function(x) {
      for ( var i = 0; i < this.items.length; i++ ) {
        if ( this.items[i] === x ) {
          x.destroy();

          console.group("Panel::removeItem()");
          console.log(x._name, x);
          console.groupEnd();

          this.items.splice(i, 1);
          return true;
        }
      }
      return false;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // PANEL ITEMS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * PanelItem
   * Basis for a PanelItem
   *
   * @class
   */
  var _PanelItem = Process.extend({


    /**
     * Constructor
     */
    init : function(name, align)  {
      this._name         = name;
      this._uuid         = null;
      this._named        = name;
      this._align        = align || "AlignLeft";
      this._expand       = false;
      this._dynamic      = false;
      this._orphan       = true;
      this._crashed      = false;
      this._configurable = false;
      this._redrawable   = false;
      this._index        = -1;
      this._panel        = null;
      this.$element      = null;

      this._super(name);
    },

    /**
     * Destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.empty();
        this.$element.remove();
      }

      this._super();
    },

    /**
     * Create DOM elements etc.
     * @return $
     */
    create : function(pos) {
      var self = this;

      this.$element = $("<li></li>").attr("class", "PanelItem " + this._name);

      if ( pos ) {
        this.align = pos;
      }
      if ( this.align == "right" ) {
        this.$element.addClass("AlignRight");
      }

      this.$element.mousedown(function(ev) {

        var ret = API.application.context_menu(ev, self.getMenu(), $(this));

        ev.preventDefault();

        return ret;
      });

      return this.$element;
    },

    /**
     * Run PanelItem
     * @return void
     */
    run : function() {
      _Tooltip.initRoot(this.$element);
    },

    /**
     * Reload PanelItem
     * @return void
     */
    reload : function() {

    },

    /**
     * FIXME
     */
    update : function() {
      if ( this.align == "right" ) {
        this.$element.addClass("AlignRight");
      } else {
        this.$element.removeClass("AlignRight");
      }
    },

    /**
     * Redraw PanelItem
     * @return void
     */
    redraw : function() {
    },

    /**
     * Make PanelItem Crash
     * @return void
     */
    crash : function(error) {
      this.$element.find("*").remove();
      this.$element.addClass("Crashed");
      this.$element.html("<img alt=\"\" src=\"/img/icons/16x16/status/error.png\"/><span>" + error + "</span>");

      this._crashed = true;
    },

    /**
     * Open Configuration Dialog
     * @return void
     */
    configure : function() {
      var self = this;
      if ( self.configurable ) {
        _Desktop.addWindow(new PanelItemOperationDialog(this, function() {
          self.reload();
        }));
      }
    },

    /**
     * Get the ContextMenu
     * @return JSON
     */
    getMenu : function() {
      var self = this;
      var menu = [
        {"title" : self._named, "disabled" : true, "attribute" : "header"},
        /*
        {"title" : (self.align == "left" ? "Align to right" : "Align to left"), "method" : function() {
          self.align = (self.align == "left") ? "right" : "left";
          self.update();
        }},
        {"title" : "Move left", "method" : function() {
          self._panel.moveItem(self, -1);
        }},
        {"title" : "Move right", "method" : function() {
          self._panel.moveItem(self, 1);
        }},*/
        {"title" : "Move", "method" : function() {
        }, "disabled" : true},
        {"title" : "Remove", "method" : function() {
          API.system.dialog("confirm", "Are you sure you want to remove this item?", null, function() {
            self._panel.removeItem(self); // TODO: Save
          });
        }}
      ];

      if ( this.configurable ) {
        menu.push({
          'title' : "Configure",
          'method' : function() {
            self.configure();
          }
        });
      }

      return menu;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // WINDOW
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Window
   * Basis for an Application or Dialog.
   * This class does all the loading
   *
   * @class
   */
  var Window = Class.extend({

    /**
     * Constructor
     *
     * @param String   name       Name of window
     * @param String   dialog     Dialog type if any
     * @param Object   attrs      Extra win attributes (used to restore from sleep etc)
     */
    init : function(name, dialog, attrs) {
      if ( (attrs instanceof Array) && attrs.length ) {
        attrs = attrs[0]; // FIXME
      }

      // DOM Elements
      this.$element = null;

      // Windot temp attributes
      this._current         = false;
      this._attrs_temp      = null;
      this._attrs_restore   = attrs;
      this._created         = false;
      this._showing         = false;
      this._origtitle       = "";
      this._bindings        = {
        "die"    : [],
        "focus"  : [],
        "blur"   : [],
        "resize" : []
      };

      // Window attributes
      this._id             = null;
      this._name           = name;
      this._title          = dialog ? "Dialog" : "Window";
      this._content        = "";
      this._icon           = "emblems/emblem-unreadable.png";
      this._is_dialog      = dialog ? dialog : false;
      this._is_resizable   = dialog ? false : true;
      this._is_draggable   = true;
      this._is_scrollable  = dialog ? false :true;
      this._is_maximized   = false;
      this._is_maximizable = dialog ? false : true;
      this._is_minimized   = false;
      this._is_minimizable = dialog ? false : true;
      this._is_sessionable = dialog ? false : true;
      this._is_closable    = true;
      this._is_orphan      = false;
      this._is_ontop       = false;
      this._skip_taskbar   = false;
      this._skip_pager     = false;
      this._oldZindex      = -1;
      this._zindex         = -1;
      this._gravity        = "none";
      this._width          = -1;
      this._height         = -1;
      this._top            = -1;
      this._left           = -1;

      console.log("Window::" + name + "::init()");
    },

    /**
     * Destructor
     */
    destroy : function() {
      var self = this;

      if ( this._created ) {
        this._call("die");

        this._showing    = false;
        this._created    = false;
        this._bindings   = null;

        $(this.$element).fadeOut(ANIMATION_SPEED, function() {
          $(self.$element).empty().remove();
        });
      }

      console.log("Window::" + this._name + "::destroy()");
    },

    /**
     * Bind an event by name and callback
     * @return void
     */
    _bind : function(mname, mfunc) {
      this._bindings[mname].push(mfunc);
    },

    /**
     * Call an event by name and arguments
     * @return void
     */
    _call : function(mname) {
      if ( this._bindings ) {
        var fs = this._bindings[mname];
        if ( fs ) {
          for ( var i = 0; i < fs.length; i++ ) {
            fs[i]();
          }
        }
      }
    },

    /**
     * Create DOM elemnts etc.
     * @return $
     */
    create : function(id, mcallback) {
      var self = this;

      mcallback = mcallback || function() {};

      if ( !this._created ) {
        this._id        = id;
        this._showing   = true;
        this._origtitle = this._title;

        var fresh = true;
        var el    = this._is_dialog ? $($("#Dialog").html()) : $($("#Window").html());

        this.$element = el;

        //
        // Attributtes
        //
        el.attr("id", id);
        el.find(".WindowContent").css("overflow", this._is_scrollable ? "auto" : "hidden");

        // Content and buttons
        el.find(".WindowTopInner span").html(this._title);
        if ( this._is_dialog ) {
          el.find(".DialogContent").html(this._content).addClass(this._is_dialog);
        } else {
          el.find(".WindowTopInner img").attr("src", this.getIcon());
          el.find(".WindowContentInner").html(this._content);

          el.find(".WindowTopInner img").click(function(ev) {
            API.application.context_menu(ev, [
              {"title" : (self._is_maximized ? "Restore" : "Maximize"), "icon" : "actions/window_fullscreen.png", "disabled" : !self._is_maximizable, "method" : function() {
                if ( self._is_maximizable ) {
                  el.find(".ActionMaximize").click();
                }
              }},
              {"title" : (self._is_ontop ? "Same as other windows" : "Always on top"), "icon" : "actions/zoom-original.png", "method" : function() {
                self._ontop();
              }},
              {"title" : (self._is_minimized ? "Show" : "Minimize"), "icon" : "actions/window_nofullscreen.png", "disabled" : !self._is_minimizable, "method" : function() {
                if ( self._is_minimizable ) {
                  el.find(".ActionMinimize").click();
                }
              }},
              {"title" : "Close", "disabled" : !self._is_closable, "icon" : "actions/window-close.png", "method" : function() {
                if ( self._is_closable ) {
                  el.find(".ActionClose").click();
                }
              }}

            ], $(this), 1);

            ev.stopPropagation();
            ev.preventDefault();
          });
        }

        _Tooltip.initRoot(el.find(".WindowContent"));

        //
        // Events
        //
        el.bind('mousedown', function(ev) {
          self.focus();
          if ( ev.which > 1 ) { // Menu only NOTE
            ev.stopPropagation();
          }
        });
        if ( this._is_maximizable ) {
          el.find(".WindowTopInner").dblclick(function() {
            el.find(".ActionMaximize").click();
          });
        }

        el.find(".WindowTop").bind("contextmenu",function(e) {
          return false;
        });

        if ( this._is_closable ) {
          el.find(".ActionClose").click(function() {
            self.close();
          });
        } else {
          el.find(".ActionClose").parent().hide();
        }

        if ( this._is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            self._minimize();
          });
        } else {
          el.find(".ActionMinimize").parent().hide();
        }

        if ( this._is_maximizable ) {
          el.find(".ActionMaximize").click(function() {
            self._maximize();
          });
        } else {
          el.find(".ActionMaximize").parent().hide();
        }

        // Insert into DOM
        _Desktop.$element.append(el);

        //
        // Apply sizes, dimensions etc.
        //

        // Size and dimension
        if ( this._gravity === "center" ) {
          this._top = (($(document).height() / 2) - ($(el).height() / 2));
          this._left = (($(document).width() / 2) - ($(el).width() / 2));
        } else {
          // Find free space for new windows
          var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
          this._top = ppos == "top" ? 50 : 20;
          this._left = 20;
        }

        // Check if window has any saved attributes for override (session restore etc)
        if ( this._attrs_restore && sizeof(this._attrs_restore) ) {

          if ( this._attrs_restore.is_maximized ) {
            this._attrs_temp = {
              top : this._top,
              left : this._left,
              width : this._width,
              height : this._height
            };
          }

          this._top          = this._attrs_restore.top;
          this._left         = this._attrs_restore.left;
          this._width        = this._attrs_restore.width;
          this._height       = this._attrs_restore.height;
          this._is_minimized = this._attrs_restore.is_minimized;
          this._is_maximized = this._attrs_restore.is_maximized;
          this._is_ontop     = this._attrs_restore.is_ontop;
          this._zindex       = this._attrs_restore.zindex;

          if ( this._is_ontop ) {
            if ( this._zindex > _OnTopIndex ) {
              _OnTopIndex = this._zindex;
            }
          } else {
            if ( this._zindex > _TopIndex ) {
              _TopIndex = this._zindex;
            }
          }

          fresh = false;
        }

        if ( !isNaN(this._width) && (this._width > 0) ) {
          $(el).width(this._width + "px");
        }
        if ( !isNaN(this._height) && (this._height > 0) ) {
          $(el).height(this._height + "px");
        }
        if ( !isNaN(this._left) && (this._left > 0) && !isNaN(this._top) && (this._top > 0) ) {
          $(el).offset({'left' : (this._left), 'top' : (this._top)});
        }

        //
        // Apply fixes etc. after DOM insertion
        //

        // Fix title alignment
        var lw = this._is_dialog ? 0 : 16;
        var hw = 0;
        $(el).find(".WindowTop .WindowTopController").filter(":visible").each(function() {
          hw += parseInt($(this).width(), 10);
        });

        $(el).find(".WindowTopInner span").css({
          "padding-left" : lw + "px",
          "padding-right" : hw + "px"
        });

        // Newly created windows needs their inner dimension fixed
        if ( fresh ) {
          if ( !isNaN(this._height) && (this._height > 0) ) {
            this._resize(this._width, this._height, el);
          }
        }

        //
        // Handlers
        //

        // Add jQuery UI Handlers
        if ( this._is_draggable ) {
          el.draggable({
            handle : ".WindowTop",
            start : function(ev) {

              if ( self._is_maximized ) {
                API.ui.cursor("not-allowed");
                return false;
              }
              el.addClass("Blend");
              API.ui.cursor("move");

              return true;
            },
            stop : function(ev) {

              el.removeClass("Blend");
              API.ui.cursor("default");

              self._left = self.$element.offset()['left'];
              self._top = self.$element.offset()['top'];
            }
          }).touch({
            animate: false,
            sticky: false,
            dragx: true,
            dragy: true,
            rotate: false,
            resort: true,
            scale: false
          });
        }

        if ( this._is_resizable ) {
          el.resizable({
            handles : "se",
            start : function() {
              if ( self._is_maximized ) {
                API.ui.cursor("not-allowed");
                return false;
              }
              el.addClass("Blend");

              return true;
            },
            stop : function() {
              el.removeClass("Blend");

              self._width = parseInt(self.$element.width(), 10);
              self._height = parseInt(self.$element.height(), 10);

              self._call("resize");
            }
          });
        }

        //
        // States
        //

        if ( this._is_minimized ) {
          $(el).hide();
        }

        if ( this._zindex && this._zindex > 0 ) {
          this._shuffle(this._zindex);
        } else {
          if ( this._is_ontop ) {
            this._ontop(true);
          }
        }

        if ( this._is_maximized ) {
          this.$element.find(".ActionMaximize").parent().addClass("Active");
          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }

        this._gravitate();

        this._created = true;

        console.group("Window::" + this._name + "::create()");
        console.log(el);
        console.groupEnd();

        mcallback(fresh);

        return el;
      }

      return null;
    },

    //
    // EVENTS
    //

    /**
     * Show window (add)
     * @see Desktop::addWindow()
     * @return void
     */
    show : function() {
      if ( !this._showing ) {
        _Desktop.addWindow(this);
      }
    },

    /**
     * Close window (remove)
     * @see Desktop::removeWindow()
     * @return void
     */
    close : function() {
      if ( this._showing ) {
        _Desktop.removeWindow(this, true);
      }
    },

    /**
     * Focus window
     * @see Desktop::focusWindow()
     * @return void
     */
    focus : function() {
      _Desktop.focusWindow(this);
    },

    /**
     * Blur window
     * @see Desktop::blurWindow()
     * @return void
     */
    blur : function() {
      _Desktop.blurWindow(this);
    },

    /**
     * Set Window title
     * @return void
     */
    setTitle : function(t) {
      if ( t != this._title ) {
        this._title = t;
        this.$element.find(".WindowTopInner span").html(this._title);
        _Desktop.updateWindow(this);
      }
    },

    /**
     * Get Window title
     * @return String
     */
    getTitle : function() {
      return this._title;
    },

    /**
     * Get Window full icon path
     * @return String
     */
    getIcon : function(size) {
      size = size || "16x16";
      if ( this._icon.match(/^\/img/) ) {
        return this._icon;
      }
      return sprintf("/img/icons/%s/%s", size, this._icon);
    },

    //
    // INTERNAL METHODS
    //

    /**
     * Shuffle Window (adjust z-index)
     * @return void
     */
    _shuffle : function(zi, old) {
      if ( old ) {
        this._oldZindex = this._zindex;
      }

      zi = parseInt(zi, 10);
      if ( !isNaN(zi) && (zi > 0) ) {
        this.$element.css("z-index", zi);
        this._zindex = zi;
      }
    },

    /**
     * Set Window on-top state
     * @return void
     */
    _ontop : function(t) {
      t = (t === undefined) ? this._is_ontop : t;
      if ( !t ) {
        if ( this._oldZindex > 0 ) {
          this._shuffle(this._oldZindex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }

        this._is_ontop = false;
      } else {
        _OnTopIndex++;
        this._shuffle(_OnTopIndex, true);
        this._is_ontop = true;
      }
    },

    /**
     * Set window to focused state
     * @return void
     */
    _focus : function() {
      var focused = false;
      if ( !this._current ) {

        if ( this._is_minimized ) {
          this._minimize();
        }

        // FIXME: Roll-back values when max is reached
        if ( this._is_ontop ) {
          _OnTopIndex++;
          this._shuffle(_OnTopIndex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }

        this.$element.addClass("Current");

        focused = true;
      }

      this._call("focus");
      this._current = true;
    },

    /**
     * Set window to blurred state
     * @return void
     */
    _blur : function() {
      if ( this._current ) {
        this.$element.removeClass("Current");

        this._call("blur");
      }

      this.$element.find("textarea, input, select, button").each(function() {
        $(this).blur();
      });

      this._current = false;
    },

    /**
     * Set window to minimized state
     * @return void
     */
    _minimize : function() {
      if ( this._is_minimizable ) {
        var self = this;
        if ( this._is_minimized ) {
          this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.restoreWindow(self);
          }});

          this._is_minimized = false;
        } else {
          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.minimizeWindow(self);
          }});

          this._is_minimized = true;
        }

      }
    },

    /**
     * Set window to maximized state
     * @return void
     */
    _maximize : function() {
      if ( this._is_maximizable ) {
        if ( this._is_maximized ) {
          if ( this._attrs_temp !== null ) {
            this._top = this._attrs_temp.top;
            this._left = this._attrs_temp.left;
            this._width = this._attrs_temp.width;
            this._height = this._attrs_temp.height;

            this.$element.animate({
              'top'    : this._top + 'px',
              'left'   : this._left + 'px',
              'width'  : this._width + 'px',
              'height' : this._height + 'px'
            }, {'duration' : ANIMATION_SPEED});

            this._attrs_temp === null;
          }

          this.$element.find(".ActionMaximize").parent().removeClass("Active");
          this._is_maximized = false;

          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").show();
          }
        } else {
          this._attrs_temp = {
            'top'    : this.$element.offset()['top'],
            'left'   : this.$element.offset()['left'],
            'width'  : this.$element.width(),
            'height' : this.$element.height()
          };

          var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
          var w = parseInt($(document).width(), 10);
          var h = parseInt($(document).height(), 10);

          this._top = ppos == "top" ? 40 : 10;
          this._left = 10;
          this._width = w - 20;
          this._height = h - 50;

          this.$element.css({
            'top'    : (this._top) + 'px',
            'left'   : (this._left) + 'px'
          }).animate({
            'width'  : (this._width) + "px",
            'height' : (this._height)  + "px"
          }, {'duration' : ANIMATION_SPEED}, function() {
            _Desktop.maximizeWidow(self);
          });

          this.$element.find(".ActionMaximize").parent().addClass("Active");
          this._is_maximized = true;

          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }

      }
    },

    /**
     * Gravitate window
     * @return void
     */
    _gravitate : function(dir) {
      dir = dir || this._gravity;
      if ( dir == "center" ) {
        var el = this.$element;
        this._move(
          (($(document).width() / 2) - ($(el).width() / 2)),
          (($(document).height() / 2) - ($(el).height() / 2)) );
      }
    },

    /**
     * Move Window position
     * @return void
     */
    _move : function(left, top) {
      this._left = left;
      this._top = top;

      this.$element.css({
        "left" : left + "px",
        "top" : top + "px"
      });
    },

    /**
     * Resize window dimension
     * @return void
     */
    _resize : function(width, height, el) {
      el = el || this.$element;

      if ( height ) {
        height = height < 128 ? 128 : height;

        el.css("height", (height) + "px");
      } else {
        el.css("height", (this._height) + "px");
      }
      if ( width ) {
        width = width < 128 ? 128 : width;

        el.css("width", (width) + "px");
      } else {
        el.css("width", (this._width) + "px");
      }
    },

    /**
     * Get current Window session data
     * @return JSON
     */
    _getSession : function() {
      if ( !this._is_sessionable ) {
        return false;
      }

      return {
        is_maximized : this._is_maximized,
        is_minimized : this._is_minimized,
        is_ontop     : this._is_ontop,
        zindex       : this._zindex,
        width        : this._width,
        height       : this._height,
        top          : this._top,
        left         : this._left
      };
   }

  });

  /////////////////////////////////////////////////////////////////////////////
  // GTK+ Implementations
  /////////////////////////////////////////////////////////////////////////////


  /**
   * Gtk+: GtkWindow
   *
   * @class
   */
  var GtkWindow = Window.extend({

    /**
     * Constructor
     * @see Window
     */
    init : function(window_name, window_dialog, app, attrs) {
      this.app = app;

      this._super(window_name, window_dialog, attrs);
    },

    /**
     * Create DOM elements etc.
     * @see Window
     * @return $
     */
    create : function(id, mcallback) {
      var el = this._super(id, mcallback);
      var self = this;

      if ( el ) {

        //
        // Menus
        //

        if ( el.find(".GtkMenuBar").length ) {
          var last_menu = null;

          el.find(".GtkMenuItem, .GtkImageMenuItem, .GtkRadioMenuItem").each(function() {
            var level = ($(this).parents(".GtkMenu").length);

            $(this).hover(function() {
              $(this).addClass("Hover").find("span:first").addClass("Hover");
            }, function() {
              $(this).removeClass("Hover").find("span:first").removeClass("Hover");
            });

            $(this).addClass("Level_" + level);
            if ( level > 0 ) {
              $(this).addClass("SubItem");

              if ( $(this).find(".GtkMenu").length ) {
                $(this).addClass("Subbed");
              }
            }

            if ( level > 0 ) {
              $(this).hover(function() {
                var c = $(this).find(".GtkMenu").first();
                if ( last_menu !== c ) {
                  if ( $(this).hasClass("Level_1") || $(this).hasClass("Level_2") ) {
                    $(this).parent().find(".GtkMenu").hide();
                  }

                  c.show().css({
                    'top'  : '0px',
                    'left' : $(this).parent().width() + 'px'
                  });
                }
              }, function() {
                $(this).find(".GtkMenu").first().hide();
              }).click(function(ev) {
                if ( !$(this).hasClass("Subbed") ) {
                  el.find(".GtkMenuItem .GtkMenu").hide();
                }
                ev.stopPropagation();
              });
            } else {
              $(this).click(function(ev) {
                var c = $(this).find(".GtkMenu:first");
                if ( last_menu && c !== last_menu ) {
                  last_menu.hide();
                }
                last_menu = c.show();
              });
            }
          });

          $(document).click(function(ev) {
            var t = $(ev.target || ev.srcElement);
            if ( !$(t).closest(".GtkMenuBar").get(0) && !$(t).closest(".GtkMenu").get(0)  ) {
              el.find(".GtkMenuItem .GtkMenu").hide();
            }
          });
        }

        //
        // Elements
        //

        el.find(".GtkScale").slider();

        el.find(".GtkToolItemGroup").click(function() {
          $(this).parents(".GtkToolPalette").first().find(".GtkToolItemGroup").removeClass("Checked");

          if ( $(this).hasClass("Checked") ) {
            $(this).removeClass("Checked");
          } else {
            $(this).addClass("Checked");
          }
        });

        el.find(".GtkToggleToolButton button").click(function() {
          if ( $(this).parent().hasClass("Checked") ) {
            $(this).parent().removeClass("Checked");
          } else {
            $(this).parent().addClass("Checked");
          }
        });


        if ( SUPPORT_CANVAS ) {
          el.find(".GtkDrawingArea").append("<canvas>");
        }

        var CreateId = function() {
          var cn = "";
          var test = "";
          while ( !cn ) {
            test = "tabs-" + TEMP_COUNTER;
            if ( !document.getElementById(test) ) {
              cn = test;
            }
            TEMP_COUNTER++;
          }
          return cn;
        };

        el.find(".GtkNotebook ul:first-child li a").each(function(ind, el) {
          var href = $(el).attr("href").replace("#", "");
          var old = document.getElementById(href);
          var newn = CreateId();

          $(el).attr("href", "#" + newn);
          $(old).attr("id", newn);
        });

        el.find(".GtkNotebook").tabs();


        el.find(".GtkFileChooserButton input[type=text]").attr("disabled", "disabled");

        //
        // Box factors (LAST!)
        //

        setTimeout(function() {
          el.find("td.Fill").each(function() {
            if ( !$(this).hasClass("Expand") ) {
              var height = parseInt($(this).find(":first-child").height(), 10);
              if ( height > 0 ) {
                $(this).parent().css("height", height + "px");
              }
            }
          });
        },0);
      }

      return el;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Menu
   * Menu for Window and Context
   *
   * @class
   */
  var Menu = Class.extend({

    /**
     * Constructor
     */
    init : function(att_window) {
      this.$element = $("<ul></ul>");
      this.$element.attr("class", "Menu");
    },

    /**
     * Destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.empty().remove();
      }

      this.$element = null;
    },

    clear : function() {
      if ( this.$element ) {
        this.$element.find("li").empty().remove();
      }
    },

    create_separator : function() {
      var litem = $("<li><hr /></li>");
        litem.addClass("separator");
      this.$element.append(litem);
    },

    create_item : function(title, icon, method, disabled, aclass) {
      var self = this;
      var litem = $("<li><span><img alt=\"\" src=\"/img/blank.gif\" /></span></li>");
      if ( typeof method == "function" ) {
        if ( !disabled ) {
          litem.click(method);
        }
      } else {
        litem.find("span").attr("class", method);
      }
      if ( icon ) {
        litem.find("img").attr("src", "/img/icons/16x16/" + icon);
      } else {
        litem.find("span").hide();
      }
      litem.append(title);
      if ( disabled ) {
        $(litem).addClass("Disabled");
      }
      if ( aclass ) {
        $(litem).addClass(aclass);
      } else {
        $(litem).addClass("Default");
      }

      $(litem).click(function() {
        $(this).parents("ul.Menu").hide();
      });

      this.$element.append(litem);
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Dialog
   * Used for Alert and Confirm messages etc.
   *
   * @class
   */
  var Dialog = Window.extend({

    /**
     * Constructor
     * @see Window
     */
    init : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this.cmd_close  = cmd_close  || function() {};
      this.cmd_ok     = cmd_ok     || function() {};
      this.cmd_cancel = cmd_cancel || function() {};

      this._super("Dialog", type);
      this._width    = 200;
      this._height   = 70;
      this._gravity  = "center";
      this._content  = message;
      this._is_ontop = true;
    },

    /**
     * Create DOM elements etc
     * @see Window
     * @return $
     */
    create : function(id, mcallback) {
      var self = this;
      var el = this._super(id, mcallback);

      var dc = el.find(".DialogContent").css({
        "top" : "auto",
        "left" : "auto",
        "bottom" : "auto",
        "right" : "auto"
      }).addClass("Message");

      this._resize(dc.width() + 20, dc.height() + 50);
      this._gravitate();

      if ( this._is_dialog == "confirm" ) {
        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Ok").show();
        this.$element.find(".DialogButtons .Cancel").show();
      }

      this.$element.find(".DialogButtons .Close").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_close();
      });
      this.$element.find(".DialogButtons .Ok").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_ok();
      });
      this.$element.find(".DialogButtons .Cancel").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_cancel();
      });
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // CRASH DIALOG
  /////////////////////////////////////////////////////////////////////////////

  var CrashDialog = Window.extend({

    /**
     * Constructor
     * @see Window
     */
    init : function(app, error, trace, alternative) {
      var title = sprintf("Application '%s' crashed!", app._name);

      this._super("Crash", false);
      this._content = "<div class=\"Crash\"><span>" + title + "</span><div class=\"error\"><div><b>Error</b></div><textarea></textarea></div><div class=\"trace\"><div><b>Trace</b></div><textarea></textarea></div></div>";
      this._title = title;
      this._icon = 'status/software-update-urgent.png';
      this._is_draggable = true;
      this._is_resizable = false;
      this._is_scrollable = false;
      this._is_sessionable = false;
      this._is_minimizable = true;
      this._is_maximizable = false;
      this._is_closable = true;
      this._is_orphan = false;
      this._is_ontop = true;
      this._width = 600;
      this._height = 300;
      this._gravity = "center";

      this.error = error;
      this.trace = trace;
      this.alternative = alternative;
    },

    /**
     * Create DOM elements etc
     * @see Window
     * @return $
     */
    create : function(id, mcallback) {
     var self = this;
      var el = this._super(id, mcallback);

      $(el).find(".Crash").css({
        "position" : "absolute",
        "top" : "5px",
        "left" : "5px",
        "right" : "5px",
        "bottom" : "5px"
      });
      $(el).find(".Crash span").css({
        "font-weight" : "bold"
      });

      $(el).find(".error").css({
        "position" : "absolute",
        "top" : "20px",
        "left" : "0px",
        "right" : "0px",
        "bottom" : "140px"
      }).find("textarea").val(self.error || self.alternative);

      $(el).find(".trace").css({
        "position" : "absolute",
        "top" : "120px",
        "left" : "0px",
        "right" : "0px",
        "bottom" : "0px"
      }).find("textarea").val(self.trace);

      $(el).find("textarea").css({
        "resize" : "none",
        "position" : "absolute",
        "top" : "15px",
        "left" : "0px",
        "right" : "0px",
        "bottom" : "0px"
      });
    }


  });

  /////////////////////////////////////////////////////////////////////////////
  // OPERATION DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OperationDialog
   * Basis for extended variant of dialogs with interactions.
   *
   * @class
   */
  var OperationDialog = Window.extend({

    /**
     * Constructor
     */
    init : function(type) {
      this._super("OperationDialog", type);
      this._width          = 400;
      this._height         = 200;
      this._gravity        = "center";
      this._is_minimizable = true;
      this._skip_taskbar   = true;
    },

    /**
     * Destructor
     */
    destroy : function() {
      this._super();
    },

    /**
     * Create DOM elements etc.
     * @return void
     */
    create : function(id, mcallback) {
      this._super(id, mcallback);

      var self = this;
      self.$element.find(".DialogButtons .Close").click(function() {
        self.$element.find(".ActionClose").click();
      });
      self.$element.find(".DialogButtons .Ok").click(function() {
        self.$element.find(".ActionClose").click();
      });
      self.$element.find(".DialogButtons .Cancel").click(function() {
        self.$element.find(".ActionClose").click();
      });
    }

  });

  /**
   * OperationDialog: ColorOperationDialog
   * Color swatch, color picking etc.
   *
   * @class
   */
  var ColorOperationDialog = OperationDialog.extend({

    init : function(start_color, clb_finish) {
      this.clb_finish = clb_finish   || function() {};
      this.colorObj   = RGBFromHex(start_color  || "#ffffff");

      this._super("Color");
      this._title    = "Choose color...";
      this._icon     = "apps/style.png";
      this._content  = $("#OperationDialogColor").html();
      this._width    = 400;
      this._height   = 170;
    },

    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);

      var desc      = $(self.$element).find(".CurrentColorDesc");
      var cube      = $(self.$element).find(".CurrentColor");
      var running   = false;

      var _update   = function() {
        if ( running ) {
          self.colorObj.red   = parseInt($(self.$element).find(".SliderR").slider("value"), 10);
          self.colorObj.green = parseInt($(self.$element).find(".SliderG").slider("value"), 10);
          self.colorObj.blue  = parseInt($(self.$element).find(".SliderB").slider("value"), 10);
        }

        var hex = hexFromRGB(self.colorObj.red, self.colorObj.green, self.colorObj.blue);
        $(cube).css("background-color", "#" + hex);
        $(desc).html(sprintf("R: %03d, G: %03d, B: %03d (#%s)", self.colorObj.red, self.colorObj.green, self.colorObj.blue, hex));
      };

      this.$element.find(".DialogButtons .Close").hide().find(".DialogButtons .Cancel").show();
      this.$element.find(".DialogButtons .Ok").show().click(function() {
        self.clb_finish(self.colorObj, "#" + hexFromRGB(self.colorObj.red, self.colorObj.green, self.colorObj.blue));
      });

      $(this.$element).find(".Slider").slider({
        'min'    : 0,
        'max'    : 255,
        'step'   : 1,
        'slide'  : _update,
        'change' : _update
      });

      this.$element.find(".SliderR").slider("value", this.colorObj.red);
      this.$element.find(".SliderG").slider("value", this.colorObj.green);
      this.$element.find(".SliderB").slider("value", this.colorObj.blue);

      running = true;
    }
  });

  /**
   * OperationDialog: CopyOperationDialog
   * Status dialog for copy/move operations for files
   *
   * @class
   */
  var CopyOperationDialog = OperationDialog.extend({

    init : function(src, dest, clb_finish, clb_progress, clb_cancel) {
      this.src          = src          || null;
      this.dest         = dest         || null;
      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this._super("Copy");
      this._title    = "Copy file";
      this._content  = $("#OperationDialogCopy").html();
      this._width    = 400;
      this._height   = 170;
    },


    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);

      $(this._content).find(".ProgressBar").progressbar({
        value : 50
      });
    }

  });

  /**
   * OperationDialog: RenameOperationDialog
   * Rename file dialog
   *
   * @class
   */
  var RenameOperationDialog = OperationDialog.extend({

    init : function(src, clb_finish) {
      this.src          = src          || null;
      this.clb_finish   = clb_finish   || function() {};

      this._super("Rename");
      this._title    = "Copy file";
      this._content  = $("#OperationDialogRename").html();
      this._width    = 200;
      this._height   = 100;
    },


    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);

      var txt = this.$element.find(".OperationDialog input");
      txt.val(this.src);

      this.$element.find(".DialogButtons .Ok").show().click(function() {
        var val = txt.val();
        if ( !val ) {
          alert("A filename is required!"); // FIXME
          return;
        }
        self.clb_finish(val);
      });

      $(txt).keydown(function(ev) {
        var keyCode = ev.which || ev.keyCode;
        if ( keyCode == 13 ) {

          self.$element.find(".DialogButtons .Ok").click();
          return false;
        }
        return true;
      });


      txt.focus();
      var tmp = txt.val().split(".");
      var len = 0;
      if ( tmp.length > 1 ) {
        tmp.pop();
        len = tmp.join(".").length;
      } else {
        len = tmp[0].length;
      }
      setSelectionRangeX(txt.get(0), 0, len);
    }

  });

  /**
   * OperationDialog: UploadOperationDialog
   * Upload file dialog
   *
   * @class
   */
  var UploadOperationDialog = OperationDialog.extend({

    init : function(path, clb_finish, clb_progress, clb_cancel) {
      this.uploader = null;
      this.upload_path  = path;
      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this._super("Upload");
      this._title    = "Upload file";
      this._icon     = "actions/up.png";
      this._content  = $("#OperationDialogUpload").html();
      this._width    = 400;
      this._height   = 140;
    },

    create : function(id, mcallback) {
      this._super(id, mcallback);

      var self = this;
      $(this.$element).find(".ProgressBar").progressbar({
        value : 0
      });

      var trigger = this.$element.find(".DialogButtons .Choose").show();
      var pbar    = this.$element.find(".ProgressBar");

      this.uploader = new qq.FileUploader({
        element : trigger[0],
        action  : '/',
        params : {
          ajax   : true,
          action : 'upload',
          path : self.upload_path
        },
        onSubmit: function(id, fileName){
          $(trigger).html(fileName);
          self.$element.find("p.Status").html(sprintf("Uploading '%s'", fileName));
          return true;
        },
        onProgress: function(id, fileName, loaded, total){
          var percentage = Math.round(loaded / total * 100);
          $(pbar).progressbar({
            value : percentage
          });

          self.$element.find("p.Status").html(sprintf("Uploading '%s' %d of %d (%d%%)", fileName, loaded, total, percentage));
          self.clb_progress(fileName, loaded, total, percentage);
        },
        onComplete: function(id, fileName, responseJSON){
          self.$element.find(".ActionClose").click();

          self.clb_finish(fileName, responseJSON);
        },
        onCancel: function(id, fileName){
          API.system.dialog("error", "File upload '" + fileName + "' was cancelled!");
          self.$element.find(".ActionClose").click();

          self.clb_cancel(fileName);
        }
      });
    },

    destroy : function() {
      if ( this.uploader ) {
        this.uploader = null;
      }

      this._super();
    }

  });

  /**
   * OperationDialog: FileOperationDialog
   * Used for Open and Save operations.
   *
   * @class
   */
  var FileOperationDialog = OperationDialog.extend({

    init : function(type, argv, clb_finish, cur_dir) {
      this.aargv         = argv         || {};
      this.atype         = type         || "open";
      this.clb_finish    = clb_finish   || function() {};
      this.selected_file = null;
      this.init_dir      = cur_dir      || "/";

      this._super("File");
      this._title        = type == "save" ? "Save As..." : "Open File";
      this._icon         = type == "save" ? "actions/document-save.png" : "actions/document-open.png";
      this._content      = $("#OperationDialogFile").html();
      this._is_resizable = true;
      this._width        = 400;
      this._height       = 300;
    },

    create : function(id, mcallback) {
      var self = this;

      this._super(id, mcallback);

      var ul          = this.$element.find("ul");
      var inp         = this.$element.find("input[type='text']");
      var prev        = null;
      var current_dir = "";
      var is_save     = self.atype == "save";
      var currentFile = null;

      var readdir = function(path)
      {
        if ( path == current_dir )
          return;

        var ignores = path == "/" ? ["..", "."] : ["."];
        currentFile = null;

        API.system.call("readdir", {'path' : path, 'mime' : self.aargv, 'ignore' : ignores}, function(result, error) {
          $(ul).die();
          $(ul).unbind();

          ul.find("li").empty().remove();

          if ( error === null ) {
            var i = 0;
            for ( var f in result ) {
              if ( result.hasOwnProperty(f) ) {
                var o = result[f];
                var el = $("<li><img alt=\"\" src=\"/img/blank.gif\" /><span></span></li>");
                el.find("img").attr("src", "/img/icons/16x16/" + o.icon);
                el.find("span").html(f);
                el.addClass(i % 2 ? "odd" : "even");
                if ( o['protected'] == "1" ) {
                  el.addClass("Disabled");
                }

                (function(vo) {
                  el.click(function() {

                    if ( prev !== null && prev !== this ) {
                      $(prev).removeClass("current");
                    }

                    if ( prev !== this ) {
                      $(this).addClass("current");
                    }

                    if ( vo.type == "file" ) {
                      if ( vo['protected'] == "1" && is_save ) {
                        self.selected_file = null;
                        self.$element.find("button.Ok").attr("disabled", "disabled");
                        currentFile = null;
                        $(inp).val("");
                      } else {
                        self.selected_file = vo;
                        self.$element.find("button.Ok").removeAttr("disabled");
                        currentFile = this;
                        $(inp).val(vo.path);
                      }

                    } else {
                      self.selected_file = null;
                      $(inp).val("");
                      self.$element.find("button.Ok").attr("disabled", "disabled");

                      currentFile = null;
                    }

                    prev = this;
                  });

                  el.dblclick(function() {

                    if ( vo.type != "file" ) {
                      readdir(vo.path);
                    } else {

                      var _doSelect = function() {
                        self.selected_file = vo;
                        $(inp).val(vo.path);

                        self.$element.find("button.Ok").removeAttr("disabled");
                        self.$element.find("button.Ok").click();
                      };

                      if ( is_save ) {
                        if ( vo['protected'] == "1" ) {
                          alert("This file is protected!"); // FIXME
                        } else {
                          if ( confirm("Are you sure you want to overwrite this file?") ) { // FIXME
                            _doSelect();
                          }
                        }
                      } else {
                        _doSelect();
                      }
                    }

                  });
                })(o);

                $(ul).append(el);

                i++;
              }
            }
          }

          self.$element.find("button.Ok").attr("disabled", "disabled");
        });

        current_dir = path;
      };


      if ( !is_save ) {
        $(inp).focus(function() {
          $(this).blur();
        }).addClass("Disabled");
      }

      $(inp).keydown(function(ev) {
        var keyCode = ev.which || ev.keyCode;
        var val = $(this).val();

        if ( keyCode == 13 ) {
          if ( !is_save ) {
            if ( !self.$element.find("button.Ok").attr("disabled") ) {
              if ( currentFile ) {
                $(currentFile).trigger('dblclick');
              }
            }
          } else {
            if ( val ) {
              if ( !val.match(/^\//) ) {
                val = (current_dir == "/" ? "/" : (current_dir + "/")) + val;
              }

              self.selected_file = {
                "path" : val,
                "size" : -1,
                "mime" : "",
                "icon" : "",
                "type" : "file"
              };
              self.$element.find("button.Ok").click();
            }
          }
        }
      });

      $(inp).keyup(function(ev) {
        var keyCode = ev.which || ev.keyCode;
        var val = $(this).val();

        if ( is_save ) {
          if ( val ) {
            self.$element.find("button.Ok").removeAttr("disabled");
          } else {
            self.$element.find("button.Ok").attr("disabled", "disabled");
          }
        }
      });

      this.$element.find(".DialogButtons .Close").hide();
      this.$element.find(".DialogButtons .Cancel").show();

      this.$element.find(".DialogButtons .Ok").show().click(function() {
        if ( self.selected_file ) {
          self.clb_finish(self.selected_file.path, self.selected_file.mime);
        }
      }).attr("disabled", "disabled");

      readdir(this.init_dir);


    }

  });

  /**
   * OperationDialog: LaunchOperationDialog
   * Select application for opening file
   *
   * @class
   */
  var LaunchOperationDialog = OperationDialog.extend({

    init : function(items, clb_finish) {
      this.list         = items        || [];
      this.clb_finish   = clb_finish   || function() {};

      this._super("Launch");
      this._title    = "Select an application";
      this._content  = $("#OperationDialogLaunch").html();
      this._width    = 400;
      this._height   = 170;
    },


    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);

      var app, current;
      var selected;
      var set_default = false;

      for ( var x = 0; x < this.list.length; x++ ) {
        app = this.list[x];
        var li = $("<li><img alt=\"\" src=\"/img/icons/16x16/" + app.icon + "\" /><span>" + app.title + "</span></li>");
        li.addClass(x % 2 ? "odd" : "even");
        (function(litem, mapp) {
          li.click(function() {
            if ( current && current !== this ) {
              $(current).removeClass("current");
            }
            current = this;
            selected = mapp.name; // must be appended

            $(current).addClass("current");
            self.$element.find(".Ok").removeAttr("disabled");
          }).dblclick(function() {
            if ( !self.$element.find(".Ok").attr("disabled") ) {
              self.$element.find(".Ok").click();
            }
          });
        })(li, app);
        this.$element.find("ul").append(li);
      }

      this.$element.find(".DialogButtons .Close").hide();
      this.$element.find(".DialogButtons .Ok").show().click(function() {
        var chk = self.$element.find("input[type=checkbox]");
        if ( selected ) {
          set_default = (chk.attr("checked") || chk.val()) ? true : false;
          self.clb_finish(selected, set_default);
        }
      }).attr("disabled", "disabled");
      this.$element.find(".DialogButtons .Cancel").show();
    }

  });

  /**
   * OperationDialog: PanelItemOperationDialog
   * Opereation dialog for handling panel and panel items
   *
   * @class
   */
  var PanelItemOperationDialog = OperationDialog.extend({

    init : function(item, clb_create, clb_finish, title, copy) {
      this.item         = item         || null;
      this.type         = item instanceof Panel ? "panel" : "item";
      this.clb_finish   = clb_finish   || function() {};
      this.clb_create   = clb_create   || function() {};


      this._super("PanelItem");
      this._title    = title || "Configure " + this.type;
      this._content  = (copy || $("#OperationDialogPanelItem")).html();
      this._width    = 400;
      this._height   = 340;
    },


    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);
      this.clb_create(self);
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////


  /**
   * @unload()
   */
  $(window).unload(function() {
    if ( _Core ) {
      _Core.destroy();
      _Core = null;
    }
  });

  /**
   * @ready()
   */
  $(window).ready(function() {

    //
    // COMPABILITY CHECK
    //

    if ( !SUPPORT_LSTORAGE ) {
      alert("Your browser does not support WebStorage. Cannot continue...");

      return false;
    }

    //
    // GLOBAL EVENTS
    //

    // Global touch-movment handler
    $(document).bind('touchmove', function(e) {
      e.preventDefault();
    }, false);


    // Global context-menu handler
    $(document).bind("contextmenu",function(e) {
      // TODO: Add parameter to DOM object if Context Menu
      if ( $(e.target).hasClass("ContextMenu") || $(e.target).hasClass("Menu") || $(e.target).parent().hasClass("ContextMenu") || $(e.target).parent().hasClass("Menu") ) {
        return false;
      }

      if ( e.target.id === "Desktop" || e.target.id === "Panel" || e.target.id === "ContextMenu" ) {
        return false;
      }
      return true;
    });

    // Global keydown handler
    $(document).keydown(function(ev) {
      var key = ev.keyCode || ev.which;
      var target = ev.target || ev.srcElement;

      // ESC cancels dialogs
      if ( key === 27 ) {
        if ( _Window && _Window._is_dialog ) {
          _Window.$element.find(".ActionClose").click();
          return false;
        }
      }

      if ( target ) {
        // TAB key only in textareas
        if ( key === 9 ) {
          if ( target.tagName.toLowerCase() == "textarea" ) {
            var cc = getCaret(target);
            var val = $(target).val();

            $(target).val( val.substr(0, cc) + "\t" + val.substr(cc, val.length) );

            var ccc = cc + 1;
            setSelectionRangeX(target, ccc, ccc);

          }
          return false;
        }
      }

      return true;
    });

    $(document).mouseup(function(ev) {
      API.ui.rectangle.hide(ev);
    }).mousemove(function(ev) {
      API.ui.rectangle.update(ev);
    });

    // Global mousedown handler (cancel bubbling)
    $("#Desktop, .DesktopPanel").mousedown(function(ev) {
      var t = ev.target || ev.srcElement;
      if ( t ) {
        var tagName = t.tagName.toLowerCase();
        if ( tagName !== "input" && tagName !== "textarea" && tagName !== "select" ) {
          ev.preventDefault();
        }
      }
    }).dblclick(function(ev) {
      ev.preventDefault();
    });

    //
    // MAIN
    //

    _Core = new Core();

    return true;
  });

})($);
