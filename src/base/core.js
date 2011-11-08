/*!
 * OS.js - JavaScript Operating System - Core File
 *
 * @package OSjs.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // CONFIG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constants CSS
   */
  var ZINDEX_MENU         = 100000000;              //!< Default Menu z-index
  var ZINDEX_RECT         = 100000000;              //!< Default Rect z-index
  var ZINDEX_TOOLTIP      = 100000001;              //!< Default Tooltip z-index
  var ZINDEX_PANEL        = 1000000;                //!< Default Panel z-index
  var ZINDEX_WINDOW       = 10;                     //!< Default Window z-index
  var ZINDEX_WINDOW_MAX   = 88888889;               //!< Max Window z-index
  var ZINDEX_WINDOW_ONTOP = 90000000;               //!< Window cur ontop z-index
  var ZINDEX_LOADING      = 1000100;                //!< Loadingbar z-index
  // @endconstants

  /**
   * @constants Local settings
   */
  var ENABLE_CACHE       = false;                   //!< Enabled caching
  var SETTING_REVISION   = 26;                      //!< The settings revision
  var ENABLE_LOGIN       = false;                   //!< Use login
  var ANIMATION_SPEED    = 400;                     //!< Animation speed in ms
  var TEMP_COUNTER       = 1;                       //!< Internal temp. counter
  var TOOLTIP_TIMEOUT    = 300;                     //!< Tooltip timeout in ms
  // @endconstants

  /**
   * @constants URIs
   */
  var WEBSOCKET_URI      = "localhost:8888";        //!< WebSocket URI
  var AJAX_URI           = "/";                     //!< AJAX URI (POST)
  var RESOURCE_URI       = "/?resource=";           //!< Resource loading URI (GET)
  var LIBRARY_URI        = "/?library=";            //!< Library URI (GET)
  var THEME_URI          = "/?theme=";              //!< Themes loading URI (GET)
  var FONT_URI           = "/?font=";               //!< Font loading URI (GET)
  var CURSOR_URI         = "/?cursor=";             //!< Cursor loading URI (GET)
  // @endconstants

  /**
   * @constants Service types
   */
  var SERVICE_GET  = 0;                             //!< Service: HTTP GET
  var SERVICE_POST = 1;                             //!< Service: HTTP POST
  var SERVICE_JSON = 2;                             //!< Service: JSON (POST)
  var SERVICE_SOAP = 3;                             //!< Service: Soap
  var SERVICE_XML  = 4;                             //!< Service: XML (POST)
  // @endconstants

  /////////////////////////////////////////////////////////////////////////////
  // PRIVATE VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Local references
   */
  var _Core            = null;                            //!< Core instance
  var _Resources       = null;                            //!< ResourceManager instance
  var _Settings        = null;                            //!< SettingsManager instance
  var _Desktop         = null;                            //!< Desktop instance
  var _Window          = null;                            //!< Current Window instance
  var _Tooltip         = null;                            //!< Current Tooltip instance
  var _Menu            = null;                            //!< Current Menu instance
  var _Processes       = [];                              //!< Process instance list
  var _TopIndex        = (ZINDEX_WINDOW + 1);             //!< OnTop z-index
  var _OnTopIndex      = (ZINDEX_WINDOW_ONTOP + 1);       //!< OnTop instances index
  var _Running         = false;                           //!< Global running state

  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * LaunchPanelItem() -- PanelItem Launch handler
   * @param   int     i             Item index
   * @param   String  iname         Item name
   * @param   Mixed   iargs         Item argument(s)
   * @param   String  ialign        Item alignment
   * @param   Panel   panel         Panel instance reference
   * @return  void
   * @function
   */
  function LaunchPanelItem(i, iname, iargs, ialign, panel) {
    var reg = _Settings._get("system.panel.registered", true);
    var resources =  reg[iname] ? reg[iname]['resources'] : [];

    _Resources.addResources(resources, function() {
      if ( OSjs.PanelItems[iname] ) {
        var item = new OSjs.PanelItems[iname](_PanelItem, panel, API, iargs);
        if ( item ) {
          item._panel = panel;
          item._index = i;
          panel.addItem(item, ialign);
        }
      }

    });
  } // @endfunction

  /**
   * CrashApplication() -- Application Crash Dialog handler
   * @param   String        app_name              Application name
   * @param   Application   application           Application instance
   * @param   Exception     ex                    Exception thrown
   * @return  void
   * @function
   */
  function CrashApplication(app_name, application, ex) {
    try {
      _Desktop.addWindow(new CrashDialog(application, ex.message, ex.stack, ex));
      try {
        application._running = true; // NOTE: Workaround
        application.kill();
      } catch ( eee ) {}
    } catch ( ee ) {
      var label = OSjs.Labels.CrashApplication;
      API.system.dialog("error", sprintf(label, app_name, ex));
    }
  } // @endfunction

  /**
   * LaunchApplication() -- Application Launch handler
   * @param   String    app_name              Application name
   * @param   Mixed     args                  Application starting arguments (argv)
   * @param   Array     windows               Window list (used for restoration)
   * @param   Function  callback              Callback on success
   * @param   Function  callback_error        Callback on error
   * @return  void
   * @function
   */
  function LaunchApplication(app_name, args, windows, callback, callback_error) {
    callback = callback || function() {};
    callback_error = callback_error || function() {};

    API.ui.cursor("wait");

    $.post(AJAX_URI, {'ajax' : true, 'action' : 'load', 'app' : app_name}, function(data) {
      if ( data.success ) {
        _Resources.addResources(data.result.resources, function() {

          var app_ref = OSjs.Applications[app_name];
          if ( app_ref ) {
            var crashed = false;
            var application;

            try {
              application = new app_ref(GtkWindow, Application, API, args, windows);
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
            /*
            var error = "Application Script not found!";
            API.system.dialog("error", error);
            callback_error(error);
            */
            var errors = [];
            var eargs = [];
            for ( var x in data.result.resources ) {
              errors.push("* " + data.result.resources[x]);
            }
            for ( var a in args ) {
              eargs.push(args[a]);
            }

            CrashApplication(app_name, {
              _name : app_name
            }, {
              message : sprintf(OSjs.Labels.CrashApplicationResourceMessage, errors.join("\n")),
              stack   : sprintf(OSjs.Labels.CrashApplicationResourceStack, app_name, eargs.join(","))
            });
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
  } // @endfunction

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Public API
   *
   * @object
   */
  var API = {

    'Socket' : function() {
      return new Socket();
    },

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
        var celement = null;

        return function(c) {
          if ( c !== ccursor ) {
            $("body").attr("class", "cursor_" + c);
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
          var all_apps = [];
          for ( var i in apps ) {
            if ( apps.hasOwnProperty(i) ) {
              app = apps[i];
              app.name = i; // append
              if ( app.mimes.length ) {
                for ( check in app.mimes ) {
                  if ( app.mimes.hasOwnProperty(check) ) {
                    mtype = app.mimes[check].split("/");
                    if ( mtype[1] == "*" ) {
                      if ( mtype[0] == inmime[0] ) {
                        found.push(i);
                        list.push(app);
                      }
                    } else {
                      if ( app.mimes[check] == mime ) {
                        found.push(i);
                        list.push(app);
                      }
                    }
                  }
                }
              }
            }
            all_apps.push(app);
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
            //API.system.dialog("error", "Found no suiting application for '" + path + "' (" + mime + ")");
            API.system.dialog_launch(all_apps, function(mapp, set_default) {
              __run(mapp);
            }, true);
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

        $.post(AJAX_URI, {'ajax' : true, 'action' : 'call', 'method' : method, 'args' : argv}, function(data) {
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

      'dialog_input' : function(path, desc, clb_finish) {
        console.info("=> API Input Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.InputOperationDialog(OperationDialog, API, [path, desc, clb_finish]));
      },

      'dialog_rename' : function(path, clb_finish) {
        console.info("=> API Rename Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.RenameOperationDialog(OperationDialog, API, [path, clb_finish]));
      },

      'dialog_upload' : function(path, clb_finish, clb_progress, clb_cancel) {
        console.info("=> API Upload Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.UploadOperationDialog(OperationDialog, API, [path, clb_finish, clb_progress, clb_cancel]));
      },

      'dialog_file' : function(clb_finish, mime_filter, type, cur_dir) {
        mime_filter = mime_filter || [];
        type = type || "open";
        cur_dir = cur_dir || "/";

        console.info("=> API File Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.FileOperationDialog(OperationDialog, API, [type, mime_filter, clb_finish, cur_dir]));
      },

      'dialog_launch' : function(list, clb_finish, not_found) {
        console.info("=> API Launch Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.LaunchOperationDialog(OperationDialog, API, [list, clb_finish, not_found]));
      },

      'dialog_color' : function(start_color, clb_finish) {
        console.info("=> API Color Dialog");

        return _Desktop.addWindow(new OSjs.Dialogs.ColorOperationDialog(OperationDialog, API, [start_color, clb_finish]));
      }

    },

    //
    // API: APPLICATION
    //

    'application' : {
      'context_menu' : function(ev, items, where, which, mpos, mtop) {
          which = which || 3;
          mpos = mpos || false;
          mtop = mtop || 20;

          var ewhich = ev.which || 1;
          if ( ewhich === which ) {
            if ( _Menu ) {
              _Menu.destroy();
              _Menu = null;
            }

            _Menu = new Menu(where);
            forEach(items, function(i, it) {
              if ( it == "---" ) {
                _Menu.create_separator();
              } else {
                _Menu.create_item(it. title, it.icon, it.method, it.disabled, it.attribute);
              }
            });

            var off = mpos ? ({'left' : ev.pageX, 'top' : ev.pageY - 20}) : $(where).offset();
            $("#ContextMenu").css(
              {
                "left" :off.left + "px",
                "top" : off.top + mtop + "px"
              }
            ).html(_Menu.$element).show();

            var h = $("#ContextMenu").height();
            var m = $(document).height();

            if ( off.top + h > m ) {
              $("#ContextMenu").css({"top" : (m - h - 40) + "px"});
            }

            ev.stopPropagation();
            ev.preventDefault();

            return false;
          }

          return true;
      }
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

        console.info("=> API Session save", sess);

        localStorage.setItem('session', JSON.stringify(sess));
      },

      'restore' : function() {

        if ( OSjs.Compability.SUPPORT_LSTORAGE ) {
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

        $.post(AJAX_URI, {'ajax' : true, 'action' : 'shutdown', 'session' : ssess, 'settings' : ssett}, function(data) {
          if ( data.success ) {
            setTimeout(function() {
              OSjs.__Stop();
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
  // Server Services
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Service -- Server-Side Services
   *
   * @class
   */
  var Service = Class.extend({

    _type    : -1,     //!< Service type
    _timeout : 30,     //!< Service default timeout

    /**
     * Service::init() -- Constructor
     * @param   int     type      Service type (default = SERVICE_GET)
     * @constructor
     */
    init : function(type) {
      this._type    = parseInt(type, 10) || SERVICE_GET;
      this._timeout = 30;
    },

    /**
     * Service::destroy() -- Destroy
     * @destructor
     */
    destroy : function() {},

    /**
     * Service::call() -- Call service
     * @param   String    uri           Service URI
     * @param   Mixed     data          Service Method data/arguments (Array/Tuple depending on service type)
     * @param   int       timeout       Service Timeout in seconds (Not avail. in some services)
     * @param   Mixed     options       Service Options (Array/Tuple depending on service type)
     * @param   Function  callback      Callback function (returns [data, internal_error?])
     * @see     Server-Side documentation
     * @return  void
     */
    call : function(uri, method, data, timeout, options, callback) {
      data      = (data === undefined)    ? null            : data;
      timeout   = (timeout === undefined) ? (this._timeout) : (parseInt(timeout, 10) || this._timeout);
      options   = (options === undefined) ? {}              : options;

      if ( uri && (callback instanceof Function) ) {
        var ajax_args = {
          'ajax'      : true,
          'action'    : 'service',
          'arguments' : {
            'type'     : this._type,
            'uri'      : uri,
            'data'     : data,
            'timeout'  : timeout,
            'options'  : options
          }
        };

        $.post(AJAX_URI, ajax_args, function(data) {
          callback(data, false);
        }, function(data) {
          callback(data, true);
        });
      }
    }

  }); // @endclass

  /**
   * Socket -- WebSocket abstraction (w/TCP)
   *
   * @class
   */
  var Socket = Class.extend({

    _socket : null,       //!< Socket instance reference
    _uri    : null,       //!< Socket URI string

    /**
     * Socket::init() -- Constructor
     * @param   String      uri     Connection host/ip/uri/string
     * @constructor
     */
    init : function(uri) {
      this._socket = null;
      this._uri    = "ws://" + (uri = uri || WEBSOCKET_URI);

      // Overrides
      this.on_open    = function(ev) {};
      this.on_message = function(ev, js, data, err) {};
      this.on_close   = function(ev) {};

      console.group("Socket::init()");
      console.log("Support", OSjs.Compability.SUPPORT_SOCKET);
      console.log("URI", uri);
      console.groupEnd();

    },

    /**
     * Socket::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this._socket ) {
        try {
          this._socket.close();
        } catch ( e ) {}
        this._socket = null;
      }
    },

    /**
     * Socket::_on_open() -- Base onopen event
     * @param   Mixed     ev      WebSocket Event
     * @return  void
     */
    _on_open : function(ev) {
      console.log("Socket::open()", this);

      this.on_open(ev);
    },

    /**
     * Socket::_on_message() -- Base onmessage event
     * @param   Mixed     ev      WebSocket Event
     * @param   Mixed     data    WebSocket Data
     * @return  void
     */
    _on_message : function(ev, data) {
      console.group("Socket::message()");
      console.log(this._uri);
      console.log(data);
      console.groupEnd();

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
     * Socket::_on_close() -- Base onclose event
     * @param   Mixed     ev      WebSocket Event
     * @return  void
     */
    _on_close : function(ev) {
      console.log("Socket::close()", this);

      this.on_close(ev);
    },

    /**
     * Socket::connect() -- Connect
     * @return bool
     */
    connect : function() {
      var self = this;

      if ( OSjs.Compability.SUPPORT_SOCKET ) {
        if ( !this._socket ) {
          console.log("Socket::connect()", this._uri);

          try {
            //var ws = new WebSocket(this._uri, "draft-ietf-hybi-thewebsocketprotocol-00");
            //var ws = new WebSocket(this._uri, "hybi-00");
            //var ws = new WebSocket(this._uri, "hybi-07");
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
            API.system.dialog("error", "Failed to create socket: " + e);
          }

          return true;
        }
      }

      return false;
    },

    /**
     * Socket::send() -- Send message
     * @param   Mixed     msg     Data to send
     * @return  void
     */
    send : function(msg) {
      if ( this._socket ) {
        console.group("Socket::send()");
        console.log(this._uri, msg);
        console.groupEnd();

        this._socket.send(msg);
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PROCESS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Process -- Process Class
   *
   * @class
   */
  var Process = Class.extend({

    _pid        : -1,                     //!< Process ID
    _started    : null,                   //!< Process started date
    _proc_name  : "(unknown)",            //!< Process name identifier
    _proc_icon  : "mimetypes/exec.png",   //!< Process icon
    _locked     : false,

    /**
     * Process::init() -- Constructor
     * @param   String    name          Process Name
     * @param   String    icon          Process Icon
     * @param   bool      locked        Not stoppable by user
     * @constructor
     */
    init : function(name, icon, locked) {
      this._pid       = (_Processes.push(this) - 1);
      this._started   = new Date();
      this._proc_name = "(unknown)";
      this._proc_icon = "mimetypes/exec.png";
      this._locked    = false;

      if ( name !== undefined && name ) {
        this._proc_name = name;
      }
      if ( icon !== undefined && icon ) {
        this._proc_icon = icon;
      }
      if ( locked !== undefined ) {
        this._locked    = locked;
      }
    },

    /**
     * Process::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this._pid >= 0 ) {
        _Processes[this._pid] = undefined;
      }

      this._started = null;
    },

    /**
     * Process::kill() -- Kill process
     * @return bool
     */
    kill : function() {
      if ( !this._locked ) {
        this.destroy();

        return true;
      }
      return false;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // CORE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Core -- Main Process
   *
   * @extends Process
   * @class
   */
  var Core = Process.extend({

    /**
     * Core::init() -- Constructor
     * @constructor
     */
    init : function() {
      var self = this;

      this._super("(Core)", "status/computer-fail.png", true);

      API.loading.show();
      API.loading.progress(5);

      // Load initial data
      $.post(AJAX_URI, {'ajax' : true, 'action' : 'init'}, function(data) {
        if ( data.success ) {
          // Initialize resources
          _Resources = new ResourceManager();

          // Bind global events
          $(document).bind("keydown",     self.global_keydown);
          $(document).bind("mousedown",   self.global_mousedown);
          $(document).bind("mouseup",     self.global_mouseup);
          $(document).bind("mousemove",   self.global_mousemove);
          $(document).bind("click",       self.global_click);
          $(document).bind("dblclick",    self.global_dblclick);
          $(document).bind("contextmenu", self.global_contextmenu);
          $(document).bind('touchmove',   self.global_touchmove, false);

          // Set some global variables
          if ( data.result.config ) {
            ENABLE_CACHE = data.result.config.cache;
          }

          // Initialize settings
          _Settings = new SettingsManager(data.result.settings);
          API.loading.progress(10);

          // Initialize desktop etc.
          _Tooltip = new Tooltip();
          _Desktop = new Desktop();
          API.loading.progress(15);

          _Desktop.run();

          if ( _Settings._get("user.first-run") === "true" ) {
            _Desktop.addWindow(new BrowserDialog());
            _Settings._set("user.first-run", "false");
          }
        } else {
          alert(data.error);
        }

      });
    },

    /**
     * Core::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( _Tooltip ) {
        _Tooltip.destroy();
      }
      if ( _Menu ) {
        _Menu.destroy();
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
      _Menu       = null;
      _Processes  = [];
      _TopIndex   = 11;

      this._super();
    },

    /**
     * Core::global_keydown() -- Global Event Handler: keydown
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
     */
    global_keydown : function(ev) {
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
    },

    /**
     * Core::global_click() -- Global Event Handler: click
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_click : function(ev) {
      //ev.preventDefault(); FIXME???

      if ( _Menu ) {
        if ( _Menu instanceof Menu ) {
          var t = $(ev.target || ev.srcElement);

          if ( !t.filter(function(){ return $(this).parents(".Menu").length; }).length ) {
            _Menu.destroy();
            _Menu = null;
          }
        //} else { TODO
        }
      }

      _Tooltip.hide();
    },

    /**
     * Core::global_dblclick() -- Global Event Handler: dblclick
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_dblclick : function(ev) {
      ev.preventDefault();
    },

    /**
     * Core::global_mousedown() -- Global Event Handler: mousedown
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_mousedown : function(ev) {
      var t = ev.target || ev.srcElement;
      if ( t ) {
        var tagName = t.tagName.toLowerCase();
        if ( tagName !== "input" && tagName !== "textarea" && tagName !== "select" ) {
          ev.preventDefault();
        }
      }
    },

    /**
     * Core::global_mouseup() -- Global Event Handler: mouseup
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_mouseup : function(ev) {
      API.ui.rectangle.hide(ev);
    },

    /**
     * Core::global_mousemove() -- Global Event Handler: mousemove
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_mousemove : function(ev) {
      API.ui.rectangle.update(ev);
    },

    /**
     * Core::global_touchmove() -- Global Event Handler: touchmove
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_touchmove : function(ev) {
      ev.preventDefault();
    },

    /**
     * Core::global_contextmenu() -- Global Event Handler: contextmenu
     * @param   DOMEvent    e       DOM Event
     * @return  bool
     */
    global_contextmenu : function(e) {
      if ( $(e.target).hasClass("ContextMenu") || $(e.target).hasClass("Menu") || $(e.target).parent().hasClass("ContextMenu") || $(e.target).parent().hasClass("Menu") ) {
        return false;
      }

      if ( e.target.id === "Desktop" || e.target.id === "Panel" || e.target.id === "ContextMenu" ) {
        return false;
      }
      return true;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MANAGERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * ResourceManager -- Resource Manager
   * Takes care of CSS, JavaScript loading etc.
   *
   * @extends Process
   * @class
   */
  var ResourceManager = (function() {

    var _aResources = [];

    return Process.extend({

      resources : [],       //!< Resources array
      links     : [],       //!< Resource link array

      /**
       * ResourceManager::init() -- Constructor
       * @constructor
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
       * ResourceManager::destroy() -- Destructor
       * @destructor
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
       * ResourceManager::updateManifest() -- Force MANIFEST update
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
       * ResourceManager::hasResource() -- Check if given resource is already loaded
       * @param   String      res       Resource URI
       * @return  bool
       */
      hasResource : function(res) {
        return in_array(res, this.resources);
      },

      /**
       * ResourceManager::addResource() -- Add a resource (load)
       * @param   String      res       Resource URI
       * @return  void
       */
      addResource : function(res) {
        if ( this.hasResource(res) )
          return;

        var type = res.split(".");
        type = type[type.length - 1];

        var el = null;
        var ie = false;
        if ( type == "js" ) {
          el = $("<script type=\"text/javascript\" src=\"" + RESOURCE_URI + res + "\"></script>");
        } else {
          if ( document.createStyleSheet ) {
            ie = true;
            el = document.createStyleSheet(RESOURCE_URI + res);
          } else {
            el = $("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + RESOURCE_URI + res + "\" />");
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
       * ResourceManager::addResources() -- Add an array with resources and call-back
       * @param   Array     res         Resource URI array
       * @param   Function  callback    Call when done adding
       * @return  void
       */
      addResources : function(res, callback) {
        var i = 0;
        var l = res.length;

        for ( i; i < l; i++ ) {
          this.addResource(res[i]);
        }

        callback();
      }
    }); // @endclass

  })();


  /**
   * SettingsManager -- Settings Manager
   * Uses localSettings (WebStorage) to handle session data
   *
   * @extends Process
   * @class
   */
  var SettingsManager = (function() {

    var _avail = {};
    var _stores = [];

    return Process.extend({

      /**
       * SettingsManager::init() -- Constructor
       * @param   Object    defaults      Default settings
       * @constructor
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
       * SettingsManager::destroy() -- Destructor
       * @destructor
       */
      destroy : function() {
        _avail = null;

        this._super();
      },

      /**
       * SettingsManager::saveApp() -- Save application data
       * @param   String    name      Application name
       * @param   Object    props     Application settings
       * @return  void
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

        console.group("SettingsManager::saveApp()");
        console.log(name);
        console.log(props);
        console.groupEnd();

        return props;
      },

      /**
       * SettingsManager::loadApp() -- Load application data
       * @param   String    name      Application name
       * @return  JSON
       */
      loadApp : function(name) {
        var storage = localStorage.getItem("applications");
        var res;
        if ( storage ) {
          try {
            res = JSON.parse(storage);
          } catch ( e ) {}
        }

        if ( (res instanceof Object) ) {
          if ( res[name] ) {

            console.group("SettingsManager::loadApp()");
            console.log(name);
            console.log(res[name]);
            console.groupEnd();

            return res[name];
          }
        }

        return false;
      },

      /**
       * SettingsManager::_apply() -- Apply a changeset
       * @param   Object    settings    Settings Array
       * @return  void
       */
      _apply : function(settings) {
        for ( var i in settings ) {
          if ( settings.hasOwnProperty(i) ) {
            this._set(i, settings[i]);
          }
        }
      },

      /**
       * SettingsManager::_set() -- Set a storage item by key and value
       * @param   String    k       Settings Key
       * @param   Mixed     v       Settings Value
       * @return  void
       */
      _set : function(k, v) {
        if ( _avail[k] !== undefined ) {
          localStorage.setItem(k, v);
        }
        //  if (e == QUOTA_EXCEEDED_ERR) { (try/catch) // TODO
      },

      /**
       * SettingsManager::_get() -- Get a storage item by key
       * @param   String    k       Settings Key
       * @param   bool      keys    Return availible options
       * @param   bool      jsn     Return as parsed JSON
       * @return  Mixed
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
       * SettingsManager::getType() -- Get storage item type by key
       * @param   String    key     Settings Key
       * @return  String
       */
      getType : function(key) {
        return (_avail[key] ? (_avail[key].type) : null);
      },

      /**
       * SettingsManager::getSession() -- Get current Storage session data
       * @return JSON
       */
      getSession : function() {
        var exp = {};
        for ( var i = 0; i < _stores.length; i++ ) {
          exp[_stores[i]] = localStorage.getItem(_stores[i]);
        }
        return exp;
      }

    }); // @endclass

  })();

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Application -- The base Application class
   * Basis for application (empty)
   *
   * @see     Window
   * @extends Process
   * @class
   */
  var Application = Process.extend({

    _argv         : {},           //!< Application staring arguments (argv)
    _name         : "",           //!< Application name
    _uuid         : null,         //!< Application unique-id (used for messsagin/comm.)
    _running      : false,        //!< Application running state
    _root_window  : null,         //!< Application root Window
    _windows      : [],           //!< Application Window list
    _storage      : {},           //!< Application Storage
    _storage_on   : false,        //!< Application Storage enabled state
    _compability  : [],           //!< Application compability list

    /**
     * Application::init() -- Constructor
     * @param   String    name      Application Name
     * @param   Array     argv      Application Staring arguments (argv)
     * @constructor
     */
    init : function(name, argv) {
      this._argv        = argv || {};
      this._name        = name;
      this._uuid        = null;
      this._running     = false;
      this._root_window = null;
      this._windows     = [];
      this._storage     = {};
      this._storage_on  = false;
      this._compability = [];

      console.log("Application::" + this._name + "::NULL::init()");

      this._super(name);
    },

    /**
     * Application::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      var self = this;
      if ( this._running ) {
        if ( this._uuid ) {
          $.post(AJAX_URI, {'ajax' : true, 'action' : 'flush', 'uuid' : self._uuid}, function(data) {
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
     * Application::run() -- Run application
     * @param   Window    root_window   Bind a Window as main Window
     * @return  void
     */
    run : function(root_window) {
      var self = this;

      if ( !this._running ) {

        this._restoreStorage();
        if ( root_window instanceof Window ) {
          this._root_window = root_window;
          this._proc_icon   = root_window._icon;

          this._root_window._bind("die", function() {
            self._stop();
          });
        }

        console.log("Application::" + this._name + "::" + this._uuid + "::run()");

        this._running = true;
      }
    },

    /**
     * Application::createMessageDialog() -- Create Dialog: Message
     * @see     API.system.dialog
     * @return  void
     */
    createMessageDialog : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this._addWindow(API.system.dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
    },

    /**
     * Application::createColorDialog() -- Create Dialog: Color Chooser
     * @see     API.system.dialog_color
     * @return  void
     */
    createColorDialog : function(color, callback) {
      this._addWindow(API.system.dialog_color(color, function(rgb, hex) {
        callback(rgb, hex);
      }));
    },

    /**
     * Application::createUploadDialog() -- Create Dialog: Upload File
     * @see     API.system.dialog_upload
     * @return  void
     */
    createUploadDialog : function(dir, callback) {
      this._addWindow(API.system.dialog_upload(dir, function() {
        callback(dir);
      }));
    },

    /**
     * Application::createFileDialog() -- Create Dialog: File Operation Dialog
     * @see     API.system.dialog_file
     * @return  void
     */
    createFileDialog : function(callback, mimes, type, dir) {
      this._addWindow(API.system.dialog_file(function(file, mime) {
        callback(file, mime);
      }, mimes, type, dir));
    },

    /**
     * Application::createLaunchDialog() -- Create Dialog: Launch Application
     * @see     API.system.dialog_launch
     * @return  void
     */
    createLaunchDialog : function(list, callback) {
      this._addWindow(API.system.dialog_launch(list, function(app, def) {
        callback(app, def);
      }));
    },

    /**
     * Application::createRenameDialog() -- Create Dialog: Rename File
     * @see     API.system.dialog_rename
     * @return  void
     */
    createRenameDialog : function(dir, callback) {
      this._addWindow(API.system.dialog_rename(dir, function(fname) {
        callback(fname);
      }));
    },

    /**
     * Application::createInputDialog() -- Create Dialog: Input Box
     * @see     API.system.dialog_input
     * @return  void
     */
    createInputDialog : function(path, desc, callback) {
      this._addWindow(API.system.dialog_input(path, desc, function(fname) {
        callback(fname);
      }));
    },

    /**
     * Application::_checkCompability() -- Check Application compabilty list and throw errors if any
     * @return void
     */
    _checkCompability : (function() {

      function __check(key) {
        var error;

        switch ( key ) {
          case "canvas" :
            if ( !OSjs.Compability.SUPPORT_CANVAS ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "3d" :
          case "webgl" :
            key = webgl;
            if ( !OSjs.Compability.SUPPORT_WEBGL ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "audio" :
            if ( !OSjs.Compability.SUPPORT_AUDIO ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "video" :
            if ( !OSjs.Compability.SUPPORT_VIDEO ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;

          case "localStorage" :
            if ( !OSjs.Compability.SUPPORT_LSTORAGE ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "sessionStorage" :
            if ( !OSjs.Compability.SUPPORT_SSTORAGE ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "globalStorage" :
            if ( !OSjs.Compability.SUPPORT_GSTORAGE ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;
          case "database" :
          case "databaseStorage" :
          case "openDatabase" :
            key = "databaseStorage";
            if ( !OSjs.Compability.SUPPORT_DSTORAGE ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;

          case "ogg" :
          case "vorbis" :
            key = "ogg";
            if ( OSjs.Compability.SUPPORT_AUDIO ) {
              if ( !OSjs.Compability.SUPPORT_AUDIO_OGG ) {
                error = OSjs.Public.CompabilityErrors[key];
              }
            } else {
              error = OSjs.Public.CompabilityErrors["audio"];
            }
          break;

          case "mp3"  :
          case "mpeg" :
            key = "mp3";
            if ( OSjs.Compability.SUPPORT_AUDIO ) {
              if ( !OSjs.Compability.SUPPORT_AUDIO_MP3 ) {
                error = OSjs.Public.CompabilityErrors[key];
              }
            } else {
              error = OSjs.Public.CompabilityErrors["audio"];
            }
          break;

          case "socket" :
            if ( !OSjs.Compability.SUPPORT_SOCKET ) {
              error = OSjs.Public.CompabilityErrors[key];
            }
          break;

          case "richtext" :
            if ( !OSjs.Compability.SUPPORT_RICHTEXT ) {
              error = OSjs.Public.CompabilityErrors[key];
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
            throw ({
              'message' : sprintf(OSjs.Labels.ApplicationCheckCompabilityMessage, error),
              'stack'   : sprintf(OSjs.Labels.ApplicationCheckCompabilityStack, self._name)
            });
          }
        }

        return error;
      };
    })(),

    /**
     * Application::_addWindow() -- Add a new window to application
     * @param   Window    win     Window to add
     * @return  void
     */
    _addWindow : function(win) {
      this._windows.push(win);
    },

    /**
     * Application::_stop() -- Stop application
     * @return void
     */
    _stop : function() {
      if ( this._running ) {
        console.log("Application::" + this._name + "::" + this._uuid + "::_stop()");

        this.destroy();
      }
    },

    /**
     * Application::_saveStorage() -- Save Application Storage
     * @return void
     */
    _saveStorage : function() {
      if ( this._name && this._storage_on ) {
        this._storage = _Settings.saveApp(this._name, this._storage);
      }
    },

    /**
     * Application::_restoreStorage() -- Load Application Storage
     * @return void
     */
    _restoreStorage : function() {
      if ( this._name && this._storage_on ) {
        var s = _Settings.loadApp(this._name);
        if ( s !== false ) {
          this._storage = s;
        }
      }
    },

    /**
     * Application::_flushStorage() -- Clear Application Storage
     * @return void
     */
    _flushStorage : function() {
      if ( this._name && this._storage_on ) {
        this._storage = _Settings.saveApp(this._name, {});
      }
    },

    /**
     * Application::_event() -- Perform Application Event (AJAX-call to Server-Side)
     * @param   String    ev          The AJAX action to perform
     * @param   Mixed     args        The AJAX action argument(s)
     * @param   Function  callback    Callback to function when done
     * @return void
     */
    _event : function(ev, args, callback) {
      var self = this;
      if ( this._uuid ) {
        var pargs = {'ajax' : true, 'action' : 'event', 'cname' : self._name ,'uuid' : self._uuid, 'instance' : {'name' : self._name, 'action' : ev, 'args' : args }};
        $.post(AJAX_URI, pargs, function(data) {

          console.group("Application::" + self._name + "::" + self._uuid + "::_event()");
          console.log(ev, args, data);
          console.groupEnd();

          callback(data.result, data.error);
        });
      }
    },

    /**
     * Application::_getSession() -- Get current Application session data
     * @return JSON
     */
    _getSession : function() {
      if ( this._root_window ) {
        var wname = this._root_window._name;
        var win   = this._root_window._getSession();

        var windows = {};
        windows[wname] = win;
        if ( win !== false ) {
          return {
            "name"    : this._name,
            "argv"    : this._argv,
            "windows" : windows
          };
        }
      }

      return false;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // DESKTOP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Desktop -- Main Window Manager Class
   * The desktop containing all elements
   *
   * TODO: Rename to Window manager
   *
   * @extends Process
   * @class
   */
  var Desktop = Process.extend({

    $element : null,          //!< Desktop DOM Element
    stack    : [],            //!< Window Stack
    panel    : null,          //!< Panel instance
    running  : false,         //!< Window Manager running ?
    bindings : {},            //!< Global action bindings

    /**
     * Desktop::init() -- Constructor
     * @constructor
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
     * Desktop::destroy() -- Destructor
     * @destructor
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
     * Desktop::bind() -- Bind an event by name and callback
     * @param   String    mname     Binding name
     * @param   Function  mfunc     Binding function
     * @return  void
     */
    bind : function(mname, mfunc) {
      if ( this.bindings ) {
        if ( this.bindings[mname] ) {
          this.bindings[mname].push(mfunc);
        }
      }
    },

    /**
     * Desktop::call() -- Call an event by name and arguments
     * @param   String    mname     Binding name
     * @param   Mixed     margs     Binding arguments
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
     * Desktop::run() -- Run DOM operations etc.
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

        LaunchPanelItem(i, iname, iargs, ialign, self.panel);
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
     * Desktop::defaultHandler() -- Default event handler callback
     * @param   String    ev          Event name
     * @param   Mixed     eargs       Event argument(s)
     * @return  bool
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
     * Desktop::addWindow() -- Add a window to the stack (and create)
     * @param   Window    win       Window to add
     * @return  Mixed
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
     * Desktop::removeWindow() -- Remove a window from the stack
     * @param   Window    win       Window to remove
     * @param   bool      destroy   Destroy window
     * @return  bool
     */
    removeWindow : function(win, destroy) {
      if ( win instanceof Window ) {
        console.log("Desktop::removeWindow()", destroy, win);

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

          return true;
        }
      }

      return false;
    },

    /**
     * Desktop::blurWindow() -- Perform 'blur' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    blurWindow : function(win) {
      win._blur();

      if ( _Window === win ) {
        _Window = null;
      }

      this.call("window_blur", win);
    },

    /**
     * Desktop::focusWindow() -- Perform 'focus' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
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
     * Desktop::restoreWindow() -- Perform 'restore' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    restoreWindow : function(win) {
      this.focusWindow(win);
    },

    /**
     * Desktop::maximizeWindow() -- Perform 'maximize' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    maximizeWindow : function(win) {
      this.focusWindow(win);
    },

    /**
     * Desktop::minimizeWindow() -- Perform 'minimize' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    minimizeWindow : function(win) {
      this.blurWindow(win);
    },

    /**
     * Desktop::updateWindow() -- Perform 'update' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    updateWindow : function(win) {
      this.call("window_updated", win);
    },

    /**
     * Desktop::sortWindows() -- Sort windows on desktop (align)
     * @param   String      method      Sorting method (default = tile)
     * @return  void
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

          this.focusWindow(last);
        }
      }
    },

    // SETTINGS \ SESSION

    /**
     * Desktop::applySettings() -- Apply changes from ResourceManger
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
      var cursor = _Settings._get('desktop.cursor.theme');
      if ( cursor ) {
        this.setCursorTheme(cursor.split(" ")[0]);
      }

      console.group("Applied used settings");
      console.log("wallpaper", wp);
      console.log("theme", theme);
      console.groupEnd();
    },

    /**
     * Desktop::setWallpaper() -- Set new wallpaper
     * @param   String    wp      Wallpaper path
     * @return  void
     */
    setWallpaper : function(wp) {
      if ( wp ) {
        $("body").css("background", "url('/media" + wp + "') center center");
      } else {
        $("body").css("background", "url('/img/blank.gif')");
      }
    },

    /**
     * Desktop::setTheme() -- Set new theme
     * @param   String    theme   Theme name
     * @return  void
     */
    setTheme : function(theme) {
      var css = $("#ThemeFace");
      var href = THEME_URI + theme.toLowerCase();
      if ( $(css).attr("href") != href ) {
        $(css).attr("href", href);
      }
    },

    /**
     * Desktop::setFont() -- Set font
     * @param   String    font    Font name
     * @return  void
     */
    setFont : function(font) {
      var css = $("#FontFace");
      var href = FONT_URI + font;
      if ( $(css).attr("href") != href ) {
        $(css).attr("href", href);
      }
    },

    /**
     * Desktop::setCursorTheme() -- Set cursor theme
     * @param   String    cursor    Theme name
     * @return  void
     */
    setCursorTheme : function(cursor) {
      var css = $("#CursorFace");
      var href = CURSOR_URI + cursor.toLowerCase();
      if ( $(css).attr("href") != href ) {
        $(css).attr("href", href);
      }
    },

    /**
     * Desktop::getSession() -- Get current Desktop session data
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


  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // TOOLTIP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Tooltip -- Custom Tooltip Class
   *
   * @class
   */
  var Tooltip = Class.extend({

    $element  :  null,      //!< DOM Elemenent
    ttimeout  :  null,      //!< Timeout reference

    /**
     * Tooltip::init() -- Constructor
     * @constructor
     */
    init : function() {
      this.$element = $("#Tooltip");
      this.ttimeout = null;
    },

    /**
     * Tooltip::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      // Element is in template
    },

    /**
     * Tooltip::initRoot() -- Initialize a DOM-root for Tooltips
     * @param   DOMElement    root    Initialize this root
     * @return  void
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
     * Tooltip::hoverOn() -- Hover On
     * @param   String      tip       Tooltip
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
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
     * Tooltip::hoverOff() -- Hover Off
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
     * @return  void
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
     * Tooltip::show() -- Show tooltip
     * @param   String      tip       Tooltip
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
     * @return  void
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
     * Tooltip::hide() -- Hide tooltip
     * @return void
     */
    hide : function() {
      this.$element.hide();
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PANEL
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Panel -- The Desktop Panel Class
   * Panels can be added to desktop. Contains PanelItem(s) or Widgets
   *
   * @extends Process
   * @class
   */
  var Panel = Process.extend({

    $element    : null,       //!< DOM Element
    pos         : "",         //!< Panel Position
    items       : [],         //!< Panel Items

    /**
     * Panel::init() -- Constructor
     * @constructor
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
            var pitem = new PanelItemOperationDialog(OperationDialog, API, [this, function(diag) {
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
                  LaunchPanelItem(self.items.length, selected, [], "left", self);
                }
              }).attr("disabled", "disabled");

            }, function() {
              self.reload();
            }, "Add new panel item", $("#OperationDialogPanelItemAdd")]);

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
     * Panel::destroy() -- Destructor
     * @destructor
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
     * Panel::redraw() -- Redraw PanelItems
     * @param   String    ev          Event name
     * @param   Mixed     eargs       Event argument(s)
     * @return  void
     */
    redraw : function(ev, eargs) {
      var pi;
      if ( this.items ) {
        for ( var i = 0; i < this.items.length; i++ ) {
          pi = this.items[i];
          if ( pi._redrawable ) {
            pi.redraw(ev, eargs);
          }
        }
      }
    },

    /**
     * Panel::addItem() -- Add a new PanelItem
     * @param   _PanelItem    i       Item
     * @param   int           pos     Position index
     * @return  Mixed
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
     * Panel::removeItem() -- Remove a PanelItem
     * @param   _PanelItem    x       Item
     * @return  bool
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PANEL ITEMS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * _PanelItem -- The Panel Item Class
   * Basis for a PanelItem
   *
   * @extends Process
   * @class
   */
  var _PanelItem = Process.extend({

    $element      : null,             //!< DOM Elemeent
    _name         : "",               //!< Item name identifier
    _uuid         : null,             //!< Item UUID
    _named        : "",               //!< Readable name
    _align        : "AlignLeft",      //!< Item alignment
    _expand       : false,            //!< Expand item
    _dynamic      : false,            //!< Dynamic item
    _orphan       : true,             //!< Orphan ? (Only one instance allowed)
    _crashed      : false,            //!< Crashed ?
    _configurable : false,            //!< Configurable ?
    _redrawable   : false,            //!< Redrawable ?
    _index        : -1,               //!< Panel item Index
    _panel        : null,             //!< Panel instance reference

    /**
     * _PanelItem::init() -- Constructor
     * @param   String    name    Panel Item name
     * @param   String    align   Panel Item alignment
     * @constructor
     */
    init : function(name, align)  {
      this._name         = name;
      this._named        = name;
      this._align        = align || this._align;
      this._uuid         = null;
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
     * _PanelItem::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.empty();
        this.$element.remove();
      }

      this._super();
    },

    /**
     * _PanelItem::create() -- Create DOM elements etc.
     * @param   String    pos     Item Alignment
     * @return  $
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
     * _PanelItem::run() -- Run PanelItem
     * @return void
     */
    run : function() {
      _Tooltip.initRoot(this.$element);
    },

    /**
     * _PanelItem::reload() -- Reload PanelItem
     * @TODO
     * @return void
     */
    reload : function() {

    },

    /**
     * _PanelItem::redraw() -- Redraw PanelItem
     * @TODO
     * @return void
     */
    redraw : function() {
    },

    /**
     * _PanelItem::crash() -- Make PanelItem Crash
     * @param   String      error     Error message
     * @return  void
     */
    crash : function(error) {
      this.$element.find("*").remove();
      this.$element.addClass("Crashed");
      this.$element.html("<img alt=\"\" src=\"/img/icons/16x16/status/error.png\"/><span>" + error + "</span>");

      this._crashed = true;
    },

    /**
     * _PanelItem::configure() -- Open Configuration Dialog
     * @return void
     */
    configure : function() {
      var self = this;
      if ( self.configurable ) {
        _Desktop.addWindow(new PanelItemOperationDialog(OperationDialog, API, [this, function() {
          self.reload();
        }]));
      }
    },

    /**
     * _PanelItem::getMenu() -- Get the ContextMenu
     * @return JSON
     */
    getMenu : function() {
      var self = this;
      var menu = [
        {"title" : self._named, "disabled" : true, "attribute" : "header"},
        {"title" : "Move", "method" : function() {}, "disabled" : true},
        {"title" : "Remove", "method" : function() {
          API.system.dialog("confirm", "Are you sure you want to remove this item?", null, function() {
            self._panel.removeItem(self);
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // WINDOW
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Window -- The Main Window Class
   * Basis for an Application or Dialog.
   * This class does all the loading
   *
   * @class
   */
  var Window = Class.extend({

    $element          : null,                             //!< DOM Element
    _current          : false,                            //!< Current window ?
    _attrs_temp       : null,                             //!< Temporary Window attributes
    _attrs_restore    : null,                             //!< Restore Window attributes
    _created          : false,                            //!< Window created ?
    _showing          : false,                            //!< Window showing ?
    _origtitle        : "",                               //!< Original Window title
    _id               : null,                             //!< DOM Element ID
    _name             : "",                               //!< Window Name
    _title            : "",                               //!< Window Title
    _content          : "",                               //!< Window Content (HTML)
    _icon             : "emblems/emblem-unreadable.png",  //!< Window Icon Name
    _is_dialog        : false,                            //!< Window Attribute: Dialog ?
    _is_resizable     : true,                             //!< Window Attribute: Resizable ?
    _is_draggable     : true,                             //!< Window Attribute: Draggable ?
    _is_scrollable    : true,                             //!< Window Attribute: Scrollable ?
    _is_maximized     : false,                            //!< Window Attribute: Maximized state
    _is_maximizable   : true,                             //!< Window Attribute: Maximizable ?
    _is_minimized     : false,                            //!< Window Attribute: Minimized state
    _is_minimizable   : true,                             //!< Window Attribute: Minimizable ?
    _is_sessionable   : true,                             //!< Window Attribute: Sessionable ?
    _is_closable      : true,                             //!< Window Attribute: Closable ?
    _is_orphan        : false,                            //!< Window Attribute: Orphan (Only one instance allowed)
    _is_ontop         : false,                            //!< Window Attribute: On-Top of other windows ?
    _skip_taskbar     : false,                            //!< Window Attribute: Skip the taskbar
    _skip_pager       : false,                            //!< Window Attribute: Skip the pager
    _oldZindex        : -1,                               //!< Old z-index
    _zindex           : -1,                               //!< Current z-index
    _gravity          : "none",                           //!< Window gravity
    _width            : -1,                               //!< Current window width in px
    _height           : -1,                               //!< Current window height in px
    _top              : -1,                               //!< Current window top position in px
    _left             : -1,                               //!< Current window left position in px
    _lock_size        : false,                            //!< Lock window size
    _lock_width       : -1,                               //!< Lock to this window width in px
    _lock_height      : -1,                               //!< Lock to this window height in px
    _bindings         : {},                               //!< Event bindings list

    /**
     * Window::init() -- Constructor
     *
     * @param String   name       Name of window
     * @param String   dialog     Dialog type if any
     * @param Object   attrs      Extra win attributes (used to restore from sleep etc)
     * @constructor
     */
    init : function(name, dialog, attrs) {
      // Check if we are restoring a window
      var restore = null;
      if ( attrs instanceof Object ) {
        if ( attrs[name] !== undefined ) {
          restore = attrs[name];
        }
      }

      // Default attributes
      this.$element          = null;
      this._current          = false;
      this._attrs_temp       = null;
      this._created          = false;
      this._showing          = false;
      this._origtitle        = "";
      this._id               = null;
      this._content          = "";
      this._icon             = "emblems/emblem-unreadable.png";
      this._is_maximized     = false;
      this._is_minimized     = false;
      this._is_closable      = true;
      this._is_orphan        = false;
      this._is_ontop         = false;
      this._skip_taskbar     = false;
      this._skip_pager       = false;
      this._oldZindex        = -1;
      this._zindex           = -1;
      this._gravity          = "none";
      this._width            = -1;
      this._height           = -1;
      this._top              = -1;
      this._left             = -1;
      this._lock_size        = false;
      this._lock_width       = -1;
      this._lock_height      = -1;

      // Window attributes
      this._name           = name;
      this._title          = dialog ? "Dialog" : "Window";
      this._is_dialog      = dialog ? dialog : false;
      this._is_resizable   = dialog ? false : true;
      this._is_scrollable  = dialog ? false :true;
      this._is_maximizable = dialog ? false : true;
      this._is_minimizable = dialog ? false : true;
      this._is_sessionable = dialog ? false : true;
      this._attrs_restore  = restore;
      this._bindings = {
        "die"    : [],
        "focus"  : [],
        "blur"   : [],
        "resize" : []
      };

      console.log("Window::" + name + "::init()");
    },

    /**
     * Window::destroy() -- Destructor
     * @destructor
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

      //this._super(); Called by the binding "die"
    },

    /**
     * Window::_bind() -- Bind an event by name and callback
     * @param   String    mname     Binding name
     * @param   Function  mfunc     Binding function
     * @return  void
     */
    _bind : function(mname, mfunc) {
      this._bindings[mname].push(mfunc);
    },

    /**
     * Window::_call() -- Call an event by name and arguments
     * @param   String    mname     Binding name
     * @return  void
     */
    _call : function(mname) {
      if ( this._bindings && this._showing ) {
        var fs = this._bindings[mname];
        if ( fs ) {
          for ( var i = 0; i < fs.length; i++ ) {
            fs[i]();
          }
        }
      }
    },

    /**
     * Window::create() -- Create DOM elemnts etc.
     * @param   String        id              The ID to give DOM Element
     * @param   Function      mcallback       Callback when done
     * @return  $
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

        if ( this._lock_size ) {
          this._lock_width = this._width;
          this._lock_height = this._height;
        }

        //
        // Attributtes
        //
        el.attr("id", id);
        el.find(".WindowContent").css("overflow", this._is_scrollable ? "auto" : "hidden");

        // Content and buttons
        el.find(".WindowTopInner span").html(this._title);
        if ( this._is_dialog ) {
          el.find(".DialogContent").html(this._content);
          if ( this._is_dialog !== true ) {
            el.find(".DialogContent").addClass(this._is_dialog);

            var icon;
            switch ( this._is_dialog ) {
              case "info" :
                icon = "info";
              break;
              case "error" :
                icon = "error";
              break;
              case "question" :
              case "confirm"  :
                icon = "question";
              break;
              case "warning" :
                icon = "warning";
              break;
              default :
                icon = null;
              break;
            }

            if ( icon ) {
              el.find(".WindowTopInner img").attr("src", sprintf("/img/icons/16x16/status/gtk-dialog-%s.png", icon));
            } else {
              el.find(".WindowTopInner img").hide();
            }
          }
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
        var lw = el.find(".WindowTopInner img").is(":visible") ? 16 : 0;
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
          var ropts = {
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
          };

          if ( this._lock_width > 0 ) {
            ropts.minWidth = this._lock_width;
          }
          if ( this._lock_height > 0 ) {
            ropts.minHeight = this._lock_height;
          }

          el.resizable(ropts);
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

        if ( fresh ) {
          this._gravitate();
        }

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
     * Window::show() -- Show window (add)
     * @see Desktop::addWindow()
     * @return void
     */
    show : function() {
      if ( !this._showing ) {
        _Desktop.addWindow(this);

        this._showing = true;
      }
    },

    /**
     * Window::close() -- Close window (remove)
     * @see Desktop::removeWindow()
     * @return void
     */
    close : function() {
      if ( this._showing ) {
        _Desktop.removeWindow(this, true);

        this._showing = false;
      }
    },

    /**
     * Window::focus() -- Focus window
     * @see Desktop::focusWindow()
     * @return void
     */
    focus : function() {
      _Desktop.focusWindow(this);
    },

    /**
     * Window::blur() -- Blur window
     * @see Desktop::blurWindow()
     * @return void
     */
    blur : function() {
      _Desktop.blurWindow(this);
    },

    /**
     * Window::setTitle() -- Set Window title
     * @param   String    t         Title
     * @return  void
     */
    setTitle : function(t) {
      if ( t != this._title ) {
        this._title = t;
        this.$element.find(".WindowTopInner span").html(this._title);
        _Desktop.updateWindow(this);
      }
    },

    /**
     * Window::getTitle() -- Get Window title
     * @return String
     */
    getTitle : function() {
      return this._title;
    },

    /**
     * Window::getIcon() -- Get Window full icon path
     * @param   String    size      Size (default = 16x16)
     * @return  String
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
     * Window::_shuffle() -- Shuffle Window (adjust z-index)
     * @param   int   zi        New z-index
     * @param   int   old       Old z-index
     * @return  void
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
     * Window::_ontop() -- Set Window on-top state
     * @param   bool    t     State
     * @return  void
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
     * Window::_focus() -- Set window to focused state
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
     * Window::_blur() -- Set window to blurred state
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
     * Window::_minimize() -- Set window to minimized state
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

          if ( this._current ) {
            _Desktop.blurWindow(self);
          }
        }

      }
    },

    /**
     * Window::_maximize() -- Set window to maximized state
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
     * Window::_gravitate() -- Gravitate window
     * @param   String    dir       Direction/Location
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
     * Window::_move() -- Move Window position
     * @param   int   left    New Left/X Position in px
     * @param   int   top     New top/Y Position in px
     * @return  void
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
     * Window::_resize() -- Resize window dimension
     * @param   int           width       New width in px
     * @param   int           height      New height in px
     * @param   DOMElement    el          Element
     * @return  void
     */
    _resize : function(width, height, el) {
      el = el || this.$element;

      if ( height ) {
        height = height < 128 ? 128 : height;
        if ( this._lock_height > 0 && height > this._lock_height ) {
          height = this._lock_height;
        }

        el.css("height", (height) + "px");
      } else {
        el.css("height", (this._height) + "px");
      }
      if ( width ) {
        width = width < 128 ? 128 : width;
        if ( this._lock_width > 0 && width > this._lock_width ) {
          width = this._lock_width;
        }

        el.css("width", (width) + "px");
      } else {
        el.css("width", (this._width) + "px");
      }
    },

    /**
     * Window::_getSession() -- Get current Window session data
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // GTK+ Implementations
  /////////////////////////////////////////////////////////////////////////////


  /**
   * GtkWindow -- Gtk+ Window Class
   *
   * @extends Window
   * @class
   */
  var GtkWindow = Window.extend({

    /**
     * GtkWindow::init() -- Constructor
     * @see Window::init()
     * @constructor
     */
    init : function(window_name, window_dialog, app, attrs) {
      this.app = app;

      this._super(window_name, window_dialog, attrs);
    },

    /**
     * GtkWindow::create() -- Create DOM elements etc.
     * @see Window::create()
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


        if ( OSjs.Compability.SUPPORT_CANVAS ) {
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

        el.find("input").attr("autocomplete", "off");

        //
        // Box factors (LAST!)
        //

        setTimeout(function() {
          el.find("td.Fill").each(function() {
            if ( !$(this).hasClass("Expand") ) {
              //var height = parseInt($(this).css("height"), 10);
              //if ( !height || isNaN(height) ) {
              //}
              var first = $(this).find(".TableCellWrap :first-child");
              var height = parseInt(first.height(), 10);
              if ( !isNaN(height) && height ) {
                $(this).parent().css("height", height + "px");
                //$(this).css("height", height + "px");
              }
            }
          });
        }, 0);
      }

      return el;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Menu -- Menu for Window and Context Class
   *
   * @class
   */
  var Menu = Class.extend({

    $element : null,      //!< Menu DOM Element

    /**
     * Menu::init() -- Constructor
     * @constructor
     */
    init : function(att_window) {
      this.$element = $("<ul></ul>");
      this.$element.attr("class", "Menu");
    },

    /**
     * Menu::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.empty().remove();
      }

      this.$element = null;
    },

    /**
     * Menu::clear() -- Empty root
     * @return void
     */
    clear : function() {
      if ( this.$element ) {
        this.$element.find("li").empty().remove();
      }
    },

    /**
     * Menu::create_separator() -- Create/Add a separator to list
     * @return void
     */
    create_separator : function() {
      var litem = $("<li><hr /></li>");
        litem.addClass("separator");
      this.$element.append(litem);
    },

    /**
     * Menu::create_item() -- Create/Add item to list
     * @param   String      title     The label
     * @param   String      icon      Icon name
     * @param   Function    method    The callback function onClick
     * @param   bool        disabled  Enabled state
     * @param   String      aclass    Add this className to menu item
     * @return  void
     */
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Dialog -- Dialog-Window class
   * Used for Alert and Confirm messages etc.
   *
   * @extends Window
   * @class
   */
  var Dialog = Window.extend({

    /**
     * Dialog::init() -- Constructor
     * @see Window::init()
     * @constructor
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

      // FIXME: Labels
      switch ( type ) {
        case "info" :
          this._title    = "Information";
        break;
        case "error" :
          this._title    = "Error";
        break;
        case "question" :
          this._title    = "Question";
        break;
        case "confirm"  :
          this._title    = "Confirmation";
        break;
        case "warning" :
          this._title    = "Warning";
        break;
        default :
          if ( !this._title ) {
            this._title  = "Dialog";
          }
        break;
      }
    },

    /**
     * Dialog::create() -- Create DOM elements etc
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MISC DIALOGS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * BrowserDialog -- Browser Compability Dialog
   * @extends Window
   * @class
   */
  var BrowserDialog = Window.extend({

    /**
     * BrowserDialog::init() -- Constructor
     * @see Window
     * @constructor
     */
    init : function() {
      var supported = "Supported";
      var color     = "black";

      var mob = MobileSupport();
      if ( ($.browser.msie || $.browser.opera) || (mob.iphone || mob.blackberry || mob.android) ) {
        supported = "Partially supported";
        color = "#f3a433";
      } else {
        supported = "Supported";
        color = "#137a26";
      }

      this._super("Crash", false);
      this._content = "<div style=\"padding:10px;\"><div><b>Your browser is: <span style=\"color:" + color + ";\">" + supported + "</span></b></div> <table class=\"chart\"></table><div class=\"notes\"></div></div>";
      this._title = "Browser compability";
      this._icon = 'status/software-update-available.png';
      this._is_draggable = true;
      this._is_resizable = false;
      this._is_scrollable = false;
      this._is_sessionable = false;
      this._is_minimizable = true;
      this._is_maximizable = false;
      this._is_closable = true;
      this._is_orphan = false;
      this._is_ontop = true;
      this._width = 500;
      this._height = 330;
      this._gravity = "center";
    },

    /**
     * BrowserDialog::create() -- Create DOM elements etc
     * @see Window
     * @return $
     */
    create : function(id, mcallback) {
      var self = this;
      var el = this._super(id, mcallback);

      var table  = el.find("table.chart");
      var _row   = "<tr><td width=\"16\"><img alt=\"\" src=\"/img/icons/16x16/emblems/emblem-%s.png\" /></td><td>%s</td></tr>";
      var _check = OSjs.Public.CompabilityLabels;

      var row;
      var icon;
      for ( var c in _check ) {
        if ( _check.hasOwnProperty(c) ) {
          icon = _check[c] ? "default" : "important";
          row = $(sprintf(_row, icon, c));
          table.append(row);
        }
      }

      $(table).css({
        "float" : "left",
        "width" : "49%",
        "margin-top" : "10px",
        "background" : "#fff",
        "height" : "226px"
      }).find("td").css({
        "padding" : "3px",
        "vertical-align" : "middle"
      });

      var notes = el.find("div.notes");
      if ( $.browser.msie || $.browser.opera ) {
        notes.append("<p>Glade CSS style problems occurs in IE and Opera for &lt;table&gt; elements.</p>");
        if ( $.browser.msie ) {
          notes.append("<p>IE is lacking some CSS effects and HTML5/W3C features.</p>");
        }
      } else {
        var mob = MobileSupport();
        if ( mob.iphone || mob.blackberry || mob.android ) {
          notes.append("<p>Your device is not fully supported due to lacking Touch support.</p>");
        } else {
          notes.append("<p>Your browser does not have any known problems.</p>");
        }
      }
      notes.append("<p><b>This message will only be showed once!</b></p>");

      $(notes).css({
        "float" : "right",
        "width" : "49%",
        "margin-top" : "10px",
        "background" : "#fff",
        "height" : "255px"
      }).find("p").css({"padding" : "5px", "margin" : "0"});
    }

  }); // @endclass

  /**
   * CrashDialog -- Application Crash Dialog
   *
   * @extends Window
   * @class
   */
  var CrashDialog = Window.extend({

    /**
     * CrashDialog::init() -- Constructor
     * @see Window
     * @constructor
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
     * CrashDialog::create() -- Create DOM elements etc
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
        "bottom" : "0px",
        "width" : "580px",
        "height" : "70px"
      });
    }


  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // OPERATION DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OperationDialog -- Misc Operation Dialogs Class
   * Basis for extended variant of dialogs with interactions.
   *
   * @extends Window
   * @class
   */
  var OperationDialog = Window.extend({

    /**
     * OperationDialog::init() -- Constructor
     * @constructor
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
     * OperationDialog::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._super();
    },

    /**
     * OperationDialog::create() -- Create DOM elements etc.
     * @see    Window::create()
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

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Run OS.js
   * @return bool
   * @function
   */
  OSjs.__Run = function() {
    _Core = new Core();
    _Running = true;

    return true;
  }; // @endfunction

  /**
   * Stop OS.js
   * @return bool
   * @function
   */
  OSjs.__Stop = function() {
    if ( _Running && _Core ) {
      _Core.destroy();
      _Core = null;
      _Running = false;

      window.onbeforeunload = null; // NOTE: Required!
    }

    return true;
  }; // @endfunction

  /**
   * Leave OS.js
   * @param   DOMEvent  ev    Event
   * @return  bool
   * @function
   */
  OSjs.__Leave = function(ev) {
    ev = ev || window.event;

    if ( _Running ) {
      ev.cancelBubble = true;
      if ( ev.stopPropagation ) {
        ev.stopPropagation();
        ev.preventDefault();
      }

      var msg = 'Are you sure you want to quit? To save your session use the Logout functionallity.';
      ev.returnValue = msg;
      return msg;
    }

    return true;
  }; // @endfunction

})($);

