/**
 * Application: ApplicationTickTackToe
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTickTackToe = (function($, undefined) {
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
        this._super("ApplicationTickTackToe", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTickTackToe window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFixed fixed1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Tick-tack-toe';
        this._icon = '/img/app.ticktacktoe/ttt.png';
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
        this._width = 440;
        this._height = 440;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;

        this.reset_game();
      },


      EventMenuQuit : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();

      },


      reset_game : function() {
        var self = this;

        this.finished = false;
        this.moves = 0;

        this.board = [
          [-1, -1, -1],
          [-1, -1, -1],
          [-1, -1, -1]
        ];

        var check = function() {
          var ret = -1;
          var x, y, sum;

          // Rows
          for ( y = 0; y < 3; y++ ) {
            sum = self.board[y][0] + self.board[y][1] + self.board[y][2];
            if ( (sum % 3) === 0 ) {
              ret = sum;
              break;
            }
          }

          // Columns
          for ( x = 0; x < 3; x++ ) {
            sum = self.board[0][x] + self.board[1][x] + self.board[2][x];
            if ( (sum % 3) === 0 ) {
              ret = sum;
              break;
            }
          }

          // Diagonal
          if ( ret == -1 ) {
            sum = self.board[0][0] + self.board[1][1] + self.board[2][2];
            if ( (sum % 3) === 0 ) {
              ret = sum;
            }
          }
          if ( ret == -1 ) {
            sum = self.board[0][2] + self.board[1][1] + self.board[2][0];
            if ( (sum % 3) === 0 ) {
              ret = sum;
            }
          }

          // Check result
          if ( ret > 0 ) {
            if ( ret === 3 ) {
              alert("You won!");
            } else {
              alert("You lost!");
            }

            return true;
          }

          return false;
        };

        // Do your stuff here
        var table = $("<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>");
        table.addClass("Table");
        table.find("td").each(function(i) {
          var x = (i % 3);
          var y = parseInt(i / 3, 10);

          $(this).click(function() {
            if ( !$(this).attr("class") ) {
              if ( !self.finished ) {
                self.moves++;

                $(this).append("X").addClass("Player");

                self.board[y][x] = 1;
                if ( check() ) {
                  self.finished = true;
                }
              }

            }
          });
        });

        this.$element.find(".fixed1").html(table);
      },


      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here

          this.reset_game();

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
    var __ApplicationTickTackToe = Application.extend({

      init : function() {
        this._super("ApplicationTickTackToe", argv);
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

    return new __ApplicationTickTackToe();
  };
})($);
