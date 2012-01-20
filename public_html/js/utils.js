/**
 * Simple function to call constructor by apply
 *
 * @author Anonymous
 * @return Class/Function
 */
function construct(/*name, */constructor, args) {
  function F() {
    return constructor.apply(this, args);
  }
  F.prototype = constructor.prototype;
  return new F();
  /*
  this[name] = function() {
    return constructor.apply(this, args);
  };
  this[name].prototype = constructor.prototype;
  return new this[name]();
  */
}

/**
 * Simple JavaScript Inheritance
 * Inspired by base2 and Prototype
 *
 * @author John Resig http://ejohn.org/
 * @return Class
 */
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? (/\b_super\b/) : (/.*/);
  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();

/**
 * in_array() for Object/Array
 *
 * @version 1103.1210
 * @link    http://phpjs.org/functions/in_array
 * @author  Kevin van Zonneveld (http://kevin.vanzonneveld.net)
 * @author  vlado houba
 * @return  bool
 */
function in_array (needle, haystack, argStrict) {
    var key = '',
        strict = !! argStrict;

    if (strict) {
      for (key in haystack) {
        if (haystack[key] === needle) {
          return true;
        }
      }
    } else {
      for (key in haystack) {
        if (haystack[key] == needle) {
          return true;
        }
      }
    }
    return false;
}

/**
 * str_pad() for String
 *
 * @link   http://phpjs.org/functions/str_pad:525
 * @author Kevin van Zonneveld (http://kevin.vanzonneveld.net)
 * @return String
 */
function str_pad (input, pad_length, pad_string, pad_type) {
  var half = '',
      pad_to_go;

  var str_pad_repeater = function (s, len) {
    var collect = '',
        i;
    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);
    return collect;
  };

  input += '';
  pad_string = pad_string !== undefined ? pad_string : ' ';

  if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
    pad_type = 'STR_PAD_RIGHT';
  }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type == 'STR_PAD_LEFT') {
      input = str_pad_repeater(pad_string, pad_to_go) + input;
    } else if (pad_type == 'STR_PAD_RIGHT') {
      input = input + str_pad_repeater(pad_string, pad_to_go);
    } else if (pad_type == 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
      input = half + input + half;
      input = input.substr(0, pad_length);
    }
  }

  return input;
}


/**
 * sizeof() for Object/Array
 *
 * @author Anonymous
 * @return int
 */
function sizeof(foo) {
  if ( foo ) {
    if ( foo instanceof Object ) {
      var i = 0;
      for ( var x in foo ) {
        if ( foo.hasOwnProperty(x) ) {
          i++;
        }
      }
      return i;
    }
    return foo.length ? foo.length : 0;
  }
  return 0;
}

/**
 * foreach() for Object/Array
 *
 * @author Anonymous
 * @return void
 */
function forEach(self, callback) {
  var s = sizeof(self) - 1;
  var i = 0;
  for ( var x in self ) {
    if ( self.hasOwnProperty(x) ) {
      if ( callback(x, self[x], i, s) === false ) {
        break;
      }

      i++;
    }
  }
}

/**
 * Serialize an object
 * For jQuery
 *
 * @author Anonymous
 * @return Object
 */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/**
 * Get carret position inside a textarea
 *
 * @author Anonymous
 * @return int
 */
function getCaret(el) { 
  if (el.selectionStart) { 
    return el.selectionStart; 
  } else if (document.selection) { 
    el.focus(); 

    var r = document.selection.createRange(); 
    if (r === null) { 
      return 0; 
    } 

    var re = el.createTextRange(), 
        rc = re.duplicate(); 
    re.moveToBookmark(r.getBookmark()); 
    rc.setEndPoint('EndToStart', re); 

    return rc.text.length; 
  }  
  return 0; 
}

/**
 * Get the input selection of a textarea
 *
 * @author Anonymous
 * @return {start, end}
 */
function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

