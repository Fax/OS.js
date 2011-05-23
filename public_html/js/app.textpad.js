var ApplicationTextpad = (function() {
  return function(Application, app, api) {
    var _ApplicationTextpad = Application.extend({
      init : function() {
        this._super("ApplicationTextpad");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
