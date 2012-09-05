/*!
 * OS.js - JavaScript Operating System - Utils File
 *
 * Contains custom written functions, and others found on PHP.net
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package OSjs.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

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
    var collect = '';
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
  };
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
    return tmp.join("/") || "/";
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
  if ( dir && dir.split ) {
    var expl = dir.split("/");
    return expl.length ? (expl[expl.length - 1]) : null;
  }

  return dir;
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
 * Format date like PHP
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return String
 */
function format_date(str, now) {
  if ( str ) {
    now = (now || new Date());
    var rep = {
      "%y" : "getYear",
      "%Y" : "getFullYear",
      "%m" : "getMonth",
      "%d" : "getDate",
      "%H" : "getHours",
      "%i" : "getMinutes",
      "%s" : "getSeconds"
    };

    for ( var i in rep ) {
      if ( rep.hasOwnProperty(i) ) {
        val = parseInt(now[rep[i]](), 10);
        if ( rep[i] == "getMonth" ) {
          val++;
        }
        str = str.replace(i, (val < 10 ? '0' + val : val));
      }
    }
  }

  return str;
}

/**
 * Recursivly merge an Object
 * @author  Sorry...
 * @return  Object
 */
function MergeRecursive(o1, o2) {
  for ( var p in o2 ) {
    try {
      if ( o2[p].constructor == Object ) {
        o1[p] = MergeRecursive(o1[p], o2[p]);
      } else {
        o1[p] = o2[p];
      }
    } catch(e) {
      o1[p] = o2[p];
    }
  }

  return o1;
}

/**
 * Get a cookie by name
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @return Mixed
 */
function GetCookie(name) {
  var cookies = (document.cookie || "").split(";");
  var i = 0, l = cookies.length, c;
  for ( i; i < l; i++ ) {
    c = cookies[i].replace(/^\s+|\s|\s$/g, "").split("=");
    if ( (c.shift()) == name ) {
      return c.join(" ");
    }
  }

  return null;
}


/**
 * Enter fullscreen mode if browser supports
 * @link    http://updates.html5rocks.com/tag/code
 * @return  void
 */
function FullscreenEnter() {
  var del = document.documentElement;
  var isf = (del.fullScreenElement && del.fullScreenElement !== null) || (!del.mozFullScreen && !del.webkitIsFullScreen);
  console.log("utils.js::FullscreenEnter()", del, isf);

  if ( isf ) {
    if ( del.requestFullScreen )
      del.requestFullScreen();
    else if ( del.mozRequestFullScreen )
      del.mozRequestFullScreen();
    else if ( del.webkitRequestFullScreen )
      del.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

/**
 * Exit fullscreen mode if browser supports
 * @link    http://updates.html5rocks.com/tag/code
 * @return  void
 */
function FullscreenExit() {
  var del = document.documentElement;
  var isf = (del.fullScreenElement && del.fullScreenElement !== null) || (!del.mozFullScreen && !del.webkitIsFullScreen);
  console.log("utils.js::FullscreenExit()", del, !isf);

  if ( !isf ) {
    if ( document.cancelFullScreen )
      document.cancelFullScreen();
    else if ( document.mozCancelFullScreen )
      document.mozCancelFullScreen();
    else if ( document.webkitCancelFullScreen )
      document.webkitCancelFullScreen();
  }
}

/**
 * Sort object by key
 * @link http://stackoverflow.com/questions/1359761/sorting-a-javascript-object
 * @return Object
 */
function sortObject(o) {
  var sorted = {},
      key, a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}


/**
 * escapeHtml() -- Like PHPs htmlspecialchars()
 * @return  String
 */
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * checkMIME() -- Check if given mime type is valid
 * @return  bool
 */
function checkMIME(needle, haystack) {
  var i = 0, l = haystack.length, x;
  for ( i; i < l; i++ ) {
    x = haystack[i];
    if ( x.match(/\/\*/) ) {
      if ( needle.split("/")[0] == x.split("/")[0] ) {
        return true;
      }
    } else {
      if ( needle == x )
        return true;
    }
  }
  return false;
}
