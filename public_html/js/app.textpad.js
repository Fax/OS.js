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

        if ( typeof argv == "string" && argv ) {
          api.system.call("read", argv, function(result, error) {
            if ( error === null ) {
              app.$element.find("textarea").val(result);
            }
          });
        }

        $(el).find(".WindowMenu .cmd_Save").parent().click(function() {
          if ( typeof argv == "string" && argv ) {
            api.system.call("write", {'file' : argv, 'content' : app.$element.find("textarea").val()}, function(result, error) {
              /*
              if ( error === null ) {
                alert("Success");
              }
              */
            });
          }
        });

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
