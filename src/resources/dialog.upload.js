/*!
 * OperationDialog: UploadOperationDialog
 * Upload file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Dialogs.UploadOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

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

        var pbar    = this.$element.find(".ProgressBar");
        this.$element.find(".DialogButtons").hide();

        // Create uploader
        var u = new API.system.uploader();
        u.form(function(data) {
          if ( data instanceof Object ) {
            if ( data.document ) {
              // Insert form
              var doc = $(data.document);
              self.$element.find(".OperationDialogInner").append(doc);

              // Cancel button
              doc.find(".CancelForm").get(0).onsubmit = function(ev) {
                ev = ev || window.event;
                if ( u.interval ) {
                  u.clearInterval();

                  self.$element.find(".FileForm").find("input[type=submit]").attr("disabled", false);
                  self.$element.find(".CancelForm").find("input[type=submit]").attr("disabled", true);
                }
              };
              self.$element.find(".CancelForm").find("input[type=submit]").attr("disabled", true);

              // Upload button
              doc.find(".FileForm").get(0).onsubmit = function(ev) {
                ev = ev || window.event;

                self.$element.find(".FileForm").find("input[type=submit]").attr("disabled", true);
                self.$element.find(".CancelForm").find("input[type=submit]").attr("disabled", false);

                u.interval = setInterval(function() {
                  u.progress(function(pdata) {
                    // Progress could not be found, cancel
                    if ( pdata === false || pdata === "false" ) {
                      self.$element.find(".FileForm").find("input[type=submit]").attr("disabled", false);
                      self.$element.find(".CancelForm").find("input[type=submit]").attr("disabled", true);

                      alert("The upload operation was cancelled. Could not get status");
                      u.cancel(function() {});
                      u.clearInterval();
                      return;
                    }

                    // Handle progress data
                    console.log(pdata);
                  });
                }, 200);
              };
            }
          }
        });

        this.uploader = u;
      },

      destroy : function() {
        if ( this.uploader ) {
          this.uploader.destroy();
          this.uploader = null;
        }

        this._super();
      }
    });

    return construct(_UploadOperationDialog, argv);
  };
})($);
