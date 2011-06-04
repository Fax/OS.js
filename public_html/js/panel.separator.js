/**
 * PanelItem: Separator
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemSeparator = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
    var _PanelItemSeparator = _PanelItem.extend({
      init : function() {
        this._super("PanelItemSeparator");
        this.named = "Separator";
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
