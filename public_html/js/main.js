/**
 * JavaScript Window Manager
 *
 * TODO: Finish Login screen
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

  /**
   * Local settings
   */
  var SETTING_REVISION = 2;
  var ENABLE_LOGIN     = false;
  var ANIMATION_SPEED  = 400;

  /**
   * Local references
   */
  var _Resources       = null;
  var _Settings        = null;
  var _Desktop         = null;
  var _Window          = null;
  var _TopIndex        = 11;

  /**
   * NULL references
   * @return void
   */
  function __null() {
    _Resources         = null;
    _Settings          = null;
    _Desktop           = null;
    _Window            = null;
    _TopIndex          = 11;
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

    //
    // API: USER INTEFACE
    //

    'ui' : {
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

      'dialog_rename' : function(path, clb_finish) {
        _Desktop.addWindow(new RenameOperationDialog(path, clb_finish));
      },

      'dialog_upload' : function(path, clb_finish, clb_progress, clb_cancel) {
        _Desktop.addWindow(new UploadOperationDialog(path, clb_finish, clb_progress, clb_cancel));
      },

      'dialog_file' : function(clb_finish, mime_filter, type, cur_dir) {
        mime_filter = mime_filter || [];
        type = type || "open";
        cur_dir = cur_dir || "/";

        _Desktop.addWindow(new FileOperationDialog(type, mime_filter, clb_finish, cur_dir));
      },

      'dialog_color' : function(start_color, clb_finish) {
        _Desktop.addWindow(new ColorOperationDialog(start_color, clb_finish));
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

          var ewhich = ev.which || 1;
          if ( ewhich === which ) {
            _destroy();

            cm = new Menu(where);
            forEach(items, function(i, it) {
              cm.create_item(it. title, it.icon, it.method, it.disabled, it.attribute === "checked");
            });

            var off = $(where).offset();
            $("#ContextMenu").css(
              {
                "left" :off.left + "px",
                "top" : off.top + "px"
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

    //
    // API: SESSION
    //

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
                  'size'     : el.size,
                  'attribs'  : el.attribs,
                  'restore'  : true
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

      run : function(settings) {
        if ( this.running ) {
          return;
        }

        this.applySettings();

        var dock_items = [
          {
            "title"  : "About",
            "icon"   : "/img/icons/16x16/actions/gtk-about.png",
            "launch" : "SystemAbout"
          },
          {
            "title"  : "System Settings",
            "icon"   : "/img/icons/16x16/categories/applications-system.png",
            "launch" : "SystemSettings"
          },
          {
            "title"  : "User Information",
            "icon"   : "/img/icons/16x16/apps/user-info.png",
            "launch" : "SystemUser"
          },
          {
            "title"  : "Save and Quit",
            "icon"   : "/img/icons/16x16/actions/gnome-logout.png",
            "launch" : "SystemLogout"
          }
        ];

        this.panel = new Panel();
        this.panel.addItem(new PanelItemMenu());
        this.panel.addItem(new PanelItemSeparator());
        this.panel.addItem(new PanelItemWindowList());
        this.panel.addItem(new PanelItemClock(), "right");
        this.panel.addItem(new PanelItemSeparator(), "right");
        this.panel.addItem(new PanelItemDock(dock_items), "right");

        API.session.restore();

        this.running = true;
      },

      redraw : function() {

      },

      // WINDOWS

      addWindow : function(win) {
        if ( win instanceof Window ) {
          var self = this;

          var callback = function(method) {
            var id = "Window_" + self.stack.length;

            win.create(self, id, _TopIndex, method, function() {
              setTimeout(function() {
                API.ui.cursor("default");
              }, 50);
            });

            _TopIndex++;

            self.stack.push(win);

            //win.focus();
            if ( !win.is_minimized && !win.is_maximized ) {
              //$(win.$element).trigger("mousedown");
              self.focusWindow(win);
            }

            self.panel.redraw(self, win, false);
          };


          if ( win.dialog ) {
            callback({});
          } else {
            API.ui.cursor("wait");
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

      restoreWindow : function(win) {
      },

      maximizeWindow : function(win) {
      },

      minimizeWindow : function(win) {
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

    // FIXME: Generic handler
    redraw : function(desktop, win, remove) {
      var wpi = this.getItem("PanelItemWindowList", 0);
      if ( wpi ) {
        wpi.redraw(desktop, win, remove);
      }
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
      if ( i instanceof PanelItem ) {

        console.log("Panel", "Added item", i.name, i);

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

    removeItem : function(x) {
      for ( var i = 0; i < this.items.length; i++ ) {
        if ( this.items[i] === x ) {
          i.destroy();

          console.log("Panel", "Removed item", x.name, x);

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
  var PanelItem = Class.extend({

    init : function(name, align)  {
      this.name = name;
      this.align = align || "AlignLeft";
      this.$element = null;
    },

    create : function(pos) {
      this.$element = $("<li></li>").attr("class", "PanelItem " + this.name);
      if ( pos ) {
        this.align = pos;
      }
      if ( this.align == "right" ) {
        this.$element.addClass("AlignRight");
      }

      this.$element.mousedown(function(ev) {
        ev.preventDefault();
      });

      return this.$element;
    },

    redraw : function() {

    },

    destroy : function() {
      if ( this.$element ) {
        this.$element.empty();
        this.$element.remove();
      }
    }

  });


  /**
   * PanelItem: PanelItemMenu
   *
   * @class
   */
  var PanelItemMenu = PanelItem.extend({
    init : function(title, icon, menu) {
      this._super("PanelItemMenu");
      this.title = title || "Launch Application";
      this.icon = icon || '/img/icons/16x16/categories/gnome-applications.png';

      var menu_items = menu || null;
      if ( menu_items === null ) {
        var o;
        var apps = _Settings._get("system.app.registered", true);
        menu_items = [];
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
      }

      this.menu = menu_items;
    },

    create : function(pos) {
      var self = this;
      var el = this._super(pos);
      var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" />");
      $(el).append(img);

      $(el).click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        return API.application.context_menu(ev, self.menu, $(this), 1);
      });

      return el;
    },

    destroy : function() {
      if ( this.menu ) {
        this.menu = null;
      }
      this._super();
    }

  });

  /**
   * PanelItem: PanelItemSeparator
   *
   * @class
   */
  var PanelItemSeparator = PanelItem.extend({
    init : function() {
      this._super("PanelItemSeparator");
    },

    create : function(pos) {
      return this._super(pos);
    },


    destroy : function() {
      this._super();
    }

  });


  /**
   * PanelItem: PanelItemWindowList
   *
   * @class
   */
  var PanelItemWindowList = PanelItem.extend({
    init : function() {
      this._super("PanelItemWindowList", "left");
    },

    create : function(pos) {
      return this._super(pos);
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

          self.$element.append(el);
        }

        if ( remove === undefined ) {
          this.$element.find(".PanelItemWindow").removeClass("Current");
          $("#" + id).addClass("Current");
        }
      }
    },


    destroy : function() {
      this._super();
    }
  });


  /**
   * PanelItem: PanelItemClock
   *
   * @class
   */
  var PanelItemClock = PanelItem.extend({
    init : function() {
      this._super("PanelItemWindowClock", "right");
    },

    create : function(pos) {
      var ret = this._super(pos);
      $(ret).append("<span></span>");

      var d = new Date();
      $(ret).find("span").html(sprintf("%02d/%02d/%02d %02d:%02s", d.getDate(), d.getMonth(), d.getYear(), d.getHours(), d.getMinutes()));

      // Start clock
      this.clock_interval = setInterval(function() {
        var d = new Date();
        $(ret).find("span").html(sprintf("%02d/%02d/%02d %02d:%02s", d.getDate(), d.getMonth(), d.getYear(), d.getHours(), d.getMinutes()));
      }, 500);

      return ret;
    },


    destroy : function() {
      if ( this.clock_interval ) {
        clearInterval(this.clock_interval);
      }

      this._super();
    }
  });


  /**
   * PanelItem: PanelItemDock
   *
   * @class
   */
  var PanelItemDock = PanelItem.extend({
    init : function(items) {
      this._super("PanelItemDoc");
      this.items = items || [];
    },

    create : function(pos) {
      var el = this._super(pos);

      var e, o;
      for ( var i = 0; i < this.items.length; i++ ) {
        e = this.items[i];
        o = $("<div class=\"PanelItem PanelItemLauncher\"><span class=\"\"><img alt=\"\" src=\"/img/blank.gif\" title=\"\" ></span></div>");
        o.find("span").addClass("launch_" + e.launch);
        o.find("img").attr("src", e.icon);
        o.find("img").attr("title", e.title);
        el.append(o);
      }

      $(el).find(".PanelItemLauncher").click(function(ev) {
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


      return el;
    },


    destroy : function() {
      this._super();
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

    init : function(name, dialog, argv, attrs) {
      // Various properties
      this.created         = false;
      this.loaded          = false;
      this.current         = false;
      this.app             = null;
      this.uuid            = null;
      this.last_attrs      = null;

      // Window main attributes
      this.name        = name;
      this.title       = this.dialog ? "Dialog" : "Window";
      this.content     = "";
      this.icon        = "emblems/emblem-unreadable.png";
      this.dialog      = dialog ? true : false;
      this.argv        = argv;
      this.attrs       = attrs;
      this.menu        = [];
      this.menubar     = false;
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
      this.top            = -1;
      this.left           = -1;
      this.gravity        = "none";

      // Window hooks FIXME: Event listeners on_XXX
      this.focus_hook  = null;
      this.blur_hook   = null;

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

      if ( sizeof(this.menus) ) {
        /*
        for ( var i = 0; i < this.menus.length; i++ ) {
          this.menus[i].destroy();
        }
        */
        this.menus = null;
      }

      this.focus_hook  = null;
      this.blur_hook   = null;

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

    create : function(desktop, id, zi, method, mcallback) {
      if ( !this.created ) {
        var self = this;
        mcallback = mcallback || function() {};

        var el = this.dialog ? $($("#Dialog").html()) : $($("#Window").html());
        var fresh = true;

        // Attributtes
        el.attr("id", id);
        el.css("z-index", zi);
        el.find(".WindowContent").css("overflow", this.is_scrollable ? "auto" : "hidden");

        // Apply default size
        if ( !isNaN(this.width) && (this.width > 0) ) {
          $(el).width(this.width + "px");
        }
        if ( !isNaN(this.height) && (this.height > 0) ) {
          $(el).height(this.height + "px");
        }

        // Create Menu
        if ( this.menu && sizeof(this.menu) ) {
          forEach(this.menu, function(ind, m) {
            var mel = $("<li class=\"Top\"><span class=\"Top\"></span></li>");
            mel.find("span").html(ind);

            if ( m instanceof Object && sizeof(m) ) {
              var menu_items = [];
              for ( var x in m ) {
                if ( m.hasOwnProperty(x) ) {
                  menu_items.push({
                    "title"  : x,
                    "method" : m[x], // Can be changed!
                    "name"   : m[x]
                  });
                }
              }
              if ( menu_items.length ) {
                self.menus[ind] = menu_items;
              }

            } else {
              mel.find("span").addClass(m);
            }

            el.find(".WindowMenu ul.Top").append(mel);
          });
        }

        // Show/Hide Menu
        if ( el.find(".WindowMenu li").length ) {
          el.find(".WindowContent").addClass("HasMenu");
          this.menubar = true;
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

          el.find(".WindowTopInner img").click(function(ev) {
            API.application.context_menu(ev, [
              {"title" : (self.is_maximized ? "Restore" : "Maximize"), "disabled" : !self.is_maximizable, "method" : function() {
                if ( self.is_maximizable ) {
                  el.find(".ActionMaximize").click();
                }
              }},
              {"title" : (self.is_minimized ? "Show" : "Minimize"), "disabled" : !self.is_minimizable, "method" : function() {
                if ( self.is_minimizable ) {
                  el.find(".ActionMinimize").click();
                }
              }},
              {"title" : "Close", "disabled" : !self.is_closable, "method" : function() {
                if ( self.is_closable ) {
                  el.find(".ActionClose").click();
                }
              }}

            ], $(this), 1);

            ev.stopPropagation();
            ev.preventDefault();
          });

          $(el).find(".WindowMenu li.Top").click(function(ev) {
            var mmenu = $(this).find("span").html();
            return API.application.context_menu(ev, self.menus[mmenu], $(this), 1);
          });
        }

        // Events
        el.bind('mousedown', function(ev) {
          desktop.focusWindow(self);
        });
        if ( this.is_maximizable ) {
          el.find(".WindowTopInner").dblclick(function() {
            el.find(".ActionMaximize").click();
          });
        }

        if ( this.is_closable ) {
          el.find(".ActionClose").click(function() {
            desktop.removeWindow(self);
          });
        } else {
          el.find(".ActionClose").parent().hide();
        }

        if ( this.is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            self.minimize();
          });
        } else {
          el.find(".ActionMinimize").parent().hide();
        }

        if ( this.is_maximizable ) {
          el.find(".ActionMaximize").click(function() {
            self.maximize();
          });
        } else {
          el.find(".ActionMaximize").parent().hide();
        }

        //
        // INSERT
        //
        desktop.$element.append(el);


        //
        // Size and dimension
        //
        if ( this.gravity === "center" ) {
          this.top = (($(document).height() / 2) - ($(el).height() / 2));
          this.left = (($(document).width() / 2) - ($(el).width() / 2));
        } else {
          // Find free space for new windows
          var ppos = _Settings._get("desktop.panel.position") == "top" ? "top" : "bottom";
          this.top = ppos == "top" ? 50 : 20;
          this.left = 20;
        }

        // Check if window has any saved attributes for override (session restore etc)
        if ( this.attrs && sizeof(this.attrs) ) {
          if ( this.attrs.position instanceof Object ) {
            this.top = this.attrs.position.top;
            this.left = this.attrs.position.left;
          }
          if ( this.attrs.size instanceof Object ) {
            if ( this.attrs.restore ) {
              fresh = false;
            }

            this.width = this.attrs.size.width;
            this.height = this.attrs.size.height;
          }
          if ( this.attrs.restore ) {
            if ( this.attrs.attribs && sizeof(this.attrs.attribs) ) {
              this.is_minimized = this.attrs.attribs.minimized;
              this.is_maximized = this.attrs.attribs.maximized;
            }
          }
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
        var lw = this.dialog ? 0 : 16;
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
            this.resize(this.width, this.height, el);
          }
        }

        // Add jQuery UI Handlers
        if ( this.is_draggable ) {
          el.draggable({
            handle : ".WindowTop",
            start : function(ev) {

              if ( self.is_maximized ) {
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

        if ( this.is_resizable ) {
          el.resizable({
            handles : "se",
            start : function() {
              if ( self.is_maximized ) {
                API.ui.cursor("not-allowed");
                return false;
              }
              el.addClass("Blend");

              return true;
            },
            stop : function() {
              el.removeClass("Blend");
            }
          });
        }

        this.$element = el;

        //
        // Run Dialog or Application
        //
        if ( this.dialog ) {
          desktop.focusWindow(this);

          mcallback();
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

                mcallback();
              });
            }

            if ( self.app ) {
              setTimeout(function() {
                self.app.run();
              }, 100);
            }
          }, 0);
        }

        if ( this.is_minimized ) {
          $(el).hide();
        }
        if ( this.is_maximized ) {
          this.$element.find(".ActionMaximize").parent().addClass("Active");
          if ( this.is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
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
              self.title   = data.result.title;
              self.content = data.result.content;
              self.icon    = data.result.icon;

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

        if ( this.is_minimized ) {
          this.minimize();
        }

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
        var self = this;
        if ( this.is_minimized ) {
          this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.restoreWindow(self);
          }});

          this.is_minimized = false;
        } else {
          this.blur();

          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.minimizeWindow(self);
          }});

          this.is_minimized = true;
        }

      }
    },

    maximize : function() {
      if ( this.is_maximizable ) {
        if ( this.is_maximized ) {
          if ( this.last_attrs !== null ) {
            this.top = this.last_attrs.position.top;
            this.left = this.last_attrs.position.left;
            this.width = this.last_attrs.size.width;
            this.height = this.last_attrs.size.height;

            this.$element.animate({
              'top'    : this.top + 'px',
              'left'   : this.left + 'px',
              'width'  : this.width + 'px',
              'height' : this.height + 'px'
            }, {'duration' : ANIMATION_SPEED});

            this.last_attrs === null;
          }

          this.$element.find(".ActionMaximize").parent().removeClass("Active");
          this.is_maximized = false;

          if ( this.is_resizable ) {
            this.$element.find(".ui-resizable-handle").show();
          }
        } else {
          this.last_attrs = {
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
          this.is_maximized = true;

          if ( this.is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }

      }
    },

    resize : function(width, height, el) {
      el = el || this.$element;
      var appendWidth = 4;
      var appendHeight = 4 + el.find(".WindowTop").height();

      if ( this.menubar ) {
        appendHeight += el.find(".WindowMenu").height();
      }

      if ( this.statusbar ) {
        appendHeight += el.find(".WindowBottom").height();
      }

      el.css("height", (height + appendHeight) + "px");
      el.css("width", (width + appendWidth) + "px");
    },

    setMenuItemAttribute : function(m, it, attribute) {
      if ( this.menus[m] ) {
        for ( var i in this.menus[m] ) {
          if ( this.menus[m].hasOwnProperty(i) ) {
            if ( this.menus[m][i]['name'] == it ) {
              this.menus[m][i]['attribute'] = attribute;
              break;
            }
          }
        }
      }
    },

    setMenuItemAction : function(m, it, callback) {
      if ( this.menus[m] ) {
        for ( var i in this.menus[m] ) {
          if ( this.menus[m].hasOwnProperty(i) ) {
            if ( this.menus[m][i]['name'] == it ) {
              this.menus[m][i]['method'] = callback;
              break;
            }
          }
        }
      }
    },

    getAttributes : function() {
      return {
        'name'     : this.name,
        'size'     : {'width' : this.$element.width(), 'height' : this.$element.height()},
        'position' : {'left' : this.left, 'top' : this.top},
        'attribs'  : {'minimized' : this.is_minimized, 'maximized' : this.is_maximized},
        'argv'     : this.argv
      };
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

    create_item : function(title, icon, method, disabled, checked) {
      var self = this;
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
      if ( checked ) {
        $(litem).addClass("checked");
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
      this._super("Dialog", true, {'type' : type});

      this.width = 200;
      this.height = 70;
      this.gravity = "center";
      this.content = message;
      this.dialog_type = type;

      this.cmd_close  = cmd_close  || function() {};
      this.cmd_ok     = cmd_ok     || function() {};
      this.cmd_cancel = cmd_cancel || function() {};
    },

    create : function(desktop, id, zi, method) {
      var self = this;
      this._super(desktop, id, zi, method);

      if ( this.dialog_type == "confirm" ) {
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

      this.title    = "Choose color...";
      this.icon     = "apps/style.png";
      this.content  = $("#OperationDialogColor").html();
      this.width    = 400;
      this.height   = 170;
    },

    create : function(desktop, id, zi, method) {
      var self = this;
      this._super(desktop, id, zi, method);

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

      this.title    = "Copy file";
      this.content  = $("#OperationDialogRename").html();
      this.width    = 200;
      this.height   = 100;
    },


    create : function(desktop, id, zi, method) {
      var self = this;
      this._super(desktop, id, zi, method);

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

      this.title    = "Upload file";
      this.icon     = "actions/up.png";
      this.content  = $("#OperationDialogUpload").html();
      this.width    = 400;
      this.height   = 140;
      this.uploader = null;
    },

    create : function(desktop, id, zi, method) {
      this._super(desktop, id, zi, method);

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

      this.title        = type == "save" ? "Save As..." : "Open File";
      this.icon         = type == "save" ? "actions/document-save.png" : "actions/document-open.png";
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

      readdir(this.init_dir);


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
        if ( _Window && _Window.dialog ) {
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
      _Resources = new ResourceManager();
      $.post("/", {'ajax' : true, 'action' : 'init'}, function(data) {
        if ( data.success ) {
          _Settings = new SettingsManager(data.result.settings);
          _Desktop = new Desktop();

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
