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
 * sizeof() for Object/Array
 *
 * @return int
 */
function sizeof(foo) {
  if ( foo instanceof Object ) {
    var i = 0;
    for ( var x in foo ) {
      if ( foo.hasOwnProperty(x) ) {
        i++;
      }
    }
    return i;
  }
  return foo.length;
}

/**
 * foreach() for Object/Array
 *
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
 * Check if browser supports localStorage
 *
 * @return bool
 */
function supports_html5_storage() {
  return ('localStorage' in window) && window['localStorage'] !== null;
}
