/*!
 * Application: SystemSettings
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.SystemSettings = (function($, undefined) {
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

    var locations = API.user.settings.options("system.locale.location");

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
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemSettings window1\"> <table class=\"GtkBox Vertical box5\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkNotebook notebook1\"> <ul> <li class=\"GtkLabel label1\"> <div> <a href=\"#tab-4\">Desktop</a> </div> </li> <li class=\"GtkLabel label2\"> <div> <a href=\"#tab-5\">System</a> </div> </li> </ul> <div class=\"GtkTab\" id=\"tab-4\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Expand GtkBoxPosition Position_0\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box2\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label3\">Background Wallpaper</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFileChooserButton filechooserbutton_wallpaper\"> <table> <tr> <td class=\"Input\"> <input type=\"text\"/> <input type=\"hidden\" style=\"display:none;\"/> </td> <td class=\"Button\"> <button class=\"GtkFileChooserButton\">...</button> </td> </tr> </table> </div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_1\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box12\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label11\">Background Type</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_background\"></select> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_2\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box13\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label12\">Background Color</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkColorButton GtkObject colorbutton_background\"></div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_3\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box3\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label4\">Theme</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_theme\"></select> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_4\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box4\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label5\">Font</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_font\"></select> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_5\" style=\"height:40px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box11\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label10\">Cursors</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_cursor\"></select> </div> </td> </tr> </table> </div> </td> </tr> </table> </div> <div class=\"GtkTab\" id=\"tab-5\"> <table class=\"GtkBox Vertical box6\"> <tr> <td class=\"Expand GtkBoxPosition Position_0\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box7\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label6\">Locale location</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_locale_location\" type=\"text\"/> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_1\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box8\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label7\">Locale time format</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_locale_time\" type=\"text\"/> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_2\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box9\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label8\">Locale date format</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_locale_date\" type=\"text\"/> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_3\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box10\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label9\">Locale timestamp format</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_locale_timestamp\" type=\"text\"/> </div> </td> </tr> </table> </div> </td> </tr> </table> </div> </div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <ul class=\"GtkButtonBox Horizontal buttonbox1\" style=\"text-align:end\"> <li> <button class=\"GtkButton button1\"><img alt=\"gtk-close\" src=\"/img/icons/16x16/actions/gtk-close.png\"/>Close</button> </li> <li> <button class=\"GtkButton button_apply\"><img alt=\"gtk-apply\" src=\"/img/icons/16x16/actions/gtk-save.png\"/>Apply</button> </li> </ul> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Settings';
        this._icon = 'categories/applications-system.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = true;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 500;
        this._height = 400;
        this._gravity = 'center';

      },

      destroy : function() {
        this._super();
      },


      EventSetWallpaper : function(el, ev) {
        var self = this;

        var my_mimes    = ["image/*"];
        var my_path     = self.$element.find(".filechooserbutton_wallpaper input[type=text]").val();

        this.app.createFileDialog(function(fname) {
          self.$element.find(".filechooserbutton_wallpaper input[type=text]").val(fname);
          self.$element.find(".filechooserbutton_wallpaper input[type=hidden]").val(fname);
        }, my_mimes, "open", dirname(my_path));

      },


      EventSetBackground : function(el, ev) {
        var self = this;
      },

      EventSetBackgroundColor : function(el, ev) {
        var self = this;

        var color = API.user.settings.get("desktop.background.color");
        this.app.createColorDialog(color, function(rgb, hex) {
          self.$element.find(".colorbutton_background").css("background-color", hex);
        });
      },

      EventClose : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();
      },


      EventApplyChanges : function(el, ev) {
        var self = this;

        var args = {
          "desktop.wallpaper.path"           : self.$element.find(".filechooserbutton_wallpaper input[type=hidden]").val(),
          "desktop.theme"                    : self.$element.find(".combobox_theme").val(),
          "desktop.font"                     : self.$element.find(".combobox_font").val(),
          "desktop.wallpaper.type"           : self.$element.find(".combobox_background").val(),
          "desktop.background.color"         : self.$element.find(".colorbutton_background").css("background-color"),
          "system.locale.location"           : self.$element.find(".entry_locale_location").val(),
          "system.locale.time-format"        : self.$element.find(".entry_locale_time").val(),
          "system.locale.date-format"        : self.$element.find(".entry_locale_date").val(),
          "system.locale.timestamp-format"   : self.$element.find(".entry_locale_timestamp").val()
        };

        // Reset any fields containing errors
        for ( var x in args ) {
          if ( args.hasOwnProperty(x) ) {
            var deflt = API.user.settings.get(x);
            var reset = false;

            if ( !args[x] ) {
              args[x] = deflt;
              reset = true;
            }

            switch ( x ) {
              case "system.locale.location" :
                if ( !reset ) {
                  var found = false;
                  for ( var l = 0; l < locations.length; l++ ) {
                    if ( locations[l] == args[x] ) {
                      found = true;
                      break;
                    }
                  }

                  if ( !found ) {
                    args[x] = deflt;
                    API.system.alert("Invalid locale location given!");
                  }
                }

                self.$element.find(".entry_locale_location").val(args[x]);
              break;
              case "system.locale.time-format" :
                if ( !reset ) {
                  (function() {})(); // FIXME: Validate stamp
                }
              break;
              case "system.locale.date-format" :
                if ( !reset ) {
                  (function() {})(); // FIXME: Validate stamp
                }
              break;
              case "system.locale.timestamp-format" :
                if ( !reset ) {
                  (function() {})(); // FIXME: Validate stamp
                }
              break;

              default :
              break;
            }

          }
        }

        API.user.settings.save(args);
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".filechooserbutton_wallpaper button").click(function(ev) {
            self.EventSetWallpaper(this, ev);
          });

          el.find(".combobox_background").change(function(ev) {
            self.EventSetBackground(this, ev);
          });

          el.find(".colorbutton_background").click(function(ev) {
            self.EventSetBackgroundColor(this, ev);
          });

          el.find(".button1").click(function(ev) {
            self.EventClose(this, ev);
          });

          el.find(".button_apply").click(function(ev) {
            self.EventApplyChanges(this, ev);
          });

          // Do your stuff here

          var opts = API.user.settings.options("desktop.theme");
          $(opts).each(function(i, v) {
            el.find(".combobox_theme").append($(sprintf("<option value=\"%s\">%s</option>", v, v)));
          });

          opts = API.user.settings.options("desktop.font");
          $(opts).each(function(i, v) {
            el.find(".combobox_font").append($(sprintf("<option value=\"%s\">%s</option>", v, v)));
          });

          opts = API.user.settings.options("desktop.wallpaper.type");
          $(opts).each(function(i, v) {
            el.find(".combobox_background").append($(sprintf("<option value=\"%s\">%s</option>", v, v)));
          });


          var wallpaper = API.user.settings.get("desktop.wallpaper.path");
          var wptype    = API.user.settings.get("desktop.wallpaper.type");
          var theme     = API.user.settings.get("desktop.theme");
          var font      = API.user.settings.get("desktop.font");
          var color     = API.user.settings.get("desktop.background.color");

          var locale_location = API.user.settings.get("system.locale.location");
          var locale_time     = API.user.settings.get("system.locale.time-format");
          var locale_date     = API.user.settings.get("system.locale.date-format");
          var locale_stamp    = API.user.settings.get("system.locale.timestamp-format");

          el.find(".filechooserbutton_wallpaper input[type=text]").val(wallpaper);
          el.find(".filechooserbutton_wallpaper input[type=hidden]").val(wallpaper);
          el.find(".combobox_theme").val(theme);
          el.find(".combobox_font").val(font);
          el.find(".combobox_cursor").attr("disabled", "disabled");
          el.find(".combobox_background").val(wptype);
          el.find(".colorbutton_background").css("background-color", color);

          el.find(".entry_locale_location").val(locale_location);
          el.find(".entry_locale_time").val(locale_time);
          el.find(".entry_locale_date").val(locale_date);
          el.find(".entry_locale_timestamp").val(locale_stamp);

          var popup = $("<div><select size=\"10\"></select></div>");
          var select = popup.find("select").css({
            width : "100%"
          });

          select.click(function(ev) {
            el.find(".entry_locale_location").val(locations[this.selectedIndex]);
            popup.hide();
          });

          var _select = function() {
            var cur = el.find(".entry_locale_location").val();
            for ( var l = 0; l < locations.length; l++ ) {
              if ( locations[l] == cur ) {
                select.get(0).selectedIndex = l;
                break;
              }
            }
          };

          for ( var l = 0; l < locations.length; l++ ) {
            var e = $("<option value=\"" + locations[l] + "\">" + locations[l] + "</option>");
            select.append(e);
          }


          this.$element.append(popup.hide());

          el.find(".entry_locale_location").bind("focus", function() {
            var iel = $(this);
            popup.css({
              position : "absolute",
              zIndex   : 9999999999,
              top      : "140px",
              left     : "17px",
              height   : popup.find("select").height() + "px",
              width    : iel.width()  + "px"
            }).show();

            _select();
          });


          el.find(".GtkTab").first().find(".box11").parents("tr").first().remove();

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
    var __SystemSettings = Application.extend({

      init : function() {
        this._super("SystemSettings", argv);
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

    return new __SystemSettings();
  };
})($);
