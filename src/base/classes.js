/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * @package OSjs.Core.Classes
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  /**
   * --OSjs::Classes::OSjsException -- Base Exception
   * @class
   */
  var OSjsException = Class.extend({
    _lineno   : 0,
    _filename : "",
    _message  : "",

    init : function(lineno, filename, message) {
      this._lineno    = parseInt(lineno, 10) || 0;
      this._filename  = filename;
      this._message   = message;
    },

    getLineNo : function() {
      return this._lineno;
    },

    getFilename : function() {
      return this._filename;
    },

    getMessage : function() {
      return this._message;
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
