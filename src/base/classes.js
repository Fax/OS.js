/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * @package OSjs.Core.Classes
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  /**
   * OSjs::Classes::Uploader -- Uploader class
   * @class
   */
  OSjs.Classes.Uploader = Class.extend({
    // http://www.matlus.com/html5-file-upload-with-progress/

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

    destroy : function() {
      var self = this;

      if ( this.xhr ) {
        this.xhr.removeEventListener("load", function(evt) { self.uploadComplete(evt); }, false);
        this.xhr.removeEventListener("error", function(evt) { self.uploadFailed(evt); }, false);
        this.xhr.removeEventListener("abort", function(evt) { self.uploadCanceled(evt); }, false);

        this.xhr = null;
      }
    },

    form : function(callback) {
      $.post(this.uri, {'upload' : true, 'action' : "upload_form"}, function(data) {
        callback(JSON.parse(data));
      });
    },

    run : function(file) {
      var self = this;
      file.onchange = function(evt) {
        self.fileSelected(evt, file.files[0]);
      };
    },

    upload : function(form) {
      var self = this;

      var xhr = new XMLHttpRequest();
      var fd  = new FormData();
      fd.append("upload", 1);
      fd.append("path", this.dest);
      fd.append("upload", form.find("input[type=file]").get(0).files[0]);

      xhr.upload.addEventListener("progress", function(evt) { self.uploadProgress(evt); }, false);
      xhr.addEventListener("load", function(evt) { self.uploadComplete(evt); }, false);
      xhr.addEventListener("error", function(evt) { self.uploadFailed(evt); }, false);
      xhr.addEventListener("abort", function(evt) { self.uploadCanceled(evt); }, false);
      xhr.open("POST", this.uri);
      xhr.send(fd);

      this.xhr = xhr;
    },

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

    uploadProgress : function(evt) {
      if ( evt.lengthComputable ) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        this.callback_progress(percentComplete.toString() + '%');
      } else {
        this.callback_progress("Unknown");
      }
    },

    uploadComplete : function(evt) {
      this.callback_finished(evt.target.responseText);
    },

    uploadFailed : function(evt) {
      this.callback_failed("There was an error attempting to upload the file.");
    },

    uploadCanceled : function(evt) {
      this.callback_failed("The upload has been canceled by the user or the browser dropped the connection.");
    }

  });

})($);
