var ApplicationTextpad = (function() {
  return function(Application, app, api, argv) {

    function _save(file, content, callback) {
      callback = callback || function() {};

      if ( typeof file == "string" && file ) {
        api.system.call("write", {'file' : file, 'content' : content}, function(result, error) {
          // SYSTEM HANDLES ERRORS
        });
      }
    }

    function _saveAs(content, callback) {
      api.system.dialog_file(function() {
        callback();
      });
    }

    function _open(content, callback) {
      api.system.dialog_file(function() {
        callback();
      });
    }

    function _update(file) {
      app.opts = file;
      argv = file;
    }

    // APP
    var _ApplicationTextpad = Application.extend({
      init : function() {
        this._super("ApplicationTextpad");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var el = app.$element;

        if ( typeof argv == "string" && argv ) {
          api.system.call("read", argv, function(result, error) {
            if ( error === null ) {
              app.$element.find("textarea").val(result);
            }
          });
        }

        $(el).find(".WindowMenu .cmd_Open").parent().click(function() {
          _open(function() {
            //_update(null);
          });
        });

        $(el).find(".WindowMenu .cmd_Save").parent().click(function() {
          _save(argv, app.$element.find("textarea").val());
        });

        $(el).find(".WindowMenu .cmd_SaveAs").parent().click(function() {
          _saveAs(app.$element.find("textarea").val(), function() {
            //_update(null);
          });
        });

        $(el).find(".WindowMenu .cmd_New").parent().click(function() {
          app.$element.find("textarea").val("");
          _update(null);
        });

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
