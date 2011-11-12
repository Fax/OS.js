/*!
 * Application: ApplicationPDF
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationPDF = (function($, undefined) {
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

    var IS_LOADING = false;

    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationPDF window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFixed fixed1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'PDF Viewer';
        this._icon = 'mimetypes/gnome-mime-application-pdf.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 440;
        this._height = 440;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuOpen : function(el, ev) {
        var self = this;
        var my_mimes    = ["application\/pdf"];

        this.app.createFileDialog(function(fname) {
          self.app.openDocument(fname);
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

          el.find(".fixed1").scroll(function(e) {
            if ( IS_LOADING ) {
              return;
            }

            var myDiv = $(this).get(0);
            if ( (myDiv.offsetHeight + myDiv.scrollTop) >= myDiv.scrollHeight ) {
              self.app.navigatePage(true, myDiv);
            } else if ( myDiv.scrollTop === 0 ) {
              self.app.navigatePage(false, myDiv);
            }
          });

          return true;
        }

        return false;
      },

      updateStatusbar : function(str) {
        this.$element.find(".statusbar1").html(str);
      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __ApplicationPDF = Application.extend({

      init : function() {
        this._super("ApplicationPDF", argv);
        this._compability = [];

        this.page_number  = -1;
        this.page_total   = -1;
        this.pdf_info     = null;
        this.pdf_cache    = null;
        this.pdf_path     = null;
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here
        if ( argv && argv.path ) {
          this.openDocument(argv.path);
        }
      },

      errorDocument : function(error) {
        this.page_number  = -1;
        this.page_total   = -1;
        this.pdf_info     = null;
        this.pdf_cache    = null;
        this.pdf_path     = null;

        this._root_window.$element.find(".fixed1").html($(sprintf("<h1>Failed to open document:</h1><p>%s</p>", error)));
        this._root_window.updateStatusbar("An error occured...");

        this._argv['path'] = null;

        setTimeout(function() {
          IS_LOADING = false;
        }, 100);
      },

      readDocument : function(path, result, page) {
        this._root_window.$element.find(".fixed1").html($(result.document));
        this.page_number  = page;
        this.page_total   = parseInt(result.info.PageCount, 10);
        this.pdf_info     = result.info;
        this.pdf_path     = path;

        this._root_window.updateStatusbar(sprintf("Page %d of %d", this.page_number, this.page_total));

        this._argv['path'] = path;

        setTimeout(function() {
          IS_LOADING = false;
        }, 100);
      },

      openDocument: function(path, page) {
        var self = this;

        IS_LOADING = true;

        page = (page === undefined) ? 1 : parseInt(page, 10);

        var source = (page > 0) ? (sprintf("%s:%d", path, page)) : (path);
        API.system.call("readpdf", source, function(result, error) {
          if ( error === null ) {
            self.readDocument(path, result, page);
          } else {
            self.errorDocument(error);
          }
        });
      },

      navigatePage: function(op, container) {
        if ( this.page_number == -1 || this.page_total == -1 ) {
          return;
        }

        if ( op ) { // Next
          if ( this.page_number < this.page_total ) {
            this.page_number++;
            this.openDocument(this.pdf_path, this.page_number);
            container.scrollTop = 0;
          }
        } else { // Prev
          if ( this.page_number >= 2 ) {
            this.page_number--;
            this.openDocument(this.pdf_path, this.page_number);
            container.scrollTop = 0;
          }
        }

        this._root_window.updateStatusbar(sprintf("Page %d of %d", this.page_number, this.page_total));
      }
    });

    return new __ApplicationPDF();
  };
})($);
