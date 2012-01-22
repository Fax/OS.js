/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * Copyright (c) 2011, Anders Evenrud
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package OSjs.Core.Init
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
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

  console.group("init.js");

  var video_supported = !!document.createElement('video').canPlayType;
  var audio_supported = !!document.createElement('audio').canPlayType;
  var upload_supported = false;

  try {
    var xhr = new XMLHttpRequest();
    upload_supported = (!! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)));
  } catch ( eee ) {}

  //
  // Main OS.js namespace
  //
  window.OSjs =
  {
    // Compability
    Compability : {
      "SUPPORT_UPLOAD"         : (upload_supported),
      "SUPPORT_LSTORAGE"       : (('localStorage'    in window) && window['localStorage']   !== null),
      "SUPPORT_SSTORAGE"       : (('sessionStorage'  in window) && window['sessionStorage'] !== null),
      "SUPPORT_GSTORAGE"       : (('globalStorage'   in window) && window['globalStorage']  !== null),
      "SUPPORT_DSTORAGE"       : (('openDatabase'    in window) && window['openDatabase']   !== null),
      "SUPPORT_SOCKET"         : (('WebSocket'       in window) && window['WebSocket']      !== null),
      "SUPPORT_WORKER"         : (('Worker'          in window) && window['Worker']         !== null),
      "SUPPORT_CANVAS"         : (!!document.createElement('canvas').getContext),
      "SUPPORT_WEBGL"          : false,
      "SUPPORT_CANVAS_CONTEXT" : [],

      // http://www.w3.org/TR/html5/video.html
      "SUPPORT_VIDEO"          : (video_supported),
      "SUPPORT_VIDEO_WEBM"     : (video_supported && !!document.createElement('video').canPlayType('video/webm; codecs="vp8.0, vorbis"')),
      "SUPPORT_VIDEO_OGG"      : (video_supported && !!document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"')),
      "SUPPORT_VIDEO_MPEG"     : (video_supported && !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.4D401E, mp4a.40.2"')),    // H.264 Main profile video level 3 and Low-Complexity AAC audio in MP4 container
      "SUPPORT_VIDEO_MKV"      : (video_supported && !!document.createElement('video').canPlayType('video/x-matroska; codecs="theora, vorbis"')),
      "SUPPORT_AUDIO"          : (audio_supported),
      "SUPPORT_AUDIO_OGG"      : (audio_supported && !!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis')),
      "SUPPORT_AUDIO_MP3"      : (audio_supported && !!document.createElement('audio').canPlayType('audio/mpeg')),
      "SUPPORT_RICHTEXT"       : (!!document.createElement('textarea').contentEditable)
    },

    // Internal namespace containers
    Labels       : { /* ... */ },
    Public       : { /* ... */ },

    // Dynamic namespace containers
    Applications : { /* ... */ }, // @see core.js,Application.class.php - Dynamic
    Dialogs      : { /* ... */ }, // @see core,Dialog.class.php.js - Dynamic
    PanelItems   : { /* ... */ }, // @see core.js,Panel.class.php - Dynamic
    Classes      : { /* ... */ }  // @see classes.js
  };

  // Compability cont.
  if ( OSjs.Compability.SUPPORT_CANVAS ) {
    var test = ["2d", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for ( var i = 0; i < test.length; i++ ) {
      var canv = document.createElement('canvas');
      try {
        if ( !!canv.getContext(test[i]) ) {
          OSjs.Compability.SUPPORT_CANVAS_CONTEXT.push(test[i]);
          if ( i > 0 ) {
            OSjs.Compability.SUPPORT_WEBGL = true;
          }
        }
      } catch ( eee ) {}

      delete canv;
    }
    delete test;
    delete i;
  }

  // Misc
  OSjs.Public.ENV = ((window.location.hostname.toLowerCase() == "OSjs.local") ? "dev" : "prod");

  // Labels
  OSjs.Labels = {
    "ApplicationCheckCompabilityMessage"  : "Your browser does not support '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Application name: %s",
    "CrashApplication"                    : "Application '%s' has crashed with error '%s'!",
    "CrashApplicationResourceMessage"     : "One or more of these resources failed to load:\n%s",
    "CrashApplicationResourceStack"       : "[LaunchApplication]API::system::launch()\n  Application: %s\n  Arguments: %s",
    "CrashDialogTitleApplication"         : "Application '%s' crashed!",
    "CrashApplicationOpen"                : "Cannot open '%s' with MIME '%s' in this application",
    "CrashDialogTitleProcess"             : "Process '%s' crashed!",
    "InitLaunchError"                     : "Cannot launch '%s'.\nMaximum allowed processes are: %d",
    "WindowManagerMissing"                : "Cannot perform this operation because the Window Manager is not running.",
    "WentOffline"                         : "Seems like you went offline. Please re-connect to continue using OS.js",
    "WentOnline"                          : "You are now back on-line!",
    "Quit"                                : "Are you sure you want to quit? To save your session use the Logout functionallity.",
    "PanelItemRemove"                     : "Are you sure you want to remove this item?",
    "WebWorkerError"                      : "An error occured while processing WebWorker script '%s' on line %d",
    "StorageWarning"                      : "Warning! You're running out of local storage space (%d of %d)",
    "StorageAlert"                        : "Warning! You have reached the maximum storage limit (%d of %d)",
    "CrashEvent"                          : "An error occured while handling AJAX Event: ",
    "CrashEventTitle"                     : "An operation in '%s' has failed!",
    "ContextMenuPanel"                    : {
      "title"     : "Panel",
      "add"       : "Add new item",
      "create"    : "New panel",
      "remove"    : "Remove panel"
    },
    "ContextMenuDesktop"                  : {
      "title"     : "Desktop",
      "wallpaper" : "Change Wallpaper",
      "sort"      : "Tile Windows"
    },
    "ContextMenuWindowMenu"               : {
      "max"     : "Maximize",
      "min"     : "Minimize",
      "restore" : "Restore",
      "show"    : "Show",
      "ontop"   : "Always on top",
      "same"    : "Same as other windows",
      "close"   : "Close"
    },
    "DialogTitles"                        : {
      "info"      : "Information",
      "error"     : "Error",
      "question"  : "Question",
      "confirm"   : "Confirm",
      "warning"   : "Warning",
      "default"   : "Dialog"
    }
  };

  // Application Compability error exceptions
  OSjs.Public.CompabilityErrors = {
    "canvas"          : "<canvas> Context (2d)",
    "webgl"           : "<canvas> WebGL Context (3d)",
    "audio"           : "<audio> DOM Element",
    "audio_ogg"       : "<audio> Does not support OGG/Vorbis",
    "audio_mp3"       : "<audio> Does not support MPEG/MP3",
    "video"           : "<video> DOM Element",
    "video_webm"      : "<video> Does not support VP8/WebM",
    "video_ogg"       : "<video> Does not support OGG/Vorbis",
    "video_mpeg"      : "<video> Does not support MP4/MPEG/h264",
    "video_mkv"       : "<video> Does not support MKV",
    "localStorage"    : "window.localStorage()",
    "sessionStorage"  : "window.sessionStorage()",
    "globalStorage"   : "window.globalStorage()",
    "databaseStorage" : "window.databaseStorage()",
    "socket"          : "window.WebSocket()",
    "richtext"        : "window.contentEditable (Rich Text Editing)",
    "upload"          : "Asynchronous Uploads",
    "worker"          : "Web Workers"
  };

  // Compability mapping
  OSjs.Public.CompabilityMapping = {
    "canvas"          : OSjs.Compability.SUPPORT_CANVS,
    "webgl"           : OSjs.Compability.SUPPORT_WEBGL,
    "audio"           : OSjs.Compability.SUPPORT_AUDIO,
    "audio_ogg"       : OSjs.Compability.SUPPORT_AUDIO_OGG,
    "audio_mp3"       : OSjs.Compability.SUPPORT_AUDIO_MP3,
    "video"           : OSjs.Compability.SUPPORT_VIDEO,
    "video_webm"      : OSjs.Compability.SUPPORT_VIDEO_WEBM,
    "video_ogg"       : OSjs.Compability.SUPPORT_VIDEO_OGG,
    "video_mpeg"      : OSjs.Compability.SUPPORT_VIDEO_MPEG,
    "video_mkv"       : OSjs.Compability.SUPPORT_VIDEO_MKV,
    "localStorage"    : OSjs.Compability.SUPPORT_LSTORAGE,
    "sessionStorage"  : OSjs.Compability.SUPPORT_SSTORAGE,
    "globalStorage"   : OSjs.Compability.SUPPORT_GSTORAGE,
    "databaseStorage" : OSjs.Compability.SUPPORT_DSTORAGE,
    "socket"          : OSjs.Compability.SUPPORT_SOCKET,
    "richtext"        : OSjs.Compability.SUPPORT_RICHTEXT,
    "upload"          : OSjs.Compability.SUPPORT_UPLOAD,
    "worker"          : OSjs.Compability.SUPPORT_WORKER
  };

  // Browser Compability list
  OSjs.Public.CompabilityLabels = {
    "Local Storage"    : OSjs.Compability.SUPPORT_LSTORAGE,
    "Session Storage"  : OSjs.Compability.SUPPORT_SSTORAGE,
    "Global Storage"   : OSjs.Compability.SUPPORT_GSTORAGE,
    "Database Storage" : OSjs.Compability.SUPPORT_DSTORAGE,
    "Canvas"           : OSjs.Compability.SUPPORT_CANVAS,
    "WebGL"            : OSjs.Compability.SUPPORT_WEBGL,
    "Audio"            : OSjs.Compability.SUPPORT_AUDIO,
    "Video"            : OSjs.Compability.SUPPORT_VIDEO,
    "Sockets"          : OSjs.Compability.SUPPORT_SOCKET,
    "Async Upload"     : OSjs.Compability.SUPPORT_UPLOAD,
    "Web Workers"      : OSjs.Compability.SUPPORT_WORKER
  };

  // File-extension => MIME types
  OSjs.Public.FileExtensions = { // TODO
    "avi" : "video/avi",
    "mp4" : "video/mp4",
    "webm": "video/webm",
    "ogv" : "video/ogg",
    "mpg" : "video/mpeg",
    "mpeg": "video/mpeg",
    "flv" : "video/flv",
    "mkv" : "video/matroska",

    "mp3" : "audio/mp3",
    "ogg" : "audio/ogg",
    "wav" : "audio/wav",
    "flac": "audio/flac",
    "aac" : "audio/aac",

    "png" : "image/png",
    "jpg" : "image/jpg",
    "jpeg": "image/jpeg",
    "bmp" : "image/bmp",
    "svg" : "image/svg"
  };

  console.group("OSjs Namespace");
    console.log(OSjs);
    console.group("Inited settings");
      console.log("Compability", OSjs.Compability);
      console.log("Language", OSjs.Labels);
      console.log("Public", OSjs.Public);
    console.groupEnd();
  console.groupEnd();

  console.groupEnd();

})($);

