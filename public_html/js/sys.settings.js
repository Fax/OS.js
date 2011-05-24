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

        $(el).find('button.Close').click(function() {
          $(el).find(".ActionClose").click();
        });
        $(el).find('button.Save').click(function() {
          var args = form.serializeObject();

          app.event(this, "save", args, function(result, error) {
            if ( error ) {
              api.system.dialog("error", error);
            } else {
              if ( result ) {
                api.system.dialog("info", "Your settings have been saved");
                api.user.settings.load(result);
              } else {
                api.system.dialog("error", "Your settings were not saved!");
              }
            }
          });

        });

        this._super();
      }
    });

    return new _SystemSettings();
  };
})();
