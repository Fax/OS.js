/**
 * Application: SystemSettings
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemSettings = (function() {
  return function(Application, app, api, argv) {
    var _SystemSettings = Application.extend({
      init : function() {
        this._super("SystemSettings");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        var form = $(el).find("form");

        $(form).find("input, select").each(function() {
          if ( this.name ) {
            var val = api.user.settings.get(this.name);
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
          api.system.dialog_file(function(fname) {
            $(txt).val(fname);
          }, ["image/*"], "open", dir);
        });

        $(el).find('button.Close').click(function() {
          $(el).find(".ActionClose").click();
        });
        $(el).find('button.Save').click(function() {
          var args = form.serializeObject();
          api.user.settings.save(args);
        });


        setTimeout(function() {
          $(el).find(".SystemSettingsLoading").hide();
          $(el).find(".SystemSettingsInner").show();
        }, 300);

        this._super();
      }
    });

    return new _SystemSettings();
  };
})();
