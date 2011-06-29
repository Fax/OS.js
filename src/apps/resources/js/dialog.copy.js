/**
 * OperationDialog: CopyOperationDialog
 * Status dialog for copy/move operations for files
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var CopyOperationDialog = (function($, undefined) {
  return function(OperationDialog, API, argv) {

    var _CopyOperationDialog = OperationDialog.extend({
      init : function(src, dest, clb_finish, clb_progress, clb_cancel) {
        this.src          = src          || null;
        this.dest         = dest         || null;
        this.clb_finish   = clb_finish   || function() {};
        this.clb_progress = clb_progress || function() {};
        this.clb_cancel   = clb_cancel   || function() {};

        this._super("Copy");
        this._title    = "Copy file";
        this._content  = $("#OperationDialogCopy").html();
        this._width    = 400;
        this._height   = 170;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        $(this._content).find(".ProgressBar").progressbar({
          value : 50
        });
      }
    });

    return construct(_CopyOperationDialog, argv);
  };
})($);
