/*!
 * Application: %CLASSNAME%
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.%CLASSNAME% = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = %LINGUAS%;

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["%DEFAULT_LANGUAGE%"];

    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////

%CODE_GLADE%

    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __%CLASSNAME% = Application.extend({

      init : function() {
        this._super("%CLASSNAME%", argv);
        this._compability = %COMPABILITY%;
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

%CODE_PREPEND%

        this._super(%ROOT_WINDOW%);

%CODE_APPEND%

        // Do your stuff here
      }
    });

    return new __%CLASSNAME%();
  };
})($);

