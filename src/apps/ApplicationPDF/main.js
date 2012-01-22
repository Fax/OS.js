/*!
 * Application: ApplicationPDF
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
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
    var CACHE = [];

    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationPDF window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Horizontal box2\"> <tr> <td class=\"GtkBoxPosition Position_0\" style=\"width:70px\"> <div class=\"TableCellWrap\"> <button class=\"GtkButton button_prev\"><img alt=\"gtk-media-previous\" src=\"/img/icons/16x16/actions/media-skip-backward.png\"/>Prev</button> </div> </td> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label_navigation\"></div> </div> </td> <td class=\"GtkBoxPosition Position_3\" style=\"width:70px\"> <div class=\"TableCellWrap\"> <button class=\"GtkButton button_next\"><img alt=\"gtk-media-next\" src=\"/img/icons/16x16/actions/media-skip-forward.png\"/>Next</button> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkFixed fixed1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_3\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
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
        this.app.defaultFileOpen(function(fname) {
          self.app.loadDocument(fname);
        }, ["application\/pdf"]);
      },

      EventMenuQuit : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },

      EventPreviousPage : function(el, ev) {
        this.app.navigatePage(false);
      },

      EventNextPage : function(el, ev) {
        this.app.navigatePage(true);
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

          el.find(".button_prev").click(function(ev) {
            self.EventPreviousPage(this, ev);
          }).attr("disabled", "disabled");

          el.find(".button_next").click(function(ev) {
            self.EventNextPage(this, ev);
          }).attr("disabled", "disabled");

          // Do your stuff here

          el.find(".label_navigation").html("No file loaded...");

          return true;
        }

        return false;
      },

      updateStatusbar : function(str) {
        this.$element.find(".statusbar1").html(str);
      },

      updateStatus : function(str) {
        this.$element.find(".label_navigation").html(str);
      },

      updateViewport : function(m) {
        this.$element.find(".fixed1").html(m);
      },

      updateButtons : function(page, page_total) {
        var el  = this.$element;
        if ( !page_total || page_total < 0 ) {
          el.find(".button_prev").attr("disabled", "disabled");
          el.find(".button_next").attr("disabled", "disabled");
        } else {
          if ( page <= 1 ) {
            el.find(".button_prev").attr("disabled", "disabled");
          } else {
            el.find(".button_prev").removeAttr("disabled");
          }

          if ( page >= (page_total) ) {
            el.find(".button_next").attr("disabled", "disabled");
          } else {
            el.find(".button_next").removeAttr("disabled");
          }
        }
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
        this.reset();

        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here
        if ( argv && argv.path ) {
          this.loadDocument(argv.path);
        }
      },

      /**
       * Reset internals
       * @return void
       */
      reset : function() {
        CACHE = [];
        IS_LOADING = false;

        this.page_number    = -1;
        this.page_total     = -1;
        this.pdf_info       = null;
        this.pdf_cache      = null;
        this.pdf_path       = null;
      },

      /**
       * Load a new document
       * @return void
       */
      loadDocument : function(path) {
        var self = this;

        IS_LOADING = true;
        CACHE      = [];

        this._root_window.updateViewport(sprintf("Loading document: " + basename(path)));
        this._root_window.updateStatus("");
        this._root_window.updateButtons(-1, -1);

        var page   = 1;
        var source = (page > 0) ? (sprintf("%s:%d", path, page)) : (path);
        API.system.call("readpdf", source, function(result, error) {
          if ( error === null ) {
            self.page_number  = page;
            self.page_total   = parseInt(result.info.PageCount, 10);
            self.pdf_info     = result.info;
            self.pdf_path     = path;

            self.drawDocument($(result.document));
          } else {
            self.drawError(path, error);
          }

          IS_LOADING = false;
        });
      },

      /**
       * Draw error document
       * @return void
       */
      drawError : function(path, error) {
        this._root_window.updateViewport(sprintf("<h1>Failed to open document:</h1><p>%s</p>", error));
        this._root_window.updateStatusbar(basename(path));
        this._root_window.updateStatus("Showing page 0 of 0");
        this._root_window.updateButtons(-1, -1);

        this.reset();

        this._argv['path']  = null;

        this._root_window.$element.find(".fixed1").get(0).scrollTop = 0;
      },

      /**
       * Draw the document (page)
       * @return void
       */
      drawDocument : function(svg) {
        this._root_window.updateViewport(svg);
        this._root_window.updateStatusbar(basename(this.pdf_path));
        this._root_window.updateStatus(sprintf("Showing page %d of %d", this.page_number, this.page_total));
        this._root_window.updateButtons(this.page_number, this.page_total);
        this._root_window.$element.find(".fixed1").get(0).scrollTop = 0;
      },

      /**
       * Change page (Internal)
       * @return void
       */
      _navigatePage : function(page) {
        var self = this;

        if ( CACHE[page] !== undefined ) {
          this.drawDocument($(CACHE[page]));
          return;
        }

        this._root_window.updateViewport(sprintf("Loading page %d (please wait)...", page));

        var path   = this.pdf_path;
        var source = (page > 0) ? (sprintf("%s:%d", path, page)) : (path);
        API.system.call("readpdf", source, function(result, error) {
          if ( error === null ) {
            var svg = result.document;
            CACHE[page] = svg;

            self.drawDocument($(svg));
          } else {
            self.drawError(self.pdf_path, error);
          }

          self._root_window.$element.find(".fixed1").get(0).scrollTop = 0;
        });

      },

      /**
       * Navigate to a page
       * @return void
       */
      navigatePage: function(op) {
        if ( !this.page_total ) {
          return;
        }

        if ( this.page_number == -1 || this.page_total == -1 ) {
          return;
        }

        if ( op === true ) {          // Next
          if ( this.page_number < this.page_total ) {
            this.page_number++;
          }
        }
        else if ( op === false ) {    // Prev
          if ( this.page_number >= 2 ) {
            this.page_number--;
          }
        }
        else {                        // Custom page
          if ( typeof op == "number" ) {
            op = parseInt(op, 10);
            if (!isNan(op) && op ) {
              if ( (op > 0) && (op < this.page_total) ) {
                this.page_number = op;
              }
            }
          }
        }

        this._navigatePage(this.page_number);
      }
    });

    return new __ApplicationPDF();
  };
})($);
