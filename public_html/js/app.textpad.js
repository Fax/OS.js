/**
 * Application: ApplicationTextpad
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTextpad = (function($, undefined) {
  return function(GtkWindow, Application, API, argv, windows) {

    var WindowTitle = "";

    function _read_file(el, file) {
      var txt = el.find("textarea");
      if ( typeof file == "string" && file ) {
        API.system.call("read", file, function(result, error) {
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

    function _save(file, content, callback) {
      callback = callback || function() {};

      if ( typeof file == "string" && file ) {
        API.system.call("write", {'file' : file, 'content' : content}, function(result, error) {
          // SYSTEM HANDLES ERRORS
          if ( result ) {
            callback(file);
          }
        });
      }
    }

    function _saveAs(callback) {
      API.system.dialog_file(function(file, mime) {
        callback(file, mime);
      }, ["text/*"], "save");
    }

    function _open(callback, el) {
      API.system.dialog_file(function(fname) {
        callback(fname);

        setTimeout(function() {
          setSelectionRangeX($(el).find("textarea"), 0, 0);
        }, 0);
      }, ["text/*"]);
    }

    function _update(file, el) {
      //app.opts = file; // FIXME
      argv['path'] = file;

      $(el).find(".WindowTopInner span").html(WindowTitle + ": " + (file || "New file"));
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


    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationTextpad", false, app, windows);
        this.content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTextpad window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_save\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_saveas\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <textarea class=\"GtkTextView GtkObject textview1\"></textarea> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"GtkStatusbar statusbar1\"></div> </td> </tr> </table> </div> </div> ").html();
        this.title = 'Textpad';
        this.icon = 'apps/text-editor.png';
        this.is_draggable = true;
        this.is_resizable = true;
        this.is_scrollable = false;
        this.is_sessionable = true;
        this.is_minimizable = true;
        this.is_maximizable = true;
        this.is_closable = true;
        this.is_orphan = false;
        this.width = 400;
        this.height = 400;
        this.gravity = null;

        WindowTitle = this.title;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        this.$element.find("textarea").val("");
        _update(null, el);
      },


      EventMenuOpen : function(el, ev) {
        var self = this;

        _open(function(fname) {
          _read_file(self.$element, fname);
        }, el);
      },


      EventMenuSave : function(el, ev) {
        var self = this;
        if ( argv && argv['path'] ) {
          _save(argv['path'], self.$element.find("textarea").val());
        }
      },


      EventMenuSaveAs : function(el, ev) {
        var self = this;
        _saveAs(function(file, mime) {
          _save(file, self.$element.find("textarea").val(), function() {
            _update(file, el);
          });
        });
      },


      EventMenuQuit : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_open").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem_save").click(function(ev) {
            self.EventMenuSave(this, ev);
          });

          el.find(".imagemenuitem_saveas").click(function(ev) {
            self.EventMenuSaveAs(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here

          this.focus_hook = function() {
            el.find("textarea").focus();
            _updateStatusbar(el);
          };

          _read_file(el, argv['path']);

          $(el).find("textarea").mousedown(function(ev) {
            _updateStatusbar(el);
            ev.stopPropagation();
          }).focus(function() {
            _updateStatusbar(el);
          }).keyup(function() {
            _updateStatusbar(el);
          });
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationTextpad = Application.extend({

      init : function() {
        this._super("ApplicationTextpad", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        root_window.show();

        this._super(root_window);

        // Do your stuff here
      }
    });

    return new __ApplicationTextpad();
  };
})($);
