/**
 * Application: SystemSettings
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemSettings = (function($, undefined) {
  return function(GtkWindow, Application, API, argv, windows) {


    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("SystemSettings", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemSettings window1\"> <div class=\"SystemSettings\"><div class=\"SystemSettingsLoading\"></div><div class=\"SystemSettingsInner\"><div class=\"SystemSettingsForm\"><form method=\"post\" action=\"/\" onsubmit=\"return false;\"><div><h1>Wallpaper</h1><input type=\"text\" name=\"fake_desktop.wallpaper.path\" value=\"\" disabled=\"disabled\" /><input type=\"hidden\" name=\"desktop.wallpaper.path\" value=\"\" /><button>...</button></div><div><h1>Theme</h1><select name=\"desktop.theme\"><option value=\"dark\">Dark</option><option value=\"light\">Light</option></select></div></form></div><div class=\"SystemSettingsButtons\"><button class=\"Save\">Save</button><button class=\"Close\">Close</button></div></div></div> </div> </div> ").html();
        this._title = 'Settings';
        this._icon = 'categories/applications-system.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = true;
        this.width = 400;
        this.height = 200;
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
          var form = $(el).find("form");

          $(form).find("input, select").each(function() {
            if ( this.name ) {
              var val = API.user.settings.get(this.name);
              if ( val ) {
                $(this).val(val);
                $(form).find("input[name='fake_" + this.name + "']").val(val);
              }
            }
          });

          $(form).find("button").click(function() {
            var txt = $(this).parent().find("input");
            var dir = $(txt).val();
            if ( dir ) {
              var tmp = dir.split("/");
              if ( tmp.length > 1 ) {
                tmp.pop();
              }
              dir = tmp.join("/");
            }
            API.system.dialog_file(function(fname) {
              $(txt).val(fname);
            }, ["image/*"], "open", dir);
          });

          $(el).find('button.Close').click(function() {
            $(el).find(".ActionClose").click();
          });
          $(el).find('button.Save').click(function() {
            var args = form.serializeObject();
            API.user.settings.save(args);
          });


          setTimeout(function() {
            $(el).find(".SystemSettingsLoading").hide();
            $(el).find(".SystemSettingsInner").show();
          }, 300);

        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

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
        root_window.show();

        this._super(root_window);

        // Do your stuff here
      }
    });

    return new __SystemSettings();
  };
})($);

