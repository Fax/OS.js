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

        $(el).find('button.Cancel').click(function() {
          $(el).find(".ActionClose").click();
        });
        $(el).find('button.Logout').click(function() {
          var chk = $(el).find("input").get(0);
          api.user.logout(chk.checked);
        });

        this._super();
      }
    });

    return new _SystemLogout();
  };
})();
