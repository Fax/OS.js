/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * @package OSjs.Client.Init
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
      "SUPPORT_LSTORAGE"       : (('localStorage'    in window) && window['localStorage']   !== null),
      "SUPPORT_SSTORAGE"       : (('sessionStorage'  in window) && window['sessionStorage'] !== null),
      "SUPPORT_GSTORAGE"       : (('globalStorage'   in window) && window['globalStorage']  !== null),
      "SUPPORT_DSTORAGE"       : (('openDatabase'    in window) && window['openDatabase']   !== null),
      "SUPPORT_SOCKET"         : (('WebSocket'       in window) && window['WebSocket']      !== null),
      "SUPPORT_CANVAS"         : (!!document.createElement('canvas').getContext),
      "SUPPORT_VIDEO"          : (!!document.createElement('video').canPlayType),
      "SUPPORT_AUDIO"          : (!!document.createElement('audio').canPlayType),
      "SUPPORT_AUDIO_OGG"      : (!!document.createElement('audio').canPlayType && !(!!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis'))),
      "SUPPORT_AUDIO_MP3"      : (!!document.createElement('audio').canPlayType && !(!!document.createElement('audio').canPlayType('audio/mpeg'))),
      "SUPPORT_RICHTEXT"       : (!!document.createElement('textarea').contentEditable)
    },

    // Internal namespace containers
    Labels       : { /* ... */ },
    Public       : { /* ... */ },

    // Dynamic namespace containers
    Applications : { /* ... */ },
    Dialogs      : { /* ... */ },
    PanelItems   : { /* ... */ }
  };

  // Labels
  OSjs.Labels = {
    "ApplicationCheckCompabilityMessage"  : "Your browser does not support '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Application name: %s",
    "CrashApplication"                    : "Application '%s' has crashed with error '%s'!",
    "CrashApplicationResourceMessage"     : "One or more of these resources failed to load:\n%s",
    "CrashApplicationResourceStack"       : "[LaunchApplication]API::system::launch()\n  Application: %s\n  Arguments: %s"
  };

  // Application Compability error exceptions
  OSjs.Public.CompabilityErrors = {
    "canvas"          : "<canvas> DOM Element",
    "audio"           : "<audio> DOM Element",
    "ogg"             : "<audio> Does not support OGG/Vorbis",
    "mp3"             : "<audio> Does not support MPEG/MP3",
    "video"           : "<video> DOM Element",
    "localStorage"    : "window.localStorage()",
    "sessionStorage"  : "window.sessionStorage()",
    "globalStorage"   : "window.globalStorage()",
    "databaseStorage" : "window.databaseStorage()",
    "socket"          : "window.WebSocket()",
    "richtext"        : "window.contentEditable (Rich Text Editing)"
  };

  // Browser Compability list
  OSjs.Public.CompabilityLabels = {
    "Local Storage"    : OSjs.Compability.SUPPORT_LSTORAGE,
    "Session Storage"  : OSjs.Compability.SUPPORT_SSTORAGE,
    "Global Storage"   : OSjs.Compability.SUPPORT_GSTORAGE,
    "Database Storage" : OSjs.Compability.SUPPORT_DSTORAGE,
    "Canvas (2D/3D)"   : OSjs.Compability.SUPPORT_CANVAS,
    "Audio"            : OSjs.Compability.SUPPORT_AUDIO,
    "Video"            : OSjs.Compability.SUPPORT_VIDEO,
    "Sockets"          : OSjs.Compability.SUPPORT_SOCKET
  };

})($);

