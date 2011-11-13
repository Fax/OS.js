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
        var sbar    = this.$element.find("p.Status");
        this.$element.find(".DialogButtons").hide();

        // Create uploader
        var fname = "";
        var fsize = 0;
        var ftype = "";

        try {
          var u = new API.system.uploader(self.upload_path, function(name, size, type) {
            fname = name;
            fsize = size;
            ftype = type;

            pbar.progressbar({ value : 0 });
            sbar.html(sprintf("%s (%s %s)", fname, fsize, ftype));
          }, function(progress) {
            pbar.progressbar({ value : (parseInt(progress, 10) || 0) });
          }, function(response) {
            pbar.progressbar({ value : 100 });
            sbar.html(sprintf("Finished %s (%s)", fname, fsize));

            //alert(sprintf("Finished uploading %s", fname));
            setTimeout(function() {
              self.$element.find(".ActionClose").click();
            }, 100);

            self.clb_finish();
          }, function(error) {
            sbar.html(sprintf("Failed %s", fname));

            alert(sprintf("Failed to upload %s: %s", fname, error));
          });

          // Insert form
          u.form(function(data) {
            if ( data instanceof Object ) {
              if ( data.document ) {
                // Insert form
                var doc = $(data.document);
                self.$element.find(".OperationDialogInner").append(doc);
                self.$element.find("form").get(0).onsubmit = function() {
                  u.upload(self.$element.find("form"));
                  return false;
                };


                u.run(self.$element.find("input[type=file]").get(0));
              }
            }
          });

          this.uploader = u;
        } catch ( eee ) {
          alert("You cannot upload files because an error occured:\n" + eee);
        }
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
