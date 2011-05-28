/**
 * Application: Terminal
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationTerminal = (function($, undefined) {
  return function(Application, app, api, argv) {
    var _ApplicationTerminal = Application.extend({
      init : function() {
        this._super("ApplicationTerminal");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        var txt = $(el).find("textarea");

        app.focus_hook = function() {
          $(txt).focus();
          var l = $(txt).val().length;
          setSelectionRangeX($(txt).get(0), l, l);
        };

        app.blur_hook = function() {
          $(txt).blur();
        };

        $(txt).val("~/ >");

        this._super();
      }
    });

    return new _ApplicationTerminal();
  };
})($);
