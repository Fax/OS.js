var ApplicationTextpad = (function() {
  return function(Application, app, api, argv) {
    var _ApplicationTextpad = Application.extend({
      init : function() {
        this._super("ApplicationTextpad");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        if ( argv ) {
          api.system.call("read", argv, function(result, error) {
            if ( error === null ) {
              app.$element.find("textarea").val(result);
            }
          });
        }

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
