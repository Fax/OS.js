/*!
 * Application: ApplicationViewer
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationViewer = (function($, undefined) {
  "$:nomunge";

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationViewer", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationViewer window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFixed fixed1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Image Viewer';
        this._icon = 'mimetypes/image-x-generic.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 300;
        this._height = 200;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },


      EventMenuOpen : function(el, ev) {
        var self = this;

        var my_callback = function(fname) {
          self.app.Open(fname);
        };
        var my_mimes    = ["image/*"];

        this.app.createFileDialog(function(fname) {
          my_callback(fname);
        }, my_mimes);
      },


      EventMenuQuit : function(el, ev) {
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

        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationViewer = Application.extend({

      init : function() {
        this._super("ApplicationViewer", argv);
        this._compability = [];

        this.$image = null;
      },

      destroy : function() {
        if ( this.$image ) {
          this.$image.remove();
        }

        this._super();
      },

      Open : function(fname) {
        var self = this;

        if ( self.$image ) {
          self.$image.remove();
        }

        var img = $("<img alt=\"\" />").attr("src", "/media" + fname);
        img.load(function() {
          var w = this.width;
          var h = this.height;

          w = (w > 800 ? 800 : w);
          h = (h > 500 ? 500 : h);

          if ( w > 0 && h > 0 ) {
            self._root_window._resize(w + 10, h + 95);
          }
        }).error(function() {
          self.createMessageDialog("error", "Failed to open '" + fname + "'!");
        }).each(function() {
          if ( !this._loaded && this.complete && this.naturalWidth !== 0 ) {
            $(this).trigger('load');
          }
        });

        self.$image = img;
        self._root_window.$element.find(".fixed1").append(self.$image);
        self._root_window.$element.find(".statusbar1").html(fname);
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();


        // Do your stuff here
        if ( argv.path ) {
          this.Open(argv.path);
        }
      }
    });

    return new __ApplicationViewer();
  };
})($);

