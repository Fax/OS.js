/**
 * Application: Draw
 *
 * TODO: Waiting when loading images
 *
 * http://hacks.mozilla.org/2009/06/pushing-pixels-with-canvas/
 * http://beej.us/blog/2010/02/html5s-canvas-part-ii-pixel-manipulation/
 * https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationDraw = (function($, undefined) {


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

    onMouseDown : function(ev, doc, api) {
      var button    = (ev.which <= 1) ? 1 : 2;

      if ( this.type == "pencil" || this.type == "brush" ) {
        doc.context.beginPath();
        doc.context.moveTo(doc.draw_start[0], doc.draw_start[1]);

        if ( button == 2 ) {
          console.log('x');
          doc.context.strokeStyle = Style.fill.hex;
        }
      } else if ( this.type == "selection" ) {
        api.ui.rectangle.init(ev);
      }
    },

    onMouseUp : function(ev, doc, api) {
      var button    = (ev.which <= 1) ? 1 : 2;

      if ( this.type == "pick" ) {
        var startPosX = doc.draw_start[0];
        var startPosY = doc.draw_start[1];
        var color = doc.getPixelColor(startPosX, startPosY);

        if ( ev.which === 1 ) {
          Style.stroke = color;
          $(doc.root).find(".color_Foreground").css("background-color", "#" + Style.stroke.hex);
        } else {
          Style.fill = color;
          $(doc.root).find(".color_Background").css("background-color", "#" + Style.fill.hex);
        }
      } else if ( this.type == "pencil" || this.type == "brush" ) {
        if ( button == 2 ) {
          doc.context.strokeStyle = Style.stroke.hex;
        }
      }
    },

    onMouseMove : function(ev, doc, api) {
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

    onMouseClick : function(ev, doc, api) {
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

    init : function(el, api) {
      var self = this;

      this.loaded   = false;
      this.root     = el;
      this.canvaso  = el.find("canvas").get(0);
      this.contexto = this.canvaso.getContext('2d');
      this.canvas   = $(this.canvaso).parent().append("<canvas></canvas>").find("canvas").get(1);
      this.context  = this.canvas.getContext('2d'); // This layer gets drawn to 'context' on update

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
        self.onMouseMove(ev, api);
      };
      var _mouseup = function(ev) {
        $(self.canvas).unbind('mousemove', _mousemove);
        self.onMouseUp(ev, api);
      };
      var _mousedown = function(ev) {
        $(self.canvas).bind('mousemove', _mousemove);
        self.onMouseDown(ev, api);
      };


      $(self.canvas).bind('mousedown', _mousedown);
      $(document).bind('mouseup', _mouseup);

      $(this.canvas).bind("click", function(ev) {
        self.onMouseClick(ev, api);
      });
      $(this.canvas).bind("contextmenu",function(e) {
        return false;
      });

      this.setSize(this.image_width, this.image_height);
      this.setStyle();
      this.clear();

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
      };
      img.onerror = function() {
        c_error(src);
      };
      img.src = src;
    },

    redraw : function() {
     this.contexto.drawImage(this.canvas, 0, 0);
     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /* MOUSE EVENTS */

    onMouseDown : function(ev, api) {
      this.setStyle();

      if ( !this.draw_on ) {
        this.draw_on = true;
        this.draw_start = [mouseposX(ev), mouseposY(ev)];

        Tool.onMouseDown(ev, this, api);
      }

      ev.preventDefault();
    },

    onMouseMove : function(ev, api) {
      if ( this.draw_on ) {
        this.draw_current = [mouseposX(ev), mouseposY(ev)];

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        Tool.onMouseMove(ev, this, api);
      }
    },

    onMouseUp : function(ev, api) {
      if ( this.draw_on ) {
        Tool.onMouseUp(ev, this, api);

        this.redraw();

        this.draw_on = false;
      }

      ev.preventDefault();
    },

    onMouseClick : function(ev, api) {
      Tool.onMouseClick(ev, this, api);

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

  return function(Application, app, api, argv) {

    var _ApplicationDraw = Application.extend({
      init : function() {
        this._super("ApplicationDraw");
      },

      destroy : function() {
        DrawDocument.destroy();

        this._super();
      },

      run : function() {
        var el = app.$element;
        var self = this;


        //
        // Helpers
        //

        function _update(file) {
          app.opts     = file;
          argv['path'] = file;
          app.argv     = argv;

          $(el).find(".WindowTopInner span").html(app.title + ": " + (file || "New file"));
        }

        function _save(file, content, callback) {
          callback = callback || function() {};

          if ( typeof file == "string" && file ) {
            api.system.call("write", {'file' : file, 'content' : content, 'encoding' : 'data:image/png;base64'}, function(result, error) {
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
          }, ["image/*"], "save");
        }

        function _open(callback) {
          api.system.dialog_file(function(fname) {
            callback(fname);
          }, ["image/*"]);
        }

        //
        // UI items
        //

        // Tool buttons
        var tool = null;
        $(el).find(".ApplicationDrawPanel button").click(function() {
          if ( (tool) && (tool !== this) ) {
            $(tool).removeClass("Current");
          }

          tool = this;

          if ( tool ) {
            var name = $(tool).attr("class").replace("draw_", "").toLowerCase();

            Tool.type = name;
            $(tool).addClass("Current");

          }
        });
        $(el).find(".ApplicationDrawPanel button:first-child").click();

        // Foreground color selection
        $(el).find(".color_Foreground").click(function() {
          api.system.dialog_color(Style.stroke.hex, function(rgb, hex) {
            $(el).find(".color_Foreground").css("background-color", hex);
            Style.stroke = DrawColor(hex);
          });
        });

        // Background color selection
        $(el).find(".color_Background").click(function() {
          api.system.dialog_color(Style.fill.hex, function(rgb, hex) {
            $(el).find(".color_Background").css("background-color", hex);

            Style.fill = DrawColor(hex);
          });
        });

        // Tool props
        $(el).find(".select_LineCap").change(function() {
          Style.cap = $(el).find(".select_LineCap").val();
        });
        $(el).find(".select_LineJoin").change(function() {
          Style.join = $(el).find(".select_LineJoin").val();
        });
        $(el).find(".enable_Fill").click(function() {
          Tool.fill = this.checked ? true : false;
        });
        $(el).find(".enable_Stroke").click(function() {
          Tool.stroke = this.checked ? true : false;
        });


        // Tool thickness
        $(el).find(".slide_Thickness").slider({
          'min'    : 1,
          'max'    : 50,
          'value'  : 1,
          'step'   : 1,
          'change' : function() {
            Style.width = $(el).find(".slide_Thickness").slider("value");
          },
          'slide'  : function() {
            Style.width = $(el).find(".slide_Thickness").slider("value");
          }
        });

        //
        // Menu items
        //
        app.setMenuItemAction("File", "cmd_Open", function() {
          _open(function(fname) {
            DrawDocument.open("/media/" + fname);
            _update(fname);
          });
        });

        app.setMenuItemAction("File", "cmd_Save", function() {
          if ( argv && argv['path'] ) {
            _save(argv['path'], DrawDocument.getImage());
            _update(argv['path']);
          }
        });

        app.setMenuItemAction("File", "cmd_SaveAs", function() {
          _saveAs(function(file, mime) {
            _save(file, DrawDocument.getImage(), function() {
              _update(file);
            });
          });
        });

        app.setMenuItemAction("File", "cmd_New", function() {
          DrawDocument.clear();
          _update(null);
        });

        //
        // Initialization
        //

        Tool.fill    = $(el).find(".enable_Fill").get(0).checked ? true : false;
        Tool.stroke  = $(el).find(".enable_Stroke").get(0).checked ? true : false;

        Style.stroke = DrawColor($(el).find(".color_Foreground").css("background-color"));
        Style.fill   = DrawColor($(el).find(".color_Background").css("background-color"));
        Style.width  = $(el).find(".slide_Thickness").slider("value");
        Style.cap    = $(el).find(".select_LineCap").val();
        Style.join   = $(el).find(".select_LineJoin").val();

        DrawDocument.init(el, api);

        var fname = null;
        if ( argv['path'] ) {
          fname = argv['path'];
          DrawDocument.open("/media/" + fname, function() {
            _update(fname);
          });
        } else {
          _update(fname);
        }


      }
    });

    return new _ApplicationDraw();
  };
})($);
