/*!
 * OperationDialog: RenameOperationDialog
 * Rename file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var RenameOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _RenameOperationDialog = OperationDialog.extend({
      init : function(src, clb_finish) {
        this.src          = src          || null;
        this.clb_finish   = clb_finish   || function() {};

        this._super("Rename");
        this._title    = "Copy file";
        this._content  = $("#OperationDialogRename").html();
        this._width    = 200;
        this._height   = 100;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var txt = this.$element.find(".OperationDialog input");
        txt.val(this.src);

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          var val = txt.val();
          if ( !val ) {
            alert("A filename is required!"); // FIXME
            return;
          }
          self.clb_finish(val);
        });

        $(txt).keydown(function(ev) {
          var keyCode = ev.which || ev.keyCode;
          if ( keyCode == 13 ) {

            self.$element.find(".DialogButtons .Ok").click();
            return false;
          }
          return true;
        });


        txt.focus();
        var tmp = txt.val().split(".");
        var len = 0;
        if ( tmp.length > 1 ) {
          tmp.pop();
          len = tmp.join(".").length;
        } else {
          len = tmp[0].length;
        }
        setSelectionRangeX(txt.get(0), 0, len);
      }
    });

    return construct(_RenameOperationDialog, argv);
  };
})($);
