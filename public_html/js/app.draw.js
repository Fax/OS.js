/**
 * Application: ApplicationDraw
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationDraw = (function($, undefined) {
  return function(Application, app, API, argv) {
    var _ApplicationDraw = Application.extend({


      // !!! DO NOT TOUCH

      init : function() {
        this._super("ApplicationDraw");
      },

      destroy : function() {
        this._super();
      },


      EventToggleStroke : function(el, ev) {
      },


      EventToggleFill : function(el, ev) {
      },


      EventChangeBackground : function(el, ev) {
      },


      EventChangeForeground : function(el, ev) {
      },



      run : function() {
        var el = app.$element;
        var self = this;


        el.find(".toolbutton_stroke").click(function(ev) {
          self.EventToggleStroke(this, ev);
        });

        el.find(".toolbutton_fill").click(function(ev) {
          self.EventToggleFill(this, ev);
        });

        el.find(".colorbutton_background").click(function(ev) {
          self.EventChangeBackground(this, ev);
        });

        el.find(".colorbutton_foreground").click(function(ev) {
          self.EventChangeForeground(this, ev);
        });


        this._super(el);
      }
    });

    // !!! READ-ONLY

    var Icons = {
      "selection"  : "/img/app.draw/icons/stock-selection-16.png",
      "pencil"     : "/img/app.draw/icons/stock-tool-pencil-16.png",
      "line"       : "/img/app.draw/icons/stock-tool-path-16.png",
      "square"     : "/img/app.draw/icons/stock-shape-square-16.png",
      "rectangle"  : "/img/app.draw/icons/stock-shape-rectangle-16.png",
      "circle"     : "/img/app.draw/icons/stock-shape-circle-16.png",
      "ellipse"    : "/img/app.draw/icons/stock-shape-ellipse-16.png",
      "fill"       : "/img/app.draw/icons/stock-tool-bucket-fill-16.png",
      "pick"       : "/img/app.draw/icons/stock-color-pick-from-screen-16.png"
    };

    // Get the mouse position relative to the canvas element.
    function mouseposX(ev) {
      var x;
      if (ev.layerX || ev.layerX === 0) { // Firefox
        x = ev.layerX;
      } else if (ev.offsetX || ev.offsetX === 0) { // Opera
        x = ev.offsetX;
      }
      return x;
    }

    // Get the mouse position relative to the canvas element.
    function mouseposY(ev) {
      var y;
      if (ev.layerX || ev.layerX === 0) { // Firefox
        y = ev.layerY;
      } else if (ev.offsetX || ev.offsetX === 0) { // Opera
        y = ev.offsetY;
      }
      return y;
    }

    /**
     * Color
     * @class
     */
    var DrawColor = function() {
      var red   = 0,
          green = 0,
          blue  = 0,
          alpha = 100,
          hex   = "#000000";


      if ( arguments.length == 1 ) {
        hex = arguments[0];

        if ( hex.match(/^rgba?/) ) {
          //var parts = hex.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
          var parts = hex.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          delete (parts[0]);
          for (var i = 1; i <= 3; ++i) {
            parts[i] = parseInt(parts[i], 10).toString(16);
            if (parts[i].length == 1) parts[i] = '0' + parts[i];
          }
          hex = parts.join('');
        }

        var rgb = parseInt(hex.replace("#", ""), 16);

        red   = (rgb & (255 << 16)) >> 16;
        green = (rgb & (255 << 8)) >> 8;
        blue  = (rgb & 255);
      } else {
        red   = arguments[0] || 0;
        green = arguments[1] || 0;
        blue  = arguments[2] || 0;
        alpha = arguments[3] || 0;

        hex   = hexFromRGB(red, green, blue);
      }

      return {
        hex : hex,
        r   : red,
        g   : green,
        b   : blue,
        a   : alpha
      };
    };

    /**
     * Tool Style
     * @class
     */
    var Style = function() {
      return {
        stroke : DrawColor("#000000"),
        fill   : DrawColor("#ffffff"),
        width  : 1,
        cap    : "butt",
        join   : "milter"
      };
    };

    /**
     * Tool
     * @class
     */
    var Tool = {

      type   : 'pencil',
      fill   : true,
      stroke : true,

      onMouseDown : function(ev, doc) {
        var button    = (ev.which <= 1) ? 1 : 2;

        if ( this.type == "pencil" || this.type == "brush" ) {
          doc.context.beginPath();
          doc.context.moveTo(doc.draw_start[0], doc.draw_start[1]);

          if ( button == 2 ) {
            doc.context.strokeStyle = Style.fill.hex;
          }
        } else if ( this.type == "selection" ) {
          API.ui.rectangle.init(ev);
        }
      },

      onMouseUp : function(ev, doc) {
        var button    = (ev.which <= 1) ? 1 : 2;

        if ( this.type == "pick" ) {
          var startPosX = doc.draw_start[0];
          var startPosY = doc.draw_start[1];
          var color = doc.getPixelColor(startPosX, startPosY);

          if ( ev.which === 1 ) {
            Style.stroke = color;
            $(doc.root).find(".colorbutton_foreground").css("background-color", "#" + Style.stroke.hex);
          } else {
            Style.fill = color;
            $(doc.root).find(".colorbutton_background").css("background-color", "#" + Style.fill.hex);
          }
        } else if ( this.type == "pencil" || this.type == "brush" ) {
          if ( button == 2 ) {
            doc.context.strokeStyle = Style.stroke.hex;
          }
        }
      },

      onMouseMove : function(ev, doc) {
        var startPosX = doc.draw_start[0];
        var startPosY = doc.draw_start[1];
        var mX        = doc.draw_current[0];
        var mY        = doc.draw_current[1];

        var posX, posY;
        var x, y, w, h, r;

        if ( this.tool == "selection" ) {
          return;
        } else if ( this.type == "pencil" || this.type == "brush" ) {
          doc.context.lineTo(doc.draw_current[0], doc.draw_current[1]);
          doc.context.stroke();
        } else if ( this.type == "line" ) {
          doc.context.beginPath();
          doc.context.moveTo(doc.draw_start[0], doc.draw_start[1]);
          doc.context.lineTo(doc.draw_current[0], doc.draw_current[1]);
          doc.context.stroke();
          doc.context.closePath();
        } else if ( this.type == "rectangle" ) {
          x = Math.min(doc.draw_current[0], doc.draw_start[0]);
          y = Math.min(doc.draw_current[1], doc.draw_start[1]);
          w = Math.abs(doc.draw_current[0] - doc.draw_start[0]);
          h = Math.abs(doc.draw_current[1] - doc.draw_start[1]);

          if (!w || !h) {
            return;
          }

          if ( Tool.stroke ) {
            doc.context.strokeRect(x, y, w, h);
          }
          if ( Tool.fill ) {
            doc.context.fillRect(x, y, w, h);
          }
        } else if ( this.type == "square" ) {

            posX = Math.round(startPosX - mX);
            posY = Math.round(startPosY - mY);
            var or = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2));
            r = or;

            if ( mX < startPosX || mY < startPosY )
              r = -r;

            mX = startPosX + r;
            mY = startPosX + r;

            x = Math.min(mX, startPosX);
            y = Math.min(mY, startPosY);
            w = or;
            h = or;

            if (!w || !h) {
              return;
            }

            if ( Tool.stroke ) {
              doc.context.strokeRect(x, y, w, h);
            }
            if ( Tool.fill ) {
              doc.context.fillRect(x, y, w, h);
            }

        } else if ( this.type == "ellipse" ) {

          var width = Math.abs(startPosX - doc.draw_current[0]);
          var height = Math.abs(startPosY - doc.draw_current[1]);

          if ( width > 0 && height > 0 ) {
            doc.context.beginPath();

            doc.context.moveTo(doc.draw_start[0], doc.draw_start[1] - height*2); // A1

            doc.context.bezierCurveTo(
              startPosX + width*2, startPosY - height*2, // C1
              startPosX + width*2, startPosY + height*2, // C2
              startPosX, startPosY + height*2); // A2

            doc.context.bezierCurveTo(
              startPosX - width*2, startPosY + height*2, // C3
              startPosX - width*2, startPosY - height*2, // C4
              startPosX, startPosY - height*2); // A1

            doc.context.closePath();

            if ( Tool.stroke ) {
              doc.context.stroke();
            }

            if ( Tool.fill ) {
              doc.context.fill();
            }
          }
        } else if ( this.type == "circle" ) {
          posX = Math.abs(doc.draw_start[0] - doc.draw_current[0]);
          posY = Math.abs(doc.draw_start[1] - doc.draw_current[1]);
          r = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2));

          if ( r > 0 ) {
            doc.context.beginPath();
            doc.context.arc(doc.draw_start[0],doc.draw_start[1],r,0,Math.PI*2,true);
            doc.context.closePath();

            if ( Tool.stroke ) {
              doc.context.stroke();
            }
            if ( Tool.fill ) {
              doc.context.fill();
            }
          }
        }
      },

      onMouseClick : function(ev, doc) {
        if ( this.type == "fill" ) {
          doc.context.fillRect(0, 0, doc.canvas.width, doc.canvas.height);
          doc.redraw();
        }
      }
    };

    /**
     * @document
     */
    var DrawDocument = {

      init : function(el) {
        var self = this;

        this.loaded   = false;
        this.root     = el;
        this.canvaso  = el.find("canvas").get(0);
        this.contexto = this.canvaso.getContext('2d');
        this.canvas   = $(this.canvaso).parent().append("<canvas></canvas>").find("canvas").get(1);
        this.context  = this.canvas.getContext('2d'); // This layer gets drawn to 'context' on update
        this.loader   = el.find(".ApplicationDrawLoading");

        this.draw_on      = false;
        this.draw_start   = null;
        this.draw_current = null;
        this.image_width  = -1;
        this.image_height = -1;

        $(this.canvas).css({
          "position" : "absolute",
          "top"      : "0px",
          "left"     : "0px"
        });

        var _mousemove = function(ev) {
          self.onMouseMove(ev);
        };
        var _mouseup = function(ev) {
          $(self.canvas).unbind('mousemove', _mousemove);
          self.onMouseUp(ev);
        };
        var _mousedown = function(ev) {
          $(self.canvas).bind('mousemove', _mousemove);
          self.onMouseDown(ev);
        };


        $(self.canvas).bind('mousedown', _mousedown);
        $(document).bind('mouseup', _mouseup);

        $(this.canvas).bind("click", function(ev) {
          self.onMouseClick(ev);
        });
        $(this.canvas).bind("contextmenu",function(e) {
          return false;
        });

        this.setSize(this.image_width, this.image_height);
        this.setStyle();
        this.clear();

        this.loader.hide();

        this.loaded = true;
      },

      destroy : function() {

      },

      clear : function() {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.contexto.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.image_width  = 640;
        this.image_height = 480;
        this.setSize(this.image_width, this.image_height);
      },

      open : function(src, c_success, c_error) {
        this.clear();

        c_success = c_success || function() {};
        c_error   = c_error   || function() {};

        var self = this;
        var img = new Image();

        API.ui.cursor("wait");
        this.loader.show();

        img.onload = function() {
          self.canvas.width   = img.width;
          self.canvas.height  = img.height;
          self.canvaso.width  = img.width;
          self.canvaso.height = img.height;
          self.image_width    = img.width;
          self.image_height   = img.height;

          self.context.drawImage(img, 0, 0, self.canvas.width, self.canvas.height);
          self.redraw();

          c_success(src);

          API.ui.cursor("default");
          self.loader.hide();
        };
        img.onerror = function() {
          c_error(src);

          API.ui.cursor("default");
          self.loader.hide();
        };
        img.src = src;
      },

      redraw : function() {
       this.contexto.drawImage(this.canvas, 0, 0);
       this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },

      /* MOUSE EVENTS */

      onMouseDown : function(ev) {
        this.setStyle();

        if ( !this.draw_on ) {
          this.draw_on = true;
          this.draw_start = [mouseposX(ev), mouseposY(ev)];

          Tool.onMouseDown(ev, this);
        }

        ev.preventDefault();
      },

      onMouseMove : function(ev) {
        if ( this.draw_on ) {
          this.draw_current = [mouseposX(ev), mouseposY(ev)];

          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

          Tool.onMouseMove(ev, this);
        }
      },

      onMouseUp : function(ev) {
        if ( this.draw_on ) {
          Tool.onMouseUp(ev, this);

          this.redraw();

          this.draw_on = false;
        }

        ev.preventDefault();
      },

      onMouseClick : function(ev) {
        Tool.onMouseClick(ev, this);

        ev.preventDefault();
      },

      /* GETTERS */

      getImage : function(type) {
        type = type || "image/png";
        return this.canvaso.toDataURL(type);
      },

      getPixelIndex : function(x, y) {
        var imageData = this.contexto.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        return ((x + y * this.canvas.width) * 4);
      },

      getPixelColor : function(x, y) {
        var imageData = this.contexto.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        var index = ((x + y * this.canvas.width) * 4);

        return DrawColor(imageData[index + 0], imageData[index + 1], imageData[index + 2], imageData[index + 3]);
      },

      /* SETTERS */

      setStyle : function() {
        this.context.strokeStyle = Style.stroke.hex;
        this.context.fillStyle   = Style.fill.hex;
        this.context.lineWidth   = Style.width;
        this.context.lineCap     = Style.cap;
        this.context.lineJoin    = Style.join;

        if ( Style.pattern ) {
          var self = this;
          var img = new Image();
          img.onload = function() {
            self.context.strokeStyle = self.context.createPattern(img, 'repeat');
          };
          img.src = Style.pattern;
        }

      },

      setPixel : function(x, y, a) {

      },

      setSize : function(w, h) {
        var oldImage;
        if ( this.loaded ) {
          oldImage = this.getImage();
        }

        this.canvas.width        = w || $(this.root).find(".WindowContent").width();
        this.canvas.height       = h || $(this.root).find(".WindowContent").height();
        this.canvaso.width       = this.canvas.width;
        this.canvaso.height      = this.canvas.height;

        if ( oldImage ) {
          var self = this;
          var img  = new Image();
          img.onload = function() {
            self.contexto.drawImage(img, 0, 0);
          };
          img.src = oldImage;
        }
      }

    };

    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationDraw = _ApplicationDraw.extend({

      init : function() {
        this._super();
      },

      destroy : function() {
        DrawDocument.destroy();

        this._super();
      },


      EventChangeBackground : function(el, ev) {
        API.system.dialog_color(Style.fill.hex, function(rgb, hex) {
          $(el).css("background-color", hex);

          Style.fill = DrawColor(hex);
        });
      },


      EventChangeForeground : function(el, ev) {
        API.system.dialog_color(Style.stroke.hex, function(rgb, hex) {
          $(el).css("background-color", hex);
          Style.stroke = DrawColor(hex);
        });
      },

      EventToggleStroke : function(el, ev) {
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }
        Tool.stroke = checked ? true : false;
      },


      EventToggleFill : function(el, ev) {
        var checked = true;
        if ( !$(el).hasClass("Checked") ) {
          checked = false;
        }
        Tool.fill = checked ? true : false;
      },

      run : function() {
        var el = app.$element;
        var self = this;

        this._super();

        //
        // Helpers
        //

        function _update(file) {
          app.opts     = file;
          argv['path'] = file;
          app.argv     = argv;

          $(el).find(".WindowTopInner span").html(app.title + ": " + (file || " file"));
        }

        function _save(file, content, callback) {
          callback = callback || function() {};

          if ( typeof file == "string" && file ) {
            API.system.call("write", {'file' : file, 'content' : content, 'encoding' : 'data:image/png;base64'}, function(result, error) {
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
          }, ["image/*"], "save");
        }

        function _open(callback) {
          API.system.dialog_file(function(fname) {
            callback(fname);
          }, ["image/*"]);
        }

        //
        // UI items
        //

        // Tool buttons
        $(el).find(".toolpalette1 .GtkToolItemGroup").each(function() {
          var name = $(this).attr("class");
          var namem = name.match(/toolitemgroup\_(.*)/);
          if ( namem.length > 1 ) {
            name = namem[1].replace("select_", "");
          }

          var img = sprintf('<img alt="" src="%s" />', Icons[name]);
          $(this).html(img);

          $(this).click(function() {
            Tool.type = name;
          });

        });

        $(el).find(".GtkToolItemGroup").first().click();

        // Tool props
        $(el).find(".combobox_linecap").change(function() {
          Style.cap = $(el).find(".combobox_linecap").val();
        });
        $(el).find(".combobox_linejoin").change(function() {
          Style.join = $(el).find(".combobox_linejoin").val();
        });

        // Tool thickness
        $(el).find(".scale1").slider({
          'min'    : 1,
          'max'    : 50,
          'value'  : 1,
          'step'   : 1,
          'change' : function() {
            Style.width = $(el).find(".scale1").slider("value");
          },
          'slide'  : function() {
            Style.width = $(el).find(".scale1").slider("value");
          }
        });

        //
        // Menu items
        //
        el.find(".imagemenuitem2").click(function() {
          _open(function(fname) {
            DrawDocument.open("/media/" + fname);
            _update(fname);
          }, null);
        });

        el.find(".imagemenuitem3").click(function() {
          if ( argv && argv['path'] ) {
            _save(argv['path'], DrawDocument.getImage());
            _update(argv['path']);
          }
        });

        el.find(".imagemenuitem4").click(function() {
          _saveAs(function(file, mime) {
            _save(file, DrawDocument.getImage(), function() {
              _update(file);
            });
          });
        });

        el.find(".imagemenuitem1").click(function() {
          DrawDocument.clear();
          _update(null);
        });

        el.find(".imagemenuitem5").click(function() {
          el.find(".ActionClose").click();
        });

        //
        // Initialization
        //

        Tool.fill    = $(el).find(".toolbutton_fill").hasClass("Checked");
        Tool.stroke  = $(el).find(".toolbutton_stroke").hasClass("Checked");

        Style.stroke = DrawColor($(el).find(".colorbutton_foreground").css("background-color"));
        Style.fill   = DrawColor($(el).find(".colorbutton_background").css("background-color"));
        Style.width  = $(el).find(".scale1").slider("value");
        Style.cap    = $(el).find(".combobox_linecap").val();
        Style.join   = $(el).find(".combobox_linejoin").val();

        DrawDocument.init(el);

        var fname = null;
        if ( argv['path'] ) {
          fname = argv['path'];
          DrawDocument.open("/media/" + fname, function() {
            _update(fname);
          }, null);
        } else {
          _update(fname);
        }

      }
    });

    return new __ApplicationDraw();
  };
})($);
