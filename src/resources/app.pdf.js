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


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationPDF window1\"> <div class=\"GtkFixed fixed1\"></div> </div> </div> ").html();
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



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

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
    var __ApplicationPDF = Application.extend({

      init : function() {
        this._super("ApplicationPDF", argv);
        this._compability = [];
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
          API.system.call("readpdf", argv.path, function(result, error) {
            if ( error === null ) {
              console.log(root_window.$element.find(".fixed1"));
              root_window.$element.find(".fixed1").html($(result));
            } else {
              alert("Cannot open document: " + error);
            }
          });
        }
      }
    });

    return new __ApplicationPDF();
  };
})($);
