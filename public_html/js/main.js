/**
 * JavaScript Window Manager
 *
 * TODOs:
 *   TODO: Tooltips
 *   TODO: Sortable panel items (use absolute, snap to direction as panel does)
 *   TODO: Menu subitems
 *   FIXME: Move all Window attributes/properties into Enums
 *
 * Fixes:
 *   TODO: Rewrite settings manager
 *   TODO: Update WindowList panel item with updated titles
 *
 * Release:
 *   TODO: Convert Dialog to Glade and Separate JS files
 *   TODO: Check and fix Window::onblur() for all applications
 *
 * Creates a desktop environment inside the browser.
 * Applications can be loaded via the server.
 * Events and System calls are performed via the API
 * object.
 *
 * @package ajwm.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  // Override for browsers without console
  if (!window.console) console = {log:function() {}, info:function(){}, error:function(){}};

  var ENABLE_CACHE        = false;

  var ZINDEX_MENU         = 100000000;
  var ZINDEX_RECT         = 100000000;
  var ZINDEX_PANEL        = 1000000;
  var ZINDEX_WINDOW       = 10;
  var ZINDEX_WINDOW_MAX   = 88888889;
  var ZINDEX_WINDOW_ONTOP = 90000000;
  var ZINDEX_LOADING      = 1000100;

  /**
   * Local settings
   */
  var SETTING_REVISION = 18;
  var ENABLE_LOGIN     = false;
  var ANIMATION_SPEED  = 400;
  var TEMP_COUNTER     = 1;

  /**
   * Local references
   */
  var _Resources       = null;
  var _Settings        = null;
  var _Desktop         = null;
  var _Window          = null;
  var _Processes       = [];
  var _TopIndex        = (ZINDEX_WINDOW + 1);
  var _OnTopIndex      = (ZINDEX_WINDOW_ONTOP + 1);

  /**
   * NULL references
   * @return void
   */
  function __null() {
    _Resources         = null;
    _Settings          = null;
    _Desktop           = null;
    _Window            = null;
    _Processes         = [];
    _TopIndex          = 11;
  }

  /*
  setInterval(function() {
    var now = (new Date()).getTime();

    var i = 0;
    var l = _Processes.length;
    var p, s;
    if ( l ) {
      for ( i; i < l; i++ ) {
        p = _Processes[i];
        if ( p !== undefined ) {
          console.info("=> Process Alive", i, p._uuid, p, sprintf("alive %dms", (now - p._started.getTime())));
        }
      }
    }
  }, 5000);
  */

  function LaunchApplication(app_name, args, windows, callback, callback_error) {
    callback = callback || function() {};
    callback_error = callback_error || function() {};

    API.ui.cursor("wait");

    $.post("/", {'ajax' : true, 'action' : 'load', 'app' : app_name}, function(data) {
      if ( data.success ) {
        _Resources.addResources(data.result.resources, function() {

          if ( window[app_name] ) {
            var application = new window[app_name](GtkWindow, Application, API, args, windows);
            application._uuid  = data.result.uuid;
            application.run();
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
          //var cname = "url('/img/cursors/" + c + "'.png), " + c;
          if ( el ) {
            $(el).css("cursor", c);
            return;
          }

          if ( c !== ccursor ) {
            $("body").css("cursor", c);
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
            API.system.dialog("confirm", "Found no suiting application for '" + path + "'"); // TODO: Ask for app
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

        _Desktop.addWindow(new Dialog(type, message, cmd_close, cmd_ok, cmd_cancel));

        console.info("=> API Dialog", type);
      },

      'dialog_rename' : function(path, clb_finish) {
        _Desktop.addWindow(new RenameOperationDialog(path, clb_finish));

        console.info("=> API Rename Dialog");
      },

      'dialog_upload' : function(path, clb_finish, clb_progress, clb_cancel) {
        _Desktop.addWindow(new UploadOperationDialog(path, clb_finish, clb_progress, clb_cancel));

        console.info("=> API Upload Dialog");
      },

      'dialog_file' : function(clb_finish, mime_filter, type, cur_dir) {
        mime_filter = mime_filter || [];
        type = type || "open";
        cur_dir = cur_dir || "/";

        _Desktop.addWindow(new FileOperationDialog(type, mime_filter, clb_finish, cur_dir));

        console.info("=> API File Dialog");
      },

      'dialog_launch' : function(list, clb_finish) {
        _Desktop.addWindow(new LaunchOperationDialog(list, clb_finish));

        console.info("=> API Launch Dialog");
      },

      'dialog_color' : function(start_color, clb_finish) {
        _Desktop.addWindow(new ColorOperationDialog(start_color, clb_finish));

        console.info("=> API Color Dialog");
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
      'save' : function(save) {
        save = save || false;
        var sess = save ? _Desktop.getSession() : {};

        console.info("=> API Session save");

        localStorage.setItem('session', JSON.stringify(sess));
      },

      'restore' : function() {

        if ( supports_html5_storage() ) {
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

    return Class.extend({
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
      },

      destroy : function() {
        forEach(this.links, function(i, el) {
          $(el).remove();
        });

        this.resources = null;
        this.links = null;
      },

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

      hasResource : function(res) {
        return in_array(res, this.resources);
      },

      addResource : function(res) {
        if ( this.hasResource(res) )
          return;

        var type = res.split(".");
        type = type[type.length - 1];

        if ( !ENABLE_CACHE ) {
          res += "?" + (new Date()).getTime();
        }

        var el = null;
        if ( type == "js" ) {
          el = $("<script type=\"text/javascript\" src=\"/js/" + res + "\"></script>");
        } else {
          el = $("<link rel=\"stylesheet\" type=\"text/css\" href=\"/css/" + res + "\" />");
        }

        $("head").append(el);

        console.group("ResourceManager::addResource()");
        console.log(el.get(0));
        console.groupEnd();

        this.resources.push(res.split("?")[0]);
        this.links.push(el);

        // FIXME: Add timeout here !!!
        if ($.browser.msie) {
          $('head').html($('head').html());
        }
      },

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

    return Class.extend({

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
      },

      destroy : function() {
        _avail = null;
      },

      saveApp : function(name, props) {
        var storage = localStorage.getItem("applications");
        console.log("storage", storage);
        if ( !storage ) {
          storage = {};
        } else {
          try {
            storage = JSON.parse(storage);
            console.log("AOK", storage);
          } catch ( e ) {
            storage = {};
          }
        }
        storage[name] = props;

        localStorage.setItem("applications", JSON.stringify(storage));
      },

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

      _apply : function(settings) {
        for ( var i in settings ) {
          if ( settings.hasOwnProperty(i) ) {
            this._set(i, settings[i]);
          }
        }
      },

      _set : function(k, v) {
        if ( _avail[k] !== undefined ) {
          localStorage.setItem(k, v);
        }
        //  if (e == QUOTA_EXCEEDED_ERR) { (try/catch) // TODO
      },

      _get : function(k, keys, jsn) {
        var ls = undefined;
        if ( _avail[k] !== undefined ) {
          ls = localStorage.getItem(k);

          if ( ls === null || ls === undefined || ls === "undefined" ) {
            if ( keys ) {
              ls = _avail[k].options;
            } else {
              ls = _avail[k].value;
            }
          }
        }
        return jsn ? (ls ? (JSON.parse(ls)) : ls) : ls;
      },

      getType : function(key) {
        return (_avail[key] ? (_avail[key].type) : null);
      },

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

    return Class.extend({

      init : function() {
        this.$element = $("#Desktop");
        this.stack = [];
        this.panel = null;
        this.running = false;

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

      },

      destroy : function() {
        try {
          $("*").unbind();
          $("*").die();
        } catch ( eee ) { }

        this.setWallpaper(null);

        if ( this.panel ) {
          this.panel.destroy();
        }

        var i = 0;
        var l = this.stack.length;
        for ( i; i < l; i++ ) {
          this.stack[i].destroy();
        }
      },

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

        setTimeout(function() {
          self.panel.update();
        },0);

        API.session.restore();

        API.loading.progress(95);

        setTimeout(function() {
          API.loading.progress(100);
          API.loading.hide();
        },200);

        this.running = true;
      },

      redraw : function() {

      },

      // WINDOWS

      addWindow : function(win) {
        if ( win instanceof Window ) {
          var self = this;

          var AddWindowCallback = function(fresh) {
            if ( fresh ) {
              if ( !win._is_minimized && !win._is_maximized ) {
                self.focusWindow(win); // Always focus new windows
              }
            }
          };

          win.create(("Window_" + this.stack.length), AddWindowCallback);

          this.stack.push(win);
          this.panel.redraw(self, win, false);

          return win;
        }

        return false;
      },

      removeApplication : function(app) {
        var i = 0;
        var l = this.stack.length;
        var a;
        for ( i; i < l; i++ ) {
          a = this.stack[i];
          if ( a.app && a.app._uuid == app._uuid ) {
            if ( a !== app._root_window ) {
              this.removeWindow(a, i);
            }
          }
        }
      },

      removeWindow : function(win, index) {
        if ( win instanceof Window ) {
          win.destroy();

          if ( index === undefined ) {
            var i = 0;
            var l = this.stack.length;
            for ( i; i < l; i++ ) {
              if ( this.stack[i] == win ) {
                index = i;
                break;
              }
            }
          }

          this.stack.splice(index, 1);

          this.panel.redraw(this, win, true);
        }
      },

      focusWindow : function(win) {
        if ( _Window !== null ) {
          if ( win != _Window ) {
            _Window._blur();
          }
        }


        win._focus();

        if ( _Window !== win ) {
          this.panel.redraw(this, win);
        }

        _Window = win;
      },

      restoreWindow : function(win) {
      },

      maximizeWindow : function(win) {
      },

      minimizeWindow : function(win) {
        this.panel.redraw(this, win);
      },

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

      applySettings : function() {
        var wp = _Settings._get('desktop.wallpaper.path');
        if ( wp ) {
          this.setWallpaper(wp);
        }
        var theme = _Settings._get('desktop.theme');
        if ( theme ) {
          this.setTheme(theme);
        }

        console.group("Applied used settings");
        console.log("wallpaper", wp);
        console.log("theme", theme);
        console.groupEnd();
      },

      setWallpaper : function(wp) {
        if ( wp ) {
          $("body").css("background", "url('/media" + wp + "') center center");
        } else {
          $("body").css("background", "url('/img/blank.gif')");
        }
      },

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

      getSession : function() {
        var sess = [];

        var i = 0;
        var l = _Processes.length;
        var p, s;
        for ( i; i < l; i++ ) {
          p = _Processes[i];
          if ( p !== undefined ) {
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
  // PANEL
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Panel
   * Panels can be added to desktop. Contains PanelItem(s) or Widgets
   *
   * @class
   */
  var Panel = Class.extend({

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
    },

    destroy : function() {
      for ( var i = 0; i < this.items.length; i++ ) {
        this.items[i].destroy();
      }
      this.items = null;
      this.$element.empty().remove();
    },

    // FIXME: Generic handler, remove desktop ref
    redraw : function(desktop, win, remove) {
      var wpi = this.getItem("PanelItemWindowList", 0);
      if ( wpi ) {
        wpi.redraw(desktop, win, remove);
      }
    },

    update : function() {
    },

    getItem : function(name, index) {
      var results = [];
      index = index >= 0 ? index : -1;
      for ( var i = 0; i < this.items.length; i++ ) {
        if ( this.items[i].name == name ) {
          results.push(this.items[i]);
        }
      }
      return results.length ? (index != -1 ? results[index] : results) : false;
    },

    addItem : function(i, pos) {
      if ( i instanceof _PanelItem ) {

        console.group("Panel::addItem()");
        console.log(i.name, i);
        console.groupEnd();

        var el = i.create(pos);
        if ( el ) {
          el.attr("id", "PanelItem" + this.items.length);
          this.$element.find("ul").append(el);

          this.items.push(i);

          return i;
        }
      }

      return false;
    },

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

    removeItem : function(x) {
      for ( var i = 0; i < this.items.length; i++ ) {
        if ( this.items[i] === x ) {
          x.destroy();

          console.group("Panel::removeItem()");
          console.log(x.name, x);
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
  var _PanelItem = Class.extend({

    init : function(name, align)  {
      this.name         = name;
      this.named        = name;
      this.align        = align || "AlignLeft";
      this.expand       = false;
      this.dynamic      = false;
      this.orphan       = true;
      this.crashed      = false;
      this.configurable = false;
      this._index       = -1;
      this._panel       = null;
      this.$element     = null;
    },

    create : function(pos) {
      var self = this;

      this.$element = $("<li></li>").attr("class", "PanelItem " + this.name);
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

    reload : function() {

    },

    update : function() {
      if ( this.align == "right" ) {
        this.$element.addClass("AlignRight");
      } else {
        this.$element.removeClass("AlignRight");
      }
    },

    redraw : function() {

    },

    crash : function(error) {
      this.$element.find("*").remove();
      this.$element.addClass("Crashed");
      this.$element.html("<img alt=\"\" src=\"/img/icons/16x16/status/error.png\"/><span>" + error + "</span>");
      this.crashed = true;
    },

    destroy : function() {
      if ( this.$element ) {
        this.$element.empty();
        this.$element.remove();
      }
    },

    configure : function() {
      var self = this;
      if ( self.configurable ) {
        _Desktop.addWindow(new PanelItemOperationDialog(this, function() {
          self.reload();
        }));
      }
    },

    getMenu : function() {
      var self = this;
      var menu = [
        {"title" : self.named, "disabled" : true, "attribute" : "header"},
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
      this._attrs_temp      = null; // FIXME: Refactor
      this._attrs_restore   = attrs;
      this._created         = false;
      this._showing         = false;
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
      this._oldZindex      = -1;
      this._zindex         = -1;
      this._gravity        = "none";

      this.width          = -1;
      this.height         = -1;
      this.top            = -1;
      this.left           = -1;

      console.log("Window::" + name + "::init()");
    },

    destroy : function() {
      var self = this;

      if ( this._created ) {
        this._call("die");

        this._showing    = false;
        this._bindings   = null;

        $(this.$element).fadeOut(ANIMATION_SPEED, function() {
          $(self.$element).empty().remove();
        });
      }

      console.log("Window::" + this._name + "::destroy()");
    },

    _bind : function(mname, mfunc) {
      this._bindings[mname].push(mfunc);
    },

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

    show : function() {
      if ( !this._showing ) {
        _Desktop.addWindow(this);
      }
    },

    close : function() {
      if ( this._showing ) {
        _Desktop.removeWindow(this);
      }
    },

    create : function(id, mcallback) {
      var self = this;

      mcallback = mcallback || function() {};

      if ( !this._created ) {
        this._id      = id;
        this._showing = true;

        var fresh = true;
        var el    = this._is_dialog ? $($("#Dialog").html()) : $($("#Window").html());

        // Attributtes
        el.attr("id", id);
        el.find(".WindowContent").css("overflow", this._is_scrollable ? "auto" : "hidden");

        // Apply default size
        if ( !isNaN(this.width) && (this.width > 0) ) {
          $(el).width(this.width + "px");
        }
        if ( !isNaN(this.height) && (this.height > 0) ) {
          $(el).height(this.height + "px");
        }

        // Content and buttons
        el.find(".WindowTopInner span").html(this._title);
        if ( this._is_dialog ) {
          el.find(".DialogContent").html(this._content).addClass(this._is_dialog);
        } else {
          el.find(".WindowTopInner img").attr("src", "/img/icons/16x16/" + this._icon);
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

        // Events
        el.bind('mousedown', function(ev) {
          _Desktop.focusWindow(self);
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

        //
        // INSERT
        //
        _Desktop.$element.append(el);

        if ( el.find(".GtkMenuItem").length ) {
          var last_menu = null;
          el.find(".GtkMenuItem").each(function() {
            $(this).click(function() {
              if ( last_menu ) {
                $(last_menu).hide();
              }

              last_menu = $(this).find(".GtkMenu").show();
            });
          });

          $(document).click(function(ev) {
            var t = ev.target || ev.srcElement;
            if ( !$(t).parents("ul").first().hasClass("GtkMenuBar") ) {
              el.find(".GtkMenuItem .GtkMenu").hide();
            }
          });
        }


        //
        // Box factors
        //

        el.find("td.Fill").each(function() {
          if ( !$(this).hasClass("Expand") ) {
            var height = parseInt($(this).find(":first-child").height(), 10);
            $(this).parent().css("height", height + "px");
          }
        });

        //
        // Size and dimension
        //
        if ( this._gravity === "center" ) {
          this.top = (($(document).height() / 2) - ($(el).height() / 2));
          this.left = (($(document).width() / 2) - ($(el).width() / 2));
        } else {
          // Find free space for new windows
          var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
          this.top = ppos == "top" ? 50 : 20;
          this.left = 20;
        }

        // Check if window has any saved attributes for override (session restore etc)
        if ( this._attrs_restore && sizeof(this._attrs_restore) ) {
          this.top          = this._attrs_restore.top;
          this.left         = this._attrs_restore.left;
          this.width        = this._attrs_restore.width;
          this.height       = this._attrs_restore.height;
          this._is_minimized = this._attrs_restore._is_minimized;
          this._is_maximized = this._attrs_restore._is_maximized;
          this._is_ontop     = this._attrs_restore._is_ontop;
          this._zindex       = this._attrs_restore._zindex;

          if ( _TopIndex < this._zindex ) {
            _TopIndex = this._zindex;
          }

          fresh = false;
        }

        if ( !isNaN(this.width) && (this.width > 0) ) {
          $(el).width(this.width + "px");
        }
        if ( !isNaN(this.height) && (this.height > 0) ) {
          $(el).height(this.height + "px");
        }
        if ( !isNaN(this.left) && (this.left > 0) && !isNaN(this.top) && (this.top > 0) ) {
          $(el).offset({'left' : (this.left), 'top' : (this.top)});
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
          if ( !isNaN(this.height) && (this.height > 0) ) {
            this._resize(this.width, this.height, el);
          }
        }

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

              self.left = self.$element.offset()['left'];
              self.top = self.$element.offset()['top'];
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

              self.width = parseInt(self.$element.width(), 10);
              self.height = parseInt(self.$element.height(), 10);

              self._call("resize");
            }
          });
        }

        this.$element = el;

        mcallback(fresh);

        if ( this._is_minimized ) {
          $(el).hide();
        }

        if ( this._zindex && this._zindex > 0 ) {
          this._shuffle(this._zindex);
        }

        if ( this._is_maximized ) {
          this.$element.find(".ActionMaximize").parent().addClass("Active");
          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }
      }

      this._created = true;

      console.group("Window::" + this._name + "::create()");
      console.log(el);
      console.groupEnd();

      return el;
    },

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

    _ontop : function() {
      if ( this._is_ontop ) {
        if ( this._oldZindex > 0 ) {
          this._shuffle(this._oldZindex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }
      } else {
        _OnTopIndex++;
        this._shuffle(_OnTopIndex, true);
      }

      this._is_ontop = !this._is_ontop;
    },

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

    _minimize : function() {
      if ( this._is_minimizable ) {
        var self = this;
        if ( this._is_minimized ) {
          this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.restoreWindow(self);
          }});

          this._is_minimized = false;
        } else {
          this._blur();

          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.minimizeWindow(self);
          }});

          this._is_minimized = true;
        }

      }
    },

    _maximize : function() {
      if ( this._is_maximizable ) {
        if ( this._is_maximized ) {
          if ( this._attrs_temp !== null ) {
            this.top = this._attrs_temp.position.top;
            this.left = this._attrs_temp.position.left;
            this.width = this._attrs_temp.size.width;
            this.height = this._attrs_temp.size.height;

            this.$element.animate({
              'top'    : this.top + 'px',
              'left'   : this.left + 'px',
              'width'  : this.width + 'px',
              'height' : this.height + 'px'
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
            'size'     : {'width' : this.$element.width(), 'height' : this.$element.height()},
            'position' : this.$element.offset()
          };

          var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
          var w = parseInt($(document).width(), 10);
          var h = parseInt($(document).height(), 10);

          this.top = ppos == "top" ? 40 : 10;
          this.left = 10;
          this.width = w - 20;
          this.height = h - 50;

          this.$element.css({
            'top'    : (this.top) + 'px',
            'left'   : (this.left) + 'px'
          }).animate({
            'width'  : (this.width) + "px",
            'height' : (this.height)  + "px"
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

    _resize : function(width, height, el) {
      el = el || this.$element;
      var appendWidth = 4;
      var appendHeight = 4 + el.find(".WindowTop").height();

      el.css("height", (height + appendHeight) + "px");
      el.css("width", (width + appendWidth) + "px");
    },

    _getSession : function() {
      if ( !this._is_sessionable ) {
        return false;
      }

      return {
        is_maximized : this._is_maximized,
        is_minimized : this._is_minimized,
        is_ontop     : this._is_ontop,
        zindex       : this._zindex,
        width        : this.width,
        height       : this.height,
        top          : this.top,
        left         : this.left
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

    init : function(window_name, window_dialog, app, attrs) {
      this.app = app;

      this._super(window_name, window_dialog, attrs);
    },

    create : function(id, mcallback) {
      var el = this._super(id, mcallback);
      var self = this;

      if ( el ) {
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

    init : function(att_window) {
      this.$element = $("<ul></ul>");
      this.$element.attr("class", "Menu");
      this.$window = att_window ? ($(att_window).parents(".Window")) : null;
    },

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

      if ( method == "cmd_Close" ) {
        $(litem).click(function() {
          $(self.$window).find(".ActionClose").click();
        });
      } else {
        $(litem).click(function() {
          $(this).parents("ul.Menu").hide();
        });
      }

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

    init : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this._super("Dialog", type);

      this.width = 200;
      this.height = 70;
      this._gravity = "center";
      this._content = message;

      this.cmd_close  = cmd_close  || function() {};
      this.cmd_ok     = cmd_ok     || function() {};
      this.cmd_cancel = cmd_cancel || function() {};
    },

    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);

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
  // OPERATION DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OperationDialog
   * Basis for extended variant of dialogs with interactions.
   *
   * @class
   */
  var OperationDialog = Window.extend({

    init : function(type) {
      this._super("OperationDialog", type);

      this.width          = 400;
      this.height         = 200;
      this._gravity        = "center";
      this._is_minimizable = true;
    },

    destroy : function() {
      this._super();
    },

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

      this._super("Color");

      this.clb_finish = clb_finish   || function() {};
      this.colorObj   = RGBFromHex(start_color  || "#ffffff");

      this._title    = "Choose color...";
      this._icon     = "apps/style.png";
      this._content  = $("#OperationDialogColor").html();
      this.width    = 400;
      this.height   = 170;
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
      this._super("Copy");

      this.src          = src          || null;
      this.dest         = dest         || null;
      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this._title    = "Copy file";
      this._content  = $("#OperationDialogCopy").html();
      this.width    = 400;
      this.height   = 170;
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
      this._super("Rename");

      this.src          = src          || null;
      this.clb_finish   = clb_finish   || function() {};

      this._title    = "Copy file";
      this._content  = $("#OperationDialogRename").html();
      this.width    = 200;
      this.height   = 100;
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
      var self = this;

      this._super("Upload");

      this.upload_path  = path;
      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this._title    = "Upload file";
      this._icon     = "actions/up.png";
      this._content  = $("#OperationDialogUpload").html();
      this.width    = 400;
      this.height   = 140;
      this.uploader = null;
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
      this.width        = 400;
      this.height       = 300;
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
      this._super("Launch");

      this.list         = items        || [];
      this.clb_finish   = clb_finish   || function() {};

      this._title    = "Select an application";
      this._content  = $("#OperationDialogLaunch").html();
      this.width    = 400;
      this.height   = 170;
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
      this._super("PanelItem");

      this.item         = item         || null;
      this.type         = item instanceof Panel ? "panel" : "item";
      this.clb_finish   = clb_finish   || function() {};
      this.clb_create   = clb_create   || function() {};

      this._title    = title || "Configure " + this.type;
      this._content  = (copy || $("#OperationDialogPanelItem")).html();
      this.width    = 400;
      this.height   = 170;
    },


    create : function(id, mcallback) {
      var self = this;
      this._super(id, mcallback);
      this.clb_create(self);
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Application
   * Basis for application (empty)
   *
   * @class
   */
  var Application = Class.extend({
    init : function(name, argv, restore) {
      this.argv         = argv;

      this._name         = name;
      this._uuid         = null;
      this._index        = (_Processes.push(this) - 1);
      this._running      = false;
      this._root_window  = null;
      this._started      = new Date();
      this._storage      = {};

      if ( restore === undefined || restore === true ) {
        this._restoreStorage();
      }

      console.log("Application::" + this._name + "::NULL::init()");
    },

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

        _Desktop.removeApplication(self);

        console.log("Application::" + this._name + "::" + this._uuid + "::destroy()");

        this._running = false;
        this._storage = null;

        _Processes[this._index] = undefined;
      }
    },

    run : function(root_window) {
      var self = this;

      if ( !this._running ) {
        this._root_window = root_window;

        if ( root_window instanceof Window ) {
          root_window._bind("die", function() {
            self._stop();
          });
        }

        console.log("Application::" + this._name + "::" + this._uuid + "::run()");

        this._running = true;
      }
    },

    _stop : function() {
      if ( this._running ) {
        this.destroy();
      }
    },

    _saveStorage : function() {
      if ( this._name ) {
        _Settings.saveApp(this._name, this._storage);
      }

      console.log('_saveStorage', this._storage);
    },

    _restoreStorage : function() {
      if ( this._name ) {
        this._storage = _Settings.loadApp(this._name);
      }

      console.log('_restoreStorage', this._storage);
    },

    _flushStorage : function() {
      if ( this._name ) {
        this._storage = {};

        _Settings.saveApp(this._name, this._storage);
      }
    },

    _event : function(win, ev, args, callback) {
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

    _getSession : function() {
      if ( this._root_window ) {
        var win = this._root_window._getSession();
        if ( win !== false ) {
          return {
            "name"    : this._name,
            "argv"    : this.argv,
            "windows" : [win]
          };
        }
      }

      return false;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////


  /**
   * @unload()
   */
  $(window).unload(function() {
    if ( _Desktop ) {
      _Desktop.destroy();
    }
    if ( _Settings ) {
      _Settings.destroy();
    }
    if ( _Resources ) {
      _Resources.destroy();
    }

    __null();
  });

  /**
   * @ready()
   */
  $(window).ready(function() {

    if ( !supports_html5_storage() ) {
      alert("Your browser does not support WebStorage. Cannot continue...");
      return;
    }

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

    // Startup script
    var __LAUNCH = function()
    {

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

          _Desktop = new Desktop();
          API.loading.progress(15);

          _Desktop.run();
        } else {
          alert(data.error);
        }

      });
    };


    if ( ENABLE_LOGIN ) {
      var el = $("#LoginWindow");
      $(el).show().css({
        "top" : parseInt(($(document).height() / 2) - ($(el).height() / 2), 10) - 80 + "px",
        "left" : parseInt(($(document).width() / 2) - ($(el).width() / 2), 10) + "px"
      });

      $(el).find("input[type=password]").focus();
      $(el).find("form").submit(function() {
        $(el).hide();
        __LAUNCH();
        return false;
      });
    } else {
      __LAUNCH();
    }

  });

})($);
