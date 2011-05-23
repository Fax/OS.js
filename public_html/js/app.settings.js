var ApplicationSettings = (function() {
  return function(Application, app, api, argv) {
    var _ApplicationSettings = Application.extend({
      init : function() {
        this._super("ApplicationSettings");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        this._super();
      }
    });

    return new _ApplicationSettings();
  };
})();
