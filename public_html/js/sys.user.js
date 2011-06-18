/**
 * Application: SystemUser
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemUser = (function($, undefined) {
  return function(Window, Application, API, argv) {


    var Window_window1 = Window.extend({

      init : function(app) {
        this._super("SystemUser", false, {}, {});
        this.content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemUser window1\"> <div class=\"SystemUser\"><div class=\"SystemUserLoading\"></div><div class=\"SystemUserInner\"><ul><li><a href=\"#tabs-1\">Profile</a></li><li><a href=\"#tabs-2\">Session</a></li></ul><div id=\"tabs-1\"></div><div id=\"tabs-2\"><div class=\"SessionData\"><ul class=\"SessionDataList\"></ul></div></div></div></div> </div> </div> ").html();
        this.title = 'User Information';
        this.icon = 'apps/user-info.png';
        this.is_draggable = true;
        this.is_resizable = true;
        this.is_scrollable = false;
        this.is_sessionable = true;
        this.is_minimizable = true;
        this.is_maximizable = true;
        this.is_closable = true;
        this.is_orphan = false;
        this.width = 400;
        this.height = 250;
        this.gravity = 'center';


        this.app = app;
      },

      destroy : function() {
        this._super();
      },



      create : function(id, zi, mcallback) {
        var el = this._super(id, zi, mcallback);
        var self = this;

        if ( el ) {
          el.find(".GtkScale").slider();

          el.find(".GtkToolItemGroup").click(function() {
            $(this).parents(".GtkToolPalette").first().find(".GtkToolItemGroup").removeClass("Checked");

            if ( $(this).hasClass("Checked") ) {
              $(this).removeClass("Checked");
            } else {
              $(this).addClass("Checked");
            }
          });

          el.find(".GtkToggleToolButton button").click(function() {
            if ( $(this).parent().hasClass("Checked") ) {
              $(this).parent().removeClass("Checked");
            } else {
              $(this).parent().addClass("Checked");
            }
          });


          var loader = this.$element.find(".SystemUserLoading");
          var inner = this.$element.find(".SystemUserInner");

          $.post("/", {'ajax' : true, 'action' : 'user'}, function(data) {

            if ( data.success ) {
              var table = $("<table></table>");
              $("#tabs-1").append(table);
              forEach(data.result, function(key, val) {
                $(table).append($(sprintf("<tr><td class=\"pri\">%s</td><td class=\"sec\">%s</td></tr>", key, val)));
              });
            } else {
              API.system.dialog("error", data.error);
            }

            $(inner).tabs();

            loader.hide();

          });

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
            $("#tabs-2").find("ul").append(item);
          }

          // Do your stuff here

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

        this._super(self);

        var root_window = new Window_window1();
        root_window.show(self);

        // Do your stuff here
      }
    });

    return new __SystemUser();
  };
})($);

