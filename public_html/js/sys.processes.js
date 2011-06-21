/**
 * Application: SystemProcesses
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemProcesses = (function($, undefined) {
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
        this._super("SystemProcesses", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemProcesses window1\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </div> ").html();
        this._title = 'Processes';
        this._icon = 'actions/system-run.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 500;
        this._height = 400;
        this._gravity = null;

        this.pinterval = null;
      },

      destroy : function() {
        clearInterval(this.pinterval);
        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          // Do your stuff here
          var table2 = $("<div class=\"TableWrap\"><table class=\"TableHead GtkIconViewHeader\"><tbody><tr><td class=\"PID\">PID</td><td>Application</td><td class=\"Alive\">Alive</td></tr></tbody></table><div class=\"TableBodyWrap\"><table class=\"TableBody\"><tbody></tbody></table></div></div>");
          el.find(".iconview1").append(table2);

          var UpdateTable = function() {
            table2.find(".TableBody tbody").html("");

            var list = API.session.processes();
            var p, row;
            for ( var x = 0; x < list.length; x++ ) {
              p = list[x];

              row = $(sprintf("<tr><td class=\"PID\">%s</td><td><img alt=\"\" src=\"/img/icons/16x16/%s\" />&nbsp; %s</td><td class=\"Alive\">%sms</td></tr>", p.id, p.icon, p.title || p.name, p.time));
              el.find(".iconview1 table.TableBody tbody").append(row);
            }
          };

          UpdateTable();
          this.pinterval = setInterval(function() {
            UpdateTable();
          }, 3000);

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
    var __SystemProcesses = Application.extend({

      init : function() {
        this._super("SystemProcesses", argv);
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

    return new __SystemProcesses();
  };
})($);
