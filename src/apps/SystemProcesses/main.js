/*!
 * Application: SystemProcesses
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.SystemProcesses = (function($, undefined) {
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

    var LastItem = null;

    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemProcesses window1\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </div> ").html();
        this._title = 'Processes';
        this._icon = 'apps/utilities-system-monitor.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = false;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = true;
        this._is_ontop = true;
        this._skip_taskbar = true;
        this._skip_pager = true;
        this._width = 500;
        this._height = 400;
        this._gravity = null;

        this.title     = "Processes (%d running)";
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
          var table2 = $("<div class=\"TableWrap\"><table class=\"TableHead GtkIconViewHeader\"><tbody><tr><td class=\"PID\">PID</td><td>Application</td><td class=\"Alive\">Alive</td><td class=\"Oper\">&nbsp;</td></tr></tbody></table><div class=\"TableBodyWrap\"><table class=\"TableBody\"><tbody></tbody></table></div></div>");
          el.find(".iconview1").append(table2);

          var UpdateTable = function() {
            table2.find(".TableBody tbody").html("");

            var list = API.session.processes();
            var p, row, icon;

            self.setTitle(sprintf(self.title, list.length));
            for ( var x = 0; x < list.length; x++ ) {
              p = list[x];
              icon = p.icon.match(/^\/img/) ? p.icon : ("/img/icons/16x16/" + p.icon);

              row = $(sprintf("<tr><td class=\"PID\">%s</td><td class=\"Name\"><img alt=\"\" src=\"%s\" />&nbsp; %s</td><td class=\"Alive\">%sms</td><td class=\"Oper\"><img alt=\"\" src=\"/img/icons/16x16/actions/stop.png\" class=\"TT\" title=\"Kill process\" /></td></tr>", p.pid, icon, p.title || p.name, p.time));
              row.addClass(x%2 ? "Odd" : "Even");
              if ( p.locked ) {
                row.find(".TT").hide();
                row.addClass("Locked");
              }

              if ( x === LastItem ) {
                row.addClass("Current");
              }

              (function(rel, proc) {
                // Kill process
                rel.find(".TT").click(function() {
                  var msglabel = sprintf("Are you sure you want to kill process \"%s\" (pid:%s)", proc.title || proc.name, proc.pid);
                  API.system.dialog("confirm", msglabel, null, function() {
                    if ( !proc.kill() ) {
                      API.system.alert("Failed to kill process!");
                    }
                  });
                });

                // Highlight
                row.click(function() {
                  if ( !$(this).hasClass("Current") ) {
                    if ( LastItem !== null ) {
                      $($(".iconview1 table.TableBody tbody").find("tr").get(LastItem)).removeClass("Current");
                    }

                    $(this).addClass("Current");
                    LastItem = this.rowIndex;
                  }
                });
              })(row, p);

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
        this._super(root_window);
        root_window.show();


        // Do your stuff here
      }
    });

    return new __SystemProcesses();
  };
})($);
