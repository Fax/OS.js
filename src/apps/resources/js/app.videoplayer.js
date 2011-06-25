/**
 * Application: ApplicationVideoPlayer
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationVideoPlayer = (function($, undefined) {
  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {


    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationVideoPlayer", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationVideoPlayer window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFixed fixed1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Video Player';
        this._icon = 'mimetypes/video-x-generic.png';
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
        this._width = 500;
        this._height = 300;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuOpen : function(el, ev) {
        var self = this;


        var my_callback = function(fname) {
          self.app.Play(fname);
        };

        var my_mimes    = ["video\/*","application\/ogg"];

        this.app.createFileDialog(function(fname) {
          my_callback(fname);

          //self._argv['path'] = fname;
        }, my_mimes);

      },


      EventMenuQuit : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();

      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_open").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
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
    var __ApplicationVideoPlayer = Application.extend({

      init : function() {
        this._super("ApplicationVideoPlayer", argv);
        this._compability = ["video"];

        this.$player = null;
      },

      destroy : function() {
        this._super();
      },

      Play : function(fname) {
        var self = this;

        self.$player.attr("src", "/media" + fname);
        self.$player.get(0).play();

        self._root_window.$element.find(".statusbar1").html(fname);
      },

      Fit : function() {
        var w = parseInt(this.$player.width(), 10);
        var h = parseInt(this.$player.height(), 10);

        console.log(w, h);

        this._root_window._resize(w + 10, h + 95);
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here

        this.$player = $("<video>").attr("controls", "controls").css({
        });

        root_window.$element.find(".fixed1").append(this.$player);

        this.Fit();

        this.$player.get(0).addEventListener("loadeddata", function() {
          self.Fit();
        });

        if ( argv && argv.path ) {
          this.Play(argv.path);
        }
      }
    });

    return new __ApplicationVideoPlayer();
  };
})($);
