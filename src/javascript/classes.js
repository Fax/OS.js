/*!
 * OS.js - JavaScript Operating System - Shared Public Classes
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
 * @package OSjs.Core.Classes
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
(function($, undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // EXCEPTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OSjsException -- Base Exception
   * @class
   */
  var OSjsException = Class.extend({
    _lineno   : 0,
    _filename : "",
    _message  : "",
    _stack    : "",

    /**
     * OSjsException::init() -- Constructor
     * @constructor
     */
    init : function(exception, message, stack) {
      this._message   = message;
      this._lineno    = exception.lineNumber || exception.number || -1;
      this._filename  = exception.fileName || "unknown";
      this._stack     = stack || (exception.stack || exception.description || "untraceable");
    },

    /**
     * OSjsException::toString() -- Convert to string
     * @return String
     */
    toString : function() {
      return this._message;
    },

    /**
     * OSjsException::getLineNo() -- Get Exception Line Number
     * @return Mixed
     */
    getLineNo : function() {
      return this._lineno;
    },

    /**
     * OSjsException::getFilename() -- Get File Name
     * @return Mixed
     */
    getFilename : function() {
      return this._filename;
    },

    /**
     * OSjsException::getMessage() -- Get Exception Message / Stack
     * @return Mixed
     */
    getMessage : function() {
      return this._message;
    },

    /**
     * OSjsException::getStack() -- Get the Exception stack
     * @return String
     */
    getStack : function() {
      return this._stack;
    }
  });

  /**
   * AJAXException -- AJAXException Exception
   * @exception
   */
  OSjs.Classes.AJAXException = OSjsException.extend({
    init : function(instance, message, exception, stack) {
      this._super(exception, message, stack);
    }
  });

  /**
   * IOException -- IOException Exception
   * @exception
   */
  OSjs.Classes.IOException = OSjsException.extend({
    init : function(instance, message, exception, stack) {
      this._super(exception, message, stack);
    }
  });

  /**
   * ProcessException -- ProcessException Exception
   * @exception
   */
  OSjs.Classes.ProcessException = OSjsException.extend({
    init : function(instance, error, exception) {
      var message = error + "\n" + exception;
      this._super(exception, message);
      this._proc_name = instance._proc_name;
    },

    getProcessName : function() {
      return this._proc_name;
    }
  });

  /**
   * ApplicationException -- ApplicationException Exception
   * @exception
   */
  OSjs.Classes.ApplicationException = OSjsException.extend({
    init : function(instance, message, stack, exception) {
      this._super(exception, message, stack);
    }
  });

  /**
   * CoreException -- CoreException Exception
   * @exception
   */
  OSjs.Classes.CoreException = OSjsException.extend({
    init : function(instance, message, exception, stack) {
      this._super(exception, message, stack);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // FILESYSTEM
  /////////////////////////////////////////////////////////////////////////////

  /**
   * VFS -- VFS Storage
   * @class
   */
  var VFS = Class.extend({

    _fs     : null,     //!< FileSystem reference object
    _quota  : -1,       //!< FileSystem Quota size in bytes

    /**
     * VFS::init() -- Constructor
     * @param   Function    callback      Callback function
     * @param   int         type          VFS Type (PERSISTENT | TEMPORARY)
     * @param   int         quota         Initial quota size request
     * @constructor
     */
    init : function(callback, type, quota) {
      callback = callback || function() {};
      quota    = quota    || 5*1024*1024; // 5 MB

      if ( !OSjs.Compability.SUPPORT_FS )
        throw("FileSystem not supported");

      this._fs = null;
      this._quota = -1;

      var self = this;
      var si = (window.storageInfo || window.webkitStorageInfo);
      var rq = (window.requestFileSystem || window.webkitRequestFileSystem);

      si.requestQuota(type, quota, function(grantedBytes) {
        self._quota = grantedBytes;

        console.log("VFS::init()","requestQuota", grantedBytes);

        rq(type, quota, function(fs) {
          console.log("VFS::init()", "requestFileSystem", fs);

          self._fs = fs;

          callback();
        }, self.error);
      });
    },

    /**
     * VFS::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._fs = null;
      this._quota = -1;
    },

    /**
     * VFS::read() -- Read file
     * @param  String     name      File name
     * @param  Function   callback  Async callback
     * @return void
     */
    read : function(name, callback) {
      var self = this;
      callback = callback || function() {};
      this._fs.root.getFile(name, {}, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            callback(this.result);
          };
          reader.readAsText(file);
        }, self.error);
      }, self.error);
    },

    /**
     * VFS::touch() -- Create file
     * @param  String     name      File name
     * @param  Function   callback  Async callback
     * @return void
     */
    touch : function(name, callback) {
      callback = callback || function() {};
      var self = this;
      this._fs.root.getFile(name, {create: true, exclusive: true}, function(fileEntry) {
        callback(fileEntry);
      }, self.error);
    },

    /**
     * VFS::write() -- Write file
     * @param  String     name      File name
     * @param  Mixed      data      Data to write
     * @param  Function   callback  Async callback
     * @return void
     */
    write : function(name, data, callback) {
      var self = this;
      callback = callback || function() {};
      this._fs.root.getFile(name, {create: true}, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Write completed.');
          };

          fileWriter.onerror = function(e) {
            console.log('Write failed: ' + e.toString());
          };

          var bb = new BlobBuilder();
          bb.append(data);
          fileWriter.write(bb.getBlob('text/plain'));

          callback();
        }, self.error);
      }, self.error);
    },

    /**
     * VFS::append() -- Append (Write) file
     * @param  String     name      File name
     * @param  Mixed      data      Data to append
     * @param  Function   callback  Async callback
     * @return void
     */
    append : function(name, data, callback) {
      var self = this;
      callback = callback || function() {};
      this._fs.root.getFile(name, {create: false}, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.seek(fileWriter.length);
          var bb = new BlobBuilder();
          bb.append(data);
          fileWriter.write(bb.getBlob('text/plain'));

          callback();
        });
      }, self.error);
    },

    /**
     * VFS::writeURL() -- Wirte file from URL
     * @param  String     url       Full URL to load
     * @param  String     name      Directory name
     * @param  Function   callback  Async callback
     * @param  Function   error     XHR Async error callback
     * @return void
     */
    writeURL : function(url, name, callback, error) {
      var self = this;
      callback = callback || function() {};

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';

      xhr.addEventListener('error', self.error);
      xhr.addEventListener('load', function() {
        self.write(name, xhr.response, callback);
      });

      xhr.send();
    },

    /**
     * VFS::mkdir() -- Create directory
     * @param  String     name      Directory name
     * @param  Function   callback  Async callback
     * @return void
     */
    mkdir : function(name, callback) {
      callback = callback || function() {};
      var self = this;
      this._fs.root.getDirectory(name, {create: true}, function(fileEntry) {
        callback();
      }, self.error);
    },

    /**
     * VFS::rm() -- Remove File
     * @param  String     name      File name
     * @param  Function   callback  Async callback
     * @return void
     */
    rm : function(name, callback) {
      var self = this;
      callback = callback || function() {};

      this._fs.root.getFile(name, {}, function(fileEntry) {
        fileEntry.remove(function() {
          callback();
        });
      }, self.error);
    },

    /**
     * VFS::rmdir() -- Remove Directory
     * @param  String     name      Directory name
     * @param  Function   callback  Async callback
     * @return void
     */
    rmdir : function(name, callback) {
      var self = this;
      callback = callback || function() {};

      this._fs.root.getDirectory(name, {}, function(fileEntry) {
        fileEntry.remove(function() {
          callback();
        });
      }, self.error);
    },

    /**
     * VFS::rrmdir() -- Remove Directory Recursivly
     * @param  String     name      Directory name
     * @param  Function   callback  Async callback
     * @return void
     */
    rrmdir : function(name, callback) {
      var self = this;
      callback = callback || function() {};

      this._fs.root.getDirectory(name, {}, function(fileEntry) {
        fileEntry.removeRecursively(function() {
          callback();
        });
      }, self.error);
    },

    /**
     * VFS::ls() -- List directory contents
     * @param  String     name      Directory name
     * @param  Function   callback  Async callback
     * @return void
     */
    ls : function(name, callback) {
      var self = this;
      callback = callback || function() {};

      var dirReader = this._fs.root.createReader();
      var entries = [];

      function toArray(list) {
        return Array.prototype.slice.call(list || [], 0);
      }

      var readEntries = function() {
        dirReader.readEntries (function(results) {
          if (!results.length) {
            callback(entries.sort());
          } else {
            entries = entries.concat(toArray(results));
            readEntries();
          }
        }, self.error);
      };

      readEntries();
    },

    /**
     * VFS::cp() -- Copy file
     * @param  FileSystem cwd       Current root
     * @param  String     src       Source name
     * @param  String     dest      Destination name
     * @param  Function   callback  Async callback
     * @return void
     */
    cp : function(cwd, src, dest, callback) {
      var self = this;
      callback = callback || function() {};

      cwd.getFile(src, {}, function(fileEntry) {
        cwd.getDirectory(dest, {}, function(dirEntry) {
          fileEntry.copyTo(dirEntry);

          callback();
        }, self.error);
      }, self.error);
    },

    /**
     * VFS::rename() -- Move/Rename file
     * @param  FileSystem cwd       Current root
     * @param  String     src       Source name
     * @param  String     dest      Destination name
     * @param  Function   callback  Async callback
     * @return void
     */
    rename : function(cwd, src, dest, callback) {
      var self = this;
      callback = callback || function() {};

      cwd.getFile(src, {}, function(fileEntry) {
        fileEntry.moveTo(cwd, dest);
      }, self.error);
    },

    /**
     * VFS::url() -- Get URL from entry
     * @param  String     name      File name
     * @param  Function   callback  Async callback
     * @return  void
     */
    url : function(name, callback) {
      var self = this;
      callback = callback || function() {};

      var resolv = (window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL);
      resolv(name, function(fileEntry) {
        callback(fileEntry.toURL());
      });
    },

    /**
     * VFS::error() -- Handle Error
     * @param  DOMEvent   e       Event
     * @return void
     */
    error : function(e) {
      var msg = '';
      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error: ' + e;
          break;
      }

      console.error('Error: ', msg, e);
    }
  });

  /**
   * VFSTemprary -- VFS Temporary Storage
   * @see VFS
   * @class
   */
  OSjs.Classes.VFSTemprary = VFS.extend({
    init : function(callback, quota) {
      this._super(callback, TEMPORARY, quota);
    }
  });

  /**
   * VFSPersistent -- VFS Persistent Storage
   * @see VFS
   * @class
   */
  OSjs.Classes.VFSPersistent = VFS.extend({
    init : function(callback, quota) {
      this._super(callback, PERSISTENT, quota);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // PROGRESSBAR
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Classes.ProgressBar = function(el, value) {
    el = $(el);
    if ( !el.hasClass("GUIProgress") ) {
      el.html("<span class=\"default\"><span>0%</span></span>");
      el.addClass("GUIProgress");
    }

    el.find("span > span").html(value + "%");
    el.find("> span").css("width", value + "%");
  };

  /////////////////////////////////////////////////////////////////////////////
  // CHECKLIST
  /////////////////////////////////////////////////////////////////////////////

  /**
   * CheckList -- GUI Check List
   * @class
   */
  OSjs.Classes.CheckList = Class.extend({

    $element : null,

    /**
     * CheckList::init() -- Create a new instance
     * @constructor
     */
    init : function(list, onchange, inner_function) {
      this.$element = $("<div class=\"GUICheckList\"><ul></ul></div>");

      if ( list ) {
        this.draw(list, onchange, inner_function);
      }
    },

    /**
     * CheckList::destroy() -- Destroy instance
     * @destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.remove();
      }
      this.$element = null;
    },

    /**
     * CheckList::draw() -- Draw list
     * @param   Object      list              List to render
     * @param   Function    onchange          onchange function
     * @param   Function    inner_function    inner element create call
     * @return void
     */
    draw : function(list, onchange, inner_function) {
      onchange = onchange || function() {};
      inner_function = inner_function || function() {};

      var current = null;
      var create = function(i, iter, el) {
        var name = iter.name;
        var label = iter.label;
        el.addClass(i % 2 ? "odd" : "even");
        el.append(sprintf("<input type=\"checkbox\" name=\"%s\" /> <label>%s</label>", name, label));
        el.find("input[type=checkbox]").prop("checked", iter.active);

        el.click(function() {
          if ( current ) {
            $(current).removeClass("selected");
          }

          $(this).addClass("selected");
          current = this;
        });

        el.dblclick(function() {
          el.find("input[type=checkbox]").prop("checked", !iter.active);
        });

        el.find("input[type=checkbox]").change(function() {
          iter.active = $(this).is(":checked");

          onchange(iter);
        });

        inner_function(el, iter);
        return el;
      };

      var root = this.$element.find("ul").empty();
      var i = 0, l = list.length, iter, el;
      for ( i; i < l; i++ ) {
        iter  = list[i];
        el    = $("<li></li>");
        root.append(create(i, iter, el));
      }
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MediaPlayer
  /////////////////////////////////////////////////////////////////////////////

  /**
   * MediaPlayer -- Media Player class
   * @class
   */
  var MediaPlayer = Class.extend({

    $element  : null,             //!< DOM Element
    type      : "",               //!< Player type (audio/video)
    source    : "",               //!< Media source (path)
    volume    : 1.0,              //!< Playback volume
    loaded    : false,            //!< Media has been loaded
    onload    : function() {},    //!< "loadeddata" callback
    onupdate  : function() {},    //!< "timeupdate" callback

    /**
     * @constructor
     */
    init : function(type, src, controls, onload, onupdate) {
      if ( type == "audio" ) {
        if ( OSjs.Compability.SUPPORT_AUDIO ) {
          this.$element = document.createElement("audio");
        }
      } else if ( type == "video" ) {
        if ( OSjs.Compability.SUPPORT_VIDEO ) {
          this.$element = document.createElement("video");
        }
      }

      if ( !this.$element ) {
        throw ("Cannot create '" + type + "'"); // FIXME
      }

      this.type       = type;
      this.volume     = 1.0;
      this.onload     = onload || function() {};
      this.onupdate   = onupdate || function() {};
      this.loaded     = false;

      if ( controls ) {
        if ( controls == "invisible" ) {
          this.$element.style.position = "absolute";
          this.$element.style.left     = "-1000px";
          this.$element.style.top      = "-1000px";
        }
      } else {
        this.$element.controls = "controls";
      }

      var self = this;
      this.$element.addEventListener("loadeddata", function() {
        self.loaded = true;
        self.onload.apply(self, arguments);
      });
      this.$element.addEventListener("timeupdate", function() {
        self.loaded = true;
        self.onupdate.apply(self, arguments);
      });

      this.setSource(src, false);
      this.setVolume(this.volume * 100);
    },

    /**
     * @constructor
     */
    destroy : function() {
      var self = this;
      if ( this.$element ) {
        this.$element.removeEventListener("loadeddata", function() {
          self.loaded = true;
          self.onload.apply(self, arguments);
        });
        this.$element.removeEventListener("timeupdate", function() {
          self.loaded = true;
          self.onupdate.apply(self, arguments);
        });

        try {
          this.$element.parentNode.removeChild(this.$element);
        } catch (e) {}
      }
      this.$element = null;
      this.type = null;
      this.source = null;
      this.volume = null;
    },

    /**
     * MediaPlayer::play() -- Start playback
     * @return void
     */
    play : function() {
      if ( this.$element ) {
        this.$element.play();
      }
    },

    /**
     * MediaPlayer::pause() -- Pause playback
     * @return void
     */
    pause : function() {
      if ( this.$element ) {
        this.$element.pause();
      }
    },

    /**
     * MediaPlayer::stop() -- Stop playback
     * @return void
     */
    stop : function() {
      if ( this.$element ) {
        this.$element.pause();
      }
    },

    /**
     * MediaPlayer::setSource() -- Set media source
     * @param   String    src     Media source
     * @param   bool      play    Start playback (Default = true)
     * @return  void
     */
    setSource : function(src, play) {
      play = (play === undefined) ? true : play;
      this.source = src;

      if ( this.$element ) {
        this.loaded = false;
        this.$element.src = this.source;
        if ( play === true ) {
          this.play();
        }
      }
    },

    /**
     * MediaPlayer::setVolume() -- Set playback volume
     * @param   int     volume      Volume (0 - 100)
     * @return  void
     */
    setVolume : function(volume) {
      volume = parseInt(volume, 10);
      if ( volume >= 0 && volume <= 100 ) {
        this.volume = volume / 100;
      }

      if ( this.$element ) {
        this.$element.volume = this.volume;
      }
    },

    /**
     * MediaPlayer::setSeek() -- Set playback time
     * @param   int     seconds     Seek time in seconds
     * @return  void
     */
    setSeek : function(seconds) {
      if ( this.$element ) {
        this.$element.currentTime = parseInt(seconds, 10);
      }
    },

    /**
     * MediaPlayer::getStartTime() -- Get current media starting time
     * @return int
     */
    getStartTime : function() {
      if ( this.$element ) {
        //return this.$element.seekable.start();
        return 0;
      }
      return false;
    },

    /**
     * MediaPlayer::getCurrentTime() -- Get current media playing time
     * @return int
     */
    getCurrentTime : function() {
      if ( this.$element ) {
        return this.$element.currentTime;
      }
      return false;
    },

    /**
     * MediaPlayer::getEndTime() -- Get current media ending time
     * @return int
     */
    getEndTime : function() {
      if ( this.$element ) {
        //return this.$element.seekable.end();
        return this.$element.duration;
      }
      return false;
    },

    /**
     * MediaPlayer::getWidth() -- Get player width in pixels
     * @return int
     */
    getWidth : function() {
      if ( this.$element ) {
        return parseInt(this.$element.offsetWidth, 10);
      }
      return 0;
    },

    /**
     * MediaPlayer::getHeight() -- Get player height in pixels
     * @return int
     */
    getHeight : function() {
      if ( this.$element ) {
        return parseInt(this.$element.offsetHeight, 10);
      }
      return 0;
    },

    /**
     * MediaPlayer::getTimestamps() -- Get current timestamps
     * FIXME: Locale
     * @return String
     */
    getTimestamps : function() {
      if ( this.$element ) {
        var curr = this.getCurrentTime();
        var durr = this.getEndTime();

        var rem  = parseInt(durr - curr, 10),
            mins = Math.floor(rem / 60, 10),
            secs = rem - mins * 60;

        var mrem  = durr,
            mmins = Math.floor(mrem / 60, 10),
            msecs = mrem - mmins * 60;

        return {
          'current' : sprintf("%s min %s sec", mins, (secs > 9 ? secs : '0' + secs)),
          'total'   : sprintf("%s min %s sec", mmins, (msecs > 9 ? msecs : '0' + msecs))
        };
      }

      return null;
    }

  });

  /**
   * MusicPlayer -- Music Player class
   * @class
   */
  OSjs.Classes.MusicPlayer = MediaPlayer.extend({
    init : function(src, controls, onload, onupdate) {
      this._super("audio", src, controls, onload, onupdate);
    }
  });

  /**
   * VideoPlayer -- Video Player class
   * @class
   */
  OSjs.Classes.VideoPlayer = MediaPlayer.extend({
    init : function(src, controls, onload, onupdate) {
      this._super("video", src, controls, onload, onupdate);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // CANVAS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OSjs.Classes.CanvasHelper -- HTML5 Canvas Helper library
   * @class
   */
  OSjs.Classes.CanvasHelper = Class.extend({

    $container  : null,     //!< Main container DOM Element
    $canvas     : null,     //!< Canvas
    $context    : null,     //!< Canvas Context
    width       : 0,        //!< Canvas Width
    height      : 0,        //!< Canvas Height

    /**
     * @constructor
     */
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

    /**
     * @destructor
     */
    destroy : function() {
    },

    /**
     * CanvasHelper::clear() -- Clear context
     * @param   String    fill      Fill color
     * @return  void
     */
    clear : function(fill) {
      if ( this.$context ) {
        this.$context.clearRect(0, 0, this.width, this.height);

        if ( fill ) {
          this.rect(0, 0, this.width, this.height, fill);
        }
      }
    },

    /**
     * CanvasHelper::rect() -- Draw a rectangle
     * @param   int     x           X Position
     * @param   int     y           Y Position
     * @param   int     w           Width
     * @param   int     h           Height
     * @param   String  fill        Fill color
     * @param   String  stroke      Stroke color
     * @return  void
     */
    rect : function(x, y, w, h, fill, stroke) {
      if ( this.$context ) {
        this._fill(fill);

        this.$context.beginPath();
        this.$context.rect(x, y, w, h);
        this.$context.closePath();

        this._apply(fill, stroke);
      }
    },

    /**
     * CanvasHelper::roudRect() -- Draw a rounded rectangle
     * @param   int     x           X Position
     * @param   int     y           Y Position
     * @param   int     w           Width
     * @param   int     h           Height
     * @param   int     radius      Radius
     * @param   String  fill        Fill color
     * @param   String  stroke      Stroke color
     * @return  void
     */
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

    /**
     * CanvasHelper::circle() -- Draw a circle
     * @param   int     x           X Position
     * @param   int     y           Y Position
     * @param   int     r           Radius
     * @param   String  fill        Fill color
     * @param   String  stroke      Stroke color
     * @return  void
     */
    circle : function(x, y, r, fill, stroke) {
      if ( this.$context ) {
        this.$context.beginPath();
        this.$context.arc(x, y, r, 0, Math.PI*2, true);
        this.$context.closePath();

        this._apply(fill, stroke);
      }
    },

    /**
     * CanvasHelper::text() -- Draw text string
     * @param   String  txt         Text string
     * @param   int     x           X Position
     * @param   int     y           Y Position
     * @return  void
     */
    text : function(txt, x, y) {
      if ( this.$context ) {
        this.$context.fillText(txt, x, y);
      }
    },

    /**
     * CanvasHelper::createLinearGradient() -- Create a linear gradient pattern
     * @param   int     sx        Source X
     * @param   int     sy        Source Y
     * @param   int     dx        Destination X
     * @param   int     dy        Destination Y
     * @param   int     steps     Step count
     * @return  LinearGradient
     */
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

    /**
     * CanvasHelper::_fill() -- Fill the canvas
     * @param   String      fill      Color
     * @return  void
     */
    _fill : function(fill) {
      if ( fill && fill !== true ) {
        this.$context.fillStyle = fill;
      }
    },

    /**
     * CanvasHelper::_apply() -- Fill the canvase
     * @param   String      fill      Fill Color
     * @param   String      stroke    Stroke color
     * @return  void
     */
    _apply : function(fill, stroke) {
      stroke = (stroke === undefined) ? false : stroke;

      if (stroke) {
        if ( stroke !== true ) {
          this.$context.strokeStyle = stroke;
        }
        this.$context.stroke();
      }
      if (fill) {
        this.$context.fillStyle = fill;
        this.$context.fill();
      }
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // UPLOADING
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Uploader -- Uploader class
   * @class
   */
  OSjs.Classes.Uploader = Class.extend({
    // http://www.matlus.com/html5-file-upload-with-progress/

    xhr                : null,      //!< Uploader XHR Object
    uri                : null,      //!< Uploader Source Path
    dest               : null,      //!< Uploader Destination Path
    callback_choose    : null,      //!< Uploader Selection callback
    callback_progress  : null,      //!< Uploader Progress callback
    callback_finished  : null,      //!< Uploader Finish callback
    callback_failed    : null,      //!< Uploader Failure callback

    /**
     * Uploader::init() -- Constructor
     * @constructor
     */
    init : function(uri, dest, fChoose, fProgress, fFinished, fFailed) {
      if ( !OSjs.Compability.SUPPORT_UPLOAD ) {
        throw OSjs.Public.CompabilityErrors.upload;
      }

      this.xhr                = null;
      this.dest               = dest      || "/";
      this.uri                = uri;
      this.callback_choose    = fChoose   || function() {};
      this.callback_progress  = fProgress || function() {};
      this.callback_finished  = fFinished || function() {};
      this.callback_failed    = fFailed   || function() {};
    },

    /**
     * Uploader::destroy() -- Constructor
     * @constructor
     */
    destroy : function() {
      var self = this;

      if ( this.xhr ) {
        this.xhr.removeEventListener("load", function(evt) { self.uploadComplete(evt); }, false);
        this.xhr.removeEventListener("error", function(evt) { self.uploadFailed(evt); }, false);
        this.xhr.removeEventListener("abort", function(evt) { self.uploadCanceled(evt); }, false);

        this.xhr = null;
      }
    },

    /**
     * Uploader::run() -- Destructor
     * @return void
     */
    run : function(file) {
      var self = this;
      file.onchange = function(evt) {
        self.fileSelected(evt, file.files[0]);
      };
    },

    /**
     * Uploader::upload() -- Upload A file
     * @param  DOMElement     form      DOM Form Element
     * @param  Object         file      ... or a File
     * @return void
     */
    upload : function(form, file) {
      var self = this;

      var xhr = new XMLHttpRequest();
      var fd  = new FormData();
      fd.append("upload", 1);
      fd.append("path", this.dest);
      fd.append("upload", file ? file : $(form).find("input[type=file]").get(0).files[0]);

      xhr.upload.addEventListener("progress", function(evt) { self.uploadProgress(evt); }, false);
      xhr.addEventListener("load", function(evt) { self.uploadComplete(evt); }, false);
      xhr.addEventListener("error", function(evt) { self.uploadFailed(evt); }, false);
      xhr.addEventListener("abort", function(evt) { self.uploadCanceled(evt); }, false);
      xhr.open("POST", this.uri);
      xhr.send(fd);

      this.xhr = xhr;
    },

    /**
     * Uploader::fileSelected() -- Constructor
     * @return void
     */
    fileSelected : function(evt, file) {
      if (file) {
        var fileSize = 0;
        if (file.size > 1024 * 1024)
          fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        else
          fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

        this.callback_choose(file.name, fileSize, file.type);
      }
    },

    /**
     * Uploader::uploadProgress() -- Upload Progress Update
     * @param  Event      evt       Browser Event
     * @return void
     */
    uploadProgress : function(evt) {
      if ( evt.lengthComputable ) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        this.callback_progress(percentComplete.toString() + '%');
      } else {
        this.callback_progress("Unknown");
      }
    },

    /**
     * Uploader::uploadComplete() -- Constructor
     * @param  Event      evt       Browser Event
     * @return void
     */
    uploadComplete : function(evt) {
      var jsn;
      try {
        jsn = JSON.parse(evt.target.responseText);
      } catch ( eee ) {
        jsn = null;
      }

      if ( jsn instanceof Object ) {
        this.callback_finished(jsn);
      } else {
        this.callback_failed("Invalid response!");
      }
    },

    /**
     * Uploader::uploadFailed() -- Constructor
     * @param  Event      evt       Browser Event
     * @return void
     */
    uploadFailed : function(evt) {
      this.callback_failed("There was an error attempting to upload the file.");
    },

    /**
     * Uploader::uploadCanceled() -- Constructor
     * @param  Event      evt       Browser Event
     * @return void
     */
    uploadCanceled : function(evt) {
      this.callback_failed("The upload has been canceled by the user or the browser dropped the connection.");
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // RICHTEXT
  /////////////////////////////////////////////////////////////////////////////

  /**
   * RichtextEditor -- Richt-text editor
   *
   * Extend this class and manipulate HTML template
   * in the init() method.
   *
   * TODO: Error handling in formatting
   * TODO: Browser compabilities
   *
   * @link  https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
   * @link  http://www.geekpedia.com/Samples/RTB/Editor.html
   *
   * @class
   */
  OSjs.Classes.RichtextEditor = Class.extend({

    _frame : null,    //!< HTML Document iframe
    _doc   : null,    //!< HTML Document reference
    _win   : null,    //!< HTML Window reference

    /**
     * RichtextEditor::init() -- Constructor
     * @constructor
     */
    init : function(area) {
      this._frame = $(area).get(0);

      if ( this._frame.contentDocument ) {
        this._win   = this._frame.contentWindow;
        this._doc   = this._frame.contentWindow.document;
      } else {
        this._win   = this._frame.window;
        this._doc   = this._frame.document;
      }

      var self = this;
      /*
      $(this._win).live("focus", function() {
        alert('y');
      });
      $(area).contents().find("body").live("focus", function(ev) {
        alert('x');
        self.onFocus(ev);
      });
      */

      console.log("RichtextEditor::init()", this._frame);

      if ( !this._doc || !this._win )
        throw "Failed to initialize Richtext IFrame";

      // Prepare design mode
      this.enable();
      this.setContent("");
    },

    /**
     * RichtextEditor::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._frame = null;
      this._doc   = null;
      this._win   = null;
    },

    /**
     * RichtextEditor::onFocus() -- When document gets focus
     * @return  void
     */
    onFocus : function() {
    },

    /**
     * RichtextEditor::onBlur() -- When document blurs
     * @return  void
     */
    onBlur : function() {
    },

    /**
     * RichtextEditor::focus() -- Focus editor
     * @return  void
     */
    focus : function() {
    },

    /**
     * RichtextEditor::blur() -- Blur editor
     * @return  void
     */
    blur : function() {
    },

    //
    // CONTROLLER
    //

    /**
     * RichtextEditor::enable() -- Enable editing
     * @return  void
     */
    enable : function() {
      if ( this._doc )
        this._doc.designMode = "on";
    },

    /**
     * RichtextEditor::disable() -- Disable editing
     * @return  void
     */
    disable : function() {
      if ( this._doc )
        this._doc.designMode = "off";
    },

    /**
     * RichtextEditor::focus() -- Focus document element
     * @return  void
     */
    focus : function() {
      if ( this._win )
        this._win.focus();
    },

    /**
     * RichtextEditor::edit() -- Change current edit mode
     * @param   String      key     What command to send
     * @param   String      value   Value (not required)
     * @return  void
     */
    edit : function(key, val) {
      if ( this._frame ) {
        console.log("RichtextEditor::edit()", key, val);

        this._doc.execCommand(key, "", val);

        var self = this;
        setTimeout(function() {
          self.focus();
        }, 0);
      }
    },

    //
    // EDITING
    //

    /**
     * RichtextEditor::undo() -- Undo last change
     * @see     RichtextEditor::edit()
     * @return  void
     */
    undo : function() {
      this.edit("undo");
    },

    /**
     * RichtextEditor::redo() -- Redo last change
     * @see     RichtextEditor::edit()
     * @return  void
     */
    redo : function() {
      this.edit("redo");
    },

    /**
     * RichtextEditor::selectAll() -- Select all content
     * @see     RichtextEditor::edit()
     * @return  void
     */
    selectAll : function() {
      this.edit("selectAll");
    },

    /**
     * RichtextEditor::cut() -- Cut selection
     * @see     RichtextEditor::edit()
     * @return  void
     */
    cut : function() {
      this.edit("cut");
    },

    /**
     * RichtextEditor::copy() -- Copy selection
     * @see     RichtextEditor::edit()
     * @return  void
     */
    copy : function() {
      this.edit("copy");
    },

    /**
     * RichtextEditor::paste() -- Paste into selection/position
     * @see     RichtextEditor::edit()
     * @return  void
     */
    paste : function() {
      this.edit("paste");
    },

    /**
     * RichtextEditor::remove() -- Delete selection
     * @see     RichtextEditor::edit()
     * @return  void
     */
    remove : function() {
      this.edit("delete");
    },

    /**
     * RichtextEditor::outdent() -- Outdent the selected text/block
     * @see     RichtextEditor::edit()
     * @return  void
     */
    outdent : function() {
      this.edit("outdent");
    },

    /**
     * RichtextEditor::indent() -- Indent the selected text/block
     * @see     RichtextEditor::edit()
     * @return  void
     */
    indent : function() {
      this.edit("indent");
    },

    //
    // FORMAT
    //

    /**
     * RichtextEditor::heading() -- Set a HTML heading (H1-H6)
     * @see     RichtextEditor::edit()
     * @return  void
     */
    heading : function(h) {
      this.edit("heading", h);
    },

    /**
     * RichtextEditor::formatBlock() -- Surround selection with given block-type
     * @see     RichtextEditor::edit()
     * @return  void
     */
    formatBlock : function(el) {
      this.edit("formatBlock", el);
    },

    /**
     * RichtextEditor::removeFormat() -- Remove formatting on selection
     * @see     RichtextEditor::edit()
     * @return  void
     */
    removeFormat : function() {
      this.edit("removeFormat");
    },

    /**
     * RichtextEditor::insertHTML() -- Insert HTML
     * @see     RichtextEditor::edit()
     * @return  void
     */
    insertHTML : function(html) {
      this.edit("insertHTML", html);
    },

    /**
     * RichtextEditor::insertImage() -- Insert image from URL
     * @see     RichtextEditor::edit()
     * @return  void
     */
    insertImage : function(src) {
      this.edit("insertImage", src);
    },

    /**
     * RichtextEditor::insertList() -- Insert a List
     * @see     RichtextEditor::edit()
     * @return  void
     */
    insertList : function(type) {
      if ( type == "ul" ) {
        this.edit("insertUnorderedList");
      } else if ( type == "ol" ) {
        this.edit("insertOrderedList");
      }
    },

    /**
     * RichtextEditor::insertParagraph() -- Insert paragraph here
     * @see     RichtextEditor::edit()
     * @return  void
     */
    insertParagraph : function() {
      this.edit("insertParagraph");
    },

    /**
     * RichtextEditor::insertLink() -- Add a linked href to selection
     * @see     RichtextEditor::edit()
     * @return  void
     */
    insertLink : function(uri) {
      this.edit("createLink", uri);
    },

    /**
     * RichtextEditor::removeLink() -- Remove linked href
     * @see     RichtextEditor::edit()
     * @return  void
     */
    removeLink : function() {
      this.edit("unlink");
    },

    //
    // STYLES
    //

    /**
     * RichtextEditor::toggleJustification() -- Set font justification
     *
     * Values: Center/Full/Left/Right
     *
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleJustification : function(val) {
      this.edit("justify" + val);
    },

    /**
     * RichtextEditor::toggleBold() -- Set bold text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleBold : function() {
      this.edit("bold");
    },

    /**
     * RichtextEditor::toggleItalic() -- Set italic text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleItalic : function() {
      this.edit("italic");
    },

    /**
     * RichtextEditor::toggleUnderline() -- Set underline text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleUnderline : function() {
      this.edit("underline");
    },

    /**
     * RichtextEditor::toggleStrikeThrough() -- Set underline text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleStrikeThrough : function() {
      this.edit("strikeThrough");
    },

    /**
     * RichtextEditor::toggleSubscript() -- Set subscript text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleSubscript : function() {
      this.edit("subscript");
    },

    /**
     * RichtextEditor::toggleSuperscript() -- Set superscript text
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleSuperscript : function() {
      this.edit("superscript");
    },

    /**
     * RichtextEditor::toggleFont() -- toggle font style
     * @see     RichtextEditor::edit()
     * @return  void
     */
    toggleFontStyle : function(name, size, color, background) {
      if ( name )
        this.edit("fontName", name);

      if ( size )
        this.edit("fontSize", size);

      if ( color )
        this.edit("foreColor", color);

      if ( background )
        this.edit("backColor", background);
    },

    //
    // FS
    //

    /**
     * RichtextEditor::setContent() -- Set the BODY HTML content of document
     *
     * This function clears the document entirely
     *
     * @param   String    content     The content
     * @param   String    css         Extra CSS (optional)
     * @return  void
     */
    setContent : function(content, css) {
      content = content || "";
      css     = css || "";

      this._frame.src = "about:blank";
      this._doc.open();
      this._doc.write('<head><link rel="stylesheet" type="text/css" href="/VFS/resource/iframe.css" /><style type="text/css">' + css + '</style></head><body>' + content + '</body>');
      this._doc.close();
    },

    /**
     * RichtextEditor::setInnerContent() -- Set the HTML content of document
     *
     * This function clears the document entirely
     *
     * @param   String    content     The content
     * @return  void
     */
    setInnerContent : function(content) {
      this._frame.src = "about:blank";
      this._doc.open();
      this._doc.write(content);
      this._doc.close();
    },

    /**
     * RichtextEditor::getContent() -- Get the contents of document in HTML format
     * @return  String
     */
    getContent : function() {
      if ( this._frame )
        return this._doc.body.innerHTML;
      return "";
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // PRELOADER
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Preloader -- Handles preloading/lazy-loading of resources
   *
   * Errors will not stop iteration.
   *
   * @class
   */
  OSjs.Classes.Preloader = Class.extend({
    _list         : [],                   //!< Remaining items
    _finished     : false,                //!< Finished state
    _resource     : null,                 //!< Current resource
    _errors       : 0,                    //!< Loading error count
    _total        : 0,                    //!< Loading try count
    _onFinished   : function() {},        //!< Callback: Finished with queue
    _onSuccess    : function() {},        //!< Callback: Finished with resource
    _onError      : function() {},        //!< Callback: Error with resource

    /**
     * Preloader::init() -- Construct a new Preloader
     *
     * @param   Array     list          List of resources
     * @param   Function  onFinished    When done loading all resources in queue
     * @param   Function  onSuccess     When resource successfully loaded
     * @param   Function  onError       When resource fails to load
     * @constructor
     */
    init : function(list, onFinished, onSuccess, onError) {
      this._finished    = false;
      this._list        = list        || [];
      this._errors      = 0;
      this._total       = list.length;

      var self = this;
      this._onFinished  = function() {
        if ( self._finished ) {
          return;
        }
        self._finished = true;

        (onFinished || function() {})(self._total, self._errors);
      };

      this._onSuccess   = function(src) {
        if ( self._finished )
          return;

        console.log("Preloader::_onSuccess()", src);

        (onSuccess || function() {})(src);

        self._checkQueue();
      };

      this._onError     = function(src) {
        if ( self._finished )
          return;

        self._errors++;

        console.log("Preloader::_onError()", src);

        (onError || function() {})(src);

        self._checkQueue();
      };

      console.group("Preloader::init()");
      console.log("List", this._list);
      console.groupEnd();

      this.run();
    },

    /**
     * Preloader::destroy() -- Destroy current instance
     * @destructor
     */
    destroy : function() {
      console.log("Preloader::destroy()");

      this._finished    = false;
      this._list        = [];
      this._errors      = 0;
      this._total       = 0;
      this._resource    = null;
      this._onFinished  = null;
      this._onSuccess   = null;
      this._onError     = null;
    },

    /**
     * Preloader::run() -- Start loading
     * @return  void
     */
    run : function() {
      this._checkQueue();
    },

    /**
     * Preloader::_checkQueue() -- Check the Queue for items to load
     * @return  void
     */
    _checkQueue : function() {
      if ( this._list.length ) {
        var item = this._list.shift();
        if ( item.type == "image" ) {
          this._loadImage(item.src);
        } else if ( item.type == "video" || item.type == "film") {
          this._loadVideo(item.src);
        } else if ( item.type == "sound" || item.type == "video" ) {
          this._loadAudio(item.src);
        } else if ( item.type == "css" || item.type == "stylesheet" ) {
          this._loadCSS(item.src);
        } else if ( item.type == "javascript" || item.type == "script" ) {
          this._loadJavaScript(item.src);
        }
        return;
      }

      this._onFinished();
    },

    /**
     * Preloader::_cleanResource() -- Handle safe destruction of DOM objects etc.
     * @return  void
     */
    _cleanResource : function() {
      if ( this._resource ) {
        //if ( (this._resource instanceof Audio) || (this._resource instanceof Video) ) {
          var self = this;
          self._resource.removeEventListener('canplaythrough', function(ev) {
            self._onSuccess(src);
          }, false );
        //}

        this._resource = null;
      }
    },

    /**
     * Preload::_loadImage() -- Handle loading of Images
     * @param   String    src       Absolute path to resource
     * @return  void
     */
    _loadImage : function(src) {
      var self = this;

      this._resource = new Image();
      this._resource.onload = function() {
        self._onSuccess(src);
      };
      this._resource.onerror = function() {
        self._onError(src);
      };
      this._resource.src = src;
    },

    /**
     * Preload::_loadVideo() -- Handle loading of Video
     * @param   String    src       Absolute path to resource
     * @return  void
     */
    _loadVideo : function(src) {
      var self = this;

      this._resource = document.createElement("video");
      this._resource.onerror = function() {
        self._onError(src);
        self._cleanResource();
      };

      self._resource.addEventListener('canplaythrough', function(ev) {
        self._onSuccess(src);
        self._cleanResource();
      }, false );

      this._resource.preload   = "auto";
      this._resource.src       = src;
    },

    /**
     * Preload::_loadAudio() -- Handle loading of Audio
     * @param   String    src       Absolute path to resource
     * @return  void
     */
    _loadAudio : function(src) {
      var self = this;

      this._resource = new Audio();
      this._resource.onerror = function() {
        self._onError(src);
        self._cleanResource();
      };

      self._resource.addEventListener('canplaythrough', function(ev) {
        self._onSuccess(src);
        self._cleanResource();
      }, false );

      this._resource.preload   = "auto";
      this._resource.src       = src;
    },

    /**
     * Preload::_loadCSS() -- Handle loading of CSS Stylesheet
     *
     * There currently are no onload() an onerror() event
     * for <link /> items. IE has document.createStyleSheet(), W3C only has
     * DOM.
     *
     * In IE, we assume the stylesheet is added. Otherwise we use an interval
     * to check if the 
     *
     * @param   String    src         Absolute path to resource
     * @param   int       interval    Interval (in ms)
     * @param   int       timeout     Timeout (in ms)
     * @return  void
     */
    _loadCSS : function(src, interval, timeout) {
      var self = this;

      interval  = interval  || 10;
      timeout   = timeout   || 7500;

      if ( document.createStyleSheet ) {
        document.createStyleSheet(src);
        this._onSuccess(src);
      } else {
        this._resource        = document.createElement("link");
        this._resource.rel    = "stylesheet";
        this._resource.type   = "text/css";
        this._resource.href   = src;

        var _found   = false;
        var _poll    = null;
        var _timeout = null;
        var _clear    = function() {

          if ( _timeout ) {
            clearTimeout(_timeout);
            _timeout = null;
          }
          if ( _poll ) {
            clearInterval(_poll);
            _poll = null;
          }
        };

        _timeout = setTimeout(function() {
          if ( !_found ) {
            self._onError(src);
          }

          _clear();
        }, timeout);

        _poll  = setInterval(function() {
          if ( self._resource ) {
            var sheet     = "styleSheet";
            var cssRules  = "rules";
            if ( "sheet" in self._resource ) {
              sheet     = "sheet";
              cssRules  = "cssRules";
            }

            try {
              if ( self._resource[sheet] && self._resource[sheet][cssRules].length ) {
                _found = true;
                self._onSuccess(src);
                _clear();
              }
            } catch ( eee ) { (function() {})(); } finally { (function() {})(); }
          }
        }, interval);

        document.getElementsByTagName("head")[0].appendChild(this._resource);
      }

    },

    /**
     * Preload::_loadJavaScript() -- Handle loading of (ECMA) JavaScript
     * @param   String    src       Absolute path to resource
     * @return  void
     */
    _loadJavaScript : function(src) {
      var self   = this;
      var loaded = false;

      this._resource                    = document.createElement("script");
      this._resource.type               = "text/javascript";
      this._resource.charset            = "utf-8";
      this._resource.onreadystatechange = function() {
        if ( (this.readyState == 'complete' || this.readyState == 'complete') && !loaded) {
          loaded = true;
          if ( self._onSuccess ) // Needed because this event may fire after destroy() in some browsers, depending on onload
            self._onSuccess(src);
        }
      };
      this._resource.onload             = function() {
        if ( loaded )
          return;
        loaded = true;
        if ( self._onSuccess ) // Needed because this event may fire after destroy() in some browsers, depending onreadystatechange
          self._onSuccess(src);
      };
      this._resource.onerror            = function() {
        if ( loaded )
          return;
        loaded = true;

        if ( self._onError ) // Needed because this event may fire after destroy() in some browsers, depending on above notes
          self._onError(src);
      };
      this._resource.src = src;

      document.getElementsByTagName("head")[0].appendChild(this._resource);
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // ICON VIEW
  /////////////////////////////////////////////////////////////////////////////

  /**
   * IconView -- Gtk Icon View
   * @class
   */
  OSjs.Classes.Iconview = Class.extend({
    $element      : null,       //!< HTML Element
    _currentView  : "icon",     //!< Current view type
    _currentItem  : null,       //!< Current selected item HTML
    _sortKey      : null,       //!< Current sorting key
    _sortDir      : "asc",      //!< Current sorting direction
    _opts         : {},         //!< Options

    /**
     * IconView::init() -- Constructor
     * @constructor
     */
    init : function(el, view, opts) {
      if ( !el )
        throw "Cannot create IconView without root container";

      if ( !opts ) {
        opts = {"dnd" : true};
      }

      this.$element     = $(el);
      this._currentView = view    || "icon";
      this._currentItem = null;
      this._opts        = opts;
      this._sortKey     = null;
      this._sortDir     = "asc";

      var self = this;
      this.$element.bind("contextmenu", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        self.onContextMenu(ev, this);
        return false;
      });
      this.$element.bind("mousedown", function(ev) {
        ev.preventDefault();
        return false;
      });
      this.$element.bind("click", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        self.onItemSelect(null, null, null);
        return false;
      });
      this.$element.bind("dblclick", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });

      /*
      this.$element.bind("focus", function(ev) {
        self.onFocus(ev);
      });
      */

      if ( OSjs.Compability.SUPPORT_DND && this._opts.dnd ) {
        this.$element.bind("dragover", function(ev) {
          ev.preventDefault();
          return self.onDragAction(ev, "dragover");
        });
        this.$element.bind("dragleave", function(ev) {
          /*return */self.onDragAction(ev, "dragleave");
        });
        this.$element.bind("dragenter", function(ev) {
          /*return */self.onDragAction(ev, "dragenter");
        });
        this.$element.bind("dragend", function(ev) {
          /*return */self.onDragAction(ev, "dragend");
        });
        this.$element.bind("drop", function(ev) {
          ev.preventDefault();
          return self.onDragAction(ev, "drop");
        });
      }

      console.log("IconviewNew::init()", el, view);
    },

    /**
     * IconView::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this.$element     = null;
      this._currentItem = null;
      this._currentView = "icon";
      this._opts        = {};
      this._sortKey     = null;
      this._sortDir     = "asc";
    },

    /**
     * IconView::onFocus() -- When user focuses view
     * @return  void
     */
    onFocus : function(ev) {
    },

    /**
     * IconView::onItemSelect() -- When user clicks/selects a item
     * @return  void
     */
    onItemSelect : function(ev, el, iter) {
      this.onFocus(ev);

      if ( this._currentItem ) {
        $(this._currentItem).removeClass("Current");
        this._currentItem = null;
      }

      if ( el ) {
        this._currentItem = $(el);
        if ( this._currentItem ) {
          this._currentItem.addClass("Current");
        }
      }
    },

    /**
     * IconView::onItemActivate() -- When user opens an item
     * @return  void
     */
    onItemActivate : function(ev, el, iter) {
      return false;
    },

    /**
     * IconView::onItemContextMenu() -- When user opens item context menu
     * @return  void
     */
    onItemContextMenu : function(ev, el, iter) {
      this.onItemSelect(ev, el, iter);
      return false;
    },

    /**
     * IconView::onContextMenu() -- When user opens main context menu
     * @return  void
     */
    onContextMenu : function(ev) {
      this.onItemSelect(null, null);
      return false;
    },

    /**
     * IconView::onColumnActivate() -- When user clicks a column
     * @return  void
     */
    onColumnActivate : function(ev, el, iter) {
      if ( iter != this._sortKey ) {
        this._sortDir = "asc";
      } else {
        if ( this._sortDir == "asc" ) {
          this._sortDir = "desc";
        } else {
          this._sortDir = "asc";
        }
      }
      this._sortKey = iter;

      return false;
    },

    /**
     * IconView::onDragAction() -- When a DnD action occurs
     * @return  bool
     */
    onDragAction : function(ev, action, item, args) {
      switch ( action ) {
        case "dragover" :
          if ( item ) {
            ev.originalEvent.dataTransfer.dropEffect = "copy";
          }
        break;

        case "dragleave" :
          if ( item ) {
            item.removeClass("DND-Enter");
          }
        break;

        case "dragenter" :
          if ( item ) {
            $(item).addClass("DND-Enter");
            ev.originalEvent.dataTransfer.dropEffect = "copy";
          } else {
            this.$element.addClass("DND-Enter");
            ev.originalEvent.dataTransfer.dropEffect = "copy";
          }
        break;

        case "dragend" :
          if ( item ) {
            this.$element.removeClass("DND-Enter");
          } else {
            this.$element.find(".DND-Active").removeClass("DND-Active");
          }
        break;

        case "dragstart" :
          if ( item ) {
            item.addClass("DND-Active");
            this.onItemSelect(ev, item);
          }
        break;

        case "drop" :
          var files = ev.originalEvent.dataTransfer.files;
          var data  = ev.originalEvent.dataTransfer.getData("text/plain");
          var jsn   = null;
          if ( data ) {
            try {
              jsn = JSON.parse(data);
            } catch (e) { jsn = {}; }
          }

          return {"json" : jsn, "data" : data, "files" : files, "item" : item};
        break;

        default :
          return true;
        break;
      }

      return false;
    },

    /**
     * IconView::render() -- Render a list of items
     *
     * This function works as a setter for items, columns and view type
     *
     * @param   Array     items       The list of items (if any)
     * @param   Array     columns     The list of columns (for listview, if any)
     * @param   String    view        Change view type
     * @return  void
     */
    render : function(items, columns, view) {
      items = items || [];
      columns = columns || [];

      if ( view )
        this._currentView = view;

      this.onItemSelect(null, null);
      var ul, root;
      if ( this._currentView == "icon" ) {
        root = ul = $("<ul></ul>");
        this.$element.html(ul);
      } else {
        ul = $("<table></table>");
        var head = $("<thead><tr></tr></thead>");
        var body = $("<tbody></tbody>");

        var j = 0, k = columns.length;
        for ( j; j < k; j++ ) {
          head.find("tr").append(this._createColumn(columns[j]));
        }

        ul.append(head);
        ul.append(body);

        root = body;
      }
      this.$element.html(ul);

      var i = 0, l = items.length;
      for ( i; i < l; i++ ) {
        ul.append(this._createItem(items[i]));
      }

    },

    /**
     * IconView::createItem() -- Create the HTML Element for iter
     *
     * This function is for developer to implement in extended class
     *
     * @return  HTMLElement
     */
    createItem : function(view, iter) {
      return view == "icon" ? $("<li class=\"GtkIconViewItem\">?</li>") : $("<tr class=\"GtkIconViewItem\"><td>?</td></tr>");
    },

    /**
     * IconView::createColumn() -- Create the HTML Column Element for iter
     *
     * This function is for developer to implement in extended class
     *
     * @return  HTMLElement
     */
    createColumn : function(iter) {
      var el = $("<td>" + iter + "</td>");
      el.data("name", iter);
      return el;
    },

    /**
     * IconView::_createItem() -- Create the HTML Element in render()
     * @see     IconView::render()
     * @see     IconView::createItem()
     * @return  HTMLElement
     */
    _createItem : function(iter) {
      var self = this;
      var el = this.createItem(this._currentView, iter);
      var jsn = {};
      try {
        jsn = JSON.stringify(iter);
      } catch ( eee ) {
        jsn = {};
      }

      if ( OSjs.Compability.SUPPORT_DND && this._opts.dnd ) {
        el.attr("draggable", "true");
        el.bind("dragover", function(ev) {
          ev.preventDefault();
          return self.onDragAction(ev, "dragover", $(this));
        });
        el.bind("dragleave", function(ev) {
          //ev.preventDefault();
          /*return */self.onDragAction(ev, "dragleave", $(this));
        });
        el.bind("dragstart", function(ev) {
          ev.originalEvent.dataTransfer.setData('text/plain', jsn);
          /*return */self.onDragAction(ev, "dragstart", $(this));
        });
        el.bind("dragend", function(ev) {
          /*return */self.onDragAction(ev, "dragend", $(this));
        });
        el.bind("drop", function(ev) {
          ev.preventDefault();
          return self.onDragAction(ev, "drop", $(this));
        });
      }

      el.mousedown(function(ev) {
        var t = $(ev.target || ev.srcElement);
        if ( !(t.attr("draggable") === "true" || t.closest("*[draggable=true]", t).length) ) {
          ev.preventDefault();
        } else {
          ev.stopPropagation();
        }
        //return false;
      });
      el.click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        self.onItemSelect(ev, this, iter);
      });
      el.bind("contextmenu", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return self.onItemContextMenu(ev, this, iter);
      });
      el.dblclick(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return self.onItemActivate(ev, this, iter);
      });

      return el;
    },

    /**
     * IconView::_createColumn() -- Create the HTML Column Element in render()
     * @see     IconView::render()
     * @see     IconView::createColumn()
     * @return  HTMLElement
     */
    _createColumn : function(iter) {
      var self = this;
      var el = this.createColumn(iter);

      el.click(function(ev) {
        ev.stopPropagation();
        self.onColumnActivate(ev, this, iter);
      });

      return el;
    },

    /**
     * IconView::selectItem() -- Select an item by searching
     * @return  void
     */
    selectItem : function(key, value) {
      var els = this.$element.find(".GtkIconViewItem");
      var i = 0, l = els.length, el;
      for ( i; i < l; i++ ) {
        el = $(els[i]);
        if ( el.data(key) == value ) {
          this.onItemSelect(null, el);
          return;
        }
      }

      this.onItemSelect(null, null);
    }

  });


})($);
