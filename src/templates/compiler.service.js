/*!
 * Service: %CLASSNAME%
 *
 * @package OSjs.Packages
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Packages.%CLASSNAME% = (function($, undefined) {

  var _LINGUAS = %LINGUAS%;

  /**
   * @param Service       Service             Service API Reference
   * @param API           API                 Public API Reference
   * @param Object        argv                Launch arguments (like cmd)
   */
  return function(Service, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["%DEFAULT_LANGUAGE%"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Service Class
     * @class
     */
    var __%CLASSNAME% = Service.extend({

      init : function() {
        this._super("%CLASSNAME%", "%ICON%");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        this._super();
      }
    });

    return new __%CLASSNAME%();
  };
})($);

