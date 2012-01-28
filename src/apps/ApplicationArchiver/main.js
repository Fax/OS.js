/*!
 * Application: ApplicationArchiver
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.ApplicationArchiver = (function($, undefined) {
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
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationArchiver window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem1\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem2\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem3\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem4\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem5\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem3\"> <span><u>A</u>ctions</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem menuitem2\"> <img alt=\"gtk-add\" src=\"/img/icons/16x16/actions/gtk-add.png\"/> <span>Add</span> </li> <li class=\"GtkImageMenuItem menuitem4\"> <img alt=\"gtk-remove\" src=\"/img/icons/16x16/actions/gtk-remove.png\"/> <span>Remove</span> </li> <li class=\"GtkImageMenuItem menuitem5\"> <img alt=\"gtk-execute\" src=\"/img/icons/16x16/actions/gtk-execute.png\"/> <span>Execute</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'File Archiver (UNDER DEVELOPMENT)';
        this._icon = 'mimetypes/package-x-generic.png';
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
        this._width = 500;
        this._height = 500;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;


      },


      EventMenuOpen : function(el, ev) {
        var self = this;


        var my_mimes    = [
          "application/zip",
          "application/x-bzip2",
          "application/x-gzip",
          "application/x-rar",
          "application/x-tar"
        ];

        this.app.defaultFileOpen(function(fname) {
          self.app.openArchive(fname, self);
        }, my_mimes);

      },


      EventMenuQuit : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();

      },


      EventMenuArchiveAdd : function(el, ev) {
        var self = this;


      },


      EventMenuArchiveRemove : function(el, ev) {
        var self = this;


      },


      EventMenuArchiveExecute : function(el, ev) {
        var self = this;

        var path = "/";
        if ( this.app.extractArchive() ) {
          API.system.dialog_input(path, "Extract to", function(value) {
            self.app.extractArchive(null, value);
          });
        }
      },


      EventIconviewSelect : function(el, ev) {
        var self = this;


      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem1").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem2").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem5").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          el.find(".menuitem2").click(function(ev) {
            self.EventMenuArchiveAdd(this, ev);
          });

          el.find(".menuitem4").click(function(ev) {
            self.EventMenuArchiveRemove(this, ev);
          });

          el.find(".menuitem5").click(function(ev) {
            self.EventMenuArchiveExecute(this, ev);
          });

          el.find(".iconview1").click(function(ev) {
            self.EventIconviewSelect(this, ev);
          });

          // Do your stuff here

          this._bind("resize", function() {
            self.$element.find(".iconview1 table.TableHead td").each(function(ind, el) {
              var pel = self.$element.find(".iconview1 table.TableBody tr:first-child td").get(ind);
              if ( pel ) {
                $(el).css("width", $(pel).width() + "px");
              }
            });
          });

          el.find(".iconview1").addClass("ContextMenu");

          // FIXME
          var menu1 = el.find(".menu1");
          var menu2 = el.find(".menu2");
          menu1.find(".imagemenuitem1").hide();
          menu1.find(".imagemenuitem3").hide();
          menu1.find(".imagemenuitem4").hide();
          menu2.find(".menuitem2").hide();
          menu2.find(".menuitem4").hide();

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
    var __ApplicationArchiver = Application.extend({

      init : function() {
        this._super("ApplicationArchiver", argv);
        this._compability = [];

        this.current_path = null;
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
        if ( argv.path ) {
          this.openArchive(argv.path, root_window);
        }
      },

      openArchive : function(path, root_window) {
        var self = this;

        this._event("browse", {"path" : path}, function(result, error) {
          if ( error ) {
            self.createMessageDialog("error", "Cannot open archive '" + basename(path) + "'. Server responded: " + error);

            self.current_path = null;
          } else {
            root_window.$element.find(".ApplicationArchiver .iconview1").html(result.items).find("td").addClass("ContextMenu");

            self.current_path = path;
          }

          root_window._call("resize");
        });
      },

      extractArchive : function(path, destination) {
        var self = this;

        if ( path === undefined || path === null ) {
          if ( !this.current_path ) {
            this.createMessageDialog("error", "No archive to extract");
            return false;
          }

          path = this.current_path;
        }

        if ( path && destination ) {
          this._event("extract", {"path" : path, "destination" : destination}, function(result, error) {
            error = error || result.error;
            if ( error ) {
              self.createMessageDialog("error", "Cannot extract archive '" + basename(path) + "'. Server responded: " + error);
            } else {
              self.createMessageDialog("info", "Archive '" + basename(path) + " extracted'.");
            }
          });
        }


        return true;
      }
    });

    return new __ApplicationArchiver();
  };
})($);
