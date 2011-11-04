/*!
 * JavaScript [Namespace] Initialization
 *
 * @package OSjs.Client.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  //
  // Override for browsers without console
  //
  if (!window.console) console = {log:function() {}, info:function(){}, error:function(){}};
  if ( !window.console.group ) {
    window.console.group = function() { console.log(arguments); };
  }
  if ( !window.console.groupEnd ) {
    window.console.groupEnd = function() { console.log(arguments); };
  }

  //
  // Main OS.js namespace
  //
  window.OSjs =
  {
    // Compability
    Compability : {
      SUPPORT_LSTORAGE : (('localStorage' in window) && window['localStorage'] !== null),
      SUPPORT_SSTORAGE : (('sessionStorage' in window) && window['sessionStorage'] !== null),
      SUPPORT_GSTORAGE : (('globalStorage' in window) && window['globalStorage'] !== null),
      SUPPORT_DSTORAGE : (('openDatabase' in window) && window['openDatabase'] !== null),
      SUPPORT_CANVAS   : (!!document.createElement('canvas').getContext),
      SUPPORT_VIDEO    : (!!document.createElement('video').canPlayType),
      SUPPORT_AUDIO    : (!!document.createElement('audio').canPlayType),
      SUPPORT_SOCKET   : ('WebSocket' in window && window['WebSocket'] !== null),
      SUPPORT_RICHTEXT : (!!document.createElement('textarea').contentEditable)
    },

    // Dynamic namespace containers
    Applications : { /* ... */ },
    Dialogs      : { /* ... */ },
    PanelItems   : { /* ... */ }
  };

  //
  // Main program
  //

  /**
   * window::unload()
   */
  $(window).unload(function() {
    return window.OSjs.__Stop();
  });

  /**
   * window::ready()
   */
  $(window).ready(function() {
    if ( !window.OSjs.Compability.SUPPORT_LSTORAGE ) {
      alert("Your browser does not support WebStorage. Cannot continue...");
      return false;
    }

    return window.OSjs.__Run();
  });

})($);

