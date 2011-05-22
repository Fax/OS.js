(function() {

  var ANIMATION_SPEED = 400;

  var _ApplicationRegister = {};
  var _Resources = null;
  var _Desktop = null;
  var _Window = null;
  var _TopIndex = 11;

  /////////////////////////////////////////////////////////////////////////////
  // MANAGERS
  /////////////////////////////////////////////////////////////////////////////

  var ResourceManager = (function() {

    var _aResources = [];

    return Class.extend({
      init : function() {
        this.resources = [];

        console.log("ResourceManager initialized...", this);
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


    return Class.extend({

      init : function() {
        this.$element = $("#Desktop");
        this.stack = [];

        this.panel = new Panel();

        console.log("Desktop initialized...");
      },

      destroy : function() {
        $.die();
        $.unbind();

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

        _Window = win;

        this.panel.redraw(this);
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

      alert : function(type, message) {
        this.addWindow(new Dialog(type, message));
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

      // Fill menu
      var o;
      for ( var a in _ApplicationRegister ) {
        if ( _ApplicationRegister.hasOwnProperty(a) ) {
          o = _ApplicationRegister[a];

          var litem = $("<li><span><img alt=\"\" src=\"\" /></span></li>");
          litem.find("span").attr("class", "launch_" + a);
          litem.find("img").attr("src", "/img/icons/16x16/" + o.icon);
          litem.append(o.title);

          $(".PanelItemMenu ul").append(litem);
        }
      }

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
        _Desktop.addWindow(new Window(app));
        if ( this.tagName == "li" ) {
          $(this).parents("ul").hide();
        }
      });
    },

    destroy : function() {

    },

    redraw : function(desktop) {
      var self = this;
      var s = desktop.stack;
      var i = 0;
      var l = s.length;

      this.$element.find(".PanelItemWindow").remove();

      var _create = function(win) {
        var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"\" /><span></span></div>");
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

    init : function(name, dialog, opts) {
      this.name = name;
      this.created = false;
      this.loaded = false;
      this.current = false;
      this.app = null;
      this.dialog = dialog ? true : false;
      this.opts = opts;
      this.uuid = null;

      this.title = this.dialog ? "Dialog" : "Window";
      this.content = "";
      this.icon = "emblems/emblem-unreadable.png";
      this.is_resizable = this.dialog ? false : true;
      this.is_draggable = true;
      this.is_scrollable = this.dialog ? false :true;
      this.is_minimized = false;
      this.is_minimizable = this.dialog ? false : true;
      this.is_closable = true;
      this.width = -1;
      this.height = -1;
      this.gravity = "none";

      this.$element = null;

      console.log("Window inited...", this);
    },

    destroy : function() {
      var self = this;

      if ( this.uuid ) {
        $.post("/", {'ajax' : true, 'action' : 'flush', 'uuid' : self.uuid}, function(data) {
          console.log('Flushed Window', self, self.uuid, data);
        });
      }

      if ( this.app ) {
        this.app.destroy();
      }

      $(this.$element).fadeOut(ANIMATION_SPEED, function() {
        $(self.$element).remove();
      });

      console.log("Window destroyed...", this);
    },

    event : function(app, ev, args, callback) {
      if ( this.uuid ) {
        var self = this;
        var pargs = {'ajax' : true, 'action' : 'event', 'uuid' : self.uuid, 'instance' : {'name' : self.name, 'action' : ev, 'args' : args }};
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
        el.attr("id", id).css("z-index", zi);

        el.find(".WindowContent").css("overflow", this.is_scrollable ? "auto" : "hidden");
        el.find(".WindowTopInner span").html(this.title);

        if ( this.dialog ) {
          el.find(".DialogContent").html(this.content).addClass(this.opts.type);
          el.find(".DialogButtons button").click(function() {
            el.find(".ActionClose").click();
          });
        } else {
          el.find(".WindowTopInner img").attr("src", "/img/icons/16x16/" + this.icon);
          el.find(".WindowContentInner").html(this.content);
        }

        if ( this.width > 0 ) {
          $(el).css("width", this.width + "px");
        }
        if ( this.height > 0 ) {
          $(el).css("height", this.height + "px");
        }

        if ( this.gravity === "center" ) {
          $(el).css({
            "top" : (($(document).height() / 2) - ($(el).height() / 2)) + "px",
            "left" : (($(document).width() / 2) - ($(el).width() / 2)) + "px"
          });
        }

        el.mousedown(function() {
          desktop.focusWindow(self);
        });

        if ( this.is_closable ) {
          el.find(".ActionClose").click(function() {
            desktop.removeWindow(self);
          });
        }
        if ( this.is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            self.minimize();
          });
        }

        desktop.$element.append(el);

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

        console.log("Window created...", this, this.uuid);

        if ( this.dialog ) {
          desktop.focusWindow(this);
        } else {
          setTimeout(function() {
            //try {
              if ( window[method] ) {
                self.app = window[method](Application, self);
              }
            //} catch ( e ) {
            //  console.error("Window application creation failed...", e);
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

              self.uuid          = data.result.uuid;
              self.is_draggable  = data.result.is_draggable;
              self.is_resizable  = data.result.is_resizable;
              self.is_scrollable = data.result.is_scrollable;
              self.width         = parseInt(data.result.width, 10);
              self.height        = parseInt(data.result.height, 10);

              callback(data.result['class']);
            });
          } else {
            _Desktop.alert("error", data.error);
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
    }

  });

  var Dialog = Window.extend({

    init : function(type, message) {
      this._super("Dialog", true, {'type' : type});

      this.width = 200;
      this.height = 100;
      this.gravity = "center";
      this.content = message;
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
    $("#LoadingBar").progressbar({
      value : 20
    });

    $("#Loading").show();

    _Resources = new ResourceManager();

    $.post("/", {'ajax' : true, 'action' : 'init'}, function(data) {

      if ( data.success ) {
        _ApplicationRegister = data.result.applications;
        _Desktop = new Desktop();

        _Desktop.addWindow(new Window("ApplicationFilemanager"));
      } else {
        alert(data.error);
      }

      $("#LoadingBar").progressbar({
        value : 100
      });

      setTimeout(function() {
        $("#LoadingBar").fadeOut(ANIMATION_SPEED);
      }, 100);
    });
  });

  $(window).unload(function() {
    if ( _Desktop ) {
      _Desktop.destroy();
    }
  });

})($, undefined);
