/**
 * Application: ApplicationTest
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTest = (function($, undefined) {
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
        this._super("ApplicationTest", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTest window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem1\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem2\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem3\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem4\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem5\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem2\"> <span><u>E</u>dit</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem imagemenuitem6\"> <img alt=\"gtk-cut\" src=\"/img/icons/16x16/actions/gtk-cut.png\"/> <span>Cut</span> </li> <li class=\"GtkImageMenuItem imagemenuitem7\"> <img alt=\"gtk-copy\" src=\"/img/icons/16x16/actions/gtk-copy.png\"/> <span>Copy</span> </li> <li class=\"GtkImageMenuItem imagemenuitem8\"> <img alt=\"gtk-paste\" src=\"/img/icons/16x16/actions/gtk-paste.png\"/> <span>Paste</span> </li> <li class=\"GtkImageMenuItem imagemenuitem9\"> <img alt=\"gtk-delete\" src=\"/img/icons/16x16/actions/gtk-delete.png\"/> <span>Delete</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem3\"> <span><u>V</u>iew</span> </li> <li class=\"GtkMenuItem menuitem4\"> <span><u>H</u>elp</span> <ul class=\"GtkMenu menu3\"> <li class=\"GtkImageMenuItem imagemenuitem10\"> <img alt=\"gtk-about\" src=\"/img/icons/16x16/actions/gtk-about.png\"/> <span>About</span> <ul class=\"GtkMenu menu4\"> <li class=\"GtkMenuItem menuitem5\"> <span>menuitem5</span> </li> </ul> </li> </ul> </li> </ul> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <textarea class=\"GtkTextView GtkObject textview1\"></textarea> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"GtkStatusbar statusbar1\"></div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Test';
        this._icon = 'emblems/emblem-unreadable.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 500;
        this._height = 300;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuTest : function(el, ev) {
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem1").click(function(ev) {
            self.EventMenuTest(this, ev);
          });

          // Do your stuff here

          return true;
        }

        return false;
      }
    });


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window2 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationTest", false, app, windows);
        this._content = $("<div class=\"window2\"> <div class=\"GtkWindow ApplicationTest window2\"> <div class=\"GtkLabel GtkObject label1\">A Second Window</div> </div> </div> ").html();
        this._title = 'Test';
        this._icon = 'emblems/emblem-unreadable.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
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
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        root_window.show();

        this._super(root_window);

        // Do your stuff here
      }
    });

    return new __ApplicationTest();
  };
})($);
