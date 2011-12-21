/*!
 * Application: ApplicationTest
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationTest = (function($, undefined) {
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
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTest window1\"> <div class=\" \"></div> </div> </div> ").html();
        this._title = 'Test';
        this._icon = 'status/starred.png';
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
        this._height = 300;
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
    var __ApplicationTest = Application.extend({

      init : function() {
        this._super("ApplicationTest", argv);
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

        console.group("ApplicationTest::Application::run()");
        var w = this.addWorker("Test", "test", function(ev, data) {
          console.log("ApplicationTest::_on_process()", ev, data);

          self.removeWorker("Test");
        }, function(ev, line, file, error) {
          console.error("ApplicationTest::_on_error()", ev, [line, file, error]);

          self.removeWorker("Test");
        });
        console.log("Worker: ", w);
        console.log("Init", w.post("5"));
        console.groupEnd();
      }
    });

    return new __ApplicationTest();
  };
})($);
