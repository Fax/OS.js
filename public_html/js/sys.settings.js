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

        this._super();
      }
    });

    return new _SystemSettings();
  };
})();
