/*!
 * OperationDialog: PanelItemOperationDialog
 * Used for Open and Save operations.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _PanelItemOperationDialog = OperationDialog.extend({
      init : function(item, clb_create, clb_finish, title, copy) {
        this.item         = item         || null;
        this.type         = item._named === undefined ? "panel" : "item";
        this.clb_finish   = clb_finish   || function() {};
        this.clb_create   = clb_create   || function() {};

        this._super("PanelItem");
        this._title    = title || "Configure " + this.type;
        this._content  = (copy || $("#OperationDialogPanelItem")).html();
        this._width    = 400;
        this._height   = 340;
        this._gravity  = "center";

        if ( this.type == "panel" ) {
          this._icon    = "categories/applications-utilities.png";
        }
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);
        this.clb_create(self);
      }
    });

    return construct(_PanelItemOperationDialog, argv);
  };
})($);
