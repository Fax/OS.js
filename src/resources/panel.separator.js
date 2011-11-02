/*!
 * PanelItem: Separator
 *
 * @package OSjs.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.PanelItems.PanelItemSeparator = (function($, undefined) {
  "$:nomunge";

  return function(_PanelItem, panel, api, argv) {
    "_PanelItem:nomunge, panel:nomunge, api:nomunge, argv:nomunge";

    var _PanelItemSeparator = _PanelItem.extend({
      init : function() {
        this._super("PanelItemSeparator");
        this._named = "Separator";
      },

      create : function(pos) {
        return this._super(pos);
      },


      destroy : function() {
        this._super();
      }
    });

    return construct(_PanelItemSeparator, argv);
  };
})($);
