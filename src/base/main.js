/*!
 * OS.js - JavaScript Operating System - Core File
 *
 * @package OSjs.Core.Main
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  //
  // Main program
  //

  /**
   * window::unload()
   * @see    main.js
   * @return bool
   */
  $(window).unload(function() {
    window.onbeforeunload = null;
    return OSjs.__Stop();
  });

  /**
   * window::ready()
   * @see    main.js
   * @return bool
   */
  $(window).ready(function() {
    if ( !OSjs.Compability.SUPPORT_LSTORAGE ) {
      alert("Your browser does not support WebStorage. Cannot continue...");
      return false;
    }

    return OSjs.__Run();
  });

  /**
   * window::onbeforeunload()
   * @see    main.js
   * @return bool
   */
  window.onbeforeunload = function(ev) {
    return OSjs.__Leave(ev);
  };

})($);

