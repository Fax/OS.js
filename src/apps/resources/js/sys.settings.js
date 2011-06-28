/**
 * Application: SystemSettings
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemSettings = (function($, undefined) {
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
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemSettings window1\"> <table class=\"GtkBox Vertical box5\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkNotebook notebook1\"> <ul> <li class=\"GtkLabel label1\"> <div> <a href=\"#tab-0\">Desktop</a> </div> </li> <li class=\"GtkLabel label2\"> <div> <a href=\"#tab-1\">System</a> </div> </li> </ul> <div class=\"GtkTab\" id=\"tab-0\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Expand GtkBoxPosition Position_0\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box2\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label3\">Background Wallpaper</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkFileChooserButton filechooserbutton_wallpaper\"> <table> <tr> <td class=\"Input\"> <input type=\"text\"/> <input type=\"hidden\" style=\"display:none;\"/> </td> <td class=\"Button\"> <button class=\"GtkFileChooserButton\">...</button> </td> </tr> </table> </div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_1\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box3\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label4\">Theme</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_theme\"></select> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Expand GtkBoxPosition Position_2\" style=\"height:60px\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box4\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label5\">Font</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <select class=\"GtkComboBox combobox_font\"></select> </div> </td> </tr> </table> </div> </td> </tr> </table> </div> <div class=\"GtkTab\" id=\"tab-1\"> <div class=\" \"></div> </div> </div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <ul class=\"GtkButtonBox Horizontal buttonbox1\"> <li> <button class=\"GtkButton button1\"><img alt=\"gtk-close\" src=\"/img/icons/16x16/actions/gtk-close.png\"/>Close</button> </li> <li> <button class=\"GtkButton button_apply\"><img alt=\"gtk-apply\" src=\"/img/icons/16x16/actions/gtk-save.png\"/>Apply</button> </li> </ul> </div> </td> </tr> </table> </div> </div> ").html();
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
        this._height = 330;
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


      EventClose : function(el, ev) {
        var self = this;


        this.$element.find(".ActionClose").click();

      },


      EventApplyChanges : function(el, ev) {
        var self = this;

        var args = {
          "desktop.wallpaper.path" : self.$element.find(".filechooserbutton_wallpaper input[type=hidden]").val(),
          "desktop.theme"          : self.$element.find(".combobox_theme").val(),
          "desktop.font"           : self.$element.find(".combobox_font").val()
        };
        API.user.settings.save(args);

      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".filechooserbutton_wallpaper button").click(function(ev) {
            self.EventSetWallpaper(this, ev);
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

          var wallpaper = API.user.settings.get("desktop.wallpaper.path");
          var theme     = API.user.settings.get("desktop.theme");
          var font      = API.user.settings.get("desktop.font");

          el.find("input[type=text]").val(wallpaper);
          el.find("input[type=hidden]").val(wallpaper);
          el.find(".combobox_theme").val(theme);
          el.find(".combobox_font").val(font);

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
