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
  // ICON VIEW
  /////////////////////////////////////////////////////////////////////////////

  var ICONVIEW_ICON  = 0;
  var ICONVIEW_LIST  = 1;
  var ICONVIEW_TREE  = 2;
  var ICONVIEW_GRID  = 3;

  var ICONVIEW_TYPES = {
    "icon" : ICONVIEW_ICON,
    "list" : ICONVIEW_LIST,
    "tree" : ICONVIEW_TREE,
    "grid" : ICONVIEW_GRID
  };

  /**
   * IconView -- IconView Class
   * @class
   */
  OSjs.Classes.IconView = Class.extend({

    type                : -1,                   //!< View Type
    list                : [],                   //!< List
    columns             : [],                   //!< Columns
    transparent         : false,                //!< Bubble events?
    $root               : null,                 //!< Root Container DOM Element
    $element            : null,                 //!< View DOM Element
    $selected           : null,                 //!< Selected DOM Element
    on_render           : function() {},        //!< Render item callback function
    on_activate         : function() {},        //!< Activate item callback function
    on_toggle           : function() {},        //!< Toggle item callback function
    on_focus            : function() {},        //!< On-focus event
    on_context          : function() {},        //!< On context-menu show
    on_drop             : function() {},        //!< DnD: Dropped in view
    on_drag_over        : function() {},        //!< DnD: View mouseover
    on_drag_leave       : function() {},        //!< DnD: View mouseout
    on_drop_item        : function() {},        //!< DnD: Dropped in item
    on_drag_item_over   : function() {},        //!< DnD: Item mouseover
    on_drag_item_leave  : function() {},        //!< DnD: Item mouseout

    /**
     * IconView::init() -- Constructor
     * @constructor
     */
    init : function(root, type, list, columns, on_render, on_activate, on_toggle, transparent) {
      this.list         = [];
      this.columns      = [];
      this.transparent  = transparent === undefined ? false : transparent;
      this.$root        = null;
      this.$element     = null;
      this.$selected    = null;

      this.on_render            = on_render   || function() {};
      this.on_activate          = on_activate || function() {};
      this.on_toggle            = on_toggle   || function() {};
      this.on_focus             = function() {};
      this.on_context           = function() {};
      this.on_drop              = function() {};
      this.on_drag_over         = function() {};
      this.on_drag_leave        = function() {};
      this.on_drop_item         = function() {};
      this.on_drag_item_over    = function() {};
      this.on_drag_item_leaver  = function() {};

      if ( $(root).hasClass("GtkIconView") ) {
        this.$root = root;
      } else {
        var tmp = $("<div class=\"GtkIconView\"></div>");
        this.$root = tmp;
        $(root).append(tmp);
      }

      this.setListType(type, false);
      if ( this.setList(list, columns) ) {
        this.renderList(this.list, this.columns);
      }

      var self = this;

      if ( this.transparent ) {
        this.$root.bind("mousedown", function(ev) {
          self.on_focus(ev);
          $(document).click(); // Trigger this! (deselects context-menu)
          ev.preventDefault();
        });
      } else {
        this.$root.bind("mousedown", function(ev) {
          self.on_focus(ev);
          $(document).click(); // Trigger this! (deselects context-menu)
          ev.preventDefault();
          return false;
        });
      }

      this.$root.bind("click", function(ev) {
        self._selectItem(ev, null, null, false);
        $(document).click(); // Trigger this! (deselects context-menu)

        if ( !self.transparent ) {
          ev.preventDefault();
          return true;
        }

        return false;
      });

      this.$root.bind("contextmenu", function(ev) {
        ev.preventDefault();
        self._selectItem(ev, null, null, false);

        if ( !self.transparent ) {
          $(document).click(); // Trigger this! (deselects context-menu)
          return true;
        }
        return false;
      });
    },

    /**
     * IconView::init() -- Destructor
     * @destructor
     */
    destroy : function() {
      this.$root.unbind();

      this.clear();

      this.$root.empty();

      this.on_render    = null;
      this.on_activate  = null;
      this.on_toggle    = null;
      this.on_focus     = null;

      this.$root      = null;
      this.$element   = null;
      this.$selected  = null;
      this.list       = null;
      this.columns    = null;
      this.type       = -1;
    },

    /**
     * IconView::resize() -- Resize event
     * @return void
     */
    resize : function() {
      var self = this;
      if ( this.type == ICONVIEW_LIST ) {
        this.$element.find(".TableHead td").each(function(ind, el) {
          var pel = self.$element.find(".TableBody tr:first-child td").get(ind);
          if ( pel ) {
            $(el).css("width", $(pel).width() + "px");
          }
        });
      }
    },

    /**
     * IconView::clear() -- Clear event
     * @return void
     */
    clear : function() {
      if ( this.$element ) {
        this.$element.unbind();
        this.$element.remove();
      }
    },

    /**
     * IconView::_clearRoot -- Clear the Icon View
     * @return void
     */
    _clearRoot  : function(el) {
      this.clear();
      this.$root.empty();

      if ( el ) {
        this.$element = el;
        this.$root.append(this.$element);
      } else {
        this.$element = null;
      }

      return this.$element;
    },

    /**
     * IconView::_createRoot() -- Create the Icon View roViewot element
     * @return DOMElement
     */
    _createRoot : function() {
      var self = this;

      var el;
      if ( this.type === ICONVIEW_ICON || this.type === ICONVIEW_GRID ) {
        el = $("<ul class=\"ListWrap\"></ul>");
      } else {
        el = $("<div class=\"TableWrap\"><table class=\"TableHead GtkIconViewHeader\"><tbody></tbody></table><div class=\"TableBodyWrap\"><table class=\"TableBody\"><tbody></tbody></table></div></div>");
      }

      el.bind("mousedown", function(ev) {
        self.on_focus(ev);

        ev.preventDefault();
        //ev.stopPropagation();
        return false;
      }).bind("dblclick", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });

      if ( OSjs.Compability.SUPPORT_DND ) {
        el.bind("dragover", function(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          self.on_drag_over(ev);
          return false;
        });
        el.bind("dragleave", function(ev) {
          el.removeClass("DND-Enter");
          self.on_drag_leave(ev);
          return false;
        });
        el.bind("dragenter", function(ev) {
          el.addClass("DND-Enter");
          ev.stopPropagation();
          ev.preventDefault();
          ev.originalEvent.dataTransfer.dropEffect = "copy";
          return false;
        });
        el.bind("dragend", function(ev) {
          el.find(".DND-Active").removeClass("DND-Active");
          return false;
        });
        el.bind("drop", function(ev) {
          var data = ev.originalEvent.dataTransfer.getData("text/plain");
          var jsn = null;
          if ( data ) {
            try {
              jsn = JSON.parse(data);
            } catch (e) {}
          }

          ev.preventDefault();
          ev.stopPropagation();

          self.on_drop(ev, jsn, null, ev.originalEvent.dataTransfer.files);
          return false;
        });
      }

      return $(el);
    },

    /**
     * IconView::_renderList() -- Render the list
     * @return void
     */
    _renderList : function(list, columns) {
      var self = this;

      var x = 0, cl = columns.length;
      var i = 0, l  = list.length;
      var el, b, item;
      var cel;

      this.$element = this._clearRoot(this._createRoot());

      // Figure out what container to use
      var table = false;
      if ( this.type === ICONVIEW_ICON || this.type === ICONVIEW_GRID ) {
        b = this.$element;//.find(".ListWrap");
      } else {
        b = this.$element.find(".TableBody tbody");
        table = true;
      }

      b.empty();


      // Apply table headers
      if ( table ) {
        var hb = this.$element.find(".TableHead tbody").empty();
        for ( i = 0; i < cl; i++ ) {
          cel = columns[i];
          el = $(sprintf("<td class=\"%s\" style=\"%s\"><span>%s</span></td>", cel.className || "", cel.style || "", cel.title || ""));
          hb.append(el);
        }
      }

      // Apply table content
      for ( i = 0; i < l; i++ ) {
        item = list[i];

        if ( this.type === ICONVIEW_ICON || this.type === ICONVIEW_GRID ) {
          el = $("<li><div class=\"Inner\"></div></li>");

          for ( x = 0; x < cl; x++ ) {
            cel = columns[x];
            el.find(".Inner").append(sprintf("<div class=\"%s\" style=\"%s\">%s</div>", cel.className || "", cel.style || "", cel.title || ""));
          }

          el.find(".Inner").click((function(it) {
            return function(ev) {
              ev.preventDefault();
              ev.stopPropagation();

              self._selectItem(ev, $(this), it);
            };
          })(item)).mousedown((function(it) {
            return function(ev) {
              var t = $(ev.target || ev.srcElement);
              if ( !(t.attr("draggable") === "true" || t.closest("*[draggable=true]", t).length) ) {
                ev.preventDefault();
              } else {
                ev.stopPropagation();
              }

              self._toggleItem(ev, $(this), it);
            };
          })(item)).dblclick((function(it) {
            return function(ev) {
              ev.preventDefault();
              ev.stopPropagation();

              self._activateItem(ev, $(this), it);
            };
          })(item));

          el.find(".Inner").bind("contextmenu", (function(it) {
            return function(ev) {
              ev.preventDefault();
              console.log(item);
              self.on_context(ev, $(this), it);
              return false;
            };
          })(item));

        } else {
          el = $("<tr>" + i + "</tr>");

          for ( x = 0; x < cl; x++ ) {
            cel = columns[x];
            el.append($(sprintf("<td class=\"%s\" style=\"%s\">%s</td>", cel.className || "", cel.style || "", cel.title || "")));
          }

          /*if ( item['class'] !== undefined ) {
            el.addClass(item['class']);
          } else {
          }*/
          el.addClass(i % 2 ? "odd" : "even");

          el.click((function(it) {
            return function(ev) {
              ev.preventDefault();
              ev.stopPropagation();

              self._selectItem(ev, $(this), it);
            };
          })(item)).mousedown((function(it) {
            return function(ev) {
              ev.preventDefault();
              //ev.stopPropagation();

              self._toggleItem(ev, $(this), it);
            };
          })(item)).dblclick((function(it) {
            return function(ev) {
              ev.preventDefault();
              ev.stopPropagation();

              self._activateItem(ev, $(this), it);
            };
          })(item));

          el.bind("contextmenu", function(ev) {
            ev.preventDefault();
            self.on_context(ev, $(this), item);
            return false;
          });
        }

        b.append(el);

        this.on_render(el, item, this.type, i);

        // Drag-and-drop
        if ( OSjs.Compability.SUPPORT_DND ) {
          el.attr("draggable", "true");
          el.bind("dragover", function(ev) {
            ev.preventDefault();
            self.on_drag_item_over(ev);
            return false;
          });
          el.bind("dragleave", function(ev) {
            el.removeClass("DND-Enter");
            self.on_drag_item_leave(ev);
            return false;
          });
          el.bind("dragstart", (function(jsn) {
            return function(ev) {
              ev.originalEvent.dataTransfer.setData('text/plain', jsn);
              el.addClass("DND-Active");
              return true;
            };
          })(JSON.stringify(item)));
          el.bind("dragend", function(ev) {
            return false;
          });

          el.bind("drop", (function(dst) {
            return function(ev) {
              var data = ev.originalEvent.dataTransfer.getData("text/plain");
              var jsn = null;
              if ( data ) {
                try {
                  jsn = JSON.parse(data);
                } catch (e) {}
              }

              ev.preventDefault();
              ev.stopPropagation();

              self.on_drop_item(ev, jsn, dst, ev.originalEvent.dataTransfer.files);
              return false;
            };
          })(item));
        }
      }

      setTimeout(function() {
        self.resize();
      }, 0);
    },

    /**
     * IconView::_activateItem() -- Activate an item (internal)
     * @return void
     */
    _activateItem : function(ev, el, item) {
      this.on_activate(el, item);
    },

    /**
     * IconView::_selectItem() -- Select an item (internal)
     * @return void
     */
    _selectItem : function(ev, el, item, no_change) {
      no_change = no_change === undefined ? true : no_change;

      if ( this.$selected ) {
        this.$selected.removeClass("Current");
      }

      if ( el !== this.$selected ) {
        if ( !no_change ) {
          this.on_toggle(ev, el, item);
        }
      }

      if ( el ) {
        this.$selected = el;
        this.$selected.addClass("Current");
      } else {
        this.$selected = null;
      }

    },

    /**
     * IconView::_toggleItem() -- Toggle an item (internal)
     * @return void
     */
    _toggleItem : function(ev, el, item) {
      $(document).click(); // Trigger this! (deselects context-menu)

      this.on_toggle(ev, el, item);

      this._selectItem(ev, el, item, false);
    },

    /**
     * IconView::selectItem() -- Select an item
     * @return void
     */
    selectItem : function(key, value) {
      if ( key && value ) {
        var item = this.findItem(key, value);
        if ( item ) {
          this._selectItem(null, item[0], item[1]);
        }
      } else {
        this._selectItem(null, null, null, false);
      }
    },

    /**
     * IconView::findItem() -- Find an item
     * @return Mixed
     */
    findItem : function(key, value) {

      var test  = this.$element.find(".Info input[name=" + key + "]");
      var el    = null;
      var els   = null;
      var inps  = null;
      var item  = {};
      var found = false;

      for ( var i = 0; i < test.length; i++ ) {
        el = $(test[i]);
        if ( el.val() == value ) {
          if ( this.type === ICONVIEW_ICON || this.type === ICONVIEW_GRID ) {
            els = el.parents("li");
          } else {
            els = el.parents("td");
          }

          inps = els.find("input[type=hidden]");
          for ( var x in inps ) {
            if ( inps.hasOwnProperty(x) ) {
              item[el.attr("name")] = el.val();
            }
          }

          found = [els, item];

          break;
        }
      }

      return found;
    },

    /**
     * IconView::renderList() -- Render the list
     * @return void
     */
    renderList : function(list, columns) {
      if ( list.length ) {
        this._renderList(list, columns);
      }
    },

    /**
     * IconView::refreshList() -- Refresh the list
     * @return void
     */
    refreshList : function() {
      this.renderList(this.list, this.columns);
    },

    /**
     * IconView::setListType() -- Set the list view type
     * @return void
     */
    setListType : function(type, refresh) {
      if ( ICONVIEW_TYPES[type] !== undefined ) {
        type = ICONVIEW_TYPES[type];
      }

      this.type = parseInt(type, 10) || 0;

      if ( refresh === true ) {
        this.refreshList();
      }
    },

    /**
     * IconView::setList() -- Set the list
     * @return void
     */
    setList : function(list, columns, refresh) {
      if ( list instanceof Array ) {
        this.list = list;

        if ( columns instanceof Array ) {
          this.columns = columns;
        }

        if ( refresh === true ) {
          this.setListType(this.type, true);
        }

        return true;
      }

      return false;
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
      var jsn = JSON.parse(evt.target.responseText);
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

})($);
