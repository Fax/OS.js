/**
 * Application: ApplicationTextpad
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTextpad = (function() {
  return function(Application, app, api, argv) {

    function _save(file, content, callback) {
      callback = callback || function() {};

      if ( typeof file == "string" && file ) {
        api.system.call("write", {'file' : file, 'content' : content}, function(result, error) {
          // SYSTEM HANDLES ERRORS
          if ( result ) {
            callback(file);
          }
        });
      }
    }

    function _saveAs(callback) {
      api.system.dialog_file(function(file, mime) {
        callback(file, mime);
      }, ["text/*"], "save");
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

        app.setMenuItemAction("File", "cmd_Open", function() {
          _open(function(fname) {
            _read_file(fname);
          });
        });

        app.setMenuItemAction("File", "cmd_Save", function() {
          if ( argv && argv['path'] ) {
            _save(argv['path'], app.$element.find("textarea").val());
          }
        });

        app.setMenuItemAction("File", "cmd_SaveAs", function() {
          _saveAs(function(file, mime) {
            _save(file, app.$element.find("textarea").val(), function() {
              _update(file, el);
            });
          });
        });

        app.setMenuItemAction("File", "cmd_New", function() {
          app.$element.find("textarea").val("");
          _update(null, el);
        });

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
