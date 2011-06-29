/**
 * OperationDialog: UploadOperationDialog
 * Upload file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var UploadOperationDialog = (function($, undefined) {
  return function(OperationDialog, API, argv) {

    var _UploadOperationDialog = OperationDialog.extend({
      init : function(path, clb_finish, clb_progress, clb_cancel) {
        this.uploader = null;
        this.upload_path  = path;
        this.clb_finish   = clb_finish   || function() {};
        this.clb_progress = clb_progress || function() {};
        this.clb_cancel   = clb_cancel   || function() {};

        this._super("Upload");
        this._title    = "Upload file";
        this._icon     = "actions/up.png";
        this._content  = $("#OperationDialogUpload").html();
        this._width    = 400;
        this._height   = 180;
      },

      create : function(id, mcallback) {
        this._super(id, mcallback);

        var self = this;
        $(this.$element).find(".ProgressBar").progressbar({
          value : 0
        });

        var trigger = this.$element.find(".DialogButtons .Choose").show();
        var pbar    = this.$element.find(".ProgressBar");

        this.uploader = new qq.FileUploader({
          element : trigger[0],
          action  : '/',
          params : {
            ajax   : true,
            action : 'upload',
            path : self.upload_path
          },
          onSubmit: function(id, fileName){
            $(trigger).html(fileName);
            self.$element.find("p.Status").html(sprintf("Uploading '%s'", fileName));
            return true;
          },
          onProgress: function(id, fileName, loaded, total){
            var percentage = Math.round(loaded / total * 100);
            $(pbar).progressbar({
              value : percentage
            });

            self.$element.find("p.Status").html(sprintf("Uploading '%s' %d of %d (%d%%)", fileName, loaded, total, percentage));
            self.clb_progress(fileName, loaded, total, percentage);
          },
          onComplete: function(id, fileName, responseJSON){
            self.$element.find(".ActionClose").click();

            self.clb_finish(fileName, responseJSON);
          },
          onCancel: function(id, fileName){
            API.system.dialog("error", "File upload '" + fileName + "' was cancelled!");
            self.$element.find(".ActionClose").click();

            self.clb_cancel(fileName);
          }
        });
      },

      destroy : function() {
        if ( this.uploader ) {
          this.uploader = null;
        }

        this._super();
      }
    });

    return construct(_UploadOperationDialog, argv);
  };
})($);
