/**
 * Application: SystemUser
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemUser = (function($, undefined) {
  return function(GtkWindow, Application, API, argv, windows) {


    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("SystemUser", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemUser window1\"> <div class=\"GtkNotebook notebook1\"> <ul> <li class=\"GtkLabel GtkObject label1\"> <div> <a href=\"#tab-0\">Profile</a> </div> </li> <li class=\"GtkLabel GtkObject label2\"> <div> <a href=\"#tab-1\">Session</a> </div> </li> <li class=\"GtkLabel GtkObject label3\"> <div> <a href=\"#tab-2\">Processes</a> </div> </li> </ul> <div class=\"GtkFixed GtkTab fixed1\" id=\"tab-0\"></div> <div class=\"GtkFixed GtkTab fixed2\" id=\"tab-1\"></div> <div class=\"GtkIconView GtkObject GtkTab iconview1\" id=\"tab-2\"></div> </div> </div> </div> ").html();
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
          var inner = this.$element.find(".fixed1");

          // User info
          var table = $("<table></table>");
          var table2 = $("<div class=\"TableWrap\"><table class=\"TableHead GtkIconViewHeader\"><tbody><tr><td>PID</td><td>Application</td><td>Alive</td></tr></tbody></table><div class=\"TableBodyWrap\"><table class=\"TableBody\"><tbody></tbody></table></div></div>");

          el.find(".fixed1").append(table);
          el.find(".fixed2").append("<ul></ul>");
          el.find(".iconview1").append(table2);

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

          // Processes info
          this.pinterval = setInterval(function() {
            table2.find(".TableBody tbody").html("");

            var list = API.session.processes();
            var p, row;
            for ( var x = 0; x < list.length; x++ ) {
              p = list[x];

              row = $(sprintf("<tr><td>%s</td><td><img alt=\"\" src=\"/img/icons/16x16/%s\" />&nbsp; %s</td><td>%sms</td></tr>", p.id, p.icon, p.title || p.name, p.time));
              el.find(".iconview1 table.TableBody tbody").append(row);
            }

            el.find(".iconview1 table.TableHead td").each(function(ind, el) {
              var pel = self.$element.find(".iconview1 table.TableBody tr:first-child td").get(ind);
              if ( pel ) {
                $(el).css("width", $(pel).width() + "px");
              }
            });

          }, 3000);


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
        root_window.show();

        this._super(root_window);

        // Do your stuff here
      }
    });

    return new __SystemUser();
  };
})($);

