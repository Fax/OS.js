/*!
 * OS.js - JavaScript Operating System - Translation (en_US - UTF8)
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
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
    "FirstRun"                            : {
      "title"   : "Welcome to OS.js",
      "message" : "This is just a demonstration version"
    },
    "SessionRestore" : {
      "title"   : "Session change",
      "message" : "A previous session was restored"
    },
    "DoPostOffline"                       : "Cannot perform this operation when off-line!",
    "DoPostInvalid"                       : "Session error. Cannot perform this operation!",
    "GlobalOfflineTitle"                  : "Unexpected Error",
    "GlobalOfflineMessage"                : "You have lost your server session.<br />This may cause errors, and you should restart!.",
    "GlobalOfflineWarningTitle"           : "Warning",
    "GlobalOfflineInfoTitle"              : "Information",
    "LoginConfirm"                        : "You are already logged in, are you sure you want to continue?",
    "LoginFailure"                        : "Failed to log in: %s",
    "LoginFailureOther"                   : "A system error occured while logging in, please try again.",
    "CreateLoginFailure"                  : "Failed to create user: %s",
    "CreateLoginFailureOther"             : "A system error occured while creating user, please try again.",
    "CannotStart"                         : "Your browser does not support WebStorage. Cannot continue...",
    "ApplicationCheckCompabilityMessage"  : "Your browser does not support '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Application name: %s",
    "CrashProcess"                        : "Process '%s' has crashed with error '%s'!",
    "CrashLaunchResourceMessage"          : "One or more of these resources failed to load:\n%s",
    "CrashLaunchResourceStack"            : "[%s]API::system::launch()\n  Process: %s\n  Arguments: %s",
    "CrashApplicationOpen"                : "Cannot open '%s' with MIME '%s' in this application",
    "CrashProcessResource"                : "This may be due to a missing file or a syntax error in a resource.",
    "ErrorLaunchString"                   : "Cannot launch '%s'. Invalid operation!",
    "InitLaunchError"                     : "Cannot launch '%s'.\nMaximum allowed processes are: %d",
    "InitLaunchNotFound"                  : "Cannot launch '%s'.\nThe package is not installer or enabled",
    "WindowManagerMissing"                : "Cannot perform this operation because the Window Manager is not running.",
    "WentOffline"                         : "Seems like you went offline. Please re-connect to continue using OS.js",
    "WentOnline"                          : "You are now back on-line!",
    "SessionFailure"                      : "Your session has been unexpectedly ended!",
    "Quit"                                : "Are you sure you want to quit? To save your session use the Logout functionallity.",
    "PanelItemRemove"                     : "Are you sure you want to remove this item?",
    "WebWorkerError"                      : "An error occured while processing WebWorker script '%s' on line %d",
    "StorageWarning"                      : "Warning! You're running out of local storage space (%d of %d)",
    "StorageAlert"                        : "Warning! You have reached the maximum storage limit (%d of %d)",
    "CrashEvent"                          : "An error occured while handling AJAX Event: ",
    "CrashEventTitle"                     : "An operation in '%s' has failed!",
    "CrashDesktopIconView"                : "An error occured while creating desktop IconView!",
    "CrashPanelCreate"                    : "An error occured while creating panels!",
    "CrashPanelStart"                     : "An error occured while starting the panels!",
    "CrashSessionRestore"                 : "Cannot restore your session because the initialization failed!",
    "CrashCoreRunService"                 : "Cannot start '%s' because of an error during startup: %s",
    "SettingsNotifyTitle"                 : "System Settings",
    "SettingsNotifyFailSave"              : "Failed to save settings",
    "SettingsNotifySave"                  : "Your settings was saved",
    "SettingsNotifyFailSaveServer"        : "Failed to save settings (server error)",
    "DesktopGridHeader"                   : "Pinned Item",
    "DesktopGridRemove"                   : "Remove",
    "AddPanelItem"                        : "Add new panel item",
    "PanelPreferences"                    : {
      "type"          : "Background Type",
      "opt"           : "Background Option",
      "transparent"   : "Transparent",
      "solid"         : "Solid Color",
      "background"    : "Background Image",
      "transparent"   : "Transparent",
      "opacity"       : "Opacity"
    },
    "ApplicationCategories"               : {
      "development" : "Development",
      "games"       : "Games",
      "gfx"         : "Graphics",
      "office"      : "Office",
      "net"         : "Internet",
      "media"       : "Multimedia",
      "sys"         : "System",
      "util"        : "Utilities",
      "other"       : "Unknown"
    },
    "ContextMenuPanel"                    : {
      "title"     : "Panel",
      "add"       : "Add new item"
    },
    "ContextMenuPanelItem"                : {
      "move"      : "Move",
      "alignment" : {
        "left"  : "Align to left",
        "right" : "Align to right"
      },
      "remove"    : "Remove",
      "configure" : "Configure"
    },
    "ContextMenuDesktop"                  : {
      "title"     : "Desktop",
      "wallpaper" : "Change Wallpaper",
      "sort"      : "Tile Windows",
      "panels"    : "Panel Preferences"
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

  OSjs.Labels.DialogButtons = {
    "Choose" : "Choose",
    "Ok"     : "Ok",
    "Close"  : "Close",
    "Cancel" : "Cancel"
  };

  /////////////////////////////////////////////////////////////////////////////
  // Gtk
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Labels.GtkMenu = {
    "file"     : "<u>F</u>ile",
    "new"      : "New",
    "open"     : "Open",
    "save"     : "Save",
    "saveas"   : "Save as..:",
    "close"    : "Close",
    "quit"     : "Quit",
    "home"     : "Home",
    "upload"   : "Upload",
    "mkdir"    : "Create directory",
    "listview" : "List view",
    "iconview" : "Icon view",
    "add"      : "Add",
    "remove"   : "Remove",
    "execute"  : "Execute",
    "refresh"  : "Refresh",
    "go"       : "<u>G</u>o",
    "view"     : "<u>V</u>iew",
    "help"     : "<u>H</u>elp",
    "about"    : "About"
  };

})();
