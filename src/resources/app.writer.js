/*!
 * Application: ApplicationWriter
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationWriter = (function($, undefined) {
  "$:nomunge";

  var CURRENT_FONT  = "Arial";
  var CURRENT_COLOR = "#000000";
  var CURRENT_SIZE  = 12;

  function _getCharacterOffsetWithin(el) {
    return null;
  }

  function _setCaretCharIndex(el, index) {
    return null;
  }

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    /////////////////////////////////////////////////////////////////////////////////////
    // GLOBAL FUNCTIONS
    /////////////////////////////////////////////////////////////////////////////////////

    function _read_file(win,file) {
      var txt = win.$element.find(".textarea");
      if ( typeof file == "string" && file ) {
        API.system.call("read", file, function(result, error) {
          if ( error === null ) {
            txt.html(result);
            _update(file, win);
          } else {
            _update(null, win);
          }
        });
      } else {
        _update(null, win);
      }

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

    function _saveAs(win, callback) {
      win.app.createFileDialog(function(file, mime) {
        callback(file, mime);
      }, ["text/*"], "save");
    }

    function _open(win, callback, el) {
      win.app.createFileDialog(function(fname) {
        callback(fname);
      }, ["text/*"]);
    }

    function _update(file, win) {
      argv['path'] = file;

      win.setTitle(win._origtitle + ": " + (file || "New file"));
    }

    function _command(el, command, val) {
      console.group("ApplicationWriter::_command()");
      console.log("Element", el);
      console.log("Command", command);
      console.log("Argument", val);
      console.groupEnd();

      document.execCommand(command, false, val);
      $(el).focus();
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // WINDOWS
    /////////////////////////////////////////////////////////////////////////////////////

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationWriter window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_save\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_saveas\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <ul class=\"GtkToolbar toolpalette1\"> <li class=\"GtktoggledToolButton toggledtoolbutton1\"> <button> <img alt=\"gtk-bold\" src=\"/img/icons/16x16/actions/gtk-bold.png\"/> <span>Bold</span> </button> </li> <li class=\"GtktoggledToolButton toggledtoolbutton2\"> <button> <img alt=\"gtk-underline\" src=\"/img/icons/16x16/actions/gtk-underline.png\"/> <span>Underline</span> </button> </li> <li class=\"GtktoggledToolButton toggledtoolbutton3\"> <button> <img alt=\"gtk-italic\" src=\"/img/icons/16x16/actions/gtk-italic.png\"/> <span>Italic</span> </button> </li> <li class=\"GtktoggledToolButton toggledtoolbutton4\"> <button> <img alt=\"gtk-strikethrough\" src=\"/img/icons/16x16/actions/gtk-strikethrough.png\"/> <span>Strikethrough</span> </button> </li> <div class=\"GtkSeparatorToolItem separatortoolitem1\"></div> <li class=\"GtktoggledToolButton toggledtoolbutton5\"> <button> <img alt=\"format-justify-left\" src=\"/img/icons/16x16/actions/format-justify-left.png\"/> <span>Align Left</span> </button> </li> <li class=\"GtktoggledToolButton toggledtoolbutton6\"> <button> <img alt=\"format-justify-center\" src=\"/img/icons/16x16/actions/format-justify-center.png\"/> <span>Align Center</span> </button> </li> <li class=\"GtktoggledToolButton toggledtoolbutton7\"> <button> <img alt=\"format-justify-right\" src=\"/img/icons/16x16/actions/format-justify-right.png\"/> <span>Align Right</span> </button> </li> <div class=\"GtkSeparatorToolItem separatortoolitem2\"></div> <li class=\"GtkToolButton toolbutton1\"> <button> <img alt=\"gtk-select-font\" src=\"/img/icons/16x16/apps/fonts.png\"/> <span>Font Selection</span> </button> </li> <li class=\"GtkToolButton toolbutton2\"> <button> <img alt=\"gtk-select-color\" src=\"/img/icons/16x16/apps/preferences-desktop-theme.png\"/> <span>Color Selection</span> </button> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <textarea class=\"GtkTextView GtkObject textview1\"></textarea> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_3\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Writer';
        this._icon = 'apps/libreoffice34-writer.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 550;
        this._height = 400;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        this.$element.find(".textarea").html("");
        _update(null, this);
      },


      EventMenuOpen : function(el, ev) {
        var self = this;

        _open(this, function(fname) {
          _read_file(self, fname);
        }, el);
      },


      EventMenuSave : function(el, ev) {
        var self = this;
        if ( argv && argv['path'] ) {
          _save(argv['path'], self.$element.find(".textarea").html());
        }
      },


      EventMenuSaveAs : function(el, ev) {
        var self = this;
        _saveAs(self, function(file, mime) {
          _save(file, self.$element.find(".textarea").html(), function() {
            _update(file, self);
          });
        });
      },


      EventMenuQuit : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },


      EventClickBold : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "bold");
      },


      EventClickUnderline : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "underline");
      },


      EventClickItalic : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "italic");
      },


      EventClickStrikethrough : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "strikeThrough");
      },


      EventClickAlignLeft : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "justifyLeft");
      },


      EventClickAlignCenter : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "justifyCenter");
      },


      EventClickAlignRight : function(el, ev) {
        var self = this;
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }

        _command(this.$element.find(".textarea"), "justifyRight");
      },


      EventActivateFont : function(el, ev) {
        var self = this;

        var txt = self.$element.find(".textarea");
        //var pos = _getCharacterOffsetWithin(txt);

        this.app.createFontDialog(CURRENT_FONT, CURRENT_SIZE, function(font, size) {
          CURRENT_FONT = font;
          CURRENT_SIZE = size;

          //_setCaretCharIndex(el, pos);

          setTimeout(function() {
            _command(txt, "fontName", font);
            _command(txt, "fontSize", size);

            //_setCaretCharIndex(el, pos);
          }, 0);

        });
      },


      EventActivateColor : function(el, ev) {
        var self = this;

        var txt = self.$element.find(".textarea");
        //var pos = _getCharacterOffsetWithin(txt);

        this.app.createColorDialog(CURRENT_COLOR, function(rgb, hex) {
          CURRENT_COLOR = hex;

          //_setCaretCharIndex(el, pos);

          setTimeout(function() {
            console.log(hex, rgb);
            _command(txt, "foreColor", hex);

            //_setCaretCharIndex(el, pos);
          }, 0);

        });
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

          el.find(".toggledtoolbutton1").click(function(ev) {
            self.EventClickBold(this, ev);
          });

          el.find(".toggledtoolbutton2").click(function(ev) {
            self.EventClickUnderline(this, ev);
          });

          el.find(".toggledtoolbutton3").click(function(ev) {
            self.EventClickItalic(this, ev);
          });

          el.find(".toggledtoolbutton4").click(function(ev) {
            self.EventClickStrikethrough(this, ev);
          });

          el.find(".toggledtoolbutton5").click(function(ev) {
            self.EventClickAlignLeft(this, ev);
          });

          el.find(".toggledtoolbutton6").click(function(ev) {
            self.EventClickAlignCenter(this, ev);
          });

          el.find(".toggledtoolbutton7").click(function(ev) {
            self.EventclickAlignRight(this, ev);
          });

          el.find(".toolbutton1").click(function(ev) {
            self.EventActivateFont(this, ev);
          });

          el.find(".toolbutton2").click(function(ev) {
            self.EventActivateColor(this, ev);
          });

          // Do your stuff here
          el.find(".GtkToolbar span").hide();

          var p = el.find("textarea").parent();
          var area = $("<div class=\"textarea\"></div>");
          el.find("textarea").remove();
          p.append(area);

          area.get(0).contentEditable = "true";
          area.get(0).designMode      = "On";

          this._bind("focus", function() {
            el.find(".textarea").focus();
          });
          // Initialize richtext-editing
          _command(this.$element.find(".textarea"), "fontName", CURRENT_FONT);
          _command(this.$element.find(".textarea"), "foreColor", CURRENT_COLOR);

          _read_file(this, argv['path']);
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationWriter = Application.extend({

      init : function() {
        this._super("ApplicationWriter", argv);
        this._compability = ["richtext"];
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
      }
    });

    return new __ApplicationWriter();
  };
})($);
