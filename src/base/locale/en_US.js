/*!
 * OS.js - JavaScript Operating System - Translation (en_US - UTF8)
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
 * @package OSjs.Core.Locale
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
(function($, undefined) {

  // Labels
  OSjs.Labels = {
    "ApplicationCheckCompabilityMessage"  : "Your browser does not support '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Application name: %s",
    "CrashApplication"                    : "Application '%s' has crashed with error '%s'!",
    "CrashApplicationResourceMessage"     : "One or more of these resources failed to load:\n%s",
    "CrashApplicationResourceStack"       : "[LaunchApplication]API::system::launch()\n  Application: %s\n  Arguments: %s",
    "CrashApplicationOpen"                : "Cannot open '%s' with MIME '%s' in this application",
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

  /////////////////////////////////////////////////////////////////////////////
  // DIALOGS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Labels.ColorOperationDialog = {
    "title" : "Choose color..."
  };

  OSjs.Labels.CopyOperationDialog = {
    "title" : "Copy file"
  };

  OSjs.Labels.CrashDialog = {
    "title"       : "Application '%s' crashed!",
    "title_proc"  : "Process '%s' crashed!"
  };

  OSjs.Labels.FileOperationDialog = {
    "title_saveas"    : "Save As...",
    "title_open"      : "Open File",
    "protected_file"  : "This file is protected!",
    "overwrite"       : "Are you sure you want to overwrite this file?"
  };

  OSjs.Labels.FontOperationDialog = {
    "title"   : "Font dialog"
  };

  OSjs.Labels.InputOperationDialog = {
    "title"   : "Input dialog",
    "missing_value" : "A value is required!"
  };

  OSjs.Labels.LaunchOperationDialog = {
    "title"     : "Select an application",
    "not_found" : "Found no suiting application for this MIME type.",
    "found"     : "Found multiple application supporting this MIME type:"
  };

  OSjs.Labels.PanelItemOperationDialog = {
    "title"     : "Configure"
  };

  OSjs.Labels.FilePropertyOperationDialog = {
    "title"     : "File properties",
    "empty"     : "No information could be gathered."
  };

  OSjs.Labels.RenameOperationDialog = {
    "title"     : "Rename file",
    "empty"     : "A filename is required!"
  };

  OSjs.Labels.UploadOperationDialog = {
    "title"       : "Upload file",
    "finished"    : "Finished",
    "failed"      : "Failed",
    "failed_str"  : "Failed to upload",
    "upload"      : "Upload",
    "choose_file" : "You need to choose a file first!",
    "error"       : "You cannot upload files because an error occured:\n"
  };

  OSjs.Labels.CompabilityDialog = {
    "title"         : "Browser compability",
    "supported"     : "Supported",
    "partially"     : "Partially supported",
    "no_upload"     : "You will not be able to upload any files into the filesystem because 'Async Upload' is not supported.",
    "no_work"       : "Some applications uses Web Workers to handle intensive operations to decrease processing times.",
    "no_gl"         : "No 3D (OpenGL) content can be desplayed as WebGL is not supported. (Check your browser documentation)",
    "browser_unsup" : "Glade CSS style problems occurs in IE and Opera for &lt;table&gt; elements.",
    "browser_ie"    : "IE is lacking some CSS effects and HTML5/W3C features.",
    "browser_touch" : "Your device is not fully supported due to lacking Touch support.",
    "browser_supp"  : "Your browser does not have any known problems.",
    "notes"         : "Please note that:",
    "footnote"      : "This message will only be showed once!"
  };

  /////////////////////////////////////////////////////////////////////////////
  // PANEL ITEMS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Labels.PanelItemClock = {
    "title" : "Clock"
  };

  OSjs.Labels.PanelItemDock = {
    "title" : "Launcher Dock"
  };

  OSjs.Labels.PanelItemMenu = {
    "title"       : "Launcher Menu",
    "menu_title"  : "Launch Application",
    "cat"         : {
      "development" : "Development",
      "games"       : "Games",
      "gfx"         : "Graphics",
      "office"      : "Office",
      "net"         : "Internet",
      "media"       : "Multimedia",
      "sys"         : "System",
      "util"        : "Utilities",
      "other"       : "Unknown"
    }
  };

  OSjs.Labels.PanelItemSeparator = {
    "title"   : "Separator"
  };

  OSjs.Labels.PanelItemWeather = {
    "title"       : "Weather",
    "loading"     : "Loading...",
    "no_data"     : "No Weather data",
    "no_support"  : "Not supported!",
    "reload"      : "Reload"
  };

  OSjs.Labels.PanelItemWindowList = {
    "title" : "Window List"
  };

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATIONS
  /////////////////////////////////////////////////////////////////////////////


})();