/**
 * Set area of text selection in textarea
 *
 * @author Anonymous
 * @return void
 */
function setSelectionRangeX(input, selectionStart, selectionEnd) {
   // IE
   if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    // real browsers :)
    } else if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    }
}

/**
 * Capitalize first letter
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return String
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Convert to RGB from HEX
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return {red, green, blue}
 */
function RGBFromHex(hex) {
  var rgb = parseInt(hex.replace("#", ""), 16);
  return {
    red   : (rgb & (255 << 16)) >> 16,
    green : (rgb & (255 << 8)) >> 8,
    blue  : (rgb & 255)
  };
}

/**
 * Convert HEX from RGB
 *
 * @author Anonymous
 * @return String
 */
function hexFromRGB(r, g, b) {
  var hex = [
    (r).toString( 16 ),
    (g).toString( 16 ),
    (b).toString( 16 )
  ];

  $.each( hex, function( nr, val ) {
    if ( val.length === 1 ) {
      hex[ nr ] = "0" + val;
    }
  });

  return hex.join( "" ).toUpperCase();
}

/**
 * Convert array from RGB (string)
 *
 * @author Anonymous
 * @return String
 */
function IntFromRGBstr(str) {
  var spl = str.replace(/^rgba?\(/, "").replace(/\,|\)/g, "").replace(/\s+/g, " ").split(" ");
  return {
    red   : parseInt(spl[0], 10),
    green : parseInt(spl[1], 10),
    blue  : parseInt(spl[2], 10)
  }
}

/**
 * Convert timezone
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return Date
 */
function TimezoneOffset(off) {
  var now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (off * 3600000));
}

/**
 * Get textarea coordinates
 *
 * A slow, but accurate method for finding caret position
 * with actual line/row index for dynamic textareas.
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return {x,y, lines}
 */
function getTextareaCoordinates(txt) {
  var val    = txt.val() || "";
  var len    = val.length;
  var row    = 0;
  var col    = 0;
  var lcount = 0;

  if ( len ) {
    var cpos  = getCaret(txt.get(0));                  // Caret pos
    var lines = val.split("\n");                       // All lines
    var back  = cpos > 0 ? val.substr(0, cpos) : "";   // ... Get text behind caret
    row       = back.split("\n").length;               // ... Calculate row based on previous newlines
    lcount    = lines.length;                          // Total line count

    // Now calculate column. Loop through rows behind caret and count chars
    var ccpos = 0;
    for ( var i = 0; i < row - 1; i++ ) {
      ccpos += lines[i].length;
    }
    col = Math.abs(ccpos - cpos) - (row - 1);
  }

  return {'x' : col, 'y' : row, 'lines' : lcount, 'length' : len};
}

/**
 * Get the directory name of a path
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return String
 */
function dirname(dir) {
  if ( dir ) {
    var tmp = dir.split("/");
    if ( tmp.length > 1 ) {
      tmp.pop();
    }
    return tmp.join("/");
  }

  return val;
}

/**
 * Get the filename name of a path
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return String
 */
function basename(dir) {
  var expl = dir.split("/");
  return expl.length ? (expl[expl.length - 1]) : null;
}

/**
 * Check for mobile support
 * @return Object
 */
function MobileSupport() {
  var ua = navigator.userAgent;
  return {
    iphone: ua.match(/(iPhone|iPod|iPad)/),
    blackberry: ua.match(/BlackBerry/),
    android: ua.match(/Android/)
  };
}

/**
 * Build absolute path
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return String
 */
