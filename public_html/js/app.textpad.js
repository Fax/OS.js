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

    function _open(callback) {
      api.system.dialog_file(function(fname) {
        callback(fname);
      }, ["text/*"]);
    }

    function _update(file, el) {
      app.opts = file;
      argv['path'] = file;

      $(el).find(".WindowTopInner span").html(app.title + ": " + (file || "New file"));
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

        function _read_file(file) {
          if ( typeof file == "string" && file ) {
            api.system.call("read", file, function(result, error) {
              if ( error === null ) {
                app.$element.find("textarea").val(result);
                _update(file, el);
              } else {
                _update(null, el);
              }
            });
          } else {
            _update(null, el);
          }
        }

        _read_file(argv['path']);

        $(el).find(".WindowMenu .cmd_Open").parent().click(function() {
          _open(function(fname) {
            _read_file(fname);
          });
        });

        $(el).find(".WindowMenu .cmd_Save").parent().click(function() {
          _save(argv['path'], app.$element.find("textarea").val());
        });

        $(el).find(".WindowMenu .cmd_SaveAs").parent().click(function() {
          _saveAs(app.$element.find("textarea").val(), function() {
            //_update(null, el);
          });
        });

        $(el).find(".WindowMenu .cmd_New").parent().click(function() {
          app.$element.find("textarea").val("");
          _update(null, el);
        });

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
