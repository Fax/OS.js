/**
 * Application: SystemLogout
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemLogout = (function($, undefined) {
  return function(GtkWindow, Application, API, argv, windows) {



    var Window_dialog1 = GtkWindow.extend({

      init : function(app) {
        this._super("SystemLogout", false, app, windows);
        this._content = $("<div class=\"dialog1\"> <div class=\"GtkDialog SystemLogout dialog1\" style=\"padding:5px\"> <table class=\"GtkBox Vertical dialog-vbox1\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label1\">Are you sure you want to log out?</div> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkCheckButton checkbutton1\"> <input checked=\"checked\" type=\"checkbox\"> <label>Save session for future logins</label> </input> </div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <ul class=\"GtkButtonBox Horizontal dialog-action_area1\"> <li> <button class=\"GtkButton button1\"><img alt=\"gtk-cancel\" src=\"/img/icons/16x16/actions/gtk-cancel.png\"/>Cancel</button> </li> <li> <button class=\"GtkButton button2\"><img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/>Quit</button> </li> </ul> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Logout';
        this._icon = 'actions/gnome-logout.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = false;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = true;
        this._is_ontop = true;
        this._width = 300;
        this._height = 150;
        this._gravity = 'center';
      },

      destroy : function() {
        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
          // Do your stuff here
          $(el).find("label").click(function() {
            $(el).find("input[type=checkbox]").click();
          });

          $(el).find('button.button1').click(function() {
            $(el).find(".ActionClose").click();
          });
          $(el).find('button.button2').click(function() {
            var chk = $(el).find("input").get(0);
            API.user.logout(chk.checked);
            self.close();
          });
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __SystemLogout = Application.extend({

      init : function() {
        this._super("SystemLogout", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_dialog1(self);
        this._super(root_window);
        root_window.show();


        // Do your stuff here
      }
    });

    return new __SystemLogout();
  };
})($);