function get_path(path) {
  var abs = [];

  if ( path != "/" ) {
    var parts = path.split("/");
    var part;
    for ( var i = 0; i < parts.length; i++ ) {
      part = parts[i];
      if ( part == "." ) {
        continue;
      } else if ( part == ".." ) {
        if ( abs.length ) {
          abs.pop();
        }
      } else {
        abs.push(part);
      }
    }
  }

  return ("/" + (abs.length ? abs.join("/") : "/")).replace(/\/\//g, '/');
}


/**
 * HTML5 Canvas Helper library
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var CanvasHelper = Class.extend({

  init : function(container, w, h) {
    this.$container = container;
    this.$canvas    = document.createElement("canvas");
    this.$context   = null;
    this.width      = w;
    this.height     = h;

    if ( this.$container && this.$canvas ) {
      this.$container.appendChild(this.$canvas);

      this.$container.style.width  = this.width + "px";
      this.$container.style.height = this.height + "px";
      this.$canvas.width           = this.width;
      this.$canvas.height          = this.height;

      if ( this.$canvas.getContext ) {
        this.$context              = this.$canvas.getContext("2d");
        this.$context.fillStyle    = "#000000";
        this.$context.strokeStyle  = "#ffffff";
        this.$context.lineWidth    = 1;
        this.$context.font         = "20px Times New Roman";

        return;
      }
    }

    throw ("Canvas is not supported in your browser");
  },

  destroy : function() {

  },

  clear : function(fill) {
    if ( this.$context ) {
      this.$context.clearRect(0, 0, this.width, this.height);

      if ( fill ) {
        this.rect(0, 0, this.width, this.height, fill);
      }
    }
  },

  rect : function(x, y, w, h, fill, stroke) {
    if ( this.$context ) {
      this._fill(fill);

      this.$context.beginPath();
      this.$context.rect(x, y, w, h);
      this.$context.closePath();

      this._apply(fill, stroke);
    }
  },

  roundRect : function(x, y, w, h, radius, fill, stroke) {
    radius = (radius === undefined) ? 5 : radius;

    if ( this.$context ) {
      this.$context.beginPath();
      this.$context.moveTo(x + radius, y);
      this.$context.lineTo(x + w - radius, y);
      this.$context.quadraticCurveTo(x + w, y, x + w, y + radius);
      this.$context.lineTo(x + w, y + h - radius);
      this.$context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      this.$context.lineTo(x + radius, y + h);
      this.$context.quadraticCurveTo(x, y + h, x, y + h - radius);
      this.$context.lineTo(x, y + radius);
      this.$context.quadraticCurveTo(x, y, x + radius, y);
      this.$context.closePath();

      this._apply(fill, stroke);
    }
  },

  circle : function(x, y, r, fill, stroke) {
    if ( this.$context ) {
      this.$context.beginPath();
      this.$context.arc(x, y, r, 0, Math.PI*2, true);
      this.$context.closePath();

      this._apply(fill, stroke);
    }
  },

  text : function(txt, x, y) {
    if ( this.$context ) {
      this.$context.fillText(txt, x, y);
    }
  },

  createLinearGradient : function(sx, sy, dx, dy, steps) {
    var gra = null;
    if ( this.$context ) {
      gra = this.$context.createLinearGradient(sx, sy, dx, dy);
      if ( steps instanceof Object ) {
        for ( var s in steps ) {
          if ( steps.hasOwnProperty(s) ) {
            gra.addColorStop(s, steps[s]);
          }
        }
      }
    }
    return gra;
  },

  _fill : function(fill) {
    if ( fill && fill !== true ) {
      this.$context.fillStyle = fill;
    }
  },

  _apply : function(fill, stroke) {
    stroke = (stroke === undefined) ? false : stroke;

    if (stroke) {
      if ( stroke !== true ) {
        this.$context.strokeStyle = stroke;
      }
      this.$context.stroke();
    }
    if (fill) {
      this.$context.fill();
    }
  }

});

function sizeof(o) {
  var x = 0;
  if ( o instanceof Object ) {
    for ( var i in o ) {
      if ( o.hasOwnProperty(i) ) {
        x++;
      }
    }
  } else if ( o instanceof Array ) {
    x = o.length;
  } else {
    x = -1;
  }

  return x;
}

