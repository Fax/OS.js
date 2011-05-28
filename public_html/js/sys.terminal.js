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

  var Commands = {
    'ls' : function(argv, $txt) {
      return "LIST OF FILES";
    },
    'cd' : function(argv, $txt) {
      return "CHANGE DIRECTORY";
    }
  };

  return function(Application, app, api, argv) {
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

        app.focus_hook = function() {
          $(txt).focus();
          var l = $(txt).val().length;
          setSelectionRangeX($(txt).get(0), l, l);
        };

        app.blur_hook = function() {
          $(txt).blur();
        };

        $(txt).val("");
        app.focus_hook();

        var execute = function(cmd) {
          var out = null;
          var args = [];
          var tmp = cmd.split(" ");
          if ( tmp.length > 1 ) {
            tmp.shift();
            args = tmp;
          }

          if ( Commands[cmd] ) {
            out = Commands[cmd].call(this, args, $(txt));
          } else {
            out = "Bad command or filename '" + cmd + "'!";
          }
          console.log(cmd, out);

          put((out ? ("\n" + out) : out) + "\n");
        };

        var put = function(v) {
          v = v || "";
          $(txt).val($(txt).val() + v + "~/ >");
        };

        var inpbuffer = [];
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
          }

          if ( ch && ch !== "" ) {
            inpbuffer.push(ch);
          }

          return true;
        });

        put();

        this._super();
      }
    });

    return new _ApplicationTerminal();
  };
})($);
