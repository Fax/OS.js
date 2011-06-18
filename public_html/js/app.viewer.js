/**
 * Application: ApplicationViewer
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationViewer = (function($, undefined) {
  return function(Window, Application, API, argv) {


    function _resize(win, img, el, force) {
      var w = parseInt($(img).width(), 10);
      var h = parseInt($(img).height(), 10);

      w = (force ? w : (w > 800 ? 800 : w));
      h = ((force ? h : (h > 600 ? 600 : h)));

      win.resize(w, h);
    }

    function _open(callback) {
      API.system.dialog_file(function(fname, mtype) {
        callback(fname, mtype);
      }, ["image/*", "video/*", "application/ogg"]);
    }

    var img;
    var video;
    var audio;

    function _play(win, el, path, mime) {
      if ( img ) 
        $(img).remove();
      if ( video )
        $(video).remove();
      if ( audio )
        $(audio).remove();

      var source = "/media/" + path;
      var type = "image";
      if ( mime )
        type = mime.split("/")[0];

      if ( type == "image" ) {
        img = $("<img alt=\"\" />").attr("src", source);
        img.load(function() {
          var img = this;
          //loader.hide();
          this._loaded = true;

          setTimeout(function() {
            _resize(win, img, el);
          }, 0);
        }).error(function() {
          API.system.dialog("error", "Failed to load " + type + "!");
          $(this).hide();
          this._loaded = true;
        }).each(function() {
          if ( !this._loaded && this.complete && this.naturalWidth !== 0 ) {
            $(this).trigger('load');
          }
        });

        el.find(".fixed1").append(img);
        el.find(".fixed1").css("overflow", "auto");
      } else if ( type == "audio" ) {
        // FIXME: removeEventListener, jquery ?!
        audio = $("<audio>");
        audio.attr("controls", "controls");
        audio.attr("src", source);

        _audio = audio[0];
        _audio.addEventListener("loadeddata", function() {
          //loader.hide();

          _audio.play();

          setTimeout(function() {
            _resize(win, audio, el, true);
          }, 1);
        }, true);
        _audio.addEventListener("error", function() {
          //loader.hide();

          setTimeout(function() {
            _resize(win, audio, el, true);
          }, 1);
        }, true);

        el.find(".fixed1").append(audio);
        el.find(".fixed1").css("overflow", "hidden");

        setTimeout(function() {
          _resize(win, audio, el, true);
        }, 1);
      } else {
        // FIXME: removeEventListener, jquery ?!
        video = $("<video>");
        video.attr("controls", "controls");
        video.attr("src", source);

        _video = video[0];
        _video.addEventListener("loadeddata", function() {
          //loader.hide();

          _video.play();

          setTimeout(function() {
            _resize(win, video, el, true);
          }, 1);
        }, true);
        _video.addEventListener("error", function() {
          //loader.hide();

          setTimeout(function() {
            _resize(win, video, el, true);
          }, 1);
        }, true);

        el.find(".fixed1").append(video);
        el.find(".fixed1").css("overflow", "hidden");

        setTimeout(function() {
          _resize(win, video, el, true);
        }, 1);
      }
    }


    var Window_window1 = Window.extend({

      init : function(app) {
        this._super("ApplicationViewer", false, {}, {});
        this.content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationViewer window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"GtkFixed fixed1\"></div> </td> </tr> </table> </div> </div> ").html();
        this.title = 'Viewer';
        this.icon = 'categories/gnome-multimedia.png';
        this.is_draggable = true;
        this.is_resizable = true;
        this.is_scrollable = false;
        this.is_sessionable = true;
        this.is_minimizable = true;
        this.is_maximizable = true;
        this.is_closable = true;
        this.is_orphan = false;
        this.width = 300;
        this.height = 200;
        this.gravity = null;


        this.app = app;
      },

      destroy : function() {
        this._super();
      },


      EventMenuOpen : function(el, ev) {
        var self = this;
        _open(function(fname, mtype) {
          _play(self, self.$element, fname, mtype);
        });
      },


      EventMenuQuit : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },



      create : function(id, zi, mcallback) {
        var el = this._super(id, zi, mcallback);
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



          el.find(".imagemenuitem_open").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here

          if ( argv.path ) {
            _play(self, el, argv.path, argv.mime);
          }
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationViewer = Application.extend({

      init : function() {
        this._super("ApplicationViewer", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        this._super(self);

        var root_window = new Window_window1(self);
        root_window.show();

        // Do your stuff here
      }
    });

    return new __ApplicationViewer();
  };
})($);

