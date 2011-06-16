/**
 * Application: Terminal
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTerminal = (function($, undefined) {


  var KEY_TAB = 9;
  var KEY_ENTER = 13;
  var KEY_BACKSPACE = 8;
  var KEY_UP = 38;
  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;
  var KEY_DOWN = 40;

  return function(Application, app, api, argv) {


    var CurrentDir = null;
    var CurrentPath = null;

    var ChDir = function(dir, callback) {
      dir = dir || "/";
      callback = callback || function() {};

      if ( !dir.match(/^\//) && CurrentDir ) {
        dir = CurrentDir + dir;
      }

      if ( dir != CurrentDir ) {
        api.system.call("readdir", {'path' : dir}, function(result, error) {
          if ( result ) {
            CurrentPath = result;
            CurrentDir = dir;
            callback(true);
          } else {
            callback(error);
          }
        }, false);
      } else {
        callback(false);
      }
    };

    var Commands = {
      'ls' : function(argv, $txt, callback) {

        if ( CurrentPath ) {
          var out = "";
          for ( var f in CurrentPath ) {
            if ( CurrentPath.hasOwnProperty(f) ) {
              out += [str_pad(f, 60, " ", 'STR_PAD_RIGHT'), str_pad(CurrentPath[f].mime, 25, " ", 'STR_PAD_LEFT'), str_pad(CurrentPath[f].size, 15, " ", 'STR_PAD_LEFT'), "\n"].join("");
            }
          }

          callback(out);
        } else {
          callback("NO WORKING DIRECTORY!");
        }
      },
      'cd' : function(argv, $txt, callback) {
        if ( (argv.length) && argv[0] ) {
          ChDir(argv[0], function(res) {
            if ( res === true ) {
              callback("Changed directory to '" + argv[0] + "'");
            } else {
              callback("Failed to change directory to '" + argv[0] + "'");
            }
          });
        } else {
          callback("No argument given");
        }
      }
    };

    var _ApplicationTerminal = Application.extend({
      init : function() {
        this._super("ApplicationTerminal");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        var txt = $(el).find("textarea");
        var inpbuffer = [];
        var history = [];

        app.focus_hook = function() {
          $(txt).focus();
          var l = $(txt).val().length - 1;
          setSelectionRangeX($(txt).get(0), l, l);
        };

        app.blur_hook = function() {
          $(txt).blur();
        };

        $(txt).mousedown(function(ev) {
          ev.preventDefault();
        }).dblclick(function(ev) {
          ev.preventDefault();
        });

        $(txt).val("");
        app.focus_hook();

        var execute = function(cmd) {
          if ( !cmd ) {
            put("\n");
            return;
          }

          var out = null;
          var args = [];

          var tmp = cmd.split(" ");
          cmd = tmp[0];
          if ( tmp.length > 1 ) {
            tmp.shift();
            args = tmp;
          }

          var callback = function(out) {
            put((out ? ("\n" + out) : out) + "\n");
          };

          if ( Commands[cmd] ) {
            out = Commands[cmd].call(this, args, $(txt), callback);
          } else {
            out = "Bad command or filename '" + cmd + "'!";
          }

          if ( out ) {
            put((out ? ("\n" + out) : out) + "\n");
          }
        };

        var put = function(v) {
          v = v || "";
          $(txt).val($(txt).val() + v + "~" + CurrentDir + " > ");
          $(txt).attr({ scrollTop: $(txt).attr("scrollHeight") });
        };

        $(txt).keydown(function(ev) {
          var keyCode = ev.which || ev.keyCode;
          if ( !ev.shiftKey && (keyCode >= 65 && keyCode <= 90) ) {
            keyCode += 32;
          }

          var ch = String.fromCharCode(keyCode);

          if ( keyCode == KEY_BACKSPACE ) {
            if ( inpbuffer.length ) {
              inpbuffer.pop();
              return true;
            }
            return false;
          } else if ( keyCode == KEY_TAB ) {
            return false;
          } else if ( keyCode == KEY_ENTER ) {
            execute(inpbuffer.join(""));
            inpbuffer = [];
            return false;
          } else if ( keyCode === 0 || keyCode == 16 || keyCode == 17 || keyCode == 18 || keyCode == 91 ) {
            return false;
          } else if ( keyCode == KEY_UP || keyCode == KEY_DOWN || keyCode == KEY_LEFT || keyCode == KEY_RIGHT ) {
            return false;
          }

          if ( ch && ch !== "" ) {
            inpbuffer.push(ch);
          }

          return true;
        });

        ChDir("/", function(out) {
          put(out === true ? null : out);
        });

        this._super();
      }
    });

    return new _ApplicationTerminal();
  };
})($);
