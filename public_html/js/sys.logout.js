/**
 * Application: SystemLogout
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemLogout = (function() {
  return function(Application, app, api, argv) {
    var _SystemLogout = Application.extend({
      init : function() {
        this._super("SystemLogout");

        app.is_sessionable = false;
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        $(el).find("label").click(function() {
          $(el).find("input[type=checkbox]").click();
        });

        $(el).find('button.button1').click(function() {
          $(el).find(".ActionClose").click();
        });
        $(el).find('button.button2').click(function() {
          var chk = $(el).find("input").get(0);
          api.user.logout(chk.checked);
        });

        this._super();
      }
    });

    return new _SystemLogout();
  };
})();
