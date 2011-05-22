var ApplicationCLASSNAME = (function() {
  return function(Application, app) {
    var _ApplicationCLASSNAME = Application.extend({
      init : function() {
        this._super("ApplicationCLASSNAME");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        this._super();
      }
    });

    return new _ApplicationCLASSNAME();
  };
})();
