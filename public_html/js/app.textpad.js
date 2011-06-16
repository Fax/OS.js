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

    function _open(callback, el) {
      api.system.dialog_file(function(fname) {
        callback(fname);

        setTimeout(function() {
          setSelectionRangeX($(el).find("textarea"), 0, 0);
        }, 0);
      }, ["text/*"]);
    }

    function _update(file, el) {
      app.opts = file;
      argv['path'] = file;

      $(el).find(".WindowTopInner span").html(app.title + ": " + (file || "New file"));
      _updateStatusbar(el);
    }

    function _updateStatusbar(el) {
      var txt = $(el).find("textarea");
      var pos = getTextareaCoordinates(txt);
/*
      var val = txt.val();

      // Line count
      var lines   = val.split("\n");
      var lcount  = lines.length;

      // Caret pos
      var cpos    = getCaret(txt.get(0));

      // Get row
      var back    = cpos > 0 ? val.substr(0, cpos) : "";
      var row     = back.split("\n").length;

      // Get column
      var ccpos = 0;
      for ( var i = 0; i < row - 1; i++ ) {
        ccpos += lines[i].length;
      }
      var col = Math.abs(ccpos - cpos) - (row - 1);
*/

      var text = sprintf("Row: %d, Col: %d, Lines: %d, Characters: %d", pos.y, pos.x, pos.lines, pos.length);
      $(el).find(".statusbar1").html(text);
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

        app.focus_hook = function() {
          el.find("textarea").focus();
          _updateStatusbar(el);
        };

        function _read_file(file) {
          var txt = el.find("textarea");
          if ( typeof file == "string" && file ) {
            api.system.call("read", file, function(result, error) {
              if ( error === null ) {
                txt.val(result);
                _update(file, el);

                setTimeout(function() {
                  setSelectionRangeX(txt.get(0), 0, 0);
                }, 0);
              } else {
                _update(null, el);
              }
            });
          } else {
            _update(null, el);
          }

          _updateStatusbar(el);
          txt.focus();
        }

        _read_file(argv['path']);

        el.find(".imagemenuitem2").click(function() {
          _open(function(fname) {
            _read_file(fname);
          }, el);
        });

        el.find(".imagemenuitem3").click(function() {
          if ( argv && argv['path'] ) {
            _save(argv['path'], app.$element.find("textarea").val());
          }
        });

        el.find(".imagemenuitem4").click(function() {
          _saveAs(function(file, mime) {
            _save(file, app.$element.find("textarea").val(), function() {
              _update(file, el);
            });
          });
        });

        el.find(".imagemenuitem1").click(function() {
          app.$element.find("textarea").val("");
          _update(null, el);
        });

        $(el).find("textarea").mousedown(function(ev) {
          _updateStatusbar(el);
          ev.stopPropagation();
        }).focus(function() {
          _updateStatusbar(el);
        }).keyup(function() {
          _updateStatusbar(el);
        });

        this._super();
      }
    });

    return new _ApplicationTextpad();
  };
})();
