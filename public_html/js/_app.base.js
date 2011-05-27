/**
 * Application: CLASSNAME
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationCLASSNAME = (function($, undefined) {
  return function(Application, app, api, argv) {
    var _ApplicationCLASSNAME = Application.extend({
      init : function() {
        this._super("ApplicationCLASSNAME");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;

        this._super();
      }
    });

    return new _ApplicationCLASSNAME();
  };
})($);
