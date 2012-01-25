/*!
 * Application: ApplicationMusicPlayer
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.ApplicationMusicPlayer = (function($, undefined) {
  "$:nomunge";

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationMusicPlayer window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_save\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_saveas\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box2\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"width:100px;height:80px;padding:10px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box4\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label1\">Artist</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label2\">Album</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label3\">Track</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_3\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label4\">Length</div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\" style=\"padding:10px\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\" style=\"padding:10px\"> <div class=\"TableCellWrap\"> <div class=\"GtkAlignment alignment1\"> <div class=\"GtkScale scale1\"></div> </div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <ul class=\"GtkButtonBox Horizontal buttonbox1\" style=\"text-align:center\"> <li> <button class=\"GtkButton button_prev\"><img alt=\"gtk-media-previous\" src=\"/img/icons/16x16/actions/media-skip-backward.png\"/>Prev</button> </li> <li> <button class=\"GtkButton button_stop\"><img alt=\"gtk-media-stop\" src=\"/img/icons/16x16/actions/media-playback-stop.png\"/>Stop</button> </li> <li> <button class=\"GtkButton button_play\"><img alt=\"gtk-media-play\" src=\"/img/icons/16x16/actions/media-playback-start.png\"/>Play</button> </li> <li> <button class=\"GtkButton button_pause\"><img alt=\"gtk-media-pause\" src=\"/img/icons/16x16/actions/media-playback-pause.png\"/>Pause</button> </li> <li> <button class=\"GtkButton button_next\"><img alt=\"gtk-media-next\" src=\"/img/icons/16x16/actions/media-skip-forward.png\"/>Next</button> </li> </ul> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Music Player';
        this._icon = 'status/audio-volume-high.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 450;
        this._height = 450;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;


      },


      EventMenuNew : function(el, ev) {
        var self = this;


      },


      EventMenuOpen : function(el, ev) {
        var self = this;

        this.app.defaultFileOpen(function(fname) {
          self.app.Play(fname);

          //self._argv['path'] = fname;
        }, ["audio\/*"]);
      },


      EventMenuSave : function(el, ev) {
        var self = this;
      },


      EventMenuSaveAs : function(el, ev) {
        var self = this;
      },


      EventMenuQuit : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();

      },


      EventButtonPrev : function(el, ev) {
        var self = this;


      },


      EventButtonStop : function(el, ev) {
        var self = this;

        self.app.Stop();
      },


      EventButtonPlay : function(el, ev) {
        var self = this;

        self.app.Resume();
      },


      EventButtonPause : function(el, ev) {
        var self = this;


        self.app.Pause();
      },


      EventButtonNext : function(el, ev) {
        var self = this;


      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".menuitem1").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_open").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem_save").click(function(ev) {
            self.EventMenuSave(this, ev);
          });

          el.find(".imagemenuitem_saveas").click(function(ev) {
            self.EventMenuSaveAs(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          el.find(".button_prev").click(function(ev) {
            self.EventButtonPrev(this, ev);
          });

          el.find(".button_stop").click(function(ev) {
            self.EventButtonStop(this, ev);
          });

          el.find(".button_play").click(function(ev) {
            self.EventButtonPlay(this, ev);
          });

          el.find(".button_pause").click(function(ev) {
            self.EventButtonPause(this, ev);
          });

          el.find(".button_next").click(function(ev) {
            self.EventButtonNext(this, ev);
          });

          // Do your stuff here

          return true;
        }

        return false;
      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __ApplicationMusicPlayer = Application.extend({

      init : function() {
        this._super("ApplicationMusicPlayer", argv);
        this._compability = ["audio"];

        this.player = null;
        this.$slider = null;
      },

      destroy : function() {
        this.Stop();

        this.player.destroy();
        this.player = null;

        try {
          this.$slider.remove();
        } catch ( e ) {}

        this._super();
      },

      Resume : function() {
        if ( this.player ) {
          this.player.play();
        }
      },

      Pause : function() {
        if ( this.player ) {
          this.player.pause();
        }
      },

      Stop : function() {
        if ( this.player ) {
          this.player.stop();
        }
      },

      Play : function(fname) {
        var self = this;
        if ( !this.player ) {
          return;
        }

        var el = this._root_window.$element;

        if ( fname ) {
          this._event("info", {"path" : fname}, function(result, error) {
            if ( !error ) {
              var invalid = true;
              var type = "unknown";
              if ( result['MIMEType'] ) {
                var mime = result['MIMEType'];
                if ( mime.match(/^audio\/mpeg/) ) {
                  invalid = self._checkCompability("audio_mp3");
                  type = "mp3";
                } else if ( mime.match(/^audio\/ogg/) ) {
                  invalid = self._checkCompability("audio_ogg");
                  type = "ogg/vorbis";
                }
              }

              if ( invalid ) {
                alert("Cannot play this filetype (" + type + ")!"); // FIXME
              } else {
                el.find(".label1").html(sprintf("<b>Artist:</b> %s", result.Artist || "Unknown"));
                el.find(".label2").html(sprintf("<b>Album:</b> %s (%s)", result.Album || "Unknown", result.Year || "Unknown year"));
                el.find(".label3").html(sprintf("<b>Track:</b> %s", result.Title || "Unknown"));
                el.find(".label4").html(sprintf("<b>Length:</b> %s", result.Length));

                el.find(".iconview1").html(fname);

                self.player.setSource("/media" + fname);
              }
            }
          }, true);
        }
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();

        // Do your stuff here
        this.$slider = root_window.$element.find(".scale1");

        var label       = root_window.$element.find(".label4");
        var src         = (argv && argv.path) ? argv.path : null;
        var manualSeek  = false;
        var loaded      = false;

        this.player = new OSjs.Classes.MediaPlayer("audio", null, "invisible", null, function() {
          var s = this.getTimestamps();
          var c = this.getCurrentTime();
          var d = this.getEndTime();

          if ( s ) {
            label.html(sprintf("<b>Length:</b> %s / %s", s.current, s.total));
          }

          if (!manualSeek) {
            self.$slider.slider("value", c);
          }

          if (!loaded) {
            loaded = true;
            self.$slider.slider({
              value       : 0,
              step        : 0.01,
              orientation : "horizontal",
              range       : "min",
              max         : d,
              animate     : true,
              slide       : function() {
                manualSeek = true;
              },
              stop        : function(e,ui) {
                manualSeek = false;
                self.player.setSeek(ui.value);
              }
            });
          }
        });

        root_window.$element.append(this.player.$element);

        if ( src ) {
          this.Play(src);
        }
      }
    });

    return new __ApplicationMusicPlayer();
  };
})($);
