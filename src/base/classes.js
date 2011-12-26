/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * @package OSjs.Core.Classes
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // EXCEPTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OSjs::Classes::OSjsException -- Base Exception
   * @class
   */
  var OSjsException = Class.extend({
    _lineno   : 0,
    _filename : "",
    _message  : "",

    /**
     * OSjsException::init() -- Constructor
     * @constructor
     */
    init : function(lineno, filename, message) {
      this._lineno    = parseInt(lineno, 10) || 0;
      this._filename  = filename;
      this._message   = message;
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
    }
  });

  /**
   * OSjs::Classes::AJAXException -- AJAXException Exception
   * @exception
   */
  OSjs.Classes.AJAXException = OSjsException.extend({
    init : function(lineno, filename, message) {
      this._super(lineno, filename, message);
    }
  });

  /**
   * OSjs::Classes::IOException -- IOException Exception
   * @exception
   */
  OSjs.Classes.IOException = OSjsException.extend({
    init : function(lineno, filename, message) {
      this._super(lineno, filename, message);
    }
  });

  /**
   * OSjs::Classes::ApplicationException -- ApplicationException Exception
   * @exception
   */
  OSjs.Classes.ApplicationException = OSjsException.extend({
    init : function(lineno, filename, message) {
      this._super(lineno, filename, message);
    }
  });

  /**
   * OSjs::Classes::CoreException -- CoreException Exception
   * @exception
   */
  OSjs.Classes.CoreException = OSjsException.extend({
    init : function(lineno, filename, message) {
      this._super(lineno, filename, message);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // ICON VIEW
  /////////////////////////////////////////////////////////////////////////////

  var ICONVIEW_ICON    = 0;
  var ICONVIEW_DETAIL  = 1;

  /**
   * OSjs::Classes::IconView -- IconView Class
   * @class
   */
  OSjs.Classes.IconView = Class.extend({

    type          : -1,                   //!< View Type
    list          : [],                   //!< List
    columns       : [],                   //!< Columns
    $root         : null,                 //!< Root Container DOM Element
    $element      : null,                 //!< View DOM Element
    $selected     : null,                 //!< Selected DOM Element
    on_render     : function() {},        //!< Render item callback function
    on_activate   : function() {},        //!< Activate item callback function
    on_toggle     : function() {},        //!< Toggle item callback function

    /**
     * IconView::init() -- Constructor
     * @constructor
     */
    init : function(root, type, list, columns, on_render, on_activate, on_toggle) {
      this.type       = type || 0;
      this.list       = [];
      this.columns    = [];
      this.$root      = root;
      this.$element   = null;
      this.$selected  = null;

      this.on_render    = on_render   || function() {};
      this.on_activate  = on_activate || function() {};
      this.on_toggle    = on_toggle   || function() {};

      if ( this.setList(list, columns) ) {
        this.renderList(this.list, this.columns);
      }

      var self = this;
      this.$root.bind("mousedown", function(ev) {
        ev.preventDefault();
        $(document).click(); // Trigger this! (deselects context-menu)
        return false;
      }).bind("click", function(ev) {
        ev.preventDefault();
        self._selectItem(ev, null, null, false);
        $(document).click(); // Trigger this! (deselects context-menu)
        return false;
      }).bind("contextmenu", function(ev) {
        ev.preventDefault();
        self._selectItem(ev, null, null, false);
        $(document).click(); // Trigger this! (deselects context-menu)
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
      if ( this.type == ICONVIEW_DETAIL ) {
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
      if ( this.type === ICONVIEW_ICON ) {
        el = $("<ul class=\"ListWrap\"></ul>");
      } else {
        el = $("<div class=\"TableWrap\"><table class=\"TableHead GtkIconViewHeader\"><tbody></tbody></table><div class=\"TableBodyWrap\"><table class=\"TableBody\"><tbody></tbody></table></div></div>");
      }

      el.bind("mousedown", function(ev) {
        ev.preventDefault();
        //ev.stopPropagation();
        return false;
      }).bind("dblclick", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });

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
      if ( this.type === ICONVIEW_ICON ) {
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
          el = $(sprintf("<td class=\"%s\" style=\"%s\">%s</td>", cel.className, cel.style, cel.title));
          hb.append(el);
        }
      }

      // Apply table content
      for ( i = 0; i < l; i++ ) {
        item = list[i];

        if ( this.type === ICONVIEW_ICON ) {
          el = $("<li><div class=\"Inner\"></div></li>");

          for ( x = 0; x < cl; x++ ) {
            cel = columns[x];
            el.find(".Inner").append(sprintf("<div class=\"%s\" style=\"%s\">%s</div>", cel.className, cel.style, cel.title));
          }

          el.find(".Inner").click((function(it) {
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

        } else {
          el = $("<tr>" + i + "</tr>");

          for ( x = 0; x < cl; x++ ) {
            cel = columns[x];
            el.append($(sprintf("<td class=\"%s\" style=\"%s\">%s</td>", cel.className, cel.style, cel.title)));
          }

          if ( item['class'] !== undefined ) {
            el.addClass(item['class']);
          }

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
        }

        b.append(el);


        this.on_render(el, item, this.type, i);

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
      var item = this.findItem(key, value);
      if ( item ) {
        this._selectItem(null, item[0], item[1]);
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
          if ( this.type == ICONVIEW_ICON ) {
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
  // UPLOADING
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OSjs::Classes::Uploader -- Uploader class
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
     * @return void
     */
    upload : function(form) {
      var self = this;

      var xhr = new XMLHttpRequest();
      var fd  = new FormData();
      fd.append("upload", 1);
      fd.append("path", this.dest);
      fd.append("upload", $(form).find("input[type=file]").get(0).files[0]);

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
      this.callback_finished(evt.target.responseText);
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
