/**
 * PanelItem: CLASSNAME
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemCLASSNAME = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
    var _PanelItemCLASSNAME = _PanelItem.extend({
      init : function() {
        this._super("PanelItemCLASSNAME");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        this._super();
      }
    });

    return construct(_PanelItemCLASSNAME, argv);
  };
})($);
