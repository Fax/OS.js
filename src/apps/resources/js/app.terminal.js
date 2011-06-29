/**
 * Application: ApplicationTerminal
 *
 * @package OSjs.Applications
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

  return function(GtkWindow, Application, API, argv, windows) {

    ///////////////////////////////////////////////////////////////////////////
    // TERMINAL EMULATION
    ///////////////////////////////////////////////////////////////////////////

    var CurrentDir = null;
    var CurrentPath = null;

    var ChDir = function(dir, callback) {
      dir = dir || "/";
      if ( CurrentDir && CurrentDir != "/" ) {
        dir = CurrentDir + "/" + dir;
      }
      dir = get_path(dir);

      callback = callback || function() {};

      if ( dir != CurrentDir ) {
        API.system.call("readdir", {'path' : dir}, function(result, error) {
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
          var num = 0;
          var total = 0;
          var out = [str_pad("Filename", 60, " ", 'STR_PAD_RIGHT'), str_pad("MIME", 25, " ", 'STR_PAD_LEFT'), str_pad("Size", 15, " ", 'STR_PAD_LEFT'), "\n"].join("");
          out += str_pad("", 100, "-") + "\n";

          for ( var f in CurrentPath ) {
            if ( CurrentPath.hasOwnProperty(f) ) {
              var fname = f;
              if ( CurrentPath[f].type == "dir" ) {
                fname = "[ " + f + " ]";
              }
              out += [str_pad(fname, 60, " ", 'STR_PAD_RIGHT'), str_pad(CurrentPath[f].mime, 25, " ", 'STR_PAD_LEFT'), str_pad(CurrentPath[f].size, 15, " ", 'STR_PAD_LEFT'), "\n"].join("");
              num++;
              total += CurrentPath[f].size;
            }
          }

          out += "\n";
          out += num + " file(s) and dir(s), totals to " + total + " byte(s)";


          callback(out);
        } else {
          callback("ls: NO WORKING DIRECTORY!");
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
          callback("cd: No argument given");
        }
      },

      'open' : function(argv, $txt, callback) {
        if ( argv && argv.length == 2 ) {
          var p = argv[0];
          var m = argv[1];
          if ( !p.match(/^\//) ) {
            p = ((CurrentDir == "/" ? "" : "/") + "/") + p;
          }

          API.system.run(p, m);
          callback("Opening " + p);
        } else {
          callback("open: Not enouth argument given (path mime)");
        }
      }
    };


    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTerminal window1\"> <textarea class=\"GtkTextView GtkObject textview1\"></textarea> </div> </div> ").html();
        this._title = 'Terminal';
        this._icon = 'apps/utilities-terminal.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 800;
        this._height = 340;
        this._gravity = null;
        this._lock_size = true;
      },

      destroy : function() {
        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
          // Do your stuff here
          var txt = $(el).find("textarea");
          var inpbuffer = [];
          var history = [];

          this._bind("focus", function() {
            $(txt).focus();
            var l = $(txt).val().length - 1;
            setSelectionRangeX($(txt).get(0), l, l);
          });

          this._bind("blur", function() {
            $(txt).blur();
          });

          $(txt).mousedown(function(ev) {
            ev.preventDefault();
          }).dblclick(function(ev) {
            ev.preventDefault();
          });

          $(txt).val("");
          this._call("focus");

          $(txt).keydown(function(ev) {
            var keyCode = ev.which || ev.keyCode;
            if ( keyCode == KEY_BACKSPACE ) {
              if ( inpbuffer.length ) {
                inpbuffer.pop();
                return true;
              }
              return false;
            } else if ( keyCode == KEY_TAB ) {
              return false;
            } else if ( keyCode == KEY_ENTER ) {
              self.app.terminal_exec(inpbuffer.join(""));
              inpbuffer = [];
              return false;
            } else if ( keyCode === 0 || keyCode == 16 || keyCode == 17 || keyCode == 18 || keyCode == 91 ) {
              return false;
            } else if ( keyCode == KEY_UP || keyCode == KEY_DOWN || keyCode == KEY_LEFT || keyCode == KEY_RIGHT ) {
              return false;
            }

            return true;
          });

          $(txt).keypress(function(ev) {
            var keyCode = ev.which || ev.keyCode;
            var ch = String.fromCharCode(keyCode);
            if ( ch && ch !== "" ) {
              inpbuffer.push(ch);
            }

            return true;
          });

          ChDir("/", function(out) {
            self.app.terminal_put(out === true ? null : out);
          });

        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationTerminal = Application.extend({

      init : function() {
        this._super("ApplicationTerminal", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();

        // Do your stuff here
        this.$txt = root_window.$element.find("textarea");
      },

      terminal_exec : function(cmd) {
        var self = this;
        if ( cmd ) {
          var args  = cmd.split(" ");
          cmd = args.shift();

          var out;
          if ( Commands[cmd] ) {
            out = Commands[cmd].call(this, args, this.$txt, function(out) {
              self.terminal_put((out ? ("\n" + out) : out) + "\n");
            });
          } else {
            out = "Bad command or filename '" + cmd + "'!\n";
          }

          if ( out ) {
            this.terminal_put(out + "\n");
          }
        } else {
          this.terminal_put("\n");
        }
      },

      terminal_put : function(v) {
        v = v || "";
        this.$txt.val(this.$txt.val() + v + "~" + CurrentDir + " > ");
        this.$txt.attr({ scrollTop: this.$txt.attr("scrollHeight") });
      }

    });

    return new __ApplicationTerminal();
  };
})($);

