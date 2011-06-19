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
        this.content = $("<div class=\"dialog1\"> <div class=\"GtkDialog SystemLogout dialog1\"> <table class=\"GtkBox Vertical dialog-vbox1\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <div class=\"GtkLabel GtkObject label1\">Are you sure you want to log out?</div> </td> </tr> <tr> <td class=\"GtkBoxPosition Position_1\"> <div class=\"GtkCheckButton checkbutton1\"> <input checked=\"checked\" type=\"checkbox\"> <label>Save session for future logins</label> </input> </div> </td> </tr> </table> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <table class=\"GtkButtonBox Horizontal dialog-action_area1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <button class=\"GtkButton GtkObject button1\"><img alt=\"gtk-cancel\" src=\"/img/icons/16x16/actions/gtk-cancel.png\"/>Cancel</button> </td> <td class=\"Fill GtkBoxPosition Position_1\"> <button class=\"GtkButton GtkObject button2\"><img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/>Quit</button> </td> </tr> </table> </td> </tr> </table> </div> </div> ").html();
        this.title = 'Logout';
        this.icon = 'actions/gnome-logout.png';
        this.is_draggable = true;
        this.is_resizable = false;
        this.is_scrollable = false;
        this.is_sessionable = false;
        this.is_minimizable = false;
        this.is_maximizable = false;
        this.is_closable = true;
        this.is_orphan = true;
        this.width = 300;
        this.height = 100;
        this.gravity = 'center';
      },

      destroy : function() {
        this._super();
      },



      create : function(id, zi, mcallback) {
        var el = this._super(id, zi, mcallback);
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
        root_window.show();

        this._super(root_window);

        // Do your stuff here
      }
    });

    return new __SystemLogout();
  };
})($);

