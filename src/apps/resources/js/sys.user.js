/**
 * Application: SystemUser
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemUser = (function($, undefined) {
  return function(GtkWindow, Application, API, argv, windows) {


    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("SystemUser", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemUser window1\"> <div class=\"GtkNotebook notebook1\"> <ul> <li class=\"GtkLabel GtkObject label1\"> <div> <a href=\"#tab-0\">Profile</a> </div> </li> <li class=\"GtkLabel GtkObject label2\"> <div> <a href=\"#tab-1\">Session</a> </div> </li> </ul> <div class=\"GtkFixed GtkTab fixed1\" id=\"tab-0\"></div> <div class=\"GtkFixed GtkTab fixed2\" id=\"tab-1\"></div> </div> </div> </div> ").html();
        this._title = 'User Information';
        this._icon = 'apps/user-info.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = true;
        this._width = 400;
        this._height = 250;
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
          var inner = this.$element.find(".fixed1");

          // User info
          var table = $("<table></table>");

          el.find(".fixed1").append(table);
          el.find(".fixed2").append("<ul></ul>");

          $.post("/", {'ajax' : true, 'action' : 'user'}, function(data) {

            if ( data.success ) {
              forEach(data.result, function(key, val) {
                $(table).append($(sprintf("<tr><td class=\"pri\">%s</td><td class=\"sec\">%s</td></tr>", key, val)));
              });
            } else {
              self.app.createMessageDialog("error", data.error);
            }

            //$(inner).tabs();
          });

          // Session info
          var items = "";
          for ( var i = 0; i < localStorage.length; i++ ) {
            var key = localStorage.key(i);
            var item = $("<li><span></span><div></div></li>");
            var type = API.user.settings.type(key);
            var value = localStorage.getItem(key);

            if ( type == "list" || key == "session" ) {
              value = JSON.stringify(JSON.parse(value), null, '\t');
            }

            item.find("span").html(key);
            item.find("div").html(value).addClass("upper");
            item.click(function() {
              $(this).find("div.upper").toggle();
              if ( $(this).find("div.upper").is(":visible") ) {
                $(this).addClass("toggled");
              } else {
                $(this).removeClass("toggled");
              }
            });
            el.find(".fixed2 ul").append(item);
          }


        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __SystemUser = Application.extend({

      init : function() {
        this._super("SystemUser", argv);
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

    return new __SystemUser();
  };
})($);

