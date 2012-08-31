/*!
 * PanelItem: %CLASSNAME%
 *
 * @package OSjs.Packages
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Packages.%CLASSNAME% = (function($, undefined) {

  var _LINGUAS = %LINGUAS%;

  /**
   * @param PanelItem     PanelItem           PanelItem API Reference
   * @param Panel         panel               Panel Instance Reference
   * @param API           API                 Public API Reference
   * @param Object        argv                Launch arguments (like cmd)
   */
  return function(PanelItem, panel, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["%DEFAULT_LANGUAGE%"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main PanelItem Class
     * @class
     */
    var __%CLASSNAME% = PanelItem.extend({

      init : function() {
        this._super("%CLASSNAME%");
      },

      destroy : function() {
        this._super();
      },

      create : function(pos) {
        var ret = this._super(pos);
        // Do your stuff here

        return ret;
      }
    });

    return new __%CLASSNAME%();
  };
})($);

