(function($, undefined) {

  var ANIMATION_SPEED = 400;

  var _ApplicationRegister = {};
  var _Resources           = null;
  var _Desktop             = null;
  var _Window              = null;
  var _TopIndex            = 11;
  var _MimeHandlers        = {};
  var _PreviousSession     = null;

  function __null() {
    _ApplicationRegister = {};
    _Resources           = null;
    _Desktop             = null;
    _Window              = null;
    _TopIndex            = 11;
    _MimeHandlers        = {};
    _PreviousSession     = null;
  }

  var cconsole = {
    'log' : function() {
      var a = [];
      for ( var x in arguments ) {
        if ( arguments.hasOwnProperty(x) ) {
          a.push(arguments[x]);
        }
      }

      var cls = a.shift();
      var first = a.shift();
      a.unshift("<b>" + first + "</b>");

      $("#Console").prepend($("<div></div>").attr("class", cls).html(a.join(" "))).scrollTop(0);
    },
    'info' : function(message) {
      $("#Console").prepend($("<div></div>").attr("class", "info").html(message)).scrollTop(0);
    },
    'error' : function(message) {
      $("#Console").prepend($("<div></div>").attr("class", "error").html(message)).scrollTop(0);
    }
  };

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

    'system' : {
      'run' : function(path, mime) {
        cconsole.log("info", "API", "run", mime, path);
        if ( mime ) {
          forEach(_MimeHandlers, function(mt, mapp, mind, mlast) {
            var mte = mt.split("/");
            var mbase = mte.shift();
            var mtype = mte.shift();

            if ( mtype == "*" ) {
              var ctbase = mime.split("/")[0];
              if ( ctbase == mbase ) {
                console.log("API found suited application for", mime, ":", mapp);
                cconsole.log("info", "API", "found application for", mime, "=>", mapp);

                API.system.launch(mapp, path);
                return false;
              }
            }/* else {

              if ( mt == mime ) {
                API.launch(mapp);
                return false;
              }
            }*/

            if ( mind == mlast ) {
              API.system.dialog("error", "Found no suiting application for '" + path + "'");
            }
            return true;
          });
        }
      },

      'launch' : function(app_name, args, attrs) {
        args = args || {};
        attrs = attrs || {};

        console.log("API launching", app_name, args);
        cconsole.log("info", "API", "launching", app_name);
        _Desktop.addWindow(new Window(app_name, false, args, attrs));
      },

      'call' : function(method, argv, callback) {
        $.post("/", {'ajax' : true, 'action' : 'call', 'method' : method, 'args' : argv}, function(data) {
          if ( data.success ) {
            callback(data.result, null);
          } else {
            API.system.dialog("error", data.error);
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
        _Desktop.addWindow(new OperationDialog('upload', 'Uploading file...', clb_finish, clb_progress, clb_cancel));
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

        return function(ev, items, where) {

          if ( inited === false ) {
            $(document).click(function(ev) {
              if ( !$(ev.target).filter(function(){ return $(this).parents(".Menu").length; }).length ) {
                _destroy();
              }
            });

            initied = true;
          }

          if ( ev.which === 3 ) {
            _destroy();

            cm = new Menu();
            forEach(items, function(i, it) {
              cm.create_item(it. title, it.icon, it.method);
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
        'load' : function(settings) {
          console.log("API loading user settings", settings);
          cconsole.log("info", "API", "loaded user settings");

          _Desktop.loadSettings(settings);
        }
      },

      'logout' : function(save) {
        console.log("API logging out", save);
        cconsole.log("info", "API", "request logout");

        save = save || false;
        var sess = save ? _Desktop.getSession() : false;
        $.post("/", {'ajax' : true, 'action' : 'logout', 'save' : save, 'session' : sess}, function(data) {
          if ( data.success ) {
            $(window).unload();
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

        console.log("ResourceManager initialized...", this);
        cconsole.log("init", "ResourceManager initialized...");
      },

      destroy : function() {
        forEach(this.links, function(i, el) {
          $(el).remove();
        });

        this.resources = null;
        this.links = null;
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
        cconsole.log("info", "ResourceManager added", res);

        this.resources.push(res);
        this.links.push(el);
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

  /////////////////////////////////////////////////////////////////////////////
  // DESKTOP
  /////////////////////////////////////////////////////////////////////////////

  var Desktop = (function() {

    var _oldTheme = null;

    return Class.extend({

      init : function(settings) {
        this.$element = $("#Desktop");
        this.stack = [];
        this.loadSettings(settings);

        this.panel = new Panel();


        console.log("Desktop initialized...");
        cconsole.log("init", "Desktop initialized...");
      },

      destroy : function() {
        //$.die(); // FIXME
        //$.unbind();

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

            self.panel.redraw(self);
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

          this.panel.redraw(this);
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
          this.panel.redraw(this);
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

        this.panel.redraw(this);
      },

      loadSettings : function(settings) {
        if ( settings ) {
          var wp = settings['desktop.wallpaper.path'];
          if ( wp ) {
            this.setWallpaper(wp);
          }
          var theme = settings['desktop.theme'];
          if ( theme ) {
            this.setTheme(theme);
          }
        }
      },

      setWallpaper : function(wp) {
        if ( wp ) {
          $("body").css("background", "url('/media/" + wp + "') center center");
        } else {
          $("body").css("background", "url('about:blank')");
        }
      },

      setTheme : function(theme) {
        var cname = "Theme" + theme;
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

  var Panel = Class.extend({

    init : function() {
      var self = this;

      this.$element = $("#Panel");

      console.log("Panel initialized...", this);
      cconsole.log("init", "Panel initialized...");

      this.start_menu = new Menu();

      // Fill menu
      var o;
      for ( var a in _ApplicationRegister ) {
        if ( _ApplicationRegister.hasOwnProperty(a) ) {
          o = _ApplicationRegister[a];
          this.start_menu.create_item(o.title, o.icon, "launch_" + a);
        }
      }
      $(".PanelItemMenu").append(this.start_menu.$element);

      // Start clock
      setInterval(function() {
        var d = new Date();
        $(".PanelItemClock span").html(sprintf("%02d/%02d/%02d %02d:%02s", d.getDate(), d.getMonth(), d.getYear(), d.getHours(), d.getMinutes()));
      }, 500);

      $(".PanelItemMenu").hover(function() {
        $(this).find("ul").show();
      }, function() {
        $(this).find("ul").hide();
      });

      $(".PanelItemMenu li, .PanelItemLauncher").click(function() {
        var app = $(this).find("span").attr("class").replace("launch_", "");
        API.system.launch(app);
      });
    },

    destroy : function() {
      this.$element.remove();
    },

    redraw : function(desktop) {
      var self = this;
      var s = desktop.stack;
      var i = 0;
      var l = s.length;

      this.$element.find(".PanelItemWindow").remove();

      var _create = function(win) {
        var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
        el.find("img").attr("src", "/img/icons/16x16/" + win.icon);
        el.find("span").html(win.title);

        if ( win.current )
          el.addClass("Current");

        el.click(function() {
          desktop.focusWindow(win);
        });

        self.$element.find(".PanelWindowHolder").append(el);
      };

      for ( i; i < l; i++ ) {
        _create(s[i]);
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

    init : function(name, dialog, opts, attrs) {
      this.name = name;
      this.created = false;
      this.loaded = false;
      this.current = false;
      this.app = null;
      this.dialog = dialog ? true : false;
      this.opts = opts;
      this.attrs = attrs;
      this.menu = [];
      this.statusbar = false;
      this.uuid = null;
      this.create_callback = null;

      this.title = this.dialog ? "Dialog" : "Window";
      this.content = "";
      this.icon = "emblems/emblem-unreadable.png";
      this.is_resizable = this.dialog ? false : true;
      this.is_draggable = true;
      this.is_scrollable = this.dialog ? false :true;
      this.is_minimized = false;
      this.is_minimizable = this.dialog ? false : true;
      this.is_sessionable = this.dialog ? false : true;
      this.is_closable = true;
      this.width = -1;
      this.height = -1;
      this.gravity = "none";

      this.$element = null;
      this.menus = [];

      console.log("Window inited...", this);
    },

    destroy : function() {
      var self = this;

      if ( this.uuid ) {
        cconsole.log("event", "-&gt; Window Event: Flush!", self.uuid);
        $.post("/", {'ajax' : true, 'action' : 'flush', 'uuid' : self.uuid}, function(data) {
          console.log('Flushed Window', self, self.uuid, data);
          cconsole.log("response", "&lt;- Window flushed...", self.uuid);
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
        $(self.$element).remove();
      });

      console.log("Window destroyed...", this);
      cconsole.log("destroy", "Window destroyed...", this.uuid);
    },

    event : function(app, ev, args, callback) {
      if ( this.uuid ) {
        var self = this;
        var pargs = {'ajax' : true, 'action' : 'event', 'uuid' : self.uuid, 'instance' : {'name' : self.name, 'action' : ev, 'args' : args }};
        cconsole.log("event", "-&gt; Window Event: Interaction!", self.uuid);
        $.post("/", pargs, function(data) {
          console.log('Event Window', self, self.uuid, pargs, data);
          cconsole.log("response", "&lt;- Window event...", self.uuid);

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
          el.find(".DialogContent").html(this.content).addClass(this.opts.type);
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
        el.attr("id", id).css("z-index", zi);
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
            },
            stop : function() {
              el.removeClass("Blend");
            }
          });
        }

        if ( this.is_resizable ) {
          el.resizable({
            start : function() {
              el.addClass("Blend");
            },
            stop : function() {
              el.removeClass("Blend");
            }
          });
        }

        this.$element = el;

        if ( this.dialog ) {
          cconsole.log("init", "Dialog created...");
        } else {
          cconsole.log("init", "Window created...", this.uuid);
        }

        // Run Dialog or Application
        if ( this.dialog ) {
          desktop.focusWindow(this);
        } else {
          setTimeout(function() {
            //try {
              if ( window[method] ) {
                self.app = window[method](Application, self, API, self.opts);
              }
            //} catch ( e ) {
            //  cconsole.error("Window application creation failed...", e);
            //  return;
            //}

            if ( self.uuid ) {
              cconsole.log("event", "-&gt; Window Event: Registration!", self.uuid);
              $.post("/", {'ajax' : true, 'action' : 'register', 'uuid' : self.uuid, 'instance' : {'name' : self.name}}, function(data) {
                console.log('Registered Window', self, self.uuid, data);
                cconsole.log('response', '&lt;- Registered Window in Session', self.uuid);
              });
            }

            if ( self.app ) {
              setTimeout(function() {
                self.app.run();
              }, 100);
            }
          }, 0);
        }

        if ( this.create_callback )
          this.create_callback();
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
      }
      this.current = true;
    },

    blur : function() {
      if ( this.current ) {
        this.$element.removeClass("Current");
      }
      this.current = false;
    },

    minimize : function() {
      if ( this.is_minimizable ) {
        if ( !this.minimized ) {
          var self = this;

          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _Desktop.toggleWindow(self, false);
          }});

        }

        this.minimized = true;
      }
    },

    restore : function() {
      if ( this.minimized ) {
        var self = this;
        this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
          _Desktop.toggleWindow(self, true);
        }});
      }

      this.minimized = false;
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
        'argv'     : this.opts
      };
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // Menu
  /////////////////////////////////////////////////////////////////////////////

  var Menu = Class.extend({

    init : function() {
      this.$element = $("<ul></ul>");
      this.$element.attr("class", "Menu");
    },

    destroy : function() {
      if ( this.$element ) {
        this.$element.remove();
      }

      this.$element = null;
    },

    clear : function() {
      if ( this.$element ) {
        this.$element.find("li").remove();
      }
    },

    create_item : function(title, icon, method) {
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

    init : function(type, message, clb_finish, clb_progress, clb_cancel) {
      this._super("OperationDialog", true, {'type' : type});

      this.width          = 400;
      this.height         = 200;
      this.gravity        = "center";
      this.is_minimizable = true;
      this.uploader = null;

      clb_finish   = clb_finish   || function() {};
      clb_progress = clb_progress || function() {};
      clb_cancel   = clb_cancel   || function() {};


      this.content        = $("<div class=\"OperationDialog\"><h1>" + message + "</h1><div class=\"OperationDialogInner\"></div></div>");

      if ( type == 'copy' ) {
        $(this.content).find(".OperationDialogInner").append("<p class=\"Status\">0 of 0</p><div class=\"ProgressBar\"></div>");
        $(this.content).find(".ProgressBar").progressbar({
          value : 50
        });
        this.width          = 400;
        this.height         = 170;
      } else if ( type == 'upload' ) {
        this.width          = 400;
        this.height         = 170;

        var self = this;
        this.create_callback = function() {
          $(self.content).find(".OperationDialogInner").append("<p class=\"Status\">No file selected</p><div class=\"ProgressBar\"></div>");
          $(self.content).find(".ProgressBar").progressbar({
            value : 0
          });

          var trigger = self.$element.find("button.Choose").show();
          var pbar = $(self.content).find(".ProgressBar");

          self.uploader = new qq.FileUploader({
            element : trigger[0],
            action  : '/',
            params : {
              ajax   : true,
              action : 'upload'
            },
            onSubmit: function(id, fileName){
              $(trigger).html(fileName);
              return true;
            },
            onProgress: function(id, fileName, loaded, total){
              $(pbar).progressbar({
                value : total
              });

              clb_progress(fileName, loaded, total);
            },
            onComplete: function(id, fileName, responseJSON){
              self.$element.find(".ActionClose").click();

              clb_finish(fileName, responseJSON);
            },
            onCancel: function(id, fileName){
              API.system.dialog("error", "File upload '" + fileName + "' was cancelled!");
              self.$element.find(".ActionClose").click();

              clb_cancel(fileName);
            }
          });

          self.$element.find(".DialogButtons .Close").click(function() {
            self.$element.find(".ActionClose").click();
          });
          self.$element.find(".DialogButtons .Ok").click(function() {
            self.$element.find(".ActionClose").click();
          });
          self.$element.find(".DialogButtons .Cancel").click(function() {
            self.$element.find(".ActionClose").click();
          });

        };

      }
    },

    destroy : function() {
      if ( this.uploader ) {
        this.uploader = null;
      }
      this._super();
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
    cconsole.info("********* WARMING UP *********");

    /*
    $(window).scroll(function(ev) {
      $(window).scrollTop(0).scrollLeft(0);
    });
    */

    $(document).bind("contextmenu",function(e){
      return false;
    });

    _Resources = new ResourceManager();

    $.post("/", {'ajax' : true, 'action' : 'init'}, function(data) {

      if ( data.success ) {
        _ApplicationRegister = data.result.applications;
        _MimeHandlers        = data.result.mime_handlers;
        _PreviousSession     = data.result.session;

        console.log("ApplicationRegister", _ApplicationRegister);
        console.log("MimeHandlers", _MimeHandlers);
        console.log("PreviousSession", _PreviousSession);

        _Desktop = new Desktop(data.result.settings);

        var autolaunch = _PreviousSession.windows;
        var el;
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

      } else {
        alert(data.error);
      }

    });
  });

  $(window).unload(function() {
    if ( _Desktop ) {
      _Desktop.destroy();
    }
    if ( _Resources ) {
      _Resources.destroy();
    }

    $("#Console").remove(); // FIXME

    __null();
  });

})($);
