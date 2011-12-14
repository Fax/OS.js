/*!
 * OperationDialog: FilePropertyOperationDialog
 * Used for Open and Save operations.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Dialogs.FilePropertyOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _FilePropertyOperationDialog = OperationDialog.extend({
      init : function(filename, clb_finish) {
        this.filename      = filename;
        this.clb_finish    = clb_finish   || function() {};

        this._super("FileProperties");
        this._title        = "File properties";
        this._icon         = "actions/document-properties.png";
        this._content      = $("#OperationDialogFileProperties").html();
        this._is_resizable = true;
        this._width        = 400;
        this._height       = 400;
        this._gravity      = "center";
      },

      create : function(id, mcallback) {
        var self = this;

        this._super(id, mcallback);

        API.system.call("fileinfo", this.filename, function(result, error) {
          if ( !error && result ) {
            console.log(result);
            console.log(self.$element.find("table"));
            self.$element.find(".TDName").html(result.filename);
            self.$element.find(".TDPath").html(result.path);
            self.$element.find(".TDSize").html(result.size);
            self.$element.find(".TDMIME").html(result.mime);

            var infoel = self.$element.find(".TDInfo pre");
            if ( result.info instanceof Object ) {
              var html = "";
              for ( var x in result.info ) {
                if ( result.info.hasOwnProperty(x) ) {
                  html += (x + ": " + result.info[x] + "\n");
                }
              }
              infoel.html(html);
            } else {
              infoel.html("No information could be gathered.");
            }
          }
        });

        //this.$element.find(".DialogButtons .Close").hide();
        //this.$element.find(".DialogButtons .Cancel").show();

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          self.clb_finish();
        });

      }
    });

    return construct(_FilePropertyOperationDialog, argv);
  };
})($);
