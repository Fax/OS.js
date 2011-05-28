/**
 * JavaScript Window Manager
 *
 * TODO: Hourglass while wating
 * TODO: Font selection
 * TODO: Finish up menu and context-menu
 * TODO: Login screen
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
  if (!window.console) console = {log:function() {}, error:function(){}};

  var SETTING_REVISION = 1;

  var ANIMATION_SPEED  = 400;

  var _Resources           = null;
  var _Settings            = null;
  var _Desktop             = null;
  var _Window              = null;
  var _TopIndex            = 11;

  function __null() {
    _Resources           = null;
    _Settings            = null;
    _Desktop             = null;
    _Window              = null;
    _TopIndex            = 11;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////////////////////

  var API = {

    /*
    'loading' : {
      'show' : function() {
        $("#Loading").show();
      },

      'hide' : function() {
        setTimeout(function() {
          $("#LoadingBar").fadeOut(ANIMATION_SPEED);
        }, 100);
      },

      'progress' : function(v) {
        $("#LoadingBar").progressbar({
          value : v
        });
      }
    },
    */

    'ui' : {
      'cursor' : function(c) {
        $("body").css("cursor", c);
      }
    },

    'system' : {
      'run' : function(path, mime) {
        if ( mime ) {
          var apps = _Settings._get("system.app.handlers", true);
          forEach(apps, function(mt, mapp, mind, mlast) {
            var mte = mt.split("/");
            var mbase = mte.shift();
            var mtype = mte.shift();

            if ( mtype == "*" ) {
              var ctbase = mime.split("/")[0];
              if ( ctbase == mbase ) {
                console.log("API found suited application for", mime, ":", mapp);

                API.system.launch(mapp, {'path' : path, 'mime' : mime});
                return false;
              }
            } else {
              if ( mt == mime ) {
                console.log("API found suited application for", mime, ":", mapp);

                API.system.launch(mapp, {'path' : path, 'mime' : mime});
                return false;
              }
            }

            if ( mind == mlast ) {
              API.system.dialog("error", "Found no suiting application for '" + path + "'");
              // TODO Ask for new browser window to open in ?!
            }
            return true;
          });
        }
      },

      'launch' : function(app_name, args, attrs) {
        args = args || {};
        if ( args.length !== undefined && !args.length ) {
          args = {};
        }
        attrs = attrs || {};

        console.log("API launching", app_name, args);
        _Desktop.addWindow(new Window(app_name, false, args, attrs));
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
      },

      'dialog' : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
        type = type || "error";
        message = message || "Unknown error";

        _Desktop.addWindow(new Dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
      },

      'dialog_upload' : function(clb_finish, clb_progress, clb_cancel) {
        _Desktop.addWindow(new UploadOperationDialog(clb_finish, clb_progress, clb_cancel));
      },

      'dialog_file' : function(clb_finish, mime_filter, type) {
        mime_filter = mime_filter || [];
        type = type || "open";
        _Desktop.addWindow(new FileOperationDialog(type, mime_filter, clb_finish));
      },

      'dialog_color' : function(start_color, clb_finish) {
        _Desktop.addWindow(new ColorOperationDialog(start_color, clb_finish));
      }
    },

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

        return function(ev, items, where, which) {
          which = which || 3;

          if ( inited === false ) {
            $(document).click(function(ev) {
              if ( !$(ev.target).filter(function(){ return $(this).parents(".Menu").length; }).length ) {
                _destroy();
              }
            });

            initied = true;
          }

          if ( ev.which === which ) {
            _destroy();

            cm = new Menu();
            forEach(items, function(i, it) {
              cm.create_item(it. title, it.icon, it.method, it.disabled);
            });

            var off = $(where).offset();
            $("#ContextMenu").css(
              {
                "left" :off.left + "px",
                "top" : off.top + "px"
              }
            ).html(cm.$element).show();

            ev.stopPropagation();
            ev.preventDefault();

            return false;
          }

          return true;
        };

      })()
    },

    'user' : {
      'settings' : {
        'save' : function(settings) {
          _Settings._apply(settings);
          _Desktop.applySettings();
        },

        'get' : function(k) {
          return _Settings._get(k);
        }
      },

      'logout' : function(save) {
        console.log("API logging out", save);

        API.session.save(save);

        API.session.shutdown();
      }
    },

    'session' : {
      'save' : function(save) {
        save = save || false;
        var sess = save ? _Desktop.getSession() : {};

        localStorage.setItem('session', JSON.stringify(sess));
      },

      'restore' : function() {

        if ( supports_html5_storage() ) {
          var item = localStorage.getItem('session');
          if ( item ) {
            var session = JSON.parse(item);

            console.log("API restore session", session);

            var el;
            var autolaunch = session.windows;
            if ( autolaunch ) {
              for ( var i = 0; i < autolaunch.length; i++ ) {
                el = autolaunch[i];
                var argv = el.argv || [];
                var attrs = {
                  'position' : el.position,
                  'size'     : el.size
                };
                API.system.launch(el.name, argv, attrs);
              }
            }
          }
        }

      },

      'shutdown' : function() {
        var ssess = _Desktop.getSession();
        var ssett = _Settings.getSession();

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
      }
    }

  };

  /////////////////////////////////////////////////////////////////////////////
  // MANAGERS
  /////////////////////////////////////////////////////////////////////////////

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

        console.log("ResourceManager initialized...", this);
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

        var el = null;
        if ( type == "js" ) {
          el = $("<script type=\"text/javascript\" src=\"/js/" + res + "\"></script>");
        } else {
          el = $("<link rel=\"stylesheet\" type=\"text/css\" href=\"/css/" + res + "\" />");
        }

        $("head").append(el);

        console.log("ResourceManager", "addResource", res, type, el);

        this.resources.push(res);
        this.links.push(el);

        // FIXME: Add timeout here !!!
        if ($.browser.msie) {
          $('head').html($('head').html());
        }
      },

      addResources : function(res, callback) {
        console.log("ResourceManager","addResources",res);
        var i = 0;
        var l = res.length;

        for ( i; i < l; i++ ) {
          this.addResource(res[i]);
        }

        callback();
      }
    });

  })();


  var SettingsManager = (function() {

    var _avail = {};
    var _stores = [];

    return Class.extend({

      init : function(defaults) {
        _avail = defaults;

        var rev = localStorage.getItem("SETTING_REVISION");
        var force = false;
        if ( rev !== SETTING_REVISION ) {
          force = true;
          localStorage.setItem("SETTING_REVISION", SETTING_REVISION);
        }

        for ( var i in _avail ) {
          if ( _avail.hasOwnProperty(i) ) {
            if ( !_avail[i].hidden ) {
              if ( force || !localStorage.getItem(i) ) {
                localStorage.setItem(i, _avail[i].value);
              }
              _stores.push(i);
            }
          }
        }

        console.log("SettingsManager initialized...", this, _avail, _stores);
      },

      destroy : function() {
        _avail = null;
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

      _get : function(k, keys) {
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
        return ls;
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

  var Desktop = (function() {

    var _oldTheme = null;

    return Class.extend({

      init : function(settings) {
        this.$element = $("#Desktop");
        this.stack = [];
        this.applySettings();

        this.panel = new Panel();


        console.log("Desktop initialized...");
      },

      destroy : function() {
        try {
          $("*").unbind();
          $("*").die();
        } catch ( eee ) { }

        this.setWallpaper(null);
        this.panel.destroy();

        var i = 0;
        var l = this.stack.length;
        for ( i; i < l; i++ ) {
          this.stack[i].destroy();
        }
      },

      redraw : function() {

      },

      addWindow : function(win) {
        if ( win instanceof Window ) {
          var self = this;

          var callback = function(method) {
            var id = "Window_" + self.stack.length;

            win.create(self, id, _TopIndex, method);

            _TopIndex++;

            self.stack.push(win);

            //win.focus();
            $(win.$element).trigger("mousedown");

            self.panel.redraw(self, win, false);
          };


          if ( win.dialog ) {
            callback({});
          } else {
            win.load(callback);
          }
        }
      },

      removeWindow : function(win) {
        if ( win instanceof Window ) {
          win.destroy();

          var i = 0;
          var l = this.stack.length;
          for ( i; i < l; i++ ) {
            if ( this.stack[i] == win ) {
              this.stack.splice(i, 1);
              break;
            }
          }

          this.panel.redraw(this, win, true);
        }
      },

      focusWindow : function(win) {
        if ( _Window !== null ) {
          if ( win != _Window ) {
            _Window.blur();
          }
        }


        win.focus();

        if ( _Window !== win ) {
          this.panel.redraw(this, win);
        }

        _Window = win;
      },

      toggleWindow : function(win, state) {
        if ( _Window === win ) {
          _Window.blur();
        }
        if ( state ) {
          win.focus();
        }

        this.panel.redraw(this, win);
      },

      applySettings : function() {
        var wp = _Settings._get('desktop.wallpaper.path');
        if ( wp ) {
          this.setWallpaper(wp);
        }
        var theme = _Settings._get('desktop.theme');
        if ( theme ) {
          this.setTheme(theme);
        }

        console.log("Applied user settings", [wp, theme]);
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
        var windows = [];

        var stack = this.stack;
        for ( var i = 0; i < stack.length; i++ ) {
          if ( stack[i].is_sessionable ) {
            windows.push(stack[i].getAttributes());
          }
        }

        return {
          "windows" : windows
        };
      }


    });

  })();

  var DesktopConsole = null; // TODO

  /////////////////////////////////////////////////////////////////////////////
  // PANEL
  /////////////////////////////////////////////////////////////////////////////

  var Panel = Class.extend({

    init : function() {
      var self = this;

      this.$element = $("#Panel");

      console.log("Panel initialized...", this);

      // Fill menu
      var o;
      var apps = _Settings._get("system.app.registered", true);
      var menu_items = [];
      for ( var a in apps ) {
        if ( apps.hasOwnProperty(a) ) {
          o = apps[a];
          (function(apn) {
            menu_items.push({
              "title" : o.title,
              "method" : function() {
                API.system.launch(apn);
              },
              "icon" : o.icon
            });
          })(a);
        }
      }

      $(".PanelItemMenu").click(function(ev) {
        return API.application.context_menu(ev, menu_items, $(this), 1);
      });


      // Start clock
      setInterval(function() {
        var d = new Date();
        $(".PanelItemClock span").html(sprintf("%02d/%02d/%02d %02d:%02s", d.getDate(), d.getMonth(), d.getYear(), d.getHours(), d.getMinutes()));
      }, 500);

      $(".PanelItemMenu li, .PanelItemLauncher").click(function(ev) {
        var app = $(this).find("span").attr("class").replace("launch_", "");
        if ( app == "About" ) {
          $("#DialogAbout").show();
          $("#DialogAbout").css({
            "top" : (($(document).height() / 2) - ($("#DialogAbout").height() / 2)) + "px",
            "left" : (($(document).width() / 2) - ($("#DialogAbout").width() / 2)) + "px"
          });
        } else {
          API.system.launch(app);
        }
      });
    },

    destroy : function() {
      this.$element.empty().remove();
    },

    redraw : function(desktop, win, remove) {
      var self = this;

      var id = win.$element.attr("id") + "_Shortcut";

      if ( remove ) {
        $("#" + id).empty().remove();
      } else {

        if ( !document.getElementById(id) ) {
          var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
          el.find("img").attr("src", "/img/icons/16x16/" + win.icon);
          el.find("span").html(win.title);
          el.attr("id", id);

          if ( win.current ) {
            el.addClass("Current");
          }

          (function(vel, wwin) {
            vel.click(function() {
              desktop.focusWindow(wwin);
            });
          })(el, win);

          self.$element.find(".PanelWindowHolder").append(el);
        }

        if ( remove === undefined ) {
          this.$element.find(".PanelItemWindow").removeClass("Current");
          $("#" + id).addClass("Current");
        }
      }
    },

    addItem : function() {

    },

    removeItem : function() {

    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // WINDOW
  /////////////////////////////////////////////////////////////////////////////

  var Window = Class.extend({

    init : function(name, dialog, argv, attrs) {
      // Various properties
      this.created         = false;
      this.loaded          = false;
      this.current         = false;
      this.app             = null;
      this.uuid            = null;
      this.last_attrs      = null;
      this.create_callback = null;

      // Window main attributes
      this.name        = name;
      this.title       = this.dialog ? "Dialog" : "Window";
      this.content     = "";
      this.icon        = "emblems/emblem-unreadable.png";
      this.dialog      = dialog ? true : false;
      this.argv        = argv;
      this.attrs       = attrs;
      this.menu        = [];
      this.statusbar   = false;

      // Window attributes
      this.is_resizable   = this.dialog ? false : true;
      this.is_draggable   = true;
      this.is_scrollable  = this.dialog ? false :true;
      this.is_maximized   = false;
      this.is_maximizable = this.dialog ? false : true;
      this.is_minimized   = false;
      this.is_minimizable = this.dialog ? false : true;
      this.is_sessionable = this.dialog ? false : true;
      this.is_closable    = true;
      this.width          = -1;
      this.height         = -1;
      this.gravity        = "none";

      this.focus_hook = null;
      this.blur_hook = null;

      // DOM Elements
      this.$element = null;
      this.menus    = [];

      console.log("Window inited...", this);
    },

    destroy : function() {
      var self = this;

      if ( this.uuid ) {
        $.post("/", {'ajax' : true, 'action' : 'flush', 'uuid' : self.uuid}, function(data) {
          console.log('Flushed Window', self, self.uuid, data);
        });
      }

      if ( this.menus.length ) {
        for ( var i = 0; i < this.menus.length; i++ ) {
          this.menus[i].destroy();
        }
        this.menus = null;
      }

      if ( this.app ) {
        this.app.destroy();
      }

      $(this.$element).fadeOut(ANIMATION_SPEED, function() {
        $(self.$element).empty().remove();
      });

      console.log("Window destroyed...", this);
    },

    event : function(app, ev, args, callback) {

      if ( this.uuid ) {
        var self = this;
        var pargs = {'ajax' : true, 'action' : 'event', 'cname' : app.name ,'uuid' : self.uuid, 'instance' : {'name' : self.name, 'action' : ev, 'args' : args }};
        $.post("/", pargs, function(data) {
          console.log('Event Window', self, self.uuid, pargs, data);

          callback(data.result, data.error);
        });
      }
    },

    create : function(desktop, id, zi, method) {
      if ( !this.created ) {
        var self = this;

        var el = this.dialog ? $($("#Dialog").html()) : $($("#Window").html());
        var menu = false;

        // Create Menu
        if ( this.menu && sizeof(this.menu) ) {
          forEach(this.menu, function(ind, m) {
            var mel = $("<li class=\"Top\"><span class=\"Top\"></span></li>");
            mel.find("span").html(ind);

            if ( m instanceof Object && sizeof(m) ) {
              var menu = new Menu();
              forEach(m, function(sind, sm) {
                menu.create_item(sind, null, sm);
              });

              mel.append(menu.$element);
              self.menus.push(menu);

            } else {
              mel.find("span").addClass(m);
            }

            el.find(".WindowMenu ul.Top").append(mel);
          });
        }

        // Show/Hide Menu
        if ( el.find(".WindowMenu li").length ) {
          el.find(".WindowContent").addClass("HasMenu");
          menu = true;
        } else {
          el.find(".WindowMenu").hide();
        }

        // Show/Hide Statusbar
        if ( this.statusbar ) {
          el.find(".WindowBottom").show();
          el.find(".WindowContent").addClass("HasBottom");
        } else {
          el.find(".WindowBottom").hide();
        }

        // Content and buttons
        el.find(".WindowTopInner span").html(this.title);
        if ( this.dialog ) {
          el.find(".DialogContent").html(this.content).addClass(this.argv.type);
        } else {
          el.find(".WindowTopInner img").attr("src", "/img/icons/16x16/" + this.icon);
          el.find(".WindowContentInner").html(this.content);

          $(el).find(".WindowMenu li.Top").hover(function() {
            $(this).find("ul").show();
          }, function() {
            $(this).find("ul").hide();
          });
        }

        // Attributtes
        el.attr("id", id);
        el.css("z-index", zi);
        el.find(".WindowContent").css("overflow", this.is_scrollable ? "auto" : "hidden");

        if ( !isNaN(this.width) && (this.width > 0) ) {
          $(el).css("width", this.width + "px");
        }
        if ( !isNaN(this.height) && (this.height > 0) ) {
          $(el).css("height", (this.height) + "px");
        }

        if ( this.gravity === "center" ) {
          $(el).css({
            "top" : (($(document).height() / 2) - ($(el).height() / 2)) + "px",
            "left" : (($(document).width() / 2) - ($(el).width() / 2)) + "px"
          });
        }

        // Events
        el.mousedown(function() {
          desktop.focusWindow(self);
        });

        if ( this.is_closable ) {
          el.find(".ActionClose").click(function() {
            desktop.removeWindow(self);
          });
        } else {
          el.find(".ActionClose").hide();
        }

        if ( this.is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            self.minimize();
          });
        } else {
          el.find(".ActionMinimize").hide();
        }

        if ( this.is_maximizable ) {
          el.find(".ActionMaximize").click(function() {
            self.maximize();
          });
        } else {
          el.find(".ActionMaximize").hide();
        }

        if ( this.attrs && sizeof(this.attrs) ) {
          if ( this.attrs.position instanceof Object ) {
            el.offset(this.attrs.position);
          }
          if ( this.attrs.size instanceof Object ) {
            el.width(this.attrs.size.width + 'px');
            el.height(this.attrs.size.height + 'px');
          }
        }

        // DOM
        desktop.$element.append(el);

        // Fix title alignment
        var lw = this.dialog ? 0 : 16;
        var hw = 0;
        $(el).find(".WindowTop .WindowTopController").filter(":visible").each(function() {
          hw += parseInt($(this).width(), 10);
        });

        $(el).find(".WindowTopInner span").css({
          "padding-left" : lw + "px",
          "padding-right" : hw + "px"
        });

        // Adjustments after DOM
        if ( !isNaN(this.height) && (this.height > 0) ) {
          if ( menu ) {
            var appendHeight = $(el).find(".WindowMenu").height();
            $(el).css("height", (this.height + appendHeight) + "px");
          }
        }


        // Add Handlers
        if ( this.is_draggable ) {
          el.draggable({
            handle : ".WindowTop",
            start : function() {
              el.addClass("Blend");
              API.ui.cursor("move");
            },
            stop : function() {
              el.removeClass("Blend");
              API.ui.cursor("default");
            }
          });
        }

        if ( this.is_resizable ) {
          el.resizable({
            handles : "se",
            start : function() {
              el.addClass("Blend");
            },
            stop : function() {
              el.removeClass("Blend");
            }
          });
        }

        this.$element = el;

        // Run Dialog or Application
        if ( this.dialog ) {
          desktop.focusWindow(this);
        } else {
          setTimeout(function() {
            //try {
              if ( window[method] ) {
                self.app = window[method](Application, self, API, self.argv);
              }
            //} catch ( e ) {
            //  cconsole.error("Window application creation failed...", e);
            //  return;
            //}

            if ( self.uuid ) {
              $.post("/", {'ajax' : true, 'action' : 'register', 'uuid' : self.uuid, 'instance' : {'name' : self.name}}, function(data) {
                console.log('Registered Window', self, self.uuid, data);
              });
            }

            if ( self.app ) {
              setTimeout(function() {
                self.app.run();
              }, 100);
            }
          }, 0);
        }

        if ( this.create_callback ) {
          setTimeout(function() {
            self.create_callback();
          }, 0);
        }
      }

      this.created = true;
    },

    load : function(callback) {
      if ( !this.loaded ) {
        var self = this;
        $.post("/", {'ajax' : true, 'action' : 'load', 'app' : self.name}, function(data) {
          if ( data.success ) {
            _Resources.addResources(data.result.resources, function() {
              self.setTitle(data.result.title);
              self.setContent(data.result.content);
              self.setIcon(data.result.icon);

              self.uuid           = data.result.uuid;
              self.is_draggable   = data.result.is_draggable;
              self.is_resizable   = data.result.is_resizable;
              self.is_scrollable  = data.result.is_scrollable;
              self.is_maximizable = data.result.is_maximizable;
              self.is_minimizable = data.result.is_minimizable;
              self.is_closable    = data.result.is_closable;
              self.menu           = data.result.menu;
              self.statusbar      = data.result.statusbar;
              self.width          = parseInt(data.result.width, 10);
              self.height         = parseInt(data.result.height, 10);
              self.gravity        = data.result.gravity;

              callback(data.result['class']);
            });
          } else {
            API.system.dialog("error", data.error);
          }
        });
      }

      this.loaded = true;
    },

    redraw : function() {

    },

    focus : function() {
      if ( !this.current ) {
        _TopIndex++;

        this.restore();

        this.$element.css("z-index", _TopIndex);
        this.$element.addClass("Current");

        if ( this.focus_hook ) {
          this.focus_hook();
        }
      }
      this.current = true;
    },

    blur : function() {
      if ( this.current ) {
        this.$element.removeClass("Current");

        if ( this.blur_hook ) {
          this.blur_hook();
        }
      }
      this.current = false;
    },

    minimize : function() {
      if ( this.is_minimizable ) {
        if ( !this.is_minimized ) {
          var self = this;

          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.toggleWindow(self, false);
          }});

        }

        this.is_minimized = true;
      }
    },

    maximize : function() {
      if ( this.is_maximizable ) {
        if ( !this.is_maximized ) {
          this.last_attrs = {
            'size'     : {'width' : this.$element.width(), 'height' : this.$element.height()},
            'position' : this.$element.offset()
          };


          var w = parseInt($(document).width(), 10);
          var h = parseInt($(document).height(), 10);

          this.$element.css({
            'top'    : '40px',
            'left'   : '10px'
          }).animate({
            'width'  : (w - 20) + "px",
            'height' : (h - 50)  + "px"
          }, {'duration' : ANIMATION_SPEED});
          this.is_maximized = true;
        } else {
          this.restore();
        }

      }
    },

    restore : function() {
      if ( this.is_minimized  ) {
        var self = this;
        this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
          _Desktop.toggleWindow(self, true);
        }});

        this.is_minimized = false;
      }


      if ( this.is_maximized ) {
        if ( this.last_attrs !== null ) {
          this.$element.animate({
            'top'    : this.last_attrs.position.top + 'px',
            'left'   : this.last_attrs.position.left + 'px',
            'width'  : this.last_attrs.size.width + 'px',
            'height' : this.last_attrs.size.height + 'px'
          }, {'duration' : ANIMATION_SPEED});

          this.last_attrs === null;

        }
        this.is_maximized = false;
      }

    },

    setTitle : function(t) {
      this.title = t;
    },

    setContent : function(c) {
      this.content = c;
    },

    setIcon : function(i) {
      this.icon = i;
    },

    getAttributes : function() {
      return {
        'name'     : this.name,
        'size'     : {'width' : this.$element.width(), 'height' : this.$element.height()},
        'position' : this.$element.offset(),
        'argv'     : this.argv
      };
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  var Menu = Class.extend({

    init : function() {
      this.$element = $("<ul></ul>");
      this.$element.attr("class", "Menu");
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

    create_item : function(title, icon, method, disabled) {
      var litem = $("<li><span><img alt=\"\" src=\"/img/blank.gif\" /></span></li>");
      if ( typeof method == "function" ) {
        litem.click(method);
      } else {
        litem.find("span").attr("class", method);
      }
      if ( icon ) {
        litem.find("img").attr("src", "/img/icons/16x16/" + icon);
      }
      litem.append(title);
      if ( disabled ) {
        $(litem).addClass("Disabled");
      }

      if ( method == "cmd_Close" ) {
        $(litem).click(function() {
          $(this).parents(".Window").find(".ActionClose").click();
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

  var Dialog = Window.extend({

    init : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this._super("Dialog", true, {'type' : type});

      this.width = 200;
      this.height = 100;
      this.gravity = "center";
      this.content = message;

      cmd_close  = cmd_close  || function() {};
      cmd_ok     = cmd_ok     || function() {};
      cmd_cancel = cmd_cancel || function() {};

      var self = this;
      this.create_callback = function() {
        if ( type == "confirm" ) {
          self.$element.find(".DialogButtons .Close").hide();
          self.$element.find(".DialogButtons .Ok").show();
          self.$element.find(".DialogButtons .Cancel").show();
        }

        self.$element.find(".DialogButtons .Close").click(function() {
          self.$element.find(".ActionClose").click();
          cmd_close();
        });
        self.$element.find(".DialogButtons .Ok").click(function() {
          self.$element.find(".ActionClose").click();
          cmd_ok();
        });
        self.$element.find(".DialogButtons .Cancel").click(function() {
          self.$element.find(".ActionClose").click();
          cmd_cancel();
        });
      };
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // OPERATION DIALOG
  /////////////////////////////////////////////////////////////////////////////

  var OperationDialog = Window.extend({

    init : function(type) {
      this._super("OperationDialog", true, {'type' : type});

      this.width          = 400;
      this.height         = 200;
      this.gravity        = "center";
      this.is_minimizable = true;
    },

    destroy : function() {
      this._super();
    },

    create : function(desktop, id, zi, method) {
      this._super(desktop, id, zi, method);

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

  var ColorOperationDialog = OperationDialog.extend({

    init : function(start_color, clb_finish) {

      this._super("Color");

      this.clb_finish = clb_finish   || function() {};
      this.colorObj   = RGBFromHex(start_color  || "#ffffff");

      this.title      = "Choose color...";
      this.content    = $("#OperationDialogColor").html();
      this.width      = 400;
      this.height     = 170;
    },

    create : function(desktop, id, zi, method) {
      var self = this;
      this._super(desktop, id, zi, method);

      var desc      = $(self.$element).find(".CurrentColorDesc");
      var cube      = $(self.$element).find(".CurrentColor");

      var _update   = function() {
        self.colorObj.red   = parseInt($(self.$element).find(".SliderR").slider("value"), 10);
        self.colorObj.green = parseInt($(self.$element).find(".SliderG").slider("value"), 10);
        self.colorObj.blue  = parseInt($(self.$element).find(".SliderB").slider("value"), 10);
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
      }).
        find(".SliderR").slider("value", this.colorObj.red).
        find(".SliderG").slider("value", this.colorObj.green).
        find(".SliderB").slider("value", this.colorObj.blue);

      _update();
    }
  });

  var CopyOperationDialog = OperationDialog.extend({

    init : function(type, message, argv, clb_finish, clb_progress, clb_cancel) {
      this._super("Copy");

      this.aargv        = argv         || {};
      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this.title    = "Copy file";
      this.content  = $("#OperationDialogCopy").html();
      this.width    = 400;
      this.height   = 170;
    },


    create : function(desktop, id, zi, method) {
      var self = this;
      this._super(desktop, id, zi, method);

      $(this.content).find(".ProgressBar").progressbar({
        value : 50
      });
    }

  });

  var UploadOperationDialog = OperationDialog.extend({

    init : function(clb_finish, clb_progress, clb_cancel) {
      var self = this;

      this._super("Upload");

      this.clb_finish   = clb_finish   || function() {};
      this.clb_progress = clb_progress || function() {};
      this.clb_cancel   = clb_cancel   || function() {};

      this.title    = "Upload file";
      this.content  = $("#OperationDialogUpload").html();
      this.width    = 400;
      this.height   = 170;
      this.uploader = null;
    },

    create : function(desktop, id, zi, method) {
      this._super(desktop, id, zi, method);

      var self = this;
      $(this.$element).find(".ProgressBar").progressbar({
        value : 0
      });

      var trigger = this.$element.find("button.Choose").show();
      var pbar    = this.$element.find(".ProgressBar");

      self.uploader = new qq.FileUploader({
        element : trigger[0],
        action  : '/',
        params : {
          ajax   : true,
          action : 'upload'
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

  var FileOperationDialog = OperationDialog.extend({

    init : function(type, argv, clb_finish) {

      this.aargv         = argv         || {};
      this.atype         = type         || "open";
      this.clb_finish    = clb_finish   || function() {};
      this.selected_file = null;

      this._super("File");

      this.title        = type == "save" ? "Save As..." : "Open File";
      this.content      = $("#OperationDialogFile").html();
      this.is_resizable = true;
      this.width        = 400;
      this.height       = 300;
    },

    create : function(desktop, id, zi, method) {
      var self = this;

      this._super(desktop, id, zi, method);

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

      readdir("/");


    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  var Application = (function() {

    return Class.extend({
      init : function(name) {
        this.name = name;

        console.log("Application created", this.name, this);
      },

      destroy : function() {
        console.log("Application destroyed", this.name, this);
      },

      run : function() {
        console.log("Application running", this.name, this);
      }

    });

  })();

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  $(window).ready(function() {
    if ( !supports_html5_storage() ) {
      alert("Your browser does not support WebStorage. Cannot continue...");
      return;
    }


    /*
    $(window).scroll(function(ev) {
      $(window).scrollTop(0).scrollLeft(0);
    });
    */

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

    $(document).keydown(function(ev) {
      var key = ev.keyCode || ev.which;
      var target = ev.target || ev.srcElement;
      if ( target ) {
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

    _Resources = new ResourceManager();

    $.post("/", {'ajax' : true, 'action' : 'init'}, function(data) {

      if ( data.success ) {
        _Settings = new SettingsManager(data.result.settings);
        _Desktop = new Desktop();

        API.session.restore();
      } else {
        alert(data.error);
      }

    });
  });

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

})($);
