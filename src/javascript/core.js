/*!
 * OS.js - JavaScript Operating System - Core File
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
 * @package OSjs.Core
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
(function($, undefined) {

  /////////////////////////////////////////////////////////////////////////////
  // CONFIG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constants CSS
   */
  //var ZINDEX_MENU         = 100000000;              //!< Default Menu z-index
  //var ZINDEX_RECT         = 100000000;              //!< Default Rect z-index
  //var ZINDEX_TOOLTIP      = 100000001;              //!< Default Tooltip z-index
  //var ZINDEX_NOTIFICATION = 100000002;              //!< Default Notification z-index
  //var ZINDEX_PANEL        = 1000000;                //!< Default Panel z-index
  var ZINDEX_WINDOW       = 10;                     //!< Default Window z-index
  //var ZINDEX_WINDOW_MAX   = 88888889;               //!< Max Window z-index
  var ZINDEX_WINDOW_ONTOP = 90000000;               //!< Window cur ontop z-index
  //var ZINDEX_LOADING      = 1000100;                //!< Loadingbar z-index
  // @endconstants

  /**
   * @constants Local settings
   */
  var ANIMATION_SPEED        = 400;                 //!< Animation speed in ms
  var TEMP_COUNTER           = 1;                   //!< Internal temp. counter
  var TOOLTIP_TIMEOUT        = 300;                 //!< Tooltip timeout in ms
  var NOTIFICATION_TIMEOUT   = 5000;                //!< Desktop notification timeout
  var MAX_PROCESSES          = 50;                  //!< Max processes running (except core procs)
  var WARN_STORAGE_SIZE      = (1024 * 4) * 1000;   //!< Warning localStorage size
  var MAX_STORAGE_SIZE       = (1024 * 5) * 1000;   //!< Max localstorage size
  var STORAGE_SIZE_FREQ      = 1000;                //!< Storage check usage frequenzy
  var ONLINECHK_FREQ         = 2500;                //!< On-line checking frequenzy
  var SESSION_CHECK          = 5000;                //!< Connection by session check freq
  var LOGIN_WAIT             = 1000;                //!< Wait after login
  var SESSION_KEY            = "PHPSESSID";         //!< The Server session cookie-key
  var TIMEOUT_CSS            = (1000 * 10);         //!< CSS loading timeout
  var DEFAULT_USERNAME       = "demo";              //!< Default User Username
  var DEFAULT_PASSWORD       = "demo";              //!< Default User Password
  var ENV_CACHE              = undefined;           //!< Server-side cache enabled state
  var ENV_PRODUCTION         = undefined;           //!< Server-side production env. state
  // @endconstants

  /**
   * @constants URIs
   */
  var WEBSOCKET_URI    = "localhost:8888";          //!< WebSocket URI // FIXME: From server configuration
  var AJAX_URI         = "/";                       //!< AJAX URI (POST)
  var RESOURCE_URI     = "/VFS/resource/";          //!< Resource loading URI (GET)
  var THEME_URI        = "/VFS/theme/";             //!< Themes loading URI (GET)
  var FONT_URI         = "/VFS/font/";              //!< Font loading URI (GET)
  var CURSOR_URI       = "/VFS/cursor/";            //!< Cursor loading URI (GET)
  var LANGUAGE_URI     = "/VFS/language/";          //!< Language loading URI (GET)
  var UPLOAD_URI       = "/API/upload";             //!< File upload URI (POST)
  var ICON_URI         = "/img/icons/%s/%s";        //!< Icons URI (GET)
  var ICON_URI_16      = "/img/icons/16x16/%s";     //!< Icons URI 16x16 (GET)
  var ICON_URI_32      = "/img/icons/32x32/%s";     //!< Icons URI 32x32 (GET)
  // @endconstants

  /**
   * @constants Service types
   */
  var SERVICE_GET  = 0;                             //!< Service: HTTP GET
  var SERVICE_POST = 1;                             //!< Service: HTTP POST
  var SERVICE_JSON = 2;                             //!< Service: JSON (POST)
  var SERVICE_SOAP = 3;                             //!< Service: Soap
  var SERVICE_XML  = 4;                             //!< Service: XML (POST)
  // @endconstants

  /**
   * Global Keyboard-key modifiers
   */
  var KEY_ALT   = false;
  var KEY_SHIFT = false;
  var KEY_CTRL  = false;

  /////////////////////////////////////////////////////////////////////////////
  // PRIVATE VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Local references
   */
  var _Core            = null;                            //!< Core instance [dependency]
  var _Resources       = null;                            //!< ResourceManager instance [dependency]
  var _Settings        = null;                            //!< SettingsManager instance [dependency]
  var _WM              = null;                            //!< WindowManager instance [not required]
  var _Desktop         = null;                            //!< Desktop instance [not required]
  var _Window          = null;                            //!< Current Window instance [dynamic]
  var _Tooltip         = null;                            //!< Current Tooltip instance [dynamic]
  var _Menu            = null;
  var _Processes       = [];                              //!< Process instance list
  var _TopIndex        = (ZINDEX_WINDOW + 1);             //!< OnTop z-index
  var _OnTopIndex      = (ZINDEX_WINDOW_ONTOP + 1);       //!< OnTop instances index
  var _Running         = false;                           //!< Global running state
  var _AppCache        = [];                              //!< Global Application[Package] Cache
  var _PanelCache      = [];                              //!< Global PanelItem[Package] Cache
  var _BackgroundServiceCache = [];                       //!< Global BackgroundService[Package] Cache
  //var _DataRX          = 0;                               //!< Global Data recieve counter
  //var _DataTX          = 0;                               //!< Global Data transmit counter
  var _StartStamp      = -1;                              //!< Starting timestamp
  var _SessionId       = "";                              //!< Server session id
  var _SessionValid    = true;                            //!< Session is valid
  var _SRevisionChange = false;                           //!< Settings revision update occured
  var _HasCrashed      = false;                           //!< If system has crashed

  /**
   * Language
   */
  var _BrowserLanguage  = "en_US";                        //!< Browser default language (Set by init)
  var _SystemLanguage   = "en_US";                        //!< System default language (Set by init)
  var _Languages        = {                               //!< Collection of avalilable languages
    'default'   : "System Default (%s)",
    'auto'      : "Browser Default (%s)",
    'en_US'     : "English (en_US)",
    'nb_NO'     : "Norwegian Bokmål (nb_NO)"
  };

  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * DoPost() -- Do a POST call
   * @param   JSON        args      Arguments
   * @param   Function    callback  Callback function
   * @function
   */
  function DoPost(args, callback, callback_error) {
    args            = args            || {};
    callback        = callback        || function() {};
    callback_error  = callback_error  || function() {};

    // TODO
    if ( !_SessionValid ) {
      _HasCrashed = true;
    }

    // TODO
    if ( _HasCrashed ) {
      return;
    }

    var ajax_args = {
      'ajax' : true
    };

    for ( var i in args ) {
      if ( args.hasOwnProperty(i) ) {
        ajax_args[i] = args[i];
      }
    }

    //_DataTX += (JSON.stringify(ajax_args)).length;

    $.ajax({
      type      : "POST",
      url       : AJAX_URI,
      data      : ajax_args,
      success   : function(data) {
        //_DataRX += (JSON.stringify(data)).length;
        callback(data);

        // Check if we crashed!
        // TODO
        if ( data && data.error && data.exception ) {
          _HasCrashed = true;
        }
      },
      error     : function (xhr, ajaxOptions, thrownError){
        callback_error(xhr, ajaxOptions, thrownError);
      }
    });

    /*
    $.post(AJAX_URI, ajax_args, function(data) {
      _DataRX += (JSON.stringify(data)).length;

      callback(data);
    });
    */

    /*
    OSjs.Classes.AJAX(AJAX_URI, ajax_args, function(data) {
      _DataRX += (JSON.stringify(data)).length;

      callback(data);
    });
    */

  } // @endfunction


  /**
   * GetLanguage() -- Get Current language
   * @return String
   * @function
   */
  function GetLanguage() {
    return localStorage.getItem("system.locale.language") || _SystemLanguage;
  } // @function

  /**
   * GetLanguages() -- Get all available languages
   * @return Object
   */
  function GetLanguages() {
    var l = _Languages;
    l['default']  = sprintf(l['default'], _SystemLanguage);
    l['auto']     = sprintf(l['auto'],    _BrowserLanguage);
    return l;
  } // @function

  /**
   * MessageBox() -- Crate a message box (alert)
   * @param  String   msg       Message to display
   * @param  String   type      Message type (default=error)
   * @param  Mixed    misc      Message box extra argument
   * @param  Function callback  Callback on close (optional)
   * @see    API
   * @return Mixed
   * @function
   */
  function MessageBox(msg, type, misc, callback) {
    callback = callback || function() {};
    type = type || "error";
    if ( _WM ) {
      API.system.dialog(type, msg, callback, misc);
    } else {
      if ( type == "confirm" ) {
        return confirm(msg);
      } else {
        alert(msg);
      }
    }

    return null;
  } // @endfunction

  /**
   * InitLaunch() -- Initialize a launching of process
   * @param   String    name      Name of process to launch
   * @return  bool
   * @function
   */
  function InitLaunch(name) {
    var i, msg, trace;

    // First check if avail
    var plist = API.user.settings.packages();
    var found = false;
    for ( i = 0; i < plist.length; i++ ) {
      if ( (plist[i].name == name) && (plist[i].active) ) {
        found = true;
        break;
      }
    }

    if ( !found ) {
      msg   = sprintf(OSjs.Labels.InitLaunchNotFound, name);
      trace = sprintf("InitLaunch(%s)", name);

      try {
        CrashCustom(name, msg, trace);
      } catch ( eee ) {
        MessageBox(msg);
      }

      return false;
    }

    // Then check process count
    var list  = API.session.processes();
    var count = 0;

    for ( i = 0; i < list.length; i++ ) {
      if ( !list[i].service ) {
        count++;
      }
    }

    delete list;

    // Check if we exceed the process conut limit
    if ( count >= MAX_PROCESSES ) {
      msg   = sprintf(OSjs.Labels.InitLaunchError, name, MAX_PROCESSES);
      trace = sprintf("InitLaunch(%s)", name);

      try {
        CrashCustom(name, msg, trace);
      } catch ( eee ) {
        MessageBox(msg);
      }
      return false;
    }

    return true;
  } // @endfunction

  /**
   * CrashApplication() -- Application Crash Dialog handler
   * @param   String        app_name              Application name
   * @param   Application   application           Application instance
   * @param   Exception     ex                    Exception thrown
   * @return  void
   * @function
   */
  function CrashApplication(app_name, application, ex) {
    try {
      if ( ex instanceof OSjs.Classes.ApplicationException ) {
        _WM.addWindow(new OSjs.Dialogs.CrashDialog(Window, Application, API, [app_name, ex.getMessage(), ex.getStack(), ex]));
      } else {
        _WM.addWindow(new OSjs.Dialogs.CrashDialog(Window, Application, API, [app_name, ex.message, ex.stack, ex]));
      }

      try {
        application._running = true; // NOTE: Workaround
        application.kill();
      } catch ( eee ) {
        console.error(">>>>>>>>>>", "ooopsie", app_name, application);
      }
    } catch ( ee ) {
      var label = OSjs.Labels.CrashProcess;
      MessageBox(sprintf(label, app_name, ex));
    }
  } // @endfunction

  /**
   * CrashCustom() -- Show a 'Custom' crash dialog
   * @return void
   * @function
   */
  function CrashCustom(title, message, description, extra) {
    extra = extra || [];
    try {
      _WM.addWindow(new OSjs.Dialogs.CrashDialog(Window, Application, API, [title, message, description, extra]));
    } catch ( eee ) {
      var label = OSjs.Labels.CrashProcess;
      MessageBox(sprintf(label, name, extra));
    }
  } // @endfunction

  /**
   * LaunchString() -- Launch something by string
   * @param   String      str       The string
   * @param   Mixed       args      Extra arguments to send
   * @function
   */
  function LaunchString(str, args) {
    args = args || [];

    var operation = str.split("API::").pop().replace(/\s[^A-z0-9]/g, "");
    switch ( operation ) {
      case 'CompabilityDialog' :
        _WM.addWindow(new OSjs.Dialogs.CompabilityDialog(Window, API, args));
      break;

      default :
        MessageBox(sprintf(OSjs.Labels.ErrorLaunchString, operation));
      break;
    }
  } // @endfunction

  /**
   * LaunchApplication() -- Application Launch handler
   * @param   String    app_name              Application name
   * @param   Mixed     app_args              Application starting arguments (argv)
   * @param   Array     windows               Window list (used for restoration)
   * @param   Function  callback              Callback on success
   * @param   Function  callback_error        Callback on error
   * @return  void
   * @function
   */
  function LaunchApplication(app_name, app_args, windows, callback, callback_error) {
    callback = callback || function() {};
    callback_error = callback_error || function() {};

    if ( InitLaunch(app_name) && _AppCache[app_name] ) {
      API.ui.cursor("wait");

      var resources = _AppCache[app_name].resources;
      _Resources.addResources(resources, app_name, function(error) {
        console.group(">>> Initing loading of '" + app_name + "' <<<");

        var app_ref = OSjs.Applications[app_name];
        console.log("Checking if resources was sucessfully loaded...");

        if ( !error && app_ref ) {
          var crashed = false;
          var application;

          console.log("Trying to create application...");

          try {
            application = new app_ref(GtkWindow, Application, API, app_args, windows);
            application._checkCompability();

            console.log("<<< CREATED >>>");
          } catch ( ex ) {
            CrashApplication(app_name, application, ex);
            crashed = true;
          }

          if ( !crashed ) {
            console.log("Running application");

            setTimeout(function() {
              try {
                application.run();
              } catch ( ex ) {
                CrashApplication(app_name, application, ex);
              }
            }, 100);
          } else {
            console.log("!!! FAILED !!!");
          }
        } else {
          var errors = [];
          var eargs = [];
          for ( var x in resources ) {
            errors.push(resources[x]);
          }

          if ( !errors.length ) {
            errors = ["<unknown>"];
          }

          for ( var a in app_args ) {
            eargs.push(app_args[a]);
          }

          var extra = "\n\nThis may be due to a missing file or a syntax error in a resource."; // FIXME: Locale

          CrashApplication(app_name, {
            _name : app_name
          }, {
            message : sprintf(OSjs.Labels.CrashLaunchResourceMessage, errors.join(", ") + extra),
            stack   : sprintf(OSjs.Labels.CrashLaunchResourceStack, "LaunchApplication", app_name, eargs.join(", "))
          });

          callback_error("AddResource() error");
        }

        setTimeout(function() {
          API.ui.cursor("default");
        }, 50);

        console.groupEnd();
      });
    }
  } // @endfunction

  /**
   * LaunchPanelItem() -- PanelItem Launch handler
   * @param   int       i             Item index
   * @param   String    iname         Item name
   * @param   Mixed     iargs         Item argument(s)
   * @param   String    ialign        Item alignment
   * @param   Panel     panel         Panel instance reference
   * @param   Function  callback      Callback function (Default = undefined)
   * @param   bool      save          Save panel after launch (Default = undefined)
   * @return  void
   * @function
   */
  function LaunchPanelItem(i, iname, iargs, ialign, panel, callback, save) {
    callback = callback || function() {};

    if ( InitLaunch(iname) && _PanelCache[iname] ) {
      var resources = _PanelCache[iname].resources;
      _Resources.addResources(resources, iname, function(error) {

        console.group(">>> Initing loading of '" + iname + "' <<<");

        var crashed = false;
        var error_msg = null;

        if ( !error && OSjs.PanelItems[iname] ) {
          var item = new OSjs.PanelItems[iname](PanelItem, panel, API, iargs);
          if ( item ) {
            item._panel = panel;
            item._index = i;
            try {
              panel.addItem(item, ialign, save);
            } catch ( exception ) {
              crashed = true;
              error_msg = iname + ": " + exception;
            }
          }
        } else {
          var errors = [];
          var eargs = iargs;
          for ( var x in resources ) {
            errors.push("* " + resources[x]);
          }

          CrashCustom(iname, 
            sprintf(OSjs.Labels.CrashLaunchResourceMessage, errors.join("\n")),
            sprintf(OSjs.Labels.CrashLaunchResourceStack, "LaunchPanelItem", iname, eargs.join(",")) );

          crashed = true;
        }

        console.groupEnd();

        callback(crashed, error_msg);
      });
    }
  } // @endfunction

  /**
   * LaunchBackgroundService() -- BackgroundService Launch handler
   * @param   String    sname         Item name
   * @param   Mixed     iargs         Item argument(s)
   * @param   Function  callback      Callback function (Default = undefined)
   * @return  void
   * @function
   */
  function LaunchBackgroundService(sname, iargs, callback) {
    callback = callback || function() {};
    iargs    = iargs    || {};

    if ( InitLaunch(sname) && _BackgroundServiceCache[sname] ) {
      var resources = _BackgroundServiceCache[sname].resources;
      _Resources.addResources(resources, sname, function(error) {

        console.group(">>> Initing loading of '" + sname + "' <<<");

        var crashed = false;
        var error_msg = null;

        if ( !error && OSjs.Services[sname] ) {
          try {
            var item = new OSjs.Services[sname](BackgroundService, API, iargs);
            item.run();
          } catch ( ex ) {
            CrashApplication(sname, item, ex);
          }
        } else {
          var errors = [];
          var eargs = iargs;
          for ( var x in resources ) {
            errors.push("* " + resources[x]);
          }

          CrashCustom(sname,
            sprintf(OSjs.Labels.CrashLaunchResourceMessage, errors.join("\n")),
            sprintf(OSjs.Labels.CrashLaunchResourceStack, "LaunchBackgroundService", sname, eargs.join(",")) );

          crashed = true;
        }

        console.groupEnd();

        callback(crashed, error_msg);
      });
    }
  } // @endfunction

  /**
   * SetVFSObjectDefault() -- Set default launching application for MIME type
   * @param   String    app       Application Name
   * @param   String    path      Path
   * @param   String    mime      MIME Type
   * @function
   */
  function SetVFSObjectDefault(app, path, mime) {
    console.log("SetVFSObjectDefault()", app, path, mime);
    _Settings.setDefaultApplication(app, mime, path);
  } // @endfunction

  /**
   * LaunchVFSObject() -- Launch an application by using a path and mime
   * @param   String    path      Object path
   * @param   String    mime      MIME Type
   * @param   bool      udef      Use default defined application
   * @function
   */
  function LaunchVFSObject(path, mime, udef) {
    udef = (udef === undefined) ? true : false;

    if ( mime ) {
      if ( mime == "OSjs/Application" ) {
        var expl = path.split("/");
        var name = expl[expl.length - 1];
        API.system.launch(name);
        return;
      }

      var default_app = null;
      var apps        = {};
      var found       = [];
      var list        = [];
      var inmime      = mime.split("/");
      var launched      = false;

      var i;

      // Figure out what apps to display
      var activated = _Settings._get("user.installed.packages", true); // FIXME
      for ( i in _AppCache ) {
        if ( _AppCache.hasOwnProperty(i) ) {
          if ( in_array(i, activated) ) {
            apps[i] = _AppCache[i];
          }
        }
      }

      if ( udef ) {
        // First, figure out default application
        var defs = _Settings.getDefaultApplications();
        if ( defs[mime] !== undefined ) {
          default_app = defs[mime];
        }

        // Then launch application if found
        if ( default_app ) {
          for ( i in apps ) {
            if ( apps.hasOwnProperty(i) ) {
              if ( i === default_app ) {
                API.system.launch(i, {'path' : path, 'mime' : mime});
                launched = true;
                break;
              }
            }
          }
        }
      }

      // If no application was launched we continue with the default dialog
      if ( !launched ) {
        var app, check, mtype;
        var all_apps = [];
        for ( i in apps ) {
          if ( apps.hasOwnProperty(i) ) {
            app = apps[i];
            app.name = i; // append
            if ( app.mimes.length ) {
              for ( check in app.mimes ) {
                if ( app.mimes.hasOwnProperty(check) ) {
                  mtype = app.mimes[check].split("/");
                  if ( mtype[1] == "*" ) {
                    if ( mtype[0] == inmime[0] ) {
                      found.push(i);
                      list.push(app);
                    }
                  } else {
                    if ( app.mimes[check] == mime ) {
                      found.push(i);
                      list.push(app);
                    }
                  }
                }
              }
            }
          }
          all_apps.push(app);
        }

        function __run(mapp) {
          API.system.launch(mapp, {'path' : path, 'mime' : mime});
        }

        if ( found.length ) {
          if ( found.length == 1 ) {
            __run(found[0]);
          } else {
            API.system.dialog_launch(list, function(mapp, set_default) {
              __run(mapp);
              if ( set_default ) {
                SetVFSObjectDefault(mapp, path, mime);
              }
            });
          }
        } else {
          API.system.dialog_launch(all_apps, function(mapp, set_default) {
            __run(mapp);
            if ( set_default ) {
              SetVFSObjectDefault(mapp, path, mime);
            }
          }, true);
        }
      }
    }

  } // @endfunction

  /**
   * VFSEvent() -- Trigger VFS Event
   * @param   String      ev              Event name
   * @param   Object      params          Event parameters
   * @param   Process     instance        Called from this instance
   * @return  void
   * @function
   */
  function VFSEvent(ev, params, instance) {
    console.group("VFSEvent()", ev, params);

    if ( ev == "update" && (params.file/* && params.mime*/) ) {
      var i = 0;
      var l = _Processes.length;
      var iter;
      for ( i; i < l; i++ ) {
        iter = _Processes[i];
        if ( (iter instanceof Application) && (iter !== instance) ) {
          console.log("Triggering", ev, "for", iter);

          iter._call("vfs", {
            "file" : params.file,
            "mime" : params.mime
          });
        }
      }
    }

    console.groupEnd();
  } // @endfunction

  /**
   * CreateDefaultApplicationMenu() -- Create default application menu
   * @param   DOMEevent     ev      DOM Event ref.
   * @param   DOMElement    el      DOM Element ref.
   * @return  void
   * @function
   */
  function CreateDefaultApplicationMenu(ev, el) {
    var lbls  = OSjs.Labels.ApplicationCategories;
    var menu  = [];

    var cats = {
      "development" : {
        "title" : lbls.development,
        "icon"  : "categories/applications-development.png",
        "items" : []
      },
      "games" : {
        "title" : lbls.games,
        "icon"  : "categories/applications-games.png",
        "items" : []
      },
      "graphics" : {
        "title" : lbls.gfx,
        "icon"  : "categories/applications-graphics.png",
        "items" : []
      },
      "office" : {
        "title" : lbls.office,
        "icon"  : "categories/applications-office.png",
        "items" : []
      },
      "internet" : {
        "title" : lbls.net,
        "icon"  : "categories/applications-internet.png",
        "items" : []
      },
      "multimedia" : {
        "title" : lbls.media,
        "icon"  : "categories/applications-multimedia.png",
        "items" : []
      },
      "system" : {
        "title" : lbls.sys,
        "icon"  : "categories/applications-system.png",
        "items" : []
      },
      "utilities" : {
        "title" : lbls.util,
        "icon"  : "categories/applications-utilities.png",
        "items" : []
      },
      "unknown" : {
        "title" : lbls.other,
        "icon"  : "categories/gnome-other.png",
        "items" : []
      }
    };

    var apps  = API.user.settings.packages(false, true, false);
    var i, iter, cat;
    for ( i in apps ) {
      if ( apps.hasOwnProperty(i) ) {
        iter = apps[i];
        if ( (iter.type == "Application") && iter.active ) {
          cat = cats[iter.category] ? iter.category : "unknown";
          cats[cat].items.push({
            "title"   : iter.label,
            "icon"    : iter.icon.match(/^\//) ? iter.icon : sprintf(ICON_URI_16, iter.icon),
            "method"  : (function(app) {
              return function() {
                API.system.launch(app);
              };
            })(iter.name)
          });
        }
      }
    }

    for ( i in cats ) {
      if ( cats.hasOwnProperty(i) ) {
        if ( cats[i].items.length ) {
          menu.push(cats[i]);
        }
      }
    }

    return ((new Menu(el)).create(ev, menu, true));
  } // @endfunction

  /**
   * Preload a list of default defined images
   * @return Mixed
   * @function
   */
  var PreloadDefaultImages = (function() {
    // Create a image
    var __load = function(index, src, callback) {
      try {
        var img =  new Image();
        img.onload = function() {
          callback(true, index, src, img);
        };
        img.onerror = function() {
          callback(false, index, src, img);
        };
        img.alt = src;
        img.src = src;
      } catch ( eee ) {
        callback(false, index, src, null);
      }
    };

    // Main
    return function(sprf, list, callback) {
      var i     = 0;
      var l     = list.length;

      function __callback(loaded, failed, total) {
        console.groupEnd();
        callback(loaded, failed, total);
      }

      if ( l ) {
        var total = (l - 1);
        var loaded = 0;
        var failed = 0;
        for ( i; i < l; i++ ) {
          __load(i, sprintf(sprf, list[i]), function(success, index, src, img) {
            if ( !success ) {
              failed++;
            } else {
              loaded++;
            }

            if ( total <= 0 ) {
              __callback(loaded, failed, l);
            }
            total--;

            img.onload = null;
            img.onerror = null;
            //delete img;
          });
        }
      } else {
        __callback(0, 0, 0);
      }
    };
  })(); // @endfunction

  /**
   * TransitionEffect() -- Apply a transition effect on an element
   * @TODO
   * @function
   */
  /*
  function TransitionEffect(el, t, trans, args, callback) {
    trans     = trans     || true;
    args      = args      || {};
    callback  = callback  || function() {};

    var eff     = _Settings._get(t) || "default";
    var method  = "";
    var vargs   = {
      "duration" : ANIMATION_SPEED,
      "complete" : callback
    };

    if ( eff == "default" ) {
      switch ( t ) {
        case "wm.animation.windowOpen" :
          method = "show";
          break;

        case "wm.animation.windowClose" :
          method = "fadeOut";
          break;

        case "wm.animation.windowMaximize" :
          method = "animate";
          break;

        case "wm.animation.windowMinimize" :
          method = "animate";
          break;

        case "wm.animation.windowRestore" :
          break;

        case "wm.animation.menuOpen" :
          break;

        case "wm.animation.menuClose" :
          break;

        default:
          method = (trans ? "show" : "hide");
        break;
      }
    } else {
      switch ( eff ) {
        case "fade" :
          method = (trans ? "fadeIn" : "fadeOut");
          break;

        case "scroll":
          method = "animate";
          break;

        case "grow" :
          method = "animate";
          break;

        case "shrink" :
          method = "animate";
          break;

        default :
          method = (trans ? "show" : "hide");
          break;
      }
    }

    var res;
    if ( method == "animate" ) {
      res = $(el).animate(args, vargs);
    } else {
      res = $(el)[method](vargs);
    }

    return res;
  } // @endfunction
   */

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Public API
   *
   * @object
   */
  var API = {

    //
    // API::UI
    //

    'ui' : {
      'windows' : {
        'tile' : function() {
          if ( !_WM ) {
            MessageBox(OSjs.Labels.WindowManagerMissing);
            return;
          }

          _WM.sortWindows('tile');
        }
      },

      'cursor' : (function() {
        var ccursor = "default";

        return function(c) {
          if ( c !== ccursor ) {
            $("body").attr("class", "cursor_" + c);
          }
          ccursor = c;
        };
      })(),

      'rectangle' : (function() {
        var startX   = -1;
        var startY   = -1;
        var rect     = false;
        var callback = function() {};

        // NOTE: Your 'mouseup' event must fire on global document object!!!
        return {
          'init' : function(ev, c) {
            if ( !rect ) {
              $("#ContextRectangle").css({
                'top'    : '-1000px',
                'left'   : '-1000px',
                'width'  : '0px',
                'height' : '0px'
              }).show();

              startX = ev.pageX;
              startY = ev.pageY;
              rect = true;
              callback = c || function() {};

              //ev.preventDefault();
            }
          },

          'hide' : function(ev) {
            if ( rect ) {
              var x = Math.min(ev.pageX, startX);
              var y = Math.min(ev.pageY, startY);
              var w = Math.abs(ev.pageX - startX);
              var h = Math.abs(ev.pageY - startY);

              callback(x, y, w, h);

              $("#ContextRectangle").css({
                'top'    : '-1000px',
                'left'   : '-1000px',
                'width'  : '0px',
                'height' : '0px'
              }).hide();

              startX = -1;
              startY = -1;
              rect = false;
            }
          },

          'update' : function(ev) {
            if ( rect ) {
              var x = Math.min(ev.pageX, startX);
              var y = Math.min(ev.pageY, startY);
              var w = Math.abs(ev.pageX - startX);
              var h = Math.abs(ev.pageY - startY);

              $("#ContextRectangle").css({
                'left'   : x + 'px',
                'top'    : y + 'px',
                'width'  : w + 'px',
                'height' : h + 'px'
              });

              //ev.preventDefault();
            }
          }

        };
      })()
    },

    //
    // API::SYSTEM
    //

    'system' : {

      'storageUsage' : function() {
        return _Settings.getStorageUsage();
       },

      'language' : function() {
        return GetLanguage();
      },

      'languages' : function() {
        return GetLanguages();
      },

      'run' : function(path, mime, use_default) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.run");
        console.log("Arguments", path, mime, use_default);
        console.groupEnd();

        LaunchVFSObject(path, mime, use_default);
      },

      'launch' : function(app_name, app_args, windows) {
        app_args = app_args || {};
        if ( !(app_args instanceof Object) ) {
          app_args = {};
        }
        windows = windows || {};

        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return;
        }

        // Check if we are launching an Application
        var launch_application = false;
        if ( !app_name.match(/^API\:\:/) ) {
          // If application is orphan, do not launch
          var wins = _WM.stack;
          for ( var i = 0; i < wins.length; i++ ) {
            if ( wins[i].app && wins[i].app._name == app_name ) {
              if ( wins[i]._is_orphan ) {
                console.group("=== API OPERATION ===");
                console.log("Method", "API.system.launch");
                console.log("Message", "Launch was denied (is_orphan)");
                console.groupEnd();

                _WM.focusWindow(wins[i]);
                return;
              }
            }
          }

          launch_application = true;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.launch");
        console.log("Launch", app_name);
        console.log("Argv", app_args);
        console.groupEnd();

        if ( launch_application ) {
          LaunchApplication(app_name, app_args, windows);
        } else {
          LaunchString(app_name, app_args, windows);
        }
      },

      'call' : function(method, argv, callback, show_alert) {
        show_alert = (show_alert === undefined) ? true : (show_alert ? true : false);

        DoPost({'action' : 'call', 'method' : method, 'args' : argv}, function(data) {
          if ( data.success ) {
            callback(data.result, null);
          } else {
            if ( show_alert ) {
              MessageBox(data.error);
            }
            callback(null, data.error);
          }
        });

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.call");
        console.log("Arguments", method, argv);
        console.groupEnd();
      },

      'post' : function(args, callback) {
        DoPost(args, callback);
      },

      'alert' : function(msg, type, callback) {
        MessageBox(msg, type, null, callback);
      },

      'dialog' : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        type = type || "error";
        message = message || "Unknown error";

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog");
        console.log("Type", type);
        console.groupEnd();

        return _WM.addWindow(new Dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
      },

      'dialog_input' : function(value, desc, clb_finish) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_input");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.InputOperationDialog(OperationDialog, API, [value, desc, clb_finish]));
      },

      'dialog_rename' : function(path, clb_finish) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_rename");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.RenameOperationDialog(OperationDialog, API, [path, clb_finish]));
      },

      'dialog_upload' : function(path, clb_finish, clb_progress, clb_cancel) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_upload");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.UploadOperationDialog(OperationDialog, API, [UPLOAD_URI, path, clb_finish, clb_progress, clb_cancel]));
      },

      'dialog_file' : function(clb_finish, mime_filter, type, cur_dir) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        mime_filter = mime_filter || [];
        type = type || "open";
        cur_dir = cur_dir || "/";

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_file");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FileOperationDialog(OperationDialog, API, [type, mime_filter, clb_finish, cur_dir]));
      },

      'dialog_launch' : function(list, clb_finish, not_found) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_launch");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.LaunchOperationDialog(OperationDialog, API, [list, clb_finish, not_found]));
      },

      'dialog_color' : function(start_color, clb_finish) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_color");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.ColorOperationDialog(OperationDialog, API, [start_color, clb_finish]));
      },

      'dialog_font' : function(current_font, current_size, clb_finish) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_font");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FontOperationDialog(OperationDialog, API, [current_font, current_size, clb_finish]));
      },

      'dialog_properties' : function(filename, clb_finish) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.system.dialog_properties");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FilePropertyOperationDialog(OperationDialog, API, [filename, clb_finish]));
      },

      'default_application_menu' : function(ev, el) {
        return CreateDefaultApplicationMenu(ev, el);
      },

      'notification' : function(title, message, icon, duration) {
        if ( _Desktop ) {
          _Desktop.createNotification(title, message, icon, duration);
        }
      }

    },

    //
    // API::APPLICATION
    //

    'application' : {

      'context_menu' : function(ev, el, items, position, button) {
        button = button === undefined ? -1 : button;

        var ewhich = ev.which || 1;
        if ( button == -1 ? (ewhich > 1) : (button == ewhich) ) {
          if ( _Menu ) {
            _Menu.destroy();
          }

          ((new Menu(el)).create(ev, items, true));

          return false;
        }

        return true;
      }
    },

    //
    // API::USER
    //

    'user' : {
      'settings' : {
        'save' : function(settings) {
          _Settings._apply(settings);

          if ( _WM ) {
            _WM.applySettings();
          }
          if ( _Desktop ) {
            _Desktop.applySettings();
          }
        },

        'type' : function(k) {
          return _Settings.getType(k);
        },

        'get' : function(k, json) {
          return _Settings._get(k, json);
        },

        'options' : function(k) {
          return _Settings.getOptions(k);
        },

        'package_enable' : function(p, callback) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_enable");
          console.log("Arguments", p);
          console.groupEnd();

          if ( (p instanceof Object) && sizeof(p) ) {
            DoPost({'action' : 'package', 'operation' : 'enable', 'data' : p}, function(res) {
              var results = {};
              for ( var i in p ) {
                if ( p.hasOwnProperty(i) ) {
                  results[i] = _Settings.modifyPackage("enable", i, p[i]);
                }
              }

              callback(res, results);
            });
          } else {
            console.group("===    ABORTED    ===");
          }
        },
        'package_disable' : function(p, callback) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_disable");
          console.log("Arguments", p);
          console.groupEnd();

          if ( (p instanceof Object) && sizeof(p) ) {
            DoPost({'action' : 'package', 'operation' : 'disable', 'data' : p}, function(res) {
              var results = {};
              for ( var i in p ) {
                if ( p.hasOwnProperty(i) ) {
                  results[i] = _Settings.modifyPackage("disable", i, p[i]);
                }
              }

              callback(res, results);
            });
          } else {
            console.group("===    ABORTED    ===");
          }
        },
        'package_uninstall' : function(p, callback) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_uninstall");
          console.log("Arguments", p, callback);
          console.groupEnd();

          if ( (p instanceof Object) && sizeof(p) ) {
            DoPost({'action' : 'package', 'operation' : 'uninstall', 'data' : p}, function(res) {
              var results = {};
              for ( var i in p ) {
                if ( p.hasOwnProperty(i) ) {
                  results[i] = _Settings.modifyPackage("uninstall", i, p[i]);
                }
              }

              callback(res, results);
            });
          } else {
            console.group("===    ABORTED    ===");
          }
        },
        'package_install' : function(p, callback) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_install");
          console.log("Arguments", p, callback);
          console.groupEnd();

          DoPost({'action' : 'package', 'operation' : 'install', 'data' : p}, function(res) {
            var inst = _Settings.modifyPackage("install", p);
            callback(res, inst);
          });
        },

        'packages' : function(icons, apps, pitems, sitems) {
          var activated = _Settings._get("user.installed.packages", true);
          var result = [];

          apps    = (apps === undefined)    ? true : apps;
          pitems  = (pitems === undefined)  ? true : pitems;
          sitems  = (sitems === undefined)  ? true : sitems;

          var ia, ip, iter;
          if ( apps ) {
            for ( ia in _AppCache ) {
              if ( _AppCache.hasOwnProperty(ia) ) {
                iter = _AppCache[ia];
                result.push({
                  name      : ia,
                  label     : _AppCache[ia].titles[GetLanguage()] || iter.title,
                  active    : iter.category == "system" || in_array(ia, activated), // FIXME: HACKISH
                  type      : 'Application',
                  locked    : iter.category == "system",
                  icon      : iter.icon,
                  icon      : (icons ? (iter.icon.match(/^\//) ? iter.icon : sprintf(ICON_URI_32, iter.icon)) : iter.icon),
                  category  : iter.category
                });
              }
            }
          }

          if ( pitems ) {
            for ( ip in _PanelCache ) {
              if ( _PanelCache.hasOwnProperty(ip) ) {
                iter = _PanelCache[ip];
                result.push({
                  name    : ip,
                  label   : iter.title,
                  active  : in_array(ip, activated),
                  type    : 'PanelItem',
                  locked  : true,
                  icon    : sprintf(ICON_URI_32, _PanelCache[ip].icon)
                });
              }
            }
          }

          if ( sitems ) {
            for ( ip in _BackgroundServiceCache ) {
              if ( _BackgroundServiceCache.hasOwnProperty(ip) ) {
                iter = _BackgroundServiceCache[ip];
                result.push({
                  name    : ip,
                  label   : iter.title,
                  active  : in_array(ip, activated),
                  type    : 'BackgroundService',
                  locked  : false,
                  icon    : sprintf(ICON_URI_32, _BackgroundServiceCache[ip].icon)
                });
              }
            }
          }

          return result;
        }
      },

      'logout' : function(save) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.user.logout");
        console.groupEnd();

        API.session.save(save);

        API.session.shutdown(save);
      }
    },

    //
    // API::SESSION
    //

    'session' : {
      'processes' : function() {
        return _Core.getProcesses();
      },

      'save' : function(save) {
        var session = _Core.sessionSave(save);
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.save");
        console.log("Save", save, session);
        console.groupEnd();
      },

      'restore' : function() {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.restore");
        console.groupEnd();

        _Core.sessionRestore();
      },

      /*
      'snapshot_save' : function(name, callback) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_save");
        console.log("Save", name);
        console.groupEnd();

        _Core.sessionSnapshotSave(name, callback);
      },

      'snapshot_load' : function(name, callback) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_load");
        console.log("Load", name);
        console.groupEnd();

        _Core.sessionSnapshotLoad(name, callback);
      },
      */

      'shutdown' : function(save) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.shutdown");
        console.groupEnd();

        return _Core.shutdown(save);
      },

      'stack' : function() {
        return _WM ? _WM.getStack() : [];
      }

    }

  };

  /////////////////////////////////////////////////////////////////////////////
  // PROCESS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Process -- Process Class
   *
   * @class
   */
  var Process = Class.extend({

    _pid        : -1,                     //!< Process ID
    _started    : null,                   //!< Process started date
    _proc_name  : "(unknown)",            //!< Process name identifier
    _proc_icon  : "mimetypes/exec.png",   //!< Process icon
    _locked     : false,

    /**
     * Process::init() -- Constructor
     * @param   String    name          Process Name
     * @param   String    icon          Process Icon
     * @param   bool      locked        Not stoppable by user
     * @constructor
     */
    init : function(name, icon, locked) {
      console.group("Process::init()");

      this._pid       = (_Processes.push(this) - 1);
      this._started   = new Date();
      this._proc_name = "(unknown)";
      this._proc_icon = "mimetypes/exec.png";
      this._locked    = false;

      if ( name !== undefined && name ) {
        this._proc_name = name;
      }
      if ( icon !== undefined && icon ) {
        this._proc_icon = icon;
      }
      if ( locked !== undefined ) {
        this._locked    = locked;
      }

      console.groupEnd();
    },

    /**
     * Process::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      console.group("Process::destroy()");

      if ( this._pid >= 0 ) {
        _Processes[this._pid] = undefined;
      }

      this._started = null;

      console.groupEnd();
    },

    /**
     * Process::kill() -- Kill process
     * @return bool
     */
    kill : function() {
      if ( !this._locked ) {
        console.log("Process::kill()", this);

        this.destroy();

        return true;
      }
      return false;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PROCESS METAS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * ProcessService -- Main Process Service [META] Class
   *
   * @extends Process
   * @class
   */
  var ProcessService = Process.extend({
    init : function(name, icon/*, locked*/) {
      //this._super(name, icon, locked);
      this._super(name, icon, true);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // SERVICE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Service -- Server-Side Services
   *
   * @class
   */
  var Service = ProcessService.extend({

    _name    : "",     //!< Service name
    _type    : -1,     //!< Service type
    _timeout : 30,     //!< Service default timeout

    /**
     * Service::init() -- Constructor
     * @param   int     type      Service type (default = SERVICE_GET)
     * @constructor
     */
    init : function(name, type, timeout) {
      this._name    = name || "Unknown";
      this._type    = parseInt(type, 10) || SERVICE_GET;
      this._timeout = parseInt(timeout, 10) || 30;

      console.group("Service::init()");
      console.log("Name", this._name);
      console.log("Type", this._type);
      console.log("Timeout", this._timeout);
      console.groupEnd();

      this._super(this._name, "devices/network-wireless.png");
    },

    /**
     * Service::destroy() -- Destroy
     * @destructor
     */
    destroy : function() {
      this._super();
    },

    /**
     * Service::call() -- Call service
     * @param   String    uri           Service URI
     * @param   Mixed     data          Service Method data/arguments (Array/Tuple depending on service type)
     * @param   int       timeout       Service Timeout in seconds (Not avail. in some services)
     * @param   Mixed     options       Service Options (Array/Tuple depending on service type)
     * @param   Function  callback      Callback function (returns [data, internal_error?])
     * @see     Server-Side documentation
     * @return  void
     */
    call : function(uri, method, data, timeout, options, callback) {
      data      = (data === undefined)    ? null            : data;
      timeout   = (timeout === undefined) ? (this._timeout) : (parseInt(timeout, 10) || this._timeout);
      options   = (options === undefined) ? {}              : options;

      if ( uri && (callback instanceof Function) ) {
        var ajax_args = {
          'action'    : 'service',
          'arguments' : {
            'type'     : this._type,
            'uri'      : uri,
            'data'     : data,
            'timeout'  : timeout,
            'options'  : options
          }
        };

        DoPost(ajax_args, function(data) {
          callback(data);
        });
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // SOCKET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Socket -- WebSocket abstraction (w/TCP)
   *
   * @class
   */
  var Socket = ProcessService.extend({

    _running : false,      //!< Socket running state
    _name    : "",         //!< Socket instance name
    _socket  : null,       //!< Socket instance reference
    _uri     : null,       //!< Socket URI string

    /**
     * Socket::init() -- Constructor
     * @param   String      name    Connection name
     * @param   String      uri     Connection host/ip/uri/string
     * @constructor
     */
    init : function(name, uri) {
      this._socket  = null;
      this._name    = name || "Unknown";
      this._uri     = "ws://" + (uri = uri || WEBSOCKET_URI);
      this._running = true;

      // Overrides
      this.on_open    = function(/*ev*/) {};
      this.on_message = function(/*ev, js, data, err*/) {};
      this.on_close   = function(/*ev*/) {};
      this.on_error   = function(/*ev*/) {};

      console.group("Socket::init()");
      console.log("Name", this._name);
      console.log("Support", OSjs.Compability.SUPPORT_SOCKET);
      console.log("URI", this._uri);
      console.groupEnd();

      this._super(this._name + " > Socket", "devices/network-wireless.png");
    },

    /**
     * Socket::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this._running ) {
        if ( this._socket ) {
          try {
            this._socket.close();
          } catch ( e ) {}
          this._socket = null;
        }
      }

      this._super();
    },

    /**
     * Socket::_on_error() -- Base onerror event
     * @param   Mixed     ev      WebSocket Event
     * @return  void
     */
    _on_error : function(ev) {
      console.log("Socket::error()", this);

      this.on_error(ev);
    },

    /**
     * Socket::_on_open() -- Base onopen event
     * @param   Mixed     ev      WebSocket Event
     * @return  void
     */
    _on_open : function(ev) {
      console.log("Socket::open()", this);

      this.on_open(ev);
    },

    /**
     * Socket::_on_message() -- Base onmessage event
     * @param   Mixed     ev      WebSocket Event
     * @param   Mixed     data    WebSocket Data
     * @return  void
     */
    _on_message : function(ev, data) {
      console.group("Socket::message()");
      console.log(this._uri);
      console.log(data);
      console.groupEnd();

      var js = null;
      var err = null;
      try {
        if ( data.substr(0, 1) !== "{" ) {
          data = data.substr(1, data.length);
        }
        js = JSON.parse(data);
      } catch ( e ) {
        err = e;
      } // FIXME

      this.on_message(ev, js, data, err);
    },

    /**
     * Socket::_on_close() -- Base onclose event
     * @param   Mixed     ev      WebSocket Event
     * @return  void
     */
    _on_close : function(ev) {
      console.log("Socket::close()", this);

      this.on_close(ev);
    },

    /**
     * Socket::connect() -- Connect
     * @return bool
     */
    connect : function() {
      var self = this;

      if ( OSjs.Compability.SUPPORT_SOCKET ) {
        if ( !this._socket ) {
          console.log("Socket::connect()", this._uri);

          try {
            //var ws = new WebSocket(this._uri, "draft-ietf-hybi-thewebsocketprotocol-00");
            //var ws = new WebSocket(this._uri, "hybi-00");
            //var ws = new WebSocket(this._uri, "hybi-07");
            var ws = new WebSocket(this._uri);
            ws.onopen = function(ev) {
              self._on_open(ev);
            };
            ws.onmessage = function(ev) {
              self._on_message(ev, ev.data);
            };
            ws.onclose = function(ev) {
              self._on_close(ev);
            };
            ws.onerror = function(ev) {
              self._on_error(ev);
            };

            this._socket = ws;
          } catch ( e ) {
            MessageBox("Failed to create socket: " + e);
          }

          return true;
        }
      }

      return false;
    },

    /**
     * Socket::send() -- Send message
     * @param   Mixed     msg     Data to send
     * @return  void
     */
    send : function(msg) {
      if ( this._socket ) {
        console.group("Socket::send()");
        console.log(this._uri, msg);
        console.groupEnd();

        this._socket.send(msg);
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // WEBWORKER
  /////////////////////////////////////////////////////////////////////////////

  /**
   * WebWorker -- Main Background Worker Class
   *
   * @extends Service
   * @class
   */
  var WebWorker = ProcessService.extend({

    _worker      : null,          //!< Worker object
    _worker_uri  : null,          //!< Worker URI
    _on_process  : null,          //!< Worker (onmessage) Processing callback
    _on_error    : null,          //!< Worker (onerror) Error callback
    _running     : null,          //!< Worker running state

    /**
     * WebWorker::init() -- Constructor
     * @throws Exception
     * @constructor
     */
    init : function(uri, process_callback, error_callback) {
      var self = this;

      if ( !OSjs.Compability.SUPPORT_WORKER ) {
        throw ("Cannot create WebWorker: " + OSjs.Public.CompabilityErrors.worker);
      }

      var _default_error = function(ev, line, file, error) {
        var name  = "WebWorker";
        var msg   = sprintf(OSjs.Labels.WebWorkerError, file, line);
        var trace = error;

        CrashCustom(name, msg, trace);

        self.destroy();
      };

      this._worker_uri = uri;
      this._worker     = new Worker(this._worker_uri);
      this._on_process = (typeof process_callback == "function") ? process_callback : function() {};
      this._on_error   = (typeof error_callback == "function") ? error_callback : _default_error;

      this._worker.addEventListener('message', function(ev) {
        self.process(ev, ev.data);
      }, false);
      this._worker.addEventListener('error', function(ev) {
        self.error(ev, ev.lineno, ev.filename, ev.message);
      }, false);

      var src = uri.split("/").pop().split(/^resource\/(.*)\/(.*)$/);
      var title = "Unknown";
      var fname = "Unknown";
      if ( src.length == 4 ) {
        title = src[1];
        fname = src[2];
      }

      this._super(sprintf("%s > WebWorker [%s]", title, fname), "actions/gtk-execute.png", true);

      console.group("WebWorker::init()");
      console.log("URI", uri);
      console.groupEnd();
    },

    /**
     * WebWorker::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      console.group("WebWorker::destroy()");
      if ( this._worker ) {

        try {
          this._worker.removeEventListener('message', function(ev) {
            self.process(ev, ev.data);
          }, false);
          this._worker.removeEventListener('error', function(ev) {
            self.error(ev, ev.lineno, ev.filename, ev.message);
          }, false);
        } catch ( eee ) {}

        try {
          if ( this.terminate() ) {
            console.log("Terminated Worker");
          } else {
            console.error("Failed to Terminate Worker");
          }
        } catch ( eee ) {
          console.error("Error", eee);
        }

        this._worker = null;
      }

      this._worker_uri = null;
      this._on_process = null;
      this._on_error   = null;
      this._running    = false;

      console.groupEnd();

      this._super();
    },

    /**
     * WebWorker::terminate() -- Terminate Worker communication
     * @return bool
     */
    terminate : function() {
      if ( this._worker ) {
        this._worker.terminate();
        this._running = false;
        return true;
      }
      return false;
    },

    /**
     * WebWorker::process() -- Process incoming data
     * @return void
     */
    process : function(ev, data) {
      var res = this._on_process(ev, data);
      if ( res ) {
        this._running = true;
      }
      return res;
    },

    /**
     * WebWorker::error() -- error incoming data
     * @return void
     */
    error : function(ev, line, file, error) {
      return this._on_error(ev, line, file, error);
    },

    /**
     * WebWorker::post() -- Post a message
     * @param   Mixed     message     Message to send
     * @return  Mixed
     */
    post : function(message) {
      if ( this._worker ) {
        return this._worker.postMessage(message);
      }

      return false;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // CORE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Core -- Main Process
   *
   * @extends Process
   * @class
   */
  var Core = Process.extend({

    online  : false,        //!< We are online, are we ?
    running : false,        //!< If core is running
    olint   : null,         //!< On-line checker interval
    cuint   : null,         //!< Cache update interval
    sclint  : null,         //!< Cache  interval

    /**
     * Core::init() -- Constructor
     * @constructor
     */
    init : function() {
      var self = this;

      this.online  = false;
      this.running = false;

      this._super("(Core)", "status/computer-fail.png", true);

      console.group("Core::init()");

      this.boot();

      console.groupEnd();
    },

    /**
     * Core::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      console.group("Core::destroy()");

      // Unbind global events
      if ( this.running ) {
        console.log("Unbinding events...");

        $(document).unbind("keydown",     this.global_keydown);
        $(document).unbind("mousedown",   this.global_mousedown);
        $(document).unbind("mouseup",     this.global_mouseup);
        $(document).unbind("mousemove",   this.global_mousemove);
        $(document).unbind("click",       this.global_click);
        $(document).unbind("dblclick",    this.global_dblclick);
        $(document).unbind("contextmenu", this.global_contextmenu);

        /*window.removeEventListener('offline', function(ev) {
          self.global_offline(ev, !(navigator.onLine === false));
        }, true);
        */
        if ( this.olint ) {
          clearInterval(this.olint);
          this.olint = null;
        }
        if ( this.cuint ) {
          clearInterval(this.cuint);
          this.cuint = null;
        }
        if ( this.sclint ) {
          clearInterval(this.sclint);
          this.sclint = null;
        }
      }

      console.group("Shutting down 'Tooltip'");
      if ( _Tooltip ) {
        _Tooltip.destroy();
      }
      console.groupEnd();

      console.group("Shutting down 'Menu'");
      if ( _Menu ) {
        _Menu.destroy();
      }
      console.groupEnd();

      console.group("Shutting down 'Desktop'");
      if ( _Desktop ) {
        _Desktop.destroy();
      }
      console.groupEnd();

      console.group("Shutting down 'WindowManager'");
      if ( _WM ) {
        _WM.destroy();
      }
      console.groupEnd();

      console.group("Shutting down 'SettingsManager'");
      if ( _Settings ) {
        _Settings.destroy();
      }
      console.groupEnd();

      console.group("Shutting down 'ResourceManager'");
      if ( _Resources ) {
        _Resources.destroy();
      }
      console.groupEnd();

      console.log("Nulling instance...");

      _Core       = null;
      _Resources  = null;
      _Settings   = null;
      _Desktop    = null;
      _WM         = null;
      _Window     = null;
      _Tooltip    = null;
      _Menu    = null;
      _Processes  = [];
      _TopIndex   = 11;

      // Try to remove remaining events
      console.log("Unbinding remaining...");
      try {
        $("*").unbind();
        $("*").die();
      } catch ( eee ) { }

      console.groupEnd();

      this._super();
    },

    /**
     * Core::boot() -- Main booting procedure
     * @return void
     */
    boot : function() {
      var self = this;
      if ( this.running ) {
        return;
      }

      $("#Loading").show();

      DoPost({'action' : 'boot'}, function(response) {
        ENV_CACHE       = response.result.cache;
        ENV_PRODUCTION  = response.result.production;

        // Initialize resources
        _Resources = new ResourceManager(response.result.preload);

        // Initialize settings
        _Settings = new SettingsManager(response.result.registry);

        // Login window handling
        self._login(DEFAULT_USERNAME, DEFAULT_PASSWORD);
      }, function(xhr, ajaxOptions, thrownError) {
        alert("A network error occured while booting OS.js: " + thrownError);
        throw("Initialization error: " + thrownError);
      });
    },

    /**
     * Core::_login() -- Perform login
     * @param  String     username      Username
     * @param  String     password      Password
     * @param  Function   callback      Calback function after ajax
     * @return void
     * @function
     */
    _login : function(username, password, callback) {
      var self = this;
      $("#LoginUsername").val(username);
      $("#LoginPassword").val(password);

      var _disableInput = function() {
        $("#LoginButton").attr("disabled", "disabled");
        $("#LoginUsername").attr("disabled", "disabled").addClass("loading");
        $("#LoginPassword").attr("disabled", "disabled").addClass("loading");
      };
      var _enableInput = function() {
        $("#LoginButton").removeAttr("disabled");
        $("#LoginUsername").removeAttr("disabled").removeClass("loading");
        $("#LoginPassword").removeAttr("disabled").removeClass("loading");
      };

      var _doLoginError = function(server_error) {
        if ( server_error ) {
          MessageBox(OSjs.Labels.LoginFailureOther); // FIXME ?
        } else {
          MessageBox(OSjs.Labels.LoginFailure); // FIXME ?
        }
      };
      var _doLogin = function(response) {
        setTimeout(function() {
          self.login(response);
        }, LOGIN_WAIT);
      };

      $("#LoginButton").focus();

      $("#LoginButton").click(function() {

        var form = {
          "username" : $("#LoginUsername").val(),
          "password" : $("#LoginPassword").val()
        };

        console.group("Core::_login()");
        console.log("Login data:", form);
        console.groupEnd();

        _disableInput();

        DoPost({'action' : 'login', 'form' : form}, function(data) {
          console.log("Login success:", data.success);
          console.log("Login result:", data.result);
          console.groupEnd();

          if ( data.success ) {
            $("#LoginForm").get(0).onsubmit = null;
            _doLogin(data.result);
          } else {
            _enableInput(false);
            _doLoginError();
          }

        }, function() {
          _doLoginError(true);
          _enableInput();
        });
      });

      /*
      if ( !ENV_PRODUCTION ) {
        $("#LoginButton").click();
        $("#LoginButton").attr("disabled", "disabled");
      }
      */

      _enableInput();
    },

    login : function(response) {
      var self = this;
      if ( this.running ) {
        return;
      }

      // Globals
      _SessionId        = response.sid;
      _BrowserLanguage  = response.lang_browser;
      _SystemLanguage   = response.lang_user;

      _Settings.run(response.registry, response.session, response.packages);

      if ( response.preload ) {
        _Resources.addResources(response.preload.resources, null, function(error) {
          if ( !error ) {
            self._run();
          } // FIXME: ERROR
        });
      } else {
        this._run();
      }
    },

    /**
     * Core::shutdown() -- Main shutdown procedure
     * @param bool  save    Save session ?
     * @return void
     */
    shutdown : function(save) {
      var usession  = JSON.stringify(_Settings.getSession());
      var duration  = ((new Date()).getTime()) - _StartStamp;

      console.group("Core::shutdown()");
      console.log("Session duration", duration);
      console.groupEnd();

      var _shutdown = function() {
        DoPost({'action' : 'shutdown', 'session' : usession, 'duration' : duration, 'save' : save}, function(data) {
          if ( data.success ) {
            console.log("Core::shutdown()", "Shutting down...");

            OSjs.__Stop();
          } else {
            MessageBox(data.error);
          }
        }, function(xhr, ajaxOptions, thrownError) {
          alert("A network error occured while shutting down OS.js: " + thrownError);
          throw("Shutdown error: " + thrownError);
        });
      };

      if ( save ) {
        _Settings._save(false, function() {
          _shutdown();
        });
      } else {
        _shutdown();
      }
    },

    /**
     * Core::leaving() -- When user leaves the page
     * @return void
     */
    leaving : function(ev) {
      ev = ev || window.event;

      if ( _Running ) {
        ev.cancelBubble = true;
        if ( ev.stopPropagation ) {
          ev.stopPropagation();
          ev.preventDefault();
        }

        var msg = OSjs.Labels.Quit;
        ev.returnValue = msg;

        return msg;
      }

      return true;
    },

    /**
     * Core::_run() -- Main startup
     * @return void
     */
    _run : function(data) {
      var self = this;

      if ( this.running ) {
        return;
      }

      console.group("Core::run()");

      // Load initial data
      DoPost({'action' : 'init'}, function(data) {
        if ( data.success ) {
          self.run();
        } else {
          MessageBox(data.error);
        }

        console.groupEnd();
      }, function(xhr, ajaxOptions, thrownError) {
        alert("A network error occured while initializing OS.js: " + thrownError);
        throw("Initialization error: " + thrownError);
      });

      this.online = true;
    },

    /**
     * Core::run() -- Main startup procedure wrapper
     * @return void
     */
    run : function() {
      var self = this;

      if ( this.running ) {
        return;
      }

      // Register confirm leave page thingy
      window.onbeforeunload = function(ev) {
        return self.leaving(ev);
      };

      _Running = true; // GLOBAL

      var load    = $("#Loading");
      var bar     = $("#LoadingBar");

      bar.progressbar({value : 5});

      /*window.addEventListener('offline', function(ev) {
        self.global_offline(ev, !(navigator.onLine === false));
      }, true);*/

      this.olint = setInterval(function(ev) {
        self.global_offline(ev, !(navigator.onLine === false));
      }, ONLINECHK_FREQ);

      this.sclint = setInterval(function(ev) {
        self.global_endsession(ev, GetCookie(SESSION_KEY));
      }, SESSION_CHECK);

      bar.progressbar({value : 10});

      // Initialize desktop etc.
      _Tooltip = new Tooltip();
      _Desktop = new Desktop();
      _WM      = new WindowManager();
      bar.progressbar({value : 15});

      // >>> Window Manager
      bar.progressbar({value : 30});
      try {
        _WM.run();
      } catch ( exception ) {
        _WM.destroy(); // DESTROY IF FAILED

        /*if ( exception instanceof OSjs.Classes.ProcessException ) {
          alert(exception.getMessage() || exception);
          return;
        } else {
          throw exception;
        }
        */
        alert(sprintf(OSjs.Labels.CrashCoreRunService, "WindowManager", exception));
      }

      // >>> Desktop
      bar.progressbar({value : 40});
      try {
        _Desktop.run();
      } catch ( exception ) {
        _Desktop.destroy(); // DESTROY IF FAILED

        if ( exception instanceof OSjs.Classes.ProcessException ) {
          var name  = exception.getProcessName();
          var msg   = exception.getMessage();
          var trace = exception.getStack();

          CrashCustom(name, msg, trace);
        } else {
          console.groupEnd();
          throw exception;
        }
      }

      // >>> Compability
      bar.progressbar({value : 70});
      if ( _Settings._get("user.first-run") === "true" ) {
        LaunchString("API::CompabilityDialog");
        _Settings._set("user.first-run", "false");

        setTimeout(function() {
          var _l = OSjs.Labels.FirstRun;
          var _i = sprintf(ICON_URI_32, "emotes/face-smile-big.png");
          API.system.notification(_l.title, _l.message, _i);
        }, 500);
      } else {
        if ( _SRevisionChange ) {
          setTimeout(function() {
            var _l = OSjs.Labels.SRevisionChange;
            var _i = sprintf(ICON_URI_32, "status/appointment-missed.png");
            API.system.notification(_l.title, _l.message, _i, -1);
          }, 500);
        }
      }

      // Bind global events
      $(document).bind("keydown",     this.global_keydown);
      $(document).bind("mousedown",   this.global_mousedown);
      $(document).bind("mouseup",     this.global_mouseup);
      $(document).bind("mousemove",   this.global_mousemove);
      $(document).bind("click",       this.global_click);
      $(document).bind("dblclick",    this.global_dblclick);
      $(document).bind("contextmenu", this.global_contextmenu);

      // Session
      setTimeout(function() {
        bar.progressbar({value : 80});

        var autostarters = _Settings._get("user.autorun", true);
        if ( autostarters ) {
          var ai = 0, al = autostarters.length;
          for ( ai; ai < al; ai++ ) {
            LaunchBackgroundService(autostarters[ai]);
          }
        }

        bar.progressbar({value : 85});

        var do_restore = _Settings._get("user.session.autorestore");
        if ( do_restore === true || do_restore === "true" ) {
          API.session.restore();
        }

        bar.progressbar({value : 90});

        // >>> Finished
        setTimeout(function() {
          setTimeout(function() {
            load.fadeOut(ANIMATION_SPEED);

            // NOTE: Fixes global_keydown "not responding upon init" issues
            $(document).focus();

            bar.progressbar({value : 100});

            self.running = true;
          }, 125);

        }, 250); // <<< Finished

      }, 500);
    },

    //
    // SESSIONS
    //

    /**
     * Core::sessionSnapshotSave() -- Create a [remote] session snapshot
     * @param   String        name        Name of the session
     * @param   Function      callback    Callback function upon result/error
     * @return void
    sessionSnapshotSave : function(name, callback) {
      callback = callback || function() {};
      name     = name     || "";

      if ( name ) {
        var session = this.getSession();
        DoPost({'action' : 'snapshotSave', 'session' : {'data' : session, 'name' : name}}, function(data) {
          if ( data.success ) {
            callback(true, data.result, session);
          } else {
            callback(false, data.error, session);
          }
        });
      }
    },
     */

    /**
     * Core::sessionSnapshotLoad() -- Load a [remote] session snapshot
     * @param   String        name        Name of the session
     * @param   Function      callback    Callback function upon result/error
     * @param   bool          create      Create the session (Default = true)
     * @return void
    sessionSnapshotLoad : function(name, callback, create) {
      var self = this;

      callback = callback || function() {};
      name     = name     || "";
      create   = create === undefined ? true : (create ? true : false);

      if ( name ) {
        DoPost({'action' : 'snapshotLoad', 'session' : {'name' : name}}, function(data) {
          if ( data.success ) {
            if ( create ) {
              self.setSession(data.result.session, true);
            }

            callback(true, data.result);
          } else {
            callback(false, data.error);
          }
        });
      }
    },
     */

    /**
     * Core::sessionSave() -- Save current [local] session (shutdown feature)
     * @param   bool    save      Save session (Default = true, otherwise empty session)
     * @return  JSON
     */
    sessionSave : function(save) {
      var sess = (save === true) ? this.getSession() : {};
      return _Settings.saveSession(sess);
    },

    /**
     * Core::sessionRestore() -- Restore last saved [local] session (boot feature)
     * @return  JSON
     */
    sessionRestore : function() {
      var session = _Settings.restoreSession();
      this.setSession(session);
      return session;
    },

    //
    // EVENTS
    //


    /**
     * Core::global_endsession() -- The Browser 'session cache clear' event handler
     * @param   DOMEvent    ev      DOM Event
     * @param   bool        state   If we went off-line
     * @return  void
     */
    global_endsession : function(ev, sid) {
      //console.info("Session valid", _SessionValid, "Registered", _SessionId, "Current", sid);
      if ( _SessionValid ) {
        if ( !sid || (_SessionId != sid) ) {
          var ico = sprintf(ICON_URI_32, "status/network-error.png");
          // FIXME
          //API.system.notification("Error", OSjs.Labels.SessionFailure, ico); // FIXME: Language title
          API.system.notification("Unexpected Error", "You have lost your server session.<br />This may cause errors, and you should restart!.", ico); // FIXME: Language title

          _SessionValid = false;
        }
      }
    },

    /**
     * Core::global_offline() -- The Browser 'offline' event handler
     * @param   DOMEvent    ev      DOM Event
     * @param   bool        state   If we went off-line
     * @return  void
     */
    global_offline : function(ev, state) {
      if ( !state ) { // Offline
        if ( this.online ) {
          this.online = false;

          API.system.notification("Warning", OSjs.Labels.WentOffline); // FIXME: Language title

          console.log("Core::global_offline()", this.online);
        }
      } else { // Online
        if ( !this.online ) {
          this.online = true;

          API.system.notification("Information", OSjs.Labels.WentOnline); // FIXME: Language title

          console.log("Core::global_offline()", this.online);
        }
      }
    },

    /**
     * Core::global_keydown() -- Global Event Handler: keydown
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
     */
    global_keydown : function(ev) {
      var key = ev.keyCode || ev.which;
      var target = ev.target || ev.srcElement;

      KEY_CTRL  = false;
      KEY_ALT   = false;
      KEY_SHIFT = false;

      if ( key == 17 ) {
        KEY_CTRL = true;
      } else if ( key == 18 ) {
        KEY_ALT = true;
      } else if ( key == 16 ) {
        KEY_SHIFT = true;
      }

      // ESC cancels dialogs
      if ( key === 27 ) {
        if ( _Window && _Window._is_dialog ) {
          _Window.$element.find(".ActionClose").click();
          return false;
        }
      }

      if ( target ) {
        // TAB key only in textareas
        if ( key === 9 ) {
          if ( target.tagName.toLowerCase() == "textarea" ) {
            var cc = getCaret(target);
            var val = $(target).val();

            $(target).val( val.substr(0, cc) + "\t" + val.substr(cc, val.length) );

            var ccc = cc + 1;
            setSelectionRangeX(target, ccc, ccc);

          }
          return false;
        }
      }

      return true;
    },

    /**
     * Core::global_click() -- Global Event Handler: click
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_click : function(ev) {
      //ev.preventDefault(); FIXME???

      if ( _Menu ) {
        _Menu.handleGlobalClick(ev);
      }

      _Tooltip.hide();
    },

    /**
     * Core::global_dblclick() -- Global Event Handler: dblclick
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_dblclick : function(ev) {
      ev.preventDefault();
    },

    /**
     * Core::global_mousedown() -- Global Event Handler: mousedown
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
     */
    global_mousedown : function(ev) {
      var t = ev.target || ev.srcElement;
      if ( t && t.tagName ) {
        var tmp = $(t);
        if ( !tmp.hasClass("GtkTextView") && !tmp.hasClass("textarea") && !tmp.parents(".textarea").length ) {
          var tagName = t.tagName.toLowerCase();
          if ( tagName !== "canvas" && tagName !== "input" && tagName !== "textarea" && tagName !== "select" && tagName != "option" ) {
            ev.preventDefault();
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Core::global_mouseup() -- Global Event Handler: mouseup
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_mouseup : function(ev) {
      API.ui.rectangle.hide(ev);
    },

    /**
     * Core::global_mousemove() -- Global Event Handler: mousemove
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_mousemove : function(ev) {
      API.ui.rectangle.update(ev);
    },

    /**
     * Core::global_contextmenu() -- Global Event Handler: contextmenu
     * @param   DOMEvent    e       DOM Event
     * @return  bool
     */
    global_contextmenu : function(e) {
      if ( $(e.target).hasClass("ContextMenu") || $(e.target).hasClass("Menu") || $(e.target).parent().hasClass("ContextMenu") || $(e.target).parent().hasClass("Menu") ) {
        return false;
      }

      if ( e.target.id === "Desktop" || e.target.id === "Panel" || e.target.id === "ContextMenu" ) {
        return false;
      }
      return true;
    },

    // GETTERS / SETTERS

    /**
     * Core::getProccesses() -- Get all running processes
     * @return Array
     */
    getProcesses : function() {
      var now = (new Date()).getTime();
      var procs = [];

      var i = 0;
      var l = _Processes.length;
      var p;
      if ( l ) {
        for ( i; i < l; i++ ) {
          p = _Processes[i];

          if ( p !== undefined ) {
            var ckill = (function(pp) {
              return function() {
                return pp.kill();
              };
            })(p);

            procs.push({
              'pid'     : p._pid,
              'name'    : p._name,
              'time'    : (now - p._started.getTime()),
              'icon'    : p._proc_icon,
              'title'   : p._proc_name,
              'locked'  : p._locked,
              //'windows' : (p instanceof Application ? p._windows : []),
              'subp'    : (p._getWorkerCount) ? (p._getWorkerCount()) : 0,
              'service' : (p instanceof ProcessService),
              'kill'    : ckill
            });
          }
        }
      }

      return procs;
    },

    /**
     * Core::getSession() -- Get current Desktop session data
     * @return JSON
     */
    getSession : function() {
      var sess = [];

      var i = 0;
      var l = _Processes.length;
      var p, s;
      for ( i; i < l; i++ ) {
        p = _Processes[i];
        if ( p !== undefined && (p instanceof Application) ) {
          s = p._getSessionData();
          if ( s !== false ) {
            sess.push(s);
          }
        }
      }

      return sess;
    },


    /**
     * Core::setSession() -- Restore a session
     * @return void
     */
    setSession : function(session, full) {
      full = full ? true : false;

      if ( full ) {
        _Settings.saveSession(session);
        window.location.reload();
        return;
      }

      var i = 0;
      var l = session.length;
      var s;

      console.group("Core::setSession()");
      console.log("Size", l);
      console.log("Data", session);
      console.groupEnd();

      for ( i; i < l; i++ ) {
        s = session[i];
        if ( s ) {
          API.system.launch(s.name, s.argv, s.windows);
        }
      }

      if ( i ) {
        setTimeout(function() {
          var _l = OSjs.Labels.SessionRestore;
          var _i = sprintf(ICON_URI_32, "status/appointment-soon.png");
          API.system.notification(_l.title, _l.message, _i);
        }, 500);
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MANAGERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * ResourceManager -- Resource Manager
   * Takes care of CSS, JavaScript loading etc.
   *
   * @extends Process
   * @class
   */
  var ResourceManager = Process.extend({

    resources : [],       //!< Resources array
    links     : [],       //!< Resource link array

    /**
     * ResourceManager::init() -- Constructor
     * @constructor
     */
    init : function(preload) {
      var self = this;

      console.group("ResourceManager::init()");
      console.log("Preload", preload);

      this.resources  = [];
      this.links      = [];

      console.groupEnd();

      this._super("(ResourceManager)", "apps/system-software-install.png", true);

      if ( preload ) {
        console.log("Preloading", preload);
        console.groupEnd();

        PreloadDefaultImages(ICON_URI_16, preload.images, function(loaded, failed, total) {
          console.log("ResourceManager::init()", loaded, "of", total, "(" + failed + " failures)");
        });
      }
    },


    /**
     * ResourceManager::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      forEach(this.links, function(i, el) {
        $(el).remove();
      });

      this.resources = null;
      this.links = null;

      this._super();
    },

    /**
     * ResourceManager::updateManifest() -- Force MANIFEST update
     * @return void
     */
    updateManifest : function() {
      var cache = window.applicationCache;

      var updateCache = function() {
        cache.swapCache();
        setTimeout(function() {
          cache.removeEventListener('updateready', updateCache, false);
        }, 0);
      };

      // Swap cache with updated data
      cache.addEventListener('updateready', updateCache, false);

      // Update cached data and call updateready listener after
      if ( cache.status == cache.UPDATEREADY ) {
        cache.update();
      }

    },

    /**
     * ResourceManager::hasResource() -- Check if given resource is already loaded
     * @param   String      res       Resource URI
     * @return  bool
     */
    hasResource : function(res) {
      return in_array(res, this.resources);
    },

    /**
     * ResourceManager::addResource() -- Add a resource (load)
     * @param   String      res       Resource URI
     * @param   String      app       Application Name (if any)
     * @param   Function    callback  onload callback (if any)
     * @return  void
     */
    addResource : function(res, app, callback) {
      app = app || "";
      callback = callback || function() {};

      var _name = (app ? (app + "/" + res) : (res));
      if ( this.hasResource(_name) ) {
        callback(false);
        return;
      }

      if ( res.match(/^worker\./) || res.match(/[^(\.js|\.css)]$/) ) {
        callback(false);
        return;
      }

      var extra   = app ? (app + "/") : "";
      var type    = res.split(".");
          type    = type[type.length - 1];

      /* NOTE: WTF
      var error   = false;
      var onload_event = function(el) {
        self.resources.push(_name);
        self.links.push(el);

        callback(error);
      };
      */

      var t_callback = function(addedres, had_error) {
        console.group("ResourceManager::addResource()");
        console.log("Added", addedres);
        console.groupEnd();

        callback(had_error);
      };

      var head  = document.getElementsByTagName("head")[0];
      if ( type == "js" ) {
        var triggered             = false;
        var script                = document.createElement("script");
        script.type               = "text/javascript";
        script.onreadystatechange = function() {
          if ( (this.readyState == 'complete' || this.readyState == 'complete') && !triggered) {
            triggered = true;
            t_callback(script, false);
          }
        };
        script.onload = function() {
          triggered = true;
          t_callback(script, false);
        };
        script.onerror = function() {
          triggered = true;
          t_callback(script, true);
        };
        script.src = RESOURCE_URI + extra + res;
        head.appendChild(script);
        delete script;
      } else {
        if ( document.createStyleSheet ) {
          var el = document.createStyleSheet(RESOURCE_URI + res);

          t_callback(el, false);
        } else {
          var stylesheet  = document.createElement("link");
          stylesheet.rel  = "stylesheet";
          stylesheet.type = "text/css";
          stylesheet.href = RESOURCE_URI + extra + res;

          var sheet = "styleSheet";
          var cssRules = "rules";
          if ( "sheet" in stylesheet ) {
            sheet = "sheet";
            cssRules = "cssRules";
          }

          var timeout_t = null;
          var timeout_i = setInterval(function() {
            try {
              if ( stylesheet[sheet] && stylesheet[sheet][cssRules].length ) {
                clearInterval(timeout_i);
                if ( timeout_t ) {
                  clearTimeout(timeout_t);
                }
                t_callback(stylesheet, false);
              }
            } catch( e ) {
              (function() {})();
            } finally {
              (function() {})();
            }
          }, 10 );

          timeout_t = setTimeout(function() {
            if ( timeout_i ) {
              clearInterval(timeout_i);
            }
            clearTimeout(timeout_t);
            t_callback(stylesheet, true);
            head.removeChild(stylesheet);
          }, TIMEOUT_CSS);


          head.appendChild(stylesheet);
        }
      }

    },

    /**
     * ResourceManager::addResources() -- Add an array with resources and call-back
     * @param   Array     res         Resource URI array
     * @param   String    app         Application Name (if any)
     * @param   Function  callback    Call when done adding
     * @return  void
     */
    addResources : function(res, app, callback) {
      var cont = true;

      if ( res ) {
        console.group("ResourceManager::addResources()");
        console.log("Adding", res);
        console.log("Application", app);
        console.groupEnd();

        var i = 0;
        var l = res.length;

        // Create a temporary callback for the queue
        if ( l > 0 ) {
          cont = false;

          var tmp_counter  = l;
          var has_failed   = false;
          var tmp_callback = function(failed) {
            tmp_counter--;
            if ( !has_failed && failed ) {
              has_failed = true;
            }

            if ( tmp_counter <= 0 ) {
              setTimeout(function() {
                callback(has_failed);
              }, 0);
            }
          };

          for ( i; i < l; i++ ) {
            this.addResource(res[i], app, tmp_callback);
          }
        }
      }

      if ( cont ) {
        setTimeout(function() {
          callback(false);
        }, 0);
      }
    }
  }); // @endclass

  /**
   * SettingsManager -- Settings Manager
   * Uses localSettings (WebStorage) to handle session data
   *
   * @extends Process
   * @class
   */
  var SettingsManager = Process.extend({

    _registry   : [],
    _session    : {
      "settings" : {},
      "defaults" : {},
      "session"  : {}
    },
    _cinterval  : null,     //!< Space checking interval

    /**
     * SettingsManager::init() -- Constructor
     * @param   Object    registry      Default registry
     * @constructor
     */
    init : function(registry) {
      console.group("SettingsManager::init()");

      this._registry = registry;

      this._super("(SettingsManager)", "apps/system-software-update.png", true);

      console.log("Registry", registry);
      console.log("Usage", this.getStorageUsage());

      // Make sure we have all external refs saved
      for ( var i in this._session ) {
        if ( this._session.hasOwnProperty(i) ) {
          if ( !localStorage.getItem(i) ) {
            localStorage.setItem(i, "{}");
          }
        }
      }

      // Deprecated!
      localStorage.removeItem("system.app.registered");
      localStorage.removeItem("system.panel.registered");
      localStorage.removeItem("system.application.installed");
      localStorage.removeItem("system.panelitem.installed");
      localStorage.removeItem("system.installed.application");
      localStorage.removeItem("system.installed.panelitem");
      localStorage.removeItem("system.installed.packages");
      localStorage.removeItem("desktop.panel.items");
      localStorage.removeItem("desktop.panel.position");
      localStorage.removeItem("applications");
      localStorage.removeItem("SETTINGS_REVISION");

      // Create space checking interval
      this._initQuota();

      console.groupEnd();
    },

    /**
     * SettingsManager::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._registry = null;
      this._session  = null;

      if ( this._cinterval ) {
        clearInterval(this._cinterval);
      }
      this._cinterval = null;

      this._super();
    },

    run : function(user_registry, user_session, user_packages) {
      this._applyUserRegistry(user_registry);
      this._applyUserSession(user_session);
      this._applyUserPackages(user_packages);
    },

    _applyUserRegistry : function(registry) {
     console.group("SettingsManager::_applyUserSettings()");
     if ( !(registry instanceof Object) || !registry ) {
       registry = {};
     }

      var i;
      for ( i in registry ) {
        if ( registry.hasOwnProperty(i) ) {
          console.log(i, this._registry[i].type, registry[i]);

          switch ( this._registry[i].type ) {
            case "bool":
            case "boolean":
              var val = "false";
              if ( registry[i] === "true" || registry[i] === true ) {
                val = "true";
              }
              this._set(i, val);
            break;

            //case "array":
            case "list":
              this._set(i, JSON.parse(registry[i]));
            break;

            default :
              this._set(i, registry[i]);
            break;
          }
        }
      }

      console.groupEnd();
    },

    _applyUserSession : function(session) {
     console.group("SettingsManager::_applyUserSession()");
     if ( !(session instanceof Object) || !session ) {
       session = {};
     }

      var i;
      for ( i in session ) {
        if ( session.hasOwnProperty(i) ) {
          console.log(i, session[i]);
          this._set(i, session[i]);
        }
      }

      console.groupEnd();
    },

    _applyUserPackages : function(packages) {
      var self = this;
      if ( this._tmpcheck )
        return;

      console.log("SettingsManager::_applyUserPackages()");

      var _update = function(d) {
        if ( (d instanceof Object) ) {
          _PanelCache             = d.PanelItem || [];
          _AppCache               = d.Application || [];
          _BackgroundServiceCache = d.BackgroundService || [];
        }

        console.group("SettingsManager::_applyUserPackages()");
        console.log("PanelCache", _PanelCache);
        console.log("AppCache", _AppCache);
        console.log("BackgroundServiceCache", _BackgroundServiceCache);
        console.groupEnd();
      };

      if ( !packages ) {
        this._tmpcheck = true;
        DoPost({'action' : 'updateCache'}, function(data) {
          if ( data.result ) {
            _update(data.result);
          }
          self._tmpcheck = false;
        }, function() {
          self._tmpcheck = false;
        });
      } else {
        _update(packages);
      }

    },

    /**
     * SettingsManager::_initQuota() -- Initialize quota checking
     * @return void
     */
    _initQuota : function() {
      var self = this;
      var warnOpen = false;
      var alertOpen = false;

      this._cinterval = setInterval(function() {
        var size = self.getStorageUsage()['localStorage'];
        if ( size >= WARN_STORAGE_SIZE ) {
          if ( !warnOpen ) {
            API.system.alert(sprintf(OSjs.Labels.StorageWarning, size, WARN_STORAGE_SIZE), "warning", function() {
              warnOpen = false;
            });
            warnOpen = true;
          }
        }
        if ( size >= MAX_STORAGE_SIZE ) {
          if ( !alertOpen ) {
            API.system.alert(sprintf(OSjs.Labels.StorageAlert, size, MAX_STORAGE_SIZE), "error", function() {
              alertOpen = false;
            });
            alertOpen = true;
          }
        }
      }, STORAGE_SIZE_FREQ);
    },

    /**
     * SettingsManager::savePackageStorage() -- Save package data
     * @param   String    name      Application name
     * @param   Object    props     Application settings
     * @return  void
     */
    savePackageStorage : function(name, props) {
      var storage = localStorage.getItem("settings");
      if ( !storage ) {
        storage = {};
      } else {
        try {
          storage = JSON.parse(storage);
        } catch ( e ) {
          storage = {};
        }
      }
      storage[name] = props;

      localStorage.setItem("settings", JSON.stringify(storage));

      console.group("SettingsManager::savePackageStorage()");
      console.log(name);
      console.log(props);
      console.groupEnd();

      return props;
    },

    /**
     * SettingsManager::loadPackageStorage() -- Load package data
     * @param   String    name      Application name
     * @return  JSON
     */
    loadPackageStorage : function(name) {
      var storage = localStorage.getItem("settings");
      var res;
      if ( storage ) {
        try {
          res = JSON.parse(storage);
        } catch ( e ) {}
      }

      if ( (res instanceof Object) ) {
        if ( res[name] ) {

          console.group("SettingsManager::loadPackageStorage()");
          console.log(name);
          console.log(res[name]);
          console.groupEnd();

          return res[name];
        }
      }

      return false;
    },

    /**
     * SettingsManager::savePanel() -- Save a panel session data
     * @return bool
     */
    savePanel : function(p) {
      if ( p instanceof Panel ) {
        var sess = p.getSession();
        var items = [];

        // Panel Items
        var i, iter, opts;
        for ( i = 0; i < sess.items.length; i++ ) {
          iter  = sess.items[i];
          items.push([iter.name, iter.opts, (iter.align + ":" + iter.position)]);
        }
        delete i;
        delete iter;
        delete opts;

        // Panel
        var json = {
          name      : sess.name,
          index     : sess.index,
          position  : sess.position,
          items     : items
        };

        console.group("SettingsManager::savePanel()");
        console.log(p, sess);
        console.log("Result", json);
        console.groupEnd();

        var pp = 0, panels = this._get("desktop.panels", true);
        for ( pp; pp < panels.length; pp++ ) {
          if ( (panels[pp].name == json.name) && (panels[pp].index == json.index) ) {
            panels[pp] = json;
            console.log("Saved panel", pp, panels[pp]);
            break;
          }
        }

        this._set("desktop.panels", panels);

        return true;
      }
      return false;
    },

    /**
     * SettingsManager::saveSession() -- Save a session
     * @param  Object     session     Session
     * @return Object
     */
    saveSession : function(session) {
      localStorage.setItem('session', (session instanceof Object) ? JSON.stringify(session) : session);
      return session;
    },

    /**
     * SettingsManager::restoreSession() -- Restore previous session
     * @return Object
     */
    restoreSession : function() {
      var item    = localStorage.getItem('session');
      return (item ? JSON.parse(item): {});
    },

    modifyPackage : function(action, p, args) {
      var result;
      var activated = _Settings._get("user.installed.packages", true);

      console.group("SettingsManager::modifyPackage()");
      console.log("Doing", action, "using", p, "and", args);
      console.log("Current", activated);

      var op_start = [];
      var op_stop  = [];

      // Manipulate storage
      switch ( action ) {
        case "enable"   :
          if ( in_array(args.type, ["Application", "PanelItem", "BackgroundService"]) ) {
            if ( !in_array(p, activated) ) {
              activated.push(p);
              result = true;

              if ( args.type === "BackgroundService" ) {
                op_start.push(args.name);
              }
            }
          }
        break;
        case "disable" :
          for ( var i = 0; i < activated.length; i++ ) {
            if ( activated[i] == p ) {
              activated.splice(i, 1);
              result = true;

              if ( args.type === "BackgroundService" ) {
                op_stop.push(p);
              }
              break;
            }
          }
        break;
        case "uninstall"  :
          //this.updateCache(true);
          result = false;
        break;
        case "install" :
          //this.updateCache(true);
          result = false;
        break;
        default :
          result = false;
        break;
      }

      // Now save
      if ( result === true ) {
        _Settings._set("user.installed.packages", activated);
      }

      /* NOTE: Goodshit
      console.log("Starting", op_start.length, "services", op_start);
      console.log("Stopping", op_stop.length, "services", op_stop);

      if ( op_start.length ) {
        for ( var opi = 0; opi < op_start.length; opi++ ) {
          LaunchBackgroundService(op_start[opi]);
        }
      }

      if ( op_stop.length ) {
        var procs = _Core.getProcesses();
        var brk = false, cur;
        for ( var opl = 0; opl < op_stop.length; opl++ ) {
          cur = op_stop[opl];
          for ( var opx = 0; opx < procs.length; opx++ ) {
            if ( procs[opx].name == cur ) {
              procs[opx].kill();
              brk = true;
              break;
            }
          }

          if ( brk )
            break;
        }
      }
      */

      console.log("Resulted", result, activated);
      console.groupEnd();

      return result;
    },

    /**
     * SettingsManager::_apply() -- Apply a changeset
     * @param   Object    settings    Settings Array
     * @return  void
     */
    _apply : function(settings) {
      console.group("SettingsManager::_apply()");
      console.log("Applying", settings);

      var changed = false;
      for ( var i in settings ) {
        if ( settings.hasOwnProperty(i) ) {
          this._set(i, settings[i]);

          changed = true;
        }
      }

      if ( changed ) {
        this._save(true, function() {
          console.groupEnd();
        });
      } else {
        console.groupEnd();
      }
    },

    /**
     * SettingsManager::_save() -- Save settings
     * @return void
     */
    _save : function(internal, callback) {
      internal = internal === undefined ? true : (internal ? true : false);
      callback = callback || function() {};

      // NOTE: Fix, save the current on server-side
      var session   = this.getSession();
      if ( session && session.session ) {
        session.session = {};
      }

      var uregistry = JSON.stringify(this.getRegistry());
      var usession  = JSON.stringify(session);
      var pargs     = {"action" : "settings", "registry" : uregistry, "session" : usession};

      DoPost(pargs, function(data) {
          if ( data.error ) {
            if ( internal ) {
              API.system.notification("System Settings", "Failed to save settings", sprintf(ICON_URI_32, "emblems/emblem-important.png")); // FIXME: Locale
            }
            callback(false);
          } else {
            if ( internal ) {
              API.system.notification("System Settings", "Your settings was saved", sprintf(ICON_URI_32, "emblems/emblem-default.png")); // FIXME: Locale
            }
            callback(true);
          }
      }, function() {
        if ( internal ) {
          API.system.notification("System Settings", "Failed to save settings (server error)", sprintf(ICON_URI_32, "emblems/emblem-important.png")); // FIXME: Locale
        }
        callback(false);
      });
    },

    /**
     * SettingsManager::_set() -- Set a storage item by key and value
     * @param   String    k       Settings Key
     * @param   Mixed     v       Settings Value
     * @return  void
     */
    _set : function(k, v) {
      try {
        if ( (typeof v === "boolean") || (v instanceof Boolean) ) {
          v = (v ? "true" : "false");
        } else if ( (v instanceof Object || v instanceof Array) ) {
          v = JSON.stringify(v);
        }
        localStorage.setItem(k, v);
      } catch ( e ) {
        // Caught by interval!
        //  if ( e == QUOTA_EXCEEDED_ERR ) {
        //    (function() {})();
      }
    },

    /**
     * SettingsManager::_get() -- Get a storage item by key
     * @param   String    k       Settings Key
     * @param   bool      json    Parse as JSON
     * @return  Mixed
     */
    _get : function(k, json) {
      var t = this.getType(k);
      var v = localStorage.getItem(k);

      if ( (json = json || false) ) {
        try {
          v = JSON.parse(v);
        } catch ( e ) {
          v = [];
        }
      }

      return v;
    },

    /**
     * SettingsManager::setDefaultApplication() -- Set default application MIME
     * @param   String    app       Application Name
     * @param   String    mime      MIME Type
     * @param   String    path      Path (Default = undefined)
     * @return  void
     */
    setDefaultApplication : function(app, mime, path) {
      var list = JSON.parse(localStorage.getItem("defaults") || "{}");
      list[mime] = app;
      localStorage.setItem("defaults", JSON.stringify(list));
    },

    /**
     * SettingsManager::getDefaultApplications() -- Get default applications for MIME
     * @return Object
     */
    getDefaultApplications : function() {
      return JSON.parse(localStorage.getItem("defaults") || "{}");
    },

    /**
     * SettingsManager::getType() -- Get storage item type by key
     * @param   String    key     Settings Key
     * @return  String
     */
    getType : function(key) {
      return (this._registry[key] ? (this._registry[key].type) : null);
    },

    /**
     * SettingsManager::getOptions() -- Get storage item option  by key
     * @param   String    key     Settings Key
     * @return  Mixed
     */
    getOptions : function(key) {
      var type = this.getType(key);
      if ( type == "array" ) {
        return this._registry[key].options || [];
      } else if ( type == "list" ) {
        return this._registry[key].items || [];
      }
      return null;
    },

    /**
     * SettingsManager::getRegistry() -- Get current Storage registry data
     * @return JSON
     */
    getRegistry : function() {
      var exp = {};
      for ( var i in this._registry ) {
        exp[i] = this._get(i, in_array(this._registry[i], ["list", "array"]));
      }
      return exp;
    },

    /**
     * SettingsManager::getSession() -- Get current Storage session data
     * @return JSON
     */
    getSession : function() {
      var exp = {};
      for ( var i in this._session ) {
        exp[i] = localStorage.getItem(i, true);
      }
      return exp;
    },

    /**
     * SettingsManager::getStorageUsage() -- Get storage usage
     * @return Array
     */
    getStorageUsage : function() {
      var ls = 0;

      for ( var l in localStorage ) {
        if ( localStorage.hasOwnProperty(l) ) {
          ls += localStorage[l].length;
        }
      }

      return {
        'localStorage' : ls
      };
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // BACKGROUNDSERVICE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * BackgroundService -- The Panel Item Class
   * Basis for a PanelItem
   *
   * @extends Process
   * @class
   */
  var BackgroundService = Process.extend({

    /**
     * BackgroundService::init() -- Constructor
     * @constructor
     */
    init : function(name, icon)  {
      this._super(name, icon);
    },

    /**
     * BackgroundService::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._super();
    },

    /**
     * BackgroundService::run() -- Run Service
     * @return  void
     */
    run : function() {
      //this._super(); // NOTE: DO NOT !
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Application -- The base Application class
   * Basis for application (empty)
   *
   * Application can store running arguments/parameters
   * via the 'argv' object. This is stored in browser's
   * storage and is applied upon application construction.
   *
   * @see     Window
   * @extends Process
   * @class
   */
  var Application = Process.extend({

    _argv         : {},           //!< Application staring arguments (argv)
    _name         : "",           //!< Application name
    _running      : false,        //!< Application running state
    _root_window  : null,         //!< Application root Window
    _windows      : [],           //!< Application Window list
    _storage      : {},           //!< Application Storage
    _storage_on   : false,        //!< Application Storage enabled state
    _compability  : [],           //!< Application compability list
    _workers      : {},           //!< Application WebWorker(s)
    _sockets      : {},           //!< Applicaiton Socket(s)
    _bindings     : {},           //!< Application Binding(s)

    /**
     * Application::init() -- Constructor
     * @param   String    name      Application Name
     * @param   Array     argv      Application Staring arguments (argv)
     * @constructor
     */
    init : function(name, argv) {
      this._argv        = argv || {};
      this._name        = name;
      this._running     = false;
      this._root_window = null;
      this._windows     = [];
      this._storage     = {};
      this._storage_on  = false;
      this._compability = [];
      this._workers     = {};
      this._sockets     = {};
      this._bindings    = {
        "vfs" : []
      };

      console.group("Application::init()");
      console.log(name);
      console.groupEnd();

      this._super(name);
    },

    /**
     * Application::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      var self = this;
      if ( this._running ) {
        this._saveStorage();      // Save storage settings
        this._clearWorkers();     // Clear WebWorkers
        this._clearSockets();     // Clear Sockets

        if ( this._root_window ) {
          setTimeout(function() { // NOTE: Required!
            for ( var i = 0; i < self._windows.length; i++ ) {
              self._windows[i].close();
            }

            self._root_window.close();
          }, 0);
        }

        console.log("Application::" + this._name + "::destroy()");

        this._bindings = {};
        this._running = false;
        this._storage = null;
      }

      this._super();
    },

    /**
     * Application::run() -- Run application
     * @param   Window    root_window   Bind a Window as main Window
     * @return  void
     */
    run : function(root_window) {
      var self = this;

      if ( !this._running ) {

        this._restoreStorage();
        if ( root_window instanceof Window ) {
          this._root_window = root_window;
          this._proc_icon   = root_window._icon;

          this._root_window._bind("die", function() {
            self._stop();
          });
        }

        console.group("Application::run()");
        console.log(this._name);
        console.groupEnd();

        this._running = true;
      }
    },

    /**
     * Application::_bind() -- Bind an event
     * @param   String    name      Binding name
     * @param   Function  func      Function callback
     * @return  void
     */
    _bind : function(name, func) {
      if ( this._bindings[name] !== undefined ) {
        this._bindings[name].push(func);
      }
    },

    /**
     * Application::_call() -- Run a bound event
     * @param   String    name      Binding name
     * @return  void
     */
    _call : function(name, args) {
      args = args || {};
      if ( this._bindings[name] !== undefined ) {
        for ( var i = 0; i < this._bindings[name].length; i++ ) {
          this._bindings[name][i](args);
        }
      }
    },

    /**
     * Application::createSocket() -- Create a new Socket instance
     * @see     Socket
     * @return  Socket
     */
    createSocket : function(name, uri) {
      var s = new Socket(this._name, uri);
      this.removeSocket(name);
      this._sockets[name] = s;
      return s;
    },

    /**
     * Application::removeSocket() -- Remove a Socket
     * @param   String    name      Socket name
     * @return  bool
     */
    removeSocket : function(name) {
      if ( this._sockets[name] !== undefined ) {
        this._sockets[name].destroy();
        delete this._sockets[name];
        return true;
      }
      return false;
    },

    /**
     * Application::_clearSockets() -- Remove all Sockets
     * @return  void
     */
    _clearSockets : function() {
      for ( var i in this._sockets ) {
        if ( this._sockets.hasOwnProperty(i) ) {
          this._sockets[i].destroy();
        }
      }
      this._sockets = {};
    },

    /**
     * Application::defaultFileUpload() -- Perform default file-upload (with dialog)
     * @param   String    dir       Upload directory
     * @param   Function  callback  Callback function
     * @return  void
     */
    defaultFileUpload : function(dir, callback) {
      var self = this;

      this.createUploadDialog(dir, function(dir, fmime, response) {
        VFSEvent("update", {'file' : dir, 'mime' : fmime}, self);
        callback(dir, fmime, response);
      });
    },

    /**
     * Application::defaultFileOpen() -- Perform default file-open operation (with dialog)
     * @param   Function      callback      Callback when file is opened
     * @param   Array         mimes         Mime filtering (not required)
     * @param   String        dir           Current directory (not required)
     * @param   String        file          Current file (not required)
     * @param   bool          check_mime    Check MIME type (Default = true)
     * @return  void
     */
    defaultFileOpen : function(callback, mimes, dir, file, check_mime) {
      var self = this;
      check_mime = (check_mime === undefined) ? true : (check_mime ? true : false);

      if ( !dir && file ) {
        dir = dirname(file);
      }

      this.createFileDialog(function(fname, mime) {
        var cont = true;
        if ( check_mime ) {
          if ( mime && mimes && mimes.length ) {
            var found = false;
            var tspl1 = mime.split("/").shift();
            for ( var i = 0; i < mimes.length; i++ ) {
              var tspl2 = mimes[i].split("/");
              if ( mime == mimes[i] || (tspl2[1] == "*" && (tspl1 == tspl2[0])) || (tspl1 == tspl2[0]) ) {
                found = true;
                break;
              }
            }
            cont = found;
          }
        }

        if ( cont ) {
          callback(fname);

          self._setArgv('path', fname);
        } else {
          MessageBox(sprintf(OSjs.Labels.CrashApplicationOpen, basename(fname), mime));
        }
      }, mimes, "open", dir);
    },

    /**
     * Application::defaultFileSave() -- Perform default file-open operation (with dialog)
     *
     * Upon success this function triggers an Application binding called "vfs" to perform
     * refreshes along all running applications. This events have to be manually bound.
     *
     * @param   String        file          Current file
     * @param   Mixed         content       Current file content
     * @param   Function      callback      Callback when file is saved
     * @param   Array         mimes         Mime filtering (not required)
     * @param   String        dir           Current directory (not required)
     * @param   bool          saveas        Perform a "Save As..." operation
     * @param   String        encoding      File encoding (not required)
     * @return  void
     */
    defaultFileSave : function(file, content, callback, mimes, dir, saveas, encoding) {
      var self = this;

      if ( !dir && file ) {
        dir = dirname(file);
      }
      if ( file && saveas ) {
        file = null;
      }

      // Actual save function
      var _func = function(file, mime) {
        var aargs = {'file' : file, 'content' : content};
        if ( encoding ) {
          aargs['encoding'] = encoding;
        }

        API.system.call("write", aargs, function(result, error) {
          if ( result ) {
            VFSEvent("update", {'file' : file, 'mime' : mime}, self);
            callback(file, mime);
            self._setArgv('path', file);
          }
        });
      };

      if ( saveas ) {
        this.createFileDialog(function(file, mime) {
          _func(file, mime);
        }, mimes, "save", dir);
      } else {
        _func(file);
      }
    },

    /**
     * Application::createService() -- Create a new Service instance
     * @TODO
     * @see     Service
     * @return  Service
     */
    /*
    createService : function(name, type) {
      return new Service(name, type);
    },
     */

    /**
     * Application::createMessageDialog() -- Create Dialog: Message
     * @see     API.system.dialog
     * @return  void
     */
    createMessageDialog : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this._addWindow(API.system.dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
    },

    /**
     * Application::createColorDialog() -- Create Dialog: Color Chooser
     * @see     API.system.dialog_color
     * @return  void
     */
    createColorDialog : function(color, callback) {
      this._addWindow(API.system.dialog_color(color, function(rgb, hex) {
        callback(rgb, hex);
      }));
    },

    /**
     * Application::createFontDialog() -- Create Dialog: Font Chooser
     * @see     API.system.dialog_font
     * @return  void
     */
    createFontDialog : function(font, size, callback) {
      this._addWindow(API.system.dialog_font(font, size, function(font, size) {
        callback(font, size);
      }));
    },

    /**
     * Application::createUploadDialog() -- Create Dialog: Upload File
     * @see     API.system.dialog_upload
     * @return  void
     */
    createUploadDialog : function(dir, callback, callback_progress, callback_cancel) {
      this._addWindow(API.system.dialog_upload(dir, function(fpath, fmime, response) {
        callback(fpath, fmime, response);
      }, callback_progress, callback_cancel));
    },

    /**
     * Application::createFileDialog() -- Create Dialog: File Operation Dialog
     * @see     API.system.dialog_file
     * @return  void
     */
    createFileDialog : function(callback, mimes, type, dir) {
      this._addWindow(API.system.dialog_file(function(file, mime) {
        callback(file, mime);
      }, mimes, type, dir));
    },

    /**
     * Application::createLaunchDialog() -- Create Dialog: Launch Application
     * @see     API.system.dialog_launch
     * @return  void
     */
    createLaunchDialog : function(list, callback, udef) {
      this._addWindow(API.system.dialog_launch(list, function(app, def, udef) {
        callback(app, def);
      }));
    },

    /**
     * Application::createRenameDialog() -- Create Dialog: Rename File
     * @see     API.system.dialog_rename
     * @return  void
     */
    createRenameDialog : function(dir, callback) {
      this._addWindow(API.system.dialog_rename(dir, function(fname) {
        callback(fname);
      }));
    },

    /**
     * Application::createInputDialog() -- Create Dialog: Input Box
     * @see     API.system.dialog_input
     * @return  void
     */
    createInputDialog : function(value, desc, callback) {
      this._addWindow(API.system.dialog_input(value, desc, function(result) {
        callback(result);
      }));
    },

    /**
     * Application::createFilePropertyDialog() -- Create Dialog: File properties
     * @see     API.system.dialog_properties
     * @return  void
     */
    createFilePropertyDialog : function(filename, callback) {
      this._addWindow(API.system.dialog_properties(filename, function(result) {
        callback(result);
      }));
    },

    /**
     * Application::addWorker() -- Create a WebWorker
     * @param   String    name        Worker name
     * @param   String    resource    Worker resource name (worker.NAME.js)
     * @param   Function  mcallback   Process callback function
     * @param   Function  ecallback   Error callback function
     * @see     WebWorker
     * @return  WebWorker
     */
    addWorker : function(name, resource, mcallback, ecallback) {
      if ( !this._workers[name] ) {
        var w = new WebWorker(RESOURCE_URI + sprintf("%s/%s", this._name, resource), mcallback, ecallback);
        this._workers[name] = w;
        return w;
      }

      return true;
    },

    /**
     * Application::removeWorker() -- Remove a WebWorker
     * @param   String  name      Worker name
     * @see     WebWorker
     * @return  bool
     */
    removeWorker : function(name) {
      var self = this;
      if ( this._workers[name] ) {
        this._workers[name].destroy();
        setTimeout(function() {
          delete self._workers[name];
        }, 0);

        return true;
      }
      return false;
    },

    /**
     * Application::_clearWorkers() -- Remove all WebWorkers
     * @see     WebWorker
     * @return  void
     */
    _clearWorkers : function() {
      var i;
      for ( i in this._workers ) {
        if ( this._workers.hasOwnProperty(i) ) {
          this._workers[i].destroy();
        }
      }
      this._workers = {};
    },

    /**
     * Application::_checkCompability() -- Check Application compabilty list and throw errors if any
     * @see    OSjs.Compability
     * @throws OSjs.Classes.ApplicationException
     * @return void
     */
    _checkCompability : (function() {

      function __check(key) {
        var error = false;

        // First check if we have a sub-compability check
        var tmp   = key.match(/\_/) ? ((key.split("_")).pop()) : null;
        if ( tmp === "audio" || tmp === "video" ) {
          if ( OSjs.Public.CompabilityMapping[tmp] === false ) {
            error = OSjs.Public.CompabilityErrors[tmp];
          }
        }

        // Then check main-type
        if ( error === false ) {
          if ( OSjs.Public.CompabilityMapping[key] === false ) {
            error = OSjs.Public.CompabilityErrors[key];
          }
        }

        return error;
      }

      return function(key) {
        var self = this;
        var error;

        console.group("Application::_checkCompability()");
        console.log(this._name);
        console.log("Compability", this._compability);

        if ( key ) {
          error = __check(key);
        } else {
          for ( var i = 0; i < this._compability.length; i++ ) {
            error = __check(this._compability[i]);
            if ( error ) {
              break;
            }
          }

          if ( error ) {
            console.groupEnd();
            throw new OSjs.Classes.ApplicationException(self,
              sprintf(OSjs.Labels.ApplicationCheckCompabilityMessage, error),
              sprintf(OSjs.Labels.ApplicationCheckCompabilityStack, self._name),
              error );
          }
        }

        console.log("Error", error);
        console.groupEnd();

        return error;
      };
    })(),

    /**
     * Application::addWindow() -- Add a new window to application
     * @param   Window    win     Window to add
     * @return  void
     */
    addWindow : function(win) {
      var w = _WM.addWindow(win);
      if ( w ) {
        this._addWindow(win);
      }
      return w ? w : false;
    },

    /**
     * Application::_addWindow() -- Add a new window to application (internal)
     * @param   Window    win     Window to add
     * @return  void
     */
    _addWindow : function(win) {
      this._windows.push(win);
    },

    /**
     * Application::_stop() -- Stop application
     * @return void
     */
    _stop : function() {
      if ( this._running ) {
        console.log("Application::" + this._name + "::_stop()");

        this.destroy();
      }
    },

    /**
     * Application::_saveStorage() -- Save Application Storage
     * @return void
     */
    _saveStorage : function() {
      if ( this._name && this._storage_on ) {
        this._storage = _Settings.savePackageStorage(this._name, this._storage);
      }

      console.log("Application::" + this._name + "::_saveStorage()", this._storage);
    },

    /**
     * Application::_restoreStorage() -- Load Application Storage
     * @return void
     */
    _restoreStorage : function() {
      if ( this._name && this._storage_on ) {
        var s = _Settings.loadPackageStorage(this._name);
        if ( s !== false ) {
          this._storage = s;
        }
      }

      console.group("Application::_restoreStorage()");
      console.log(this._name);
      console.log("Result", this._storage);
      console.groupEnd();
    },

    /**
     * Application::_flushStorage() -- Clear Application Storage
     * @return void
     */
    _flushStorage : function() {
      if ( this._name && this._storage_on ) {
        this._storage = _Settings.savePackageStorage(this._name, {});
      }

      console.log("Application::" + this._name + "::_flushStorage()", this._storage);
    },

    /**
     * Application::_event() -- Perform Application Event (AJAX-call to Server-Side)
     * @param   String    ev          The AJAX action to perform
     * @param   Mixed     args        The AJAX action argument(s)
     * @param   Function  callback    Callback to function when done
     * @param   bool      show_error  Show a [crash] dialog on error (Default = false)
     * @return void
     */
    _event : function(ev, args, callback, show_error) {
     show_error = (show_error === undefined) ? false : (show_error ? true : false);

      var self = this;
      var pargs = {
        'action'    : 'event',
        'cname'     : self._name ,
        'instance'  : {
          'name'      : self._name,
          'action'    : ev,
          'args'      : args || {}
        }
      };

      DoPost(pargs, function(data) {

        console.group("Application::_event()");
        console.log(self._name);
        console.log("Arguments", ev, args, data);
        console.groupEnd();

        if ( data.error && show_error ) {
          var msg = OSjs.Labels.CrashEvent + data.error;
          var title = sprintf(OSjs.Labels.CrashEventTitle, self._name);
          CrashCustom(title, msg, JSON.stringify(pargs));
        }

        callback(data.result, data.error);
      });
    },

    /**
     * Application::_setArgv() -- Set stored argument
     * @param   String    a       Argument name
     * @param   Mixed     v       Value
     * @return  void
     */
    _setArgv : function(a, v) {
      this._argv[a] = v;
    },

    /**
     * Application::_getResourceURL() -- Get Package resource URL
     * @return void
     */
    _getResourceURL : function(resource) {
      return sprintf("%s/%s/%s", RESOURCE_URI, this._name, resource);
    },

    /**
     * Application::_getArgv() -- Get stored arguments
     * @param   String    a       Argument name (Optional)
     * @return  Object
     */
    _getArgv : function(a) {
      return this._argv ? (a ? (this._argv[a] || null) : this._argv) : null;
    },

    /**
     * Application::_getWorker() -- Get a WebWorker
     * @param   String  name      Worker name
     * @see     WebWorker
     * @return  Worker
     */
    _getWorker : function(name) {
      if ( this._workers[name] ) {
        return this._workers[name];
      }
      return null;
    },

    /**
     * Application::_getWorkerCount() -- Get WebWorker count
     * @return  int
     */
    _getWorkerCount : function() {
      var c = 0;
      for ( var i in this._workers ) {
        if ( this._workers.hasOwnProperty(i) ) {
          c++;
        }
      }
      return c;
    },

    /**
     * Application::_getSessionData() -- Get current Application session data
     * @return JSON
     */
    _getSessionData : function() {
      if ( this._root_window ) {
        var wname = this._root_window._name;
        var win   = this._root_window.getAttributes();

        var windows = {};
        windows[wname] = win;
        if ( win !== false ) {
          return {
            "name"    : this._name,
            "argv"    : this._getArgv(),
            "windows" : windows
          };
        }
      }

      return false;
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // WINDOW MANAGER
  /////////////////////////////////////////////////////////////////////////////

  /**
   * WindowManager -- Main Window Manager Class
   *
   * @extends Process
   * @class
   */
  var WindowManager = Process.extend({

    stack    : [],            //!< Window Stack
    running  : false,         //!< Window Manager running ?
    bindings : {},            //!< Global action bindings

    /**
     * WindowManager::init() -- Constructor
     * @constructor
     */
    init : function() {
      this.stack    = [];
      this.running  = false;
      this.bindings = {
        "window_add"     : [],
        "window_remove"  : [],
        "window_focus"   : [],
        "window_blur"    : [],
        "window_updated" : []
      };

      API.ui.cursor("default");

      this._super("(WindowManager)", "apps/xfwm4.png");
    },

    /**
     * WindowManager::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      // Remove bindings
      this.bindings = null;

      // Remove windows
      var i = 0;
      var l = this.stack.length;
      for ( i; i < l; i++ ) {
        if ( this.stack[i] ) {
          this.stack[i].destroy();
        }
      }
      this.stack = null;

      this.running = false;

      this._super();

      // >>> REMOVE GLOBAL <<<
      if ( _WM )
        _WM = null;
    },

    /**
     * WindowManager::run() -- Run window manager
     * @return void
     */
    run : function() {
      if ( this.running ) {
        return;
      }

      this.applySettings();

      this.running = true;
    },


    // BINDINGS

    /**
     * WindowManager::bind() -- Bind an event by name and callback
     * @param   String    mname     Binding name
     * @param   Function  mfunc     Binding function
     * @return  void
     */
    bind : function(mname, mfunc) {
      if ( this.bindings ) {
        if ( this.bindings[mname] ) {
          this.bindings[mname].push(mfunc);
        }
      }
    },

    /**
     * WindowManager::call() -- Call an event by name and arguments
     * @param   String    mname     Binding name
     * @param   Mixed     margs     Binding arguments
     * @return void
     */
    call : function(mname, margs) {
      if ( this.bindings && this.bindings[mname] ) {
        //var r;
        for ( var i = 0; i < this.bindings[mname].length; i++ ) {
          /*r = */this.bindings[mname][i].call(_Desktop, mname, margs); // FIXME: _Desktop is not this
        }
      }
    },

    // WINDOWS

    /**
     * WindowManager::insertWindow() -- Insert a window into DOM
     * @param   DOMElement    el      DOM Element from window
     * @return  void
     */
    insertWindow : function(el) {
      console.log("WindowManager::insertWindow()");

      $("#Desktop").append(el);
    },

    /**
     * WindowManager::addWindow() -- Add a window to the stack (and create)
     * @param   Window    win       Window to add
     * @return  Mixed
     */
    addWindow : function(win) {
      if ( win instanceof Window ) {
        var self = this;

        var AddWindowCallback = function(fresh) {
          if ( fresh ) {
            if ( !win._is_minimized && !win._is_maximized ) {
              setTimeout(function() {  // NOTE: Timeout required for Panel items to be
                                       // Correctly redrawed
                self.focusWindow(win); // Always focus new windows
              }, 0);
            }
          }
        };

        console.group("WindowManager::addWindow()");
        console.log("Window", win);

        win.create(("Window_" + this.stack.length), AddWindowCallback);
        this.stack.push(win);
        this.call("window_add", win);

        console.groupEnd();

        return win;
      }

      return false;
    },

    /**
     * WindowManager::removeWindow() -- Remove a window from the stack
     * @param   Window    win       Window to remove
     * @param   bool      destroy   Destroy window
     * @return  bool
     */
    removeWindow : function(win, destroy) {
      if ( win instanceof Window ) {
        console.log("WindowManager::removeWindow()", destroy, win);

        if ( destroy ) {
          win.destroy();
        }

        var i = 0;
        var l = this.stack.length;
        var index = -1;
        for ( i; i < l; i++ ) {
          if ( this.stack[i] == win ) {
            index = i;
            break;
          }
        }

        if ( index >= 0 ) {
          this.call("window_remove", win);
          this.stack.splice(index, 1);

          return true;
        }
      }

      return false;
    },

    /**
     * WindowManager::blurWindow() -- Perform 'blur' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    blurWindow : function(win) {
      win._blur();

      if ( _Window === win ) {
        _Window = null;
      }

      this.call("window_blur", win);
    },

    /**
     * WindowManager::focusWindow() -- Perform 'focus' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    focusWindow : function(win) {
      if ( _Window !== null ) {
        if ( win != _Window ) {
          this.blurWindow(_Window);
        }
      }

      if ( _Window !== win ) {
        win._focus();

        this.call("window_focus", win);

        _Window = win;
      }
    },

    /**
     * WindowManager::restoreWindow() -- Perform 'restore' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    restoreWindow : function(win) {
      this.focusWindow(win);
    },

    /**
     * WindowManager::maximizeWindow() -- Perform 'maximize' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    maximizeWindow : function(win) {
      this.focusWindow(win);
    },

    /**
     * WindowManager::minimizeWindow() -- Perform 'minimize' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    minimizeWindow : function(win) {
      this.blurWindow(win);
    },

    /**
     * WindowManager::updateWindow() -- Perform 'update' on Window
     * @param   Window    win       Window to manipulate
     * @return  void
     */
    updateWindow : function(win) {
      this.call("window_updated", win);
    },

    /**
     * WindowManager::sortWindows() -- Sort windows on desktop (align)
     * @param   String      method      Sorting method (default = tile)
     * @return  void
     */
    sortWindows : function(method) {
      var ws = this.getWindowSpace();
      var top  = ws.y;
      var left = ws.x;

      if ( method == "tile" ) {
        var last;
        for ( var i = 0; i < this.stack.length; i++ ) {
          last = this.stack[i];

          last.$element.css({
            'left' : left + 'px',
            'top'  : top + 'px'
          });
          last.left = left;
          last.top  = top;

          top += 20;
          left += 20;

          this.focusWindow(last);
        }
      }
    },

    // SETTINGS / SESSION

    /**
     * WindowManager::applySettings() -- Apply changes from ResourceManger
     * @return void
     */
    applySettings : function() {
      var map = {};

      console.group("WindowManager::applySettings() Applying user settings");

      var s;
      var c = 0;
      for ( var i in map ) {
        if ( map.hasOwnProperty(i) ) {
          s = _Settings._get(i);
          if ( s ) {
            if ( typeof this[map[i]] == 'function' ) {
              console.log(i, s);

              this[map[i]](s);

              c++;
            }
          }
        }
      }

      console.log(sprintf("Applied %d setting(s)...", c));
      console.groupEnd();
    },

    // GETTERS / SETTERS

    /**
     * WindowManager::getWindowSpace() -- Get free window space rect
     * @return Object
     */
    getWindowSpace : function() {
      var w      = parseInt($(document).width(), 10);
      var h      = parseInt($(document).height(), 10);
      var margin = 10;
      var result = {
        'y' : margin,
        'x' : margin,
        'w' : w - (margin * 2),
        'h' : h - (margin * 2)
      };

      if ( _Desktop ) {
        var panels = _Desktop.getPanels();
        var i = 0, l = panels.length, p;
        for ( i; i < l; i++ ) {
          p = panels[i];
          if ( p.getPosition() == "top" ) {
            result.y += p.getHeight();
            result.h -= p.getHeight();
          } else {
            //result.y += p.getHeight();
            result.h -= p.getHeight();
          }
        }
      }

      console.log("WindowManager::getWindowSpace()", result);

      return result;
    },

    /**
     * WindowManager::getStack() -- Get stack of Windows
     * @return Array
     */
    getStack : function() {
      var stack = [];
      for ( var i = 0; i < this.stack.length; i++ ) {
        stack.push({
          id    : this.stack[i].getWindowId(),
          title : this.stack[i].getTitle(),
          icon  : this.stack[i].getIcon(),
          focus : (function(w) {
            return function() {
              w.focus();
            };
          })(this.stack[i])
        });
      }
      return stack;
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // DESKTOP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Desktop -- Main Desktop Class
   * The desktop containing all elements
   *
   * @extends Process
   * @class
   */
  var Desktop = Process.extend({

    $element       : null,          //!< Desktop DOM Element
    running        : false,         //!< Desktop running ?
    panels         : [],            //!< Panel instances
    notifications  : 0,             //!< Desktop notification counter
    iconview       : null,          //!< Desktop IconView
    _rtimeout      : null,          //!< Desktop resize timeout

    /**
     * Desktop::init() -- Constructor
     * @constructor
     */
    init : function() {
      var self = this;

      this.$element = $("#Desktop");
      this.panels   = [];

      this.$element.mousedown(function(ev) {
        _Core.global_mousedown(ev);
        //ev.preventDefault();
      });


      /*
      $("#Desktop").bind("dragover", function(ev) {
        ev.preventDefault();
        return false;
      });
      $("#Desktop").bind("dragleave", function(ev) {
        ev.preventDefault();
        return false;
      });
      $("#Desktop").bind("dragenter", function(ev) {
        ev.preventDefault();
        return false;
      });
      $("#Desktop").bind("drop", function(ev) {
        ev.preventDefault();
        var dt = ev.originalEvent.dataTransfer;
        console.log(dt, dt.getData('Text'));
        console.log(dt.getData('text/uri-list'));
        console.log(dt.getData('text/plain'));
        console.log(dt.getData('text/html'));
        return false;
      });
      */

      // Global resize event
      var curHeight = $(window).height();
      var curWidth  = $(window).width();
      $(window).bind("resize", function(ev) {
        var newHeight = $(window).height();
        var newWidth  = $(window).width();

        if ( self._rtimeout ) {
          clearTimeout(self._rtimeout);
        }

        self._rtimeout = setTimeout(function() {
          if ( newHeight != curHeight || newWidth != curWidth ) {
            self.resize(ev);

            curHeight = newHeight;
            curWidth  = newWidth;
          }
        }, 30);
      });

      this._super("(Desktop)", "places/desktop.png");
    },

    /**
     * Desktop::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      $("#Desktop").unbind("contextmenu");

      if ( this._rtimeout ) {
        clearTimeout(this._rtimeout);
      }

      $(window).unbind("resize");

      // Remove panel
      if ( this.panels ) {
        for ( var i = 0; i < this.panels.length; i++ ) {
          this.panels[i].destroy();
          this.panels[i] = null;
        }
      }
      this.panels = null;

      // Remove IconView
      if ( this.iconview ) {
        this.iconview.destroy();
      }
      this.iconview = null;

      // Reset settings
      this.setWallpaper(null);

      this.running = false;
      this._rtimeout = null;

      this._super();

      // >>> REMOVE GLOBAL <<<
      if ( _Desktop )
        _Desktop = null;
    },

    /**
     * Desktop::run() -- Run DOM operations etc.
     * @return void
     */
    run : function() {
      var self = this;
      if ( this.running ) {
        return;
      }

      console.group("Desktop::run()");

      //
      // Events
      //
      console.log("Registering events...");
      $("#Desktop").bind("contextmenu", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        /*return */self.showContextMenu(ev);
        return false;
      });

      this.applySettings();

      //
      // Create IconView and items from localStorage
      //

      var IconView = Class.extend({

        _sel : null,

        init : function() {
          var self = this;

          $("#DesktopGrid").click(function() {
            if ( self._sel ) {
              $(self._sel).parent().removeClass("current");
              self._sel = null;
            }

            $(document).click(); // Trigger this! (deselects context-menu)
          });

          var ivlist = _Settings._get("desktop.grid", true);
          var root = $("<ul></ul>");

          if ( ivlist ) {
            var str, giter, e, i = 0, l = ivlist.length;

            for ( i; i < l; i++ ) {
              giter = ivlist[i];
              str = sprintf("<li><div class=\"inner\"><div class=\"icon\"><img alt=\"\" src=\"%s\" /></div><div class=\"label\"><span>%s</span></div></div></li>", sprintf(ICON_URI_32, giter.icon), giter.title);
              e = $(str);

              self._createClick(e, i);

              e.find(".inner").click(function(ev) {
                ev.stopPropagation();

                if ( self._sel ) {
                  $(self._sel).parent().removeClass("current");
                }

                $(this).parent().addClass("current");
                self._sel = this;

                $(document).click(); // Trigger this! (deselects context-menu)
              });

              root.append(e);
            }
          }

          $("#DesktopGrid").html(root);
        },

        destroy : function() {
          $("#DesktopGrid").empty(); //.remove();
        },

        _createClick : function(e, index) {
          e.find(".inner").dblclick(function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var iter = _Settings._get("desktop.grid", true)[index]; // NOTE: This was the solution ?! WTF
            if ( iter ) {
              API.system.launch(iter.launch, iter['arguments']);
            }
            $("#DesktopGrid").click(); // Unselect

            return false;
          });
        }

      }); // @class

      console.log("Registering desktop grid...");
      try {
        self.iconview = new IconView();
      } catch ( exception ) {
        throw new OSjs.Classes.ProcessException(self, OSjs.Labels.CrashDesktopIconView, exception);
      }

      //
      // Create panel and items from localStorage
      //
      console.log("Registering panels...");
      try {
        var panels = _Settings._get("desktop.panels", true);
        var panel, items;

        console.log("Panels", panels);

        var additems = function(panel, items, callback_error) {
          var size = items.length;
          var current = 0;

          var additem = function(index) {

            var el      = items[index];
            var iname   = el[0];
            var iargs   = el[1];
            var ialign  = el[2] || "left:0";

            LaunchPanelItem(index, iname, iargs, ialign, panel, function(crashed, error_msg) {
              current++;

              if ( crashed && error_msg ) {
                callback_error(error_msg, panel);
              }

              if ( current < size ) {
                additem(current);
              } else {
                try {
                  panel.run();
                  self.updatePanelPosition(panel);
                } catch ( exception ) {
                  callback_error(exception, panel);
                }
              }
            });
          };

          if ( size > 0 ) {
            additem(0);
          }

        };

        if ( panels ) {
          for ( var x = 0; x < panels.length; x++ ) {
            panel = new Panel(panels[x].index, panels[x].name, panels[x].position);
            items = panels[x].items;

            additems(panel, items, function(error, p) {
              CrashCustom("Panel", error, "Desktop::run(){[LaunchPanelitem()>{callback(error)}]}\nPanelItem::create(), ResourceManager::addResources() ?");
            });

            self.addPanel(panel);
          }
        }

      } catch ( exception ) {
        throw new OSjs.Classes.ProcessException(self, OSjs.Labels.CrashPanelCreate, exception);
      }

      //
      // Now apply bindings and run desktop
      //
      console.log("Registering internal bindings...");
      if ( _WM ) {
        _WM.bind("window_add", this.defaultHandler);
        _WM.bind("window_remove", this.defaultHandler);
        _WM.bind("window_focus", this.defaultHandler);
        _WM.bind("window_blur", this.defaultHandler);
        _WM.bind("window_updated", this.defaultHandler);
      }

      this.running = true;

      console.log("...done...");
      console.groupEnd();

      setTimeout(function() {
        self.resize();
      }, 1000);

    },

    // HANDLERS

    /**
     * Desktop::defaultHandler() -- Default event handler callback
     * @param   String    ev          Event name
     * @param   Mixed     eargs       Event argument(s)
     * @return  bool
     */
    defaultHandler : function(ev, eargs) {
      var redrawPanels = function(panels, e, ee) {
        if ( panels.length ) {
          for ( var i = 0; i < panels.length; i++ ) {
            panels[i].redraw(e, ee);
          }
          return true;
        }

        return false;
      };

      if ( ev.match(/^window/) ) {
        return redrawPanels(this.panels, ev, eargs);
      }

      return false;
    },

    /**
     * Desktop::showContextMenu() -- Show context menu
     * @param   DOMEvent  ev          Event
     * @return  bool
     */
    showContextMenu : function(ev) {
      var t = ev.target || ev.srcElement;

      if ( !t || !t.id == "Desktop" ) {
        return true;
      }

      var labels = OSjs.Labels.ContextMenuDesktop;
      var ret = API.application.context_menu(ev, $(this), [
        {"title" : labels.title, "attribute" : "header"},
        {"title" : labels.wallpaper, "method" : function() {
          var dir = _Settings._get("desktop.wallpaper.path");
          if ( dir ) {
            var tmp = dir.split("/");
            if ( tmp.length > 1 ) {
              tmp.pop();
            }
            dir = tmp.join("/");
          } else {
            dir = "/System/Wallpapers";
          }
          API.system.dialog_file(function(fname) {
            API.user.settings.save({
              "desktop.wallpaper.path" : fname
            });
          }, ["image/*"], "open", dir);
        }
      },
      {"title" : labels.sort, "method" : function() { 
        API.ui.windows.tile();
      }}

      ], true);

      /*if ( ev.which > 1 ) {
      ev.preventDefault();
      }*/

      return ret;
    },

    /**
     * Desktop::addPanel() -- Add Panel
     * @param   Panel     p           Panel or null
     * @return  void
     */
    addPanel : function(p) {
      if ( p instanceof Panel ) {
        this.panels.push(p);
      }
    },

    /**
     * Desktop::removePanel() -- Remove Panel
     * @param   Panel     p           Panel or null
     * @param   bool      destroyed   Set if action comes from Panel::destroy()
     * @return  void
     */
    removePanel : function(p, destroyed) {
      for ( var i in this.panels ) {
        if ( this.panels.hasOwnProperty(i) ) {
          if ( this.panels[i] === p ) {
            if ( !destroyed ) {
              this.panels[i].destroy();
            }

            this.panels[i] = null;
            delete this.panels[i];
            break;
          }
        }
      }
    },

    /**
     * Desktop::updatePanelPosition() -- Triggered upon panel position update
     * @param   Panel     p           Panel or null
     * @return  void
     */
    updatePanelPosition : function(p) {
      if ( this.iconview ) {
        $("#DesktopGrid").attr("class", "");
        $("#DesktopGrid").addClass(p.getPosition());
      }
    },

    /**
     * Desktop::resize() -- Resize desktop
     * @param  DOMEvent   ev      Event
     * @return void
     */
    resize : function(ev) {
      var p = this.getPanel();
      if ( p ) {
        p.triggerExpand();
      }
    },

    // SETTINGS / SESSION

    /**
     * Desktop::applySettings() -- Apply changes from ResourceManger
     * @return void
     */
    applySettings : function() {
      var map = {
        'desktop.wallpaper.path'   : 'setWallpaper',
        'desktop.wallpaper.type'   : 'setWallpaperType',
        'desktop.background.color' : 'setBackgroundColor',
        'desktop.theme'            : 'setTheme',
        'desktop.font'             : 'setFont',
        'desktop.cursor.theme'     : 'setCursorTheme'
      };

      console.group("Desktop::applySettings() Applying user settings");

      var s;
      var c = 0;
      for ( var i in map ) {
        if ( map.hasOwnProperty(i) ) {
          s = _Settings._get(i);
          if ( s ) {
            if ( i == 'desktop.cursor.theme' ) {
              s = s.split(" ")[0];
            }
            if ( s ) {
              if ( typeof this[map[i]] == 'function' ) {
                console.log(i, s);

                this[map[i]](s);

                c++;
              }
            }
          }
        }
      }

      console.log(sprintf("Applied %d setting(s)...", c));
      console.groupEnd();
    },

    // GETTERS / SETTERS

    /**
     * Desktop::setWallpaper() -- Set new wallpaper
     * @param   String    wp      Wallpaper path
     * @return  void
     */
    setWallpaper : function(wp) {
      if ( wp ) {
        $("body").css("background-image", "url('/media" + wp + "')");
      } else {
        $("body").css("background-image", "url('/img/blank.gif')");
      }
    },

    /**
     * Desktop::setWallpaperType() -- Set the wallpaper type
     * @param   String    t       Wallpaper type
     * @return  void
     */
    setWallpaperType : function(t) {

      switch ( t ) {
        case "Tiled Wallpaper" :
          $("body").css("background-repeat",    "repeat");
          $("body").css("background-position",  "inherit");
          $("body").css("background-size",      "auto auto");

          this.setWallpaper(_Settings._get("desktop.wallpaper.path"));
        break;

        case "Centered Wallpaper" :
          $("body").css("background-repeat",    "no-repeat");
          $("body").css("background-position",  "center center");
          $("body").css("background-size",      "auto auto");

          this.setWallpaper(_Settings._get("desktop.wallpaper.path"));
        break;

        case "Stretched Wallpaper" :
          $("body").css("background-repeat",    "no-repeat");
          $("body").css("background-position",  "center center");
          $("body").css("background-size",      "100%");

          this.setWallpaper(_Settings._get("desktop.wallpaper.path"));
        break;

        case "Color only" :
        default :
          $("body").css("background-repeat",    "no-repeat");
          $("body").css("background-position",  "inherit");
          $("body").css("background-size",      "auto auto");

          this.setWallpaper(null);
        break;
      }
    },

    /**
     * Desktop::setBackgroundColor() -- Set the background-color
     * @param   String    t       Wallpaper type
     * @return  void
     */
    setBackgroundColor : function(c) {
      if ( c ) {
        $("body").css("background-color", c);
      }
    },

    /**
     * Desktop::setTheme() -- Set new theme
     * @param   String    theme   Theme name
     * @return  void
     */
    setTheme : function(theme) {
      if ( theme ) {
        var css = $("#ThemeFace");
        var href = THEME_URI + theme.toLowerCase();
        if ( $(css).attr("href") != href ) {
          $(css).attr("href", href);
        }
      }
    },

    /**
     * Desktop::setFont() -- Set font
     * @param   String    font    Font name
     * @return  void
     */
    setFont : function(font) {
      if ( font ) {
        var css = $("#FontFace");
        var href = FONT_URI + font;
        if ( $(css).attr("href") != href ) {
          $(css).attr("href", href);
        }
      }
    },

    /**
     * Desktop::setCursorTheme() -- Set cursor theme
     * @param   String    cursor    Theme name
     * @return  void
     */
    setCursorTheme : function(cursor) {
      if ( cursor ) {
        var css = $("#CursorFace");
        var href = CURSOR_URI + cursor.toLowerCase();
        if ( $(css).attr("href") != href ) {
          $(css).attr("href", href);
        }
      }
    },

    /**
     * Desktop::createNotification() -- Create a Desktop notification
     * @param   String    title     Title
     * @param   String    message   Message
     * @param   String    icon      Icon (if any)
     * @param   int       duration  Visibility duration in ms (Default = NOTIFICATION_TIMEOUT)
     * @return  void
     */
    createNotification : function(title, message, icon, duration) {
      var self = this;

      title     = title   || "Notification";
      message   = message || "Unknonwn notification";
      icon      = icon    || null;

      duration  = parseInt(duration, 10) || NOTIFICATION_TIMEOUT;

      console.group("Desktop::createNotification()");
      console.log("title", title);
      console.log("message", message);
      console.log("icon", icon);
      console.log("Duration", duration);
      console.groupEnd();

      // Create element
      var root = $("#DesktopNotifications");
      var del = $(sprintf('<div class="DesktopNotification" style="display:none"><h1>%s</h1><p>%s</p><div class=\"Close\">x</div></div>', title, message));
      if ( icon ) {
        del.css({
          'backgroundImage'     : sprintf("url('%s')", icon),
          'backgroundRepeat'    : "no-repeat",
          //'backgroundPosition'  : "center left",
          'backgroundPosition'  : "5px 14px",
          'paddingLeft'         : "42px"
        });
      }

      root.append(del);
      del.fadeIn(ANIMATION_SPEED);

      // Removal functions
      var to;
      var fu = function() {
        del.fadeOut(ANIMATION_SPEED, function() {
          del.remove();
        });

        if ( to ) {
          clearTimeout(to);
        }

        if ( self.notifications ) {
          self.notifications--;
        }

        to = null;
     };

      del.click(fu);

      if ( duration !== -1 ) {
        to = setTimeout(fu, duration);
      }

      this.notifications++;
    },

    /**
     * Desktop::getPanel() -- Get Panel
     * @return Panel
     */
    getPanel : function(index) {
      index = index || 0;
      return this.panels[index];
    },

    /**
     * Desktop::getPanels() -- Get All Panels
     * @return Panel
     */
    getPanels : function() {
      return this.panels;
    },

    /**
     * Desktop::getSession() -- Get the desktop session
     * @return Object
     */
    getSession : function() {
      var panels = [];
      for ( var i = 0; i < this.panels.length; i++ ) {
        panels.push(this.panels[i].getSession());
      }

      return {
        "panels" : panels
      };
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // TOOLTIP
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Tooltip -- Custom Tooltip Class
   *
   * @class
   */
  var Tooltip = Class.extend({

    $element  :  null,      //!< DOM Elemenent
    ttimeout  :  null,      //!< Timeout reference

    /**
     * Tooltip::init() -- Constructor
     * @constructor
     */
    init : function() {
      this.$element = $("#Tooltip");
      this.ttimeout = null;
    },

    /**
     * Tooltip::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      // Element is in template
    },

    /**
     * Tooltip::initRoot() -- Initialize a DOM-root for Tooltips
     * @param   DOMElement    root    Initialize this root
     * @return  void
     */
    initRoot : function(root) {
      root.find(".TT").each(function() {
        var tip = $(this).attr("title");
        if ( tip ) {
          $(this).removeAttr("title");

          $(this).hover(function(ev) {
            _Tooltip.hoverOn(tip, this, ev);
          }, function(ev) {
            _Tooltip.hoverOff(this, ev);
          });
        }
      });
    },

    /**
     * Tooltip::hoverOn() -- Hover On
     * @param   String      tip       Tooltip
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
     * @return void
     */
    hoverOn : function(tip, el, ev) {
      if ( this.ttimeout ) {
        clearTimeout(this.ttimeout);
      }

      this.ttimeout = setTimeout(function() {
        _Tooltip.show(tip, null, ev);
      }, TOOLTIP_TIMEOUT);
    },

    /**
     * Tooltip::hoverOff() -- Hover Off
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
     * @return  void
     */
    hoverOff : function(el, ev) {
      if ( this.ttimeout ) {
        clearTimeout(this.ttimeout);
      }

      this.ttimeout = setTimeout(function() {
        _Tooltip.hide();
      }, 0);
    },

    /**
     * Tooltip::show() -- Show tooltip
     * @param   String      tip       Tooltip
     * @param   DOMElement  el        Element
     * @param   DOMEevent   ev        Event
     * @return  void
     */
    show : function(tip, el, ev) {
      var posX = 0;
      var posY = 0;

      if ( ev ) {
        posX = ev.pageX;
        posY = ev.pageY;
      } else if ( el ) {
        posX = $(el).offset()['left'];
        posY = $(el).offset()['top'];
      }

      this.$element.css({
        "top" : (posY + 10) + "px",
        "left" : (posX + 10) + "px"
      }).show().html(tip);
    },

    /**
     * Tooltip::hide() -- Hide tooltip
     * @return void
     */
    hide : function() {
      this.$element.hide();
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PANEL
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Panel -- The Desktop Panel Class
   * Panels can be added to desktop. Contains PanelItem(s) or Widgets
   *
   * @extends Process
   * @class
   */
  var Panel = Process.extend({

    $element      : null,       //!< DOM Element
    index         : -1,         //!< Panel Index
    name          : "",         //!< Panel Name
    pos           : "",         //!< Panel Position
    items         : [],         //!< Panel Items
    running       : false,      //!< Panel running state
    dragging      : false,      //!< Current item dragging
    width         : -1,         //!< Current width

    /**
     * Panel::init() -- Constructor
     * @constructor
     */
    init : function(index, name, pos) {
      var self = this;

      console.group("Panel::init()");
      console.log("Index", index);
      console.log("Name", name);
      console.log("Position", pos);

      this.$element = $('<div class="DesktopPanel"><ul></ul></div>');
      this.pos      = pos;
      this.items    = [];
      this.running  = false;
      this.index    = parseInt(index, 10);
      this.name     = name || "Panel";
      this.width    = -1;

      // Panel item dragging
      var oldPos = {'top' : 0, 'left' : 0};
      this.$element.draggable({
        axis : "y",
        snap : "body",
        snapMode : "inner",
        containment : "body",
        start : function() {
          if ( self.dragging ) {
            return;
          }

          self.$element.addClass("Blend");
          API.ui.cursor("move");
          oldPos = self.$element.offset();
          self.dragging = true;
        },
        stop : function() {
          self.$element.removeClass("Blend");
          API.ui.cursor("default");
          var middle = Math.round(($(document).height() - self.$element.height()) / 2);
          var bottom = $(document).height() - self.$element.height();
          var pos = self.$element.offset();

          if ( pos.top <= middle ) {
            self.$element.removeClass("Bottom");
            self.$element.css({"position" : "absolute", "top" : "0px", "bottom" : "auto"});
            self.pos = "top";
            _Settings.savePanel(self);
          } else {
            self.$element.addClass("Bottom");
            self.$element.css({"position" : "absolute", "top" : "auto", "bottom" : "0px"});
            self.pos = "bottom";
            _Settings.savePanel(self);
          }

          if ( _Desktop ) {
            _Desktop.updatePanelPosition(self);
          }
          self.dragging = false;
        }
      });

      // Stop bubbling
      $(this.$element).bind("mousedown", function(ev) {
        ev.preventDefault();
        /*ev.stopPropagation();
        return false;*/
      });
      /*$(this.$element).bind("dblclick", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });
      $(this.$element).bind("click", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        $(document).click(); // Trigger this! (deselects context-menu)
        return false;
      });*/

      // Context menu
      this.$element.bind("contextmenu", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        var labels = OSjs.Labels.ContextMenuPanel;
        API.application.context_menu(ev, $(this), [
          {"title" : labels.title, "attribute" : "header"},
          {"title" : labels.add, "method" : function() {
            addItem(ev);
          }},
          {"title" : labels.create, "disabled" : true},
          {"title" : labels.remove, "disabled" : true}

        ], true);

        return false;
      });

      // Add Panel item function
      var addItem = function(pos_ev) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return;
        }

        var pitem = new OSjs.Dialogs.PanelItemOperationDialog(OperationDialog, API, [this, function(diag) {
          var items = _PanelCache;
          var name, li, current, selected;

          for ( name in items ) {
            if ( items.hasOwnProperty(name) ) {
              li = $("<li><img alt=\"/img/blank.gif\" /><div class=\"Inner\"><div class=\"Title\">Title</div><div class=\"Description\">Description</div></div></li>");
              li.find("img").attr("src", sprintf(ICON_URI_32, items[name].icon));
              li.find(".Title").html(items[name].title);
              li.find(".Description").html(items[name].description);

              (function(litem, iname/*, iitem*/) {
                litem.click(function() {
                  if ( current && current != this ) {
                    $(current).removeClass("Current");
                  }
                  $(this).addClass("Current");
                  current = this;
                  selected = iname;

                  diag.$element.find(".DialogButtons .Ok").removeAttr("disabled");
                });

                litem.dblclick(function() {
                  diag.$element.find(".DialogButtons .Ok").click();
                });
              })(li, name, items[name]);
                diag.$element.find(".DialogContent ul").append(li);
              }
            }

            diag.$element.find(".DialogButtons .Close").show();
            diag.$element.find(".DialogButtons .Ok").show().click(function() {
              if ( selected ) {
                var pos = pos_ev.pageX;
                LaunchPanelItem(self.items.length, selected, [], "left:" + pos, self, undefined, true);
              }
            }).attr("disabled", "disabled");

          }, function() {
            self.reload();
        }, "Add new panel item", $("#OperationDialogPanelItemAdd")]);

        pitem.height = 300;
        pitem._gravity = "center";
        pitem.icon = "categories/applications-utilities.png";

        _WM.addWindow(pitem);
      };

      if ( this.pos == "bottom" ) {
        this.$element.addClass("Bottom");
        this.$element.css({"position" : "absolute", "top" : "auto", "bottom" : "0px"});
      } else {
        this.$element.removeClass("Bottom");
        this.$element.css({"position" : "absolute", "top" : "0px", "bottom" : "auto"});
      }

      console.groupEnd();

      this._super("Panel");
    },

    /**
     * Panel::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      for ( var i = 0; i < this.items.length; i++ ) {
        this.items[i].destroy();
      }

      this.items = null;
      this.index = -1;
      this.name  = "";
      if ( this.$element ) {
        this.$element.unbind("contextmenu");
        this.$element.empty().remove();
      }
      this.$element = null;

      if ( _Desktop ) {
        _Desktop.removePanel(this, true);
      }

      this.running = false;

      this._super();
    },

    /**
     * Panel::run() -- Set panel to running state
     * @return  void
     */
    run : function() {
      if ( this.running )
        return;

      var id = "Panel_" + this.index;
      var ul = this.$element.find("ul").first();

      ul.attr("id", id);

      $("#Desktop").append(this.$element);

      this.$element.show();
      this.running = true;

      var self = this;
      $(document).mouseup(function(ev) {
        if ( self.dragging ) {
          self._stopItemDrag(ev);
        }
      });
    },

    /**
     * Panel::_startItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _startItemDrag : function(ev, item) {
      var self = this;
      if ( !this.dragging ) {
        var dw = $(document).width();
        var off = item.$element.offset();
        var ghost = $("<li class=\"Ghost PanelItemSeparator\"></li>");
        ghost.css("left", ev.pageX + "px");
        ghost.css({
          "left"   : off['left'] + "px",
          "width"  : item.$element.width() + "px",
          "height" : item.$element.height() + "px"
        });

        this.dragging = {
          'start'   : item._align == "right" ? (dw - (off['left'] + item.$element.width())) : off['left'],
          'item'    : item,
          'result'  : null,
          'ghost'   : ghost,
          'startX'  : ev.pageX
        };

        console.log("Panel::_startItemDrag()", ev, this.dragging);

        $(document).bind("mousemove", function(ev) {
          self._handleItemDrag(ev);
        });

        this.$element.append(this.dragging.ghost);
      }
    },

    /**
     * Panel::_stopItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _stopItemDrag : function(ev) {
      var self = this;
      if ( this.dragging ) {
        console.log("Panel::_stopItemDrag()", ev, this.dragging);

        $(document).unbind("mousemove", function(ev) {
          self._handleItemDrag(ev);
        });

        this.dragging.item.setPosition(this.dragging.result, true);

        this.dragging.ghost.remove();
      }
      this.dragging = false;
    },

    /**
     * Panel::_handleItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _handleItemDrag : function(ev) {
      if ( this.dragging ) {
        var cur, diff = this.dragging.startX - ev.pageX;
        if ( this.dragging.item._align == "left" ) {
          cur = this.dragging.start - diff;
          this.dragging.result = {"left" : (cur + "px"), "right" : "auto"};
        } else {
          cur = this.dragging.start + diff;
          this.dragging.result = {"right" : (cur + "px"), "left" : "auto"};
        }
        this.dragging.ghost.css(this.dragging.result);
      }
    },

    /**
     * Panel::redraw() -- Redraw PanelItems
     * @param   String    ev          Event name
     * @param   Mixed     eargs       Event argument(s)
     * @return  void
     */
    redraw : function(ev, eargs) {
      var pi;
      if ( this.items ) {
        for ( var i = 0; i < this.items.length; i++ ) {
          pi = this.items[i];
          if ( pi._redrawable ) {
            pi.redraw(ev, eargs);
          }
        }
      }
    },

    /**
     * Panel::addItem() -- Add a new PanelItem
     * @param   PanelItem   i       Item
     * @param   String      pos     Position string
     * @param   bool        save    Save panel (Default = undefined)
     * @return  Mixed
     */
    addItem : function(i, pos, save) {
      if ( i instanceof PanelItem ) {

        console.group("Panel::addItem()");
        console.log(i._name, i);
        console.groupEnd();

        var el = i.create(pos);
        if ( el ) {
          el.attr("id", "PanelItem" + this.items.length);
          this.$element.find("ul").first().append(el);

          i.run();

          this.items.push(i);

          if ( save === true ) {
            _Settings.savePanel(this);
          }

          return i;
        }
      }

      return false;
    },

    /**
     * Panel::removeItem() -- Remove a PanelItem
     * @param   PanelItem     x       Item
     * @param   bool          save    Save panel (Default = undefined)
     * @return  bool
     */
    removeItem : function(x, save) {
      for ( var i = 0; i < this.items.length; i++ ) {
        if ( this.items[i] === x ) {
          x.destroy();

          console.group("Panel::removeItem()");
          console.log(x._name, x);
          console.groupEnd();

          this.items.splice(i, 1);

          if ( save === true ) {
            _Settings.savePanel(this);
          }

          return true;
        }
      }
      return false;
    },

    /**
     * PanelItem::modifyItem() -- A panel item has been modified
     * @param  PanelItem      item        Panel Item instance
     * @param  bool           save        Save the operation
     * @return void
     */
    modifyItem : function(item, save) {
      if ( save === true ) {
        _Settings.savePanel(this);
      }
    },

    /**
     * Panel::triggerExpand() -- Trigger expanding of items
     * @param   PanelItem    x       Item
     * @return  bool
     */
    triggerExpand : function() {
      console.group("Panel::triggerExpand()");
      if ( this.running ) {
        var i;
        var fs = 0;
        var is = 0;
        var ts = this.$element.width();

        if ( ts == this.width ) {
          console.groupEnd();
          return;
        }

        for ( i = 0; i < this.items.length; i++ ) {
          if ( !this.items[i]._expand ) {
            is += (this.items[i].$element.width() + 10);
          } else {
            is += 10;
          }
        }

        fs = (ts - is);

        console.log("Total Space", ts);
        console.log("Item Space", is);
        console.log("Free Space", fs);

        if ( fs > 0 ) {
          for ( i = 0; i < this.items.length; i++ ) {
            if ( this.items[i]._expand ) {
              fs -=  (this.items[i].$element.offset()['left']);
              console.log("Giving item", i, ":", fs, "space", this.items[i].$element);
              this.items[i].$element.width(fs);
              break;
            }
          }
        }

        this.width = ts;
      }

      console.groupEnd();
    },

    /**
     * Panel::getHeight() -- Get panel height
     * @return String
     */
    getHeight : function() {
      return 35; // FIXME
    },

    /**
     * Panel::getPosition() -- Get placed position
     * @return String
     */
    getPosition : function() {
      return this.pos;
    },

    /**
     * Panel::getSession() -- Get the panel session
     * @return Object
     */
    getSession : function() {
      var self = this;
      var items = [];
      for ( var i = 0; i < this.items.length; i++ ) {
        items.push(this.items[i].getSession());
      }

      return {
        "index"     : self.index,
        "name"      : self.name,
        "position"  : self.pos,
        "items"     : items
      };
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // PANEL ITEMS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * PanelItem -- The Panel Item Class
   * Basis for a PanelItem
   *
   * @extends Process
   * @class
   */
  var PanelItem = Process.extend({

    $element      : null,             //!< DOM Elemeent
    _name         : "",               //!< Item name identifier
    _named        : "",               //!< Readable name
    _align        : "left",           //!< Item alignment
    _expand       : false,            //!< Expand item
    _dynamic      : false,            //!< Dynamic item
    _orphan       : true,             //!< Orphan ? (Only one instance allowed)
    _crashed      : false,            //!< Crashed ?
    _configurable : false,            //!< Configurable ?
    _redrawable   : false,            //!< Redrawable ?
    _index        : -1,               //!< Panel item Index
    _panel        : null,             //!< Panel instance reference
    _position     : -1,               //!< Panel item position (left/right) in px

    /**
     * PanelItem::init() -- Constructor
     * @param   String    name    Panel Item name
     * @param   String    align   Panel Item alignment
     * @constructor
     */
    init : function(name, align)  {
      if ( align == "AlignLeft" ) align = "left";
      if ( align == "AlignRight" ) align = "right";

      this._name         = name;
      this._named        = name;
      this._align        = align || this._align;
      this._expand       = false;
      this._dynamic      = false;
      this._orphan       = true;
      this._crashed      = false;
      this._configurable = false;
      this._redrawable   = false;
      this._index        = -1;
      this._panel        = null;
      this.$element      = null;

      this._super(name);
    },

    /**
     * PanelItem::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.empty();
        this.$element.remove();
      }

      this._super();
    },

    /**
     * PanelItem::create() -- Create DOM elements etc.
     * @param   String    pos     Item Alignment
     * @return  $
     */
    create : function(pos) {
      var self = this;

      var spl = pos.split(":");
      var px = parseInt(spl[1], 10);
      pos = spl[0];

      if ( pos ) {
        this._align = pos;
      }

      this.$element = $("<li></li>");
      this.$element.addClass("PanelItem " + this._name);

      var cpos;
      if ( this._align == "right" ) {
        this.$element.addClass("AlignRight");
        cpos = {"left" : "auto", "right" : (px + "px")};
      } else {
        this.$element.removeClass("AlignRight");
        cpos = {"right" : "auto", "left" : (px + "px")};
      }

      console.log("PanelItem::create()", this._name, cpos, this._align);

      this.$element.bind("contextmenu", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        API.application.context_menu(ev, $(this), self.getMenu(), true);
        return false;
      });
      this.$element.bind("click", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        $(document).click(); // Trigger this! (deselects context-menu)
        return false;
      });
      this.$element.bind("mousedown", function(ev) {
        ev.preventDefault();
        /*ev.stopPropagation();
        return false;*/
      });
      /*this.$element.bind("mouseup", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });
      this.$element.bind("dblclick", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });*/

      this.setPosition(cpos);

      return this.$element;
    },

    /**
     * PanelItem::run() -- Run PanelItem
     * @return void
     */
    run : function() {
      _Tooltip.initRoot(this.$element);
    },

    /**
     * PanelItem::reload() -- Reload PanelItem
     * @return void
     */
    reload : function() {
      // Implemented in upper-class
    },

    /**
     * PanelItem::redraw() -- Redraw PanelItem
     * @return void
     */
    redraw : function() {
      // Implemented in upper-class
    },

    /**
     * PanelItem::expand() -- Expand item to max size
     * @return void
     */
    expand : function() {
      if ( this._expand ) {
        (function(){})();
      }
    },

    /**
     * PanelItem::onRedraw() -- Bubble a redraw event down to panel
     * This function is called in a panel item when chaning content
     * @return void
     */
    onRedraw : function() {
      if ( this._panel ) {
        this._panel.triggerExpand();
      }
    },

    /**
     * PanelItem::crash() -- Make PanelItem Crash
     * @param   String      error     Error message
     * @return  void
     */
    crash : function(error) {
      this.$element.find("*").remove();
      this.$element.addClass("Crashed");
      this.$element.html("<img alt=\"\" src=\"" + sprintf(ICON_URI_16, "status/error.png") + "\"/><span>" + error + "</span>");

      this._crashed = true;
    },

    /**
     * PanelItem::configure() -- Open Configuration Dialog
     * @return void
     */
    configure : function(callback, callback_ok) {
      var self = this;
      callback = callback || function() {};
      callback_ok = callback_ok || function() {};

      if ( this._configurable ) {
        _WM.addWindow(new OSjs.Dialogs.PanelItemOperationDialog(OperationDialog, API, [this, function(diag) {
          callback(diag);

          diag.$element.find(".DialogButtons .Close").show();
          diag.$element.find(".DialogButtons .Ok").show().click(function() {
            callback_ok(diag);
            self.reload();

            if ( self._panel ) {
              self._panel.modifyItem(self, true);
            }
          });
        }]));
      }
    },

    /**
     * PanelItem::setPosition() -- Set position CSS
     * @return void
     */
    setPosition : function(pos, save) {
      if ( pos ) {
        if ( pos[this._align] !== undefined ) {
          this._position = parseInt(pos[this._align].replace("px", ""), 10) || 0;

          if ( this._align == "right" ) {
            var tw = $(document).width();
            if ( this._position > tw ) {
              this._position = tw;
              pos[this._align] = tw + "px";
            }
          } else {
            if ( this._position < 0 ) {
              this._position = 0;
              pos[this._align] = 0 + "px";
            }
          }
        }

        this.$element.css(pos);

        if ( save === true ) {
          _Settings.savePanel(this._panel);
        }

        this.onRedraw();
      }
    },

    /**
     * PanelItem::setAlignment() -- Set new alignment
     * @return void
     */
    setAlignment : function(align) {
      this._align = align;
      var pos;

      if ( this._align == "left" ) {
        pos = {"left" : this._position + "px", "right" : "auto"};
      } else {
        pos = {"left" : "auto", "right" : this._position + "px"};
      }

      this.setPosition(pos, true);
    },

    /**
     * PanelItem::getMenu() -- Get the ContextMenu
     * @return  JSON
     */
    getMenu : function() {
      var self = this;
      var labels = OSjs.Labels.ContextMenuPanelItem;
      var newpos = self._align == "left" ? "right" : "left";

      var menu = [
        {"title" : self._named, "attribute" : "header"},
        {"title" : labels.move, "method" : function(ev) {
          if ( self._panel ) {
            self._panel._startItemDrag(ev, self);
          }
        }},
        {"title" : labels.alignment[newpos], "method" : function() {
          self.setAlignment(newpos);
        }},
        {"title" : labels.remove, "method" : function() {
          API.system.dialog("confirm", OSjs.Labels.PanelItemRemove, null, function() {
            self._panel.removeItem(self, true);
          });
        }}
      ];

      if ( this._configurable ) {
        menu.push({
          'title' : labels.configure,
          'method' : function() {
            self.configure();
          }
        });
      }

      return menu;
    },

    /**
     * PanelItem::getSession() -- Get the session properties
     * @return Object
     */
    getSession : function() {
      return {
        "name"      : this._name,
        "index"     : this._index,
        "align"     : this._align,
        "position"  : this._position,
        "opts"      : []
      };
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // WINDOW
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Window -- The Main Window Class
   * Basis for an Application or Dialog.
   * This class does all the loading
   *
   * @class
   */
  var Window = Class.extend({

    $element          : null,                             //!< DOM Element
    _current          : false,                            //!< Current window ?
    _attrs_temp       : null,                             //!< Temporary Window attributes
    _attrs_restore    : null,                             //!< Restore Window attributes
    _created          : false,                            //!< Window created ?
    _showing          : false,                            //!< Window showing ?
    _origtitle        : "",                               //!< Original Window title
    _id               : null,                             //!< DOM Element ID
    _name             : "",                               //!< Window Name
    _title            : "",                               //!< Window Title
    _content          : "",                               //!< Window Content (HTML)
    _icon             : "emblems/emblem-unreadable.png",  //!< Window Icon Name
    _is_dialog        : false,                            //!< Window Attribute: Dialog ?
    _is_resizable     : true,                             //!< Window Attribute: Resizable ?
    _is_draggable     : true,                             //!< Window Attribute: Draggable ?
    _is_scrollable    : true,                             //!< Window Attribute: Scrollable ?
    _is_maximized     : false,                            //!< Window Attribute: Maximized state
    _is_maximizable   : true,                             //!< Window Attribute: Maximizable ?
    _is_minimized     : false,                            //!< Window Attribute: Minimized state
    _is_minimizable   : true,                             //!< Window Attribute: Minimizable ?
    _is_sessionable   : true,                             //!< Window Attribute: Sessionable ?
    _is_closable      : true,                             //!< Window Attribute: Closable ?
    _is_orphan        : false,                            //!< Window Attribute: Orphan (Only one instance allowed)
    _is_ontop         : false,                            //!< Window Attribute: On-Top of other windows ?
    _skip_taskbar     : false,                            //!< Window Attribute: Skip the taskbar
    _skip_pager       : false,                            //!< Window Attribute: Skip the pager
    _oldZindex        : -1,                               //!< Old z-index
    _zindex           : -1,                               //!< Current z-index
    _gravity          : "none",                           //!< Window gravity
    _width            : -1,                               //!< Current window width in px
    _height           : -1,                               //!< Current window height in px
    _top              : -1,                               //!< Current window top position in px
    _left             : -1,                               //!< Current window left position in px
    _lock_size        : false,                            //!< Lock window size
    _lock_width       : -1,                               //!< Lock to this window width in px
    _lock_height      : -1,                               //!< Lock to this window height in px
    _bindings         : {},                               //!< Event bindings list

    /**
     * Window::init() -- Constructor
     *
     * @param String   name       Name of window
     * @param String   dialog     Dialog type if any
     * @param Object   attrs      Extra win attributes (used to restore from sleep etc)
     * @constructor
     */
    init : function(name, dialog, attrs) {
      // Check if we are restoring a window
      var restore = null;
      if ( attrs instanceof Object ) {
        if ( attrs[name] !== undefined ) {
          restore = attrs[name];
        }
      }

      // Default attributes
      this.$element          = null;
      this._current          = false;
      this._attrs_temp       = null;
      this._created          = false;
      this._showing          = false;
      this._origtitle        = "";
      this._id               = null;
      this._content          = "";
      this._icon             = "emblems/emblem-unreadable.png";
      this._is_maximized     = false;
      this._is_minimized     = false;
      this._is_closable      = true;
      this._is_orphan        = false;
      this._is_ontop         = false;
      this._skip_taskbar     = false;
      this._skip_pager       = false;
      this._oldZindex        = -1;
      this._zindex           = -1;
      this._gravity          = "none";
      this._width            = -1;
      this._height           = -1;
      this._top              = -1;
      this._left             = -1;
      this._lock_size        = false;
      this._lock_width       = -1;
      this._lock_height      = -1;

      // Window attributes
      this._name           = name;
      this._title          = dialog ? "Dialog" : "Window";
      this._is_dialog      = dialog ? dialog : false;
      this._is_resizable   = dialog ? false : true;
      this._is_scrollable  = dialog ? false :true;
      this._is_maximizable = dialog ? false : true;
      this._is_minimizable = dialog ? false : true;
      this._is_sessionable = dialog ? false : true;
      this._attrs_restore  = restore;
      this._bindings = {
        "die"    : [],
        "focus"  : [],
        "blur"   : [],
        "resize" : []
      };

      console.log("Window::" + name + "::init()");
    },

    /**
     * Window::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      var self = this;

      if ( this._created ) {
        this._call("die");

        this._showing    = false;
        this._created    = false;
        this._bindings   = null;

        $(this.$element).fadeOut(ANIMATION_SPEED, function() {
          $(self.$element).empty().remove();
        });
      }

      console.log("Window::" + this._name + "::destroy()");

      //this._super(); Called by the binding "die"
    },

    /**
     * Window::_bind() -- Bind an event by name and callback
     * @param   String    mname     Binding name
     * @param   Function  mfunc     Binding function
     * @return  void
     */
    _bind : function(mname, mfunc) {
      this._bindings[mname].push(mfunc);
    },

    /**
     * Window::_call() -- Call an event by name and arguments
     * @param   String    mname     Binding name
     * @return  void
     */
    _call : function(mname) {
      if ( this._bindings && this._showing ) {
        var fs = this._bindings[mname];
        if ( fs ) {
          for ( var i = 0; i < fs.length; i++ ) {
            fs[i]();
          }
        }
      }
    },

    /**
     * Window::create() -- Create DOM elemnts etc.
     * @param   String        id              The ID to give DOM Element
     * @param   Function      mcallback       Callback when done
     * @return  $
     */
    create : function(id, mcallback) {
      var self = this;

      mcallback = mcallback || function() {};

      if ( !this._created ) {
        console.group("Window::" + this._name + "::create()");

        this._id        = id;
        this._showing   = true;
        this._origtitle = this._title;

        var fresh = true;
        var el    = this._is_dialog ? $($("#Dialog").html()) : $($("#Window").html());

        this.$element = el;

        if ( this._lock_size ) {
          this._lock_width = this._width;
          this._lock_height = this._height;
        }

        //
        // Attributtes
        //
        el.attr("id", id);
        el.find(".WindowContent").css("overflow", this._is_scrollable ? "auto" : "hidden");

        // Content and buttons
        el.find(".WindowTopInner span").html(this._title);
        if ( this._is_dialog ) {
          el.find(".DialogContent").html(this._content);
          if ( this._is_dialog !== true ) {
            el.find(".DialogContent").addClass(this._is_dialog);

            var icon;
            switch ( this._is_dialog ) {
              case "info" :
                icon = "info";
              break;
              case "error" :
                icon = "error";
              break;
              case "question" :
              case "confirm"  :
                icon = "question";
              break;
              case "warning" :
                icon = "warning";
              break;
              default :
                icon = null;
              break;
            }

            if ( icon ) {
              el.find(".WindowTopInner img").attr("src", sprintf(ICON_URI_16, sprintf("status/gtk-dialog-%s.png", icon)));
            } else {
              el.find(".WindowTopInner img").hide();
            }
          }
        } else {
          el.find(".WindowTopInner img").attr("src", this.getIcon());
          el.find(".WindowContentInner").html(this._content);

          el.find(".WindowTopInner img").click(function(ev) {
            var labels = OSjs.Labels.ContextMenuWindowMenu;
            API.application.context_menu(ev, $(this), [
              {"title" : (self._is_maximized ? labels.restore : labels.max), "icon" : "actions/window_fullscreen.png", "disabled" : !self._is_maximizable, "method" : function() {
                if ( self._is_maximizable ) {
                  el.find(".ActionMaximize").click();
                }
              }},
              {"title" : (self._is_ontop ? labels.same : labels.ontop), "icon" : "actions/zoom-original.png", "method" : function() {
                self._ontop();
              }},
              {"title" : (self._is_minimized ? labels.show : labels.min), "icon" : "actions/window_nofullscreen.png", "disabled" : !self._is_minimizable, "method" : function() {
                if ( self._is_minimizable ) {
                  el.find(".ActionMinimize").click();
                }
              }},
              {"title" : labels.close, "disabled" : !self._is_closable, "icon" : "actions/window-close.png", "method" : function() {
                if ( self._is_closable ) {
                  el.find(".ActionClose").click();
                }
              }}

            ], true, 1);

            ev.stopPropagation();
            ev.preventDefault();
          });
        }

        _Tooltip.initRoot(el.find(".WindowContent"));

        //
        // Events
        //
        el.bind('contextmenu', function(ev) {
          ev.stopPropagation();
        });

        el.bind('mousedown', function(ev) {
          self.focus();
          if ( ev.which > 1 ) { // Menu only NOTE
            ev.stopPropagation();
          }
        });
        if ( this._is_maximizable ) {
          el.find(".WindowTopInner").dblclick(function() {
            el.find(".ActionMaximize").click();
          });
        }

        el.find(".WindowTop").bind("contextmenu",function() {
          return false;
        });

        if ( this._is_closable ) {
          el.find(".ActionClose").click(function() {
            self.close();
          });
        } else {
          el.find(".ActionClose").parent().hide();
        }

        if ( this._is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            self._minimize();
          });
        } else {
          el.find(".ActionMinimize").parent().hide();
        }

        if ( this._is_maximizable ) {
          el.find(".ActionMaximize").click(function() {
            self._maximize();
          });
        } else {
          el.find(".ActionMaximize").parent().hide();
        }

        // Insert into DOM
        _WM.insertWindow(el);

        //
        // Apply sizes, dimensions etc.
        //

        // Size and dimension
        if ( this._gravity === "center" ) {
          this._top = (($(document).height() / 2) - ($(el).height() / 2));
          this._left = (($(document).width() / 2) - ($(el).width() / 2));
        } else {
          // Find free space for new windows
          var _ws = _WM.getWindowSpace();
          this._top = _ws.y;
          this._left = _ws.x;
        }

        // Check if window has any saved attributes for override (session restore etc)
        if ( this._attrs_restore && sizeof(this._attrs_restore) ) {
          if ( this._attrs_restore.is_maximized ) {
            this._attrs_temp = {
              top : this._top,
              left : this._left,
              width : this._width,
              height : this._height
            };
          }

          this._top          = this._attrs_restore.top;
          this._left         = this._attrs_restore.left;
          this._width        = this._attrs_restore.width;
          this._height       = this._attrs_restore.height;
          this._is_minimized = this._attrs_restore.is_minimized;
          this._is_maximized = this._attrs_restore.is_maximized;
          this._is_ontop     = this._attrs_restore.is_ontop;
          this._zindex       = this._attrs_restore.zindex;

          if ( this._is_ontop ) {
            if ( this._zindex > _OnTopIndex ) {
              _OnTopIndex = this._zindex;
            }
          } else {
            if ( this._zindex > _TopIndex ) {
              _TopIndex = this._zindex;
            }
          }

          fresh = false;
        }

        if ( !isNaN(this._width) && (this._width > 0) ) {
          $(el).width(this._width + "px");
        }
        if ( !isNaN(this._height) && (this._height > 0) ) {
          $(el).height(this._height + "px");
        }
        if ( !isNaN(this._left) && (this._left > 0) && !isNaN(this._top) && (this._top > 0) ) {
          $(el).offset({'left' : (this._left), 'top' : (this._top)});
        }

        //
        // Apply fixes etc. after DOM insertion
        //

        // Fix title alignment
        var lw = el.find(".WindowTopInner img").is(":visible") ? 16 : 0;
        var hw = 0;
        $(el).find(".WindowTop .WindowTopController").filter(":visible").each(function() {
          hw += parseInt($(this).width(), 10);
        });

        $(el).find(".WindowTopInner span").css({
          "padding-left" : lw + "px",
          "padding-right" : hw + "px"
        });

        // Newly created windows needs their inner dimension fixed
        if ( fresh ) {
          if ( !isNaN(this._height) && (this._height > 0) ) {
            this._resize(this._width, this._height, el);
          }
        }

        //
        // Handlers
        //

        // Add jQuery UI Handlers
        if ( this._is_draggable ) {
          el.draggable({
            handle : ".WindowTop",
            start : function() {

              if ( self._is_maximized ) {
                API.ui.cursor("not-allowed");
                return false;
              }
              el.addClass("Blend");
              API.ui.cursor("move");

              return true;
            },
            stop : function() {

              el.removeClass("Blend");
              API.ui.cursor("default");

              self._left = self.$element.offset()['left'];
              self._top = self.$element.offset()['top'];
            }
          });
        }

        if ( this._is_resizable ) {
          var ropts = {
            handles : "se",
            start : function() {
              if ( self._is_maximized ) {
                API.ui.cursor("not-allowed");
                return false;
              }
              el.addClass("Blend");

              return true;
            },
            stop : function() {
              el.removeClass("Blend");

              self._width = parseInt(self.$element.width(), 10);
              self._height = parseInt(self.$element.height(), 10);

              self._call("resize");
            }
          };

          if ( this._lock_width > 0 ) {
            ropts.minWidth = this._lock_width;
          }
          if ( this._lock_height > 0 ) {
            ropts.minHeight = this._lock_height;
          }

          el.resizable(ropts);
        }

        //
        // States
        //

        if ( this._is_minimized ) {
          $(el).hide();
        }

        if ( this._zindex && this._zindex > 0 ) {
          this._shuffle(this._zindex);
        } else {
          if ( this._is_ontop ) {
            this._ontop(true);
          }
        }

        if ( this._is_maximized ) {
          this.$element.find(".ActionMaximize").parent().addClass("Active");
          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }

        if ( fresh ) {
          this._gravitate();
        }

        this._created = true;

        console.log(el.get(0));
        console.groupEnd();

        mcallback(fresh);

        return el;
      }

      return null;
    },

    //
    // EVENTS
    //

    /**
     * Window::show() -- Show window (add)
     * @see WidowManager::addWindow()
     * @return void
     */
    show : function() {
      if ( !this._showing ) {
        _WM.addWindow(this);

        this._showing = true;
      }
    },

    /**
     * Window::close() -- Close window (remove)
     * @see WindowManager::removeWindow()
     * @return void
     */
    close : function() {
      if ( this._showing ) {
        _WM.removeWindow(this, true);

        this._showing = false;
      }
    },

    /**
     * Window::focus() -- Focus window
     * @see WindowManager::focusWindow()
     * @return void
     */
    focus : function() {
      _WM.focusWindow(this);
    },

    /**
     * Window::blur() -- Blur window
     * @see WindowManager::blurWindow()
     * @return void
     */
    blur : function() {
      _WM.blurWindow(this);
    },

    /**
     * Window::setTitle() -- Set Window title
     * @param   String    t         Title
     * @return  void
     */
    setTitle : function(t) {
      if ( t != this._title ) {
        this._title = t;
        this.$element.find(".WindowTopInner span").html(this._title);
        _WM.updateWindow(this);
      }
    },

    /**
     * Window::getTitle() -- Get Window title
     * @return String
     */
    getTitle : function() {
      return this._title;
    },

    /**
     * Window::getIcon() -- Get Window full icon path
     * @param   String    size      Size (default = 16x16)
     * @return  String
     */
    getIcon : function(size) {
      size = size || "16x16";
      //if ( this._icon.match(/^\/img/) ) {
      if ( this._icon.match(/^\//) ) {
        return this._icon;
      }
      return sprintf(ICON_URI, size, this._icon);
    },

    //
    // INTERNAL METHODS
    //

    /**
     * Window::_shuffle() -- Shuffle Window (adjust z-index)
     * @param   int   zi        New z-index
     * @param   int   old       Old z-index
     * @return  void
     */
    _shuffle : function(zi, old) {
      if ( old ) {
        this._oldZindex = this._zindex;
      }

      zi = parseInt(zi, 10);
      if ( !isNaN(zi) && (zi > 0) ) {
        this.$element.css("z-index", zi);
        this._zindex = zi;
      }
    },

    /**
     * Window::_ontop() -- Set Window on-top state
     * @param   bool    t     State
     * @return  void
     */
    _ontop : function(t) {
      t = (t === undefined) ? this._is_ontop : t;
      if ( !t ) {
        if ( this._oldZindex > 0 ) {
          this._shuffle(this._oldZindex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }

        this._is_ontop = false;
      } else {
        _OnTopIndex++;
        this._shuffle(_OnTopIndex, true);
        this._is_ontop = true;
      }
    },

    /**
     * Window::_focus() -- Set window to focused state
     * @return void
     */
    _focus : function() {
      if ( !this._current ) {

        if ( this._is_minimized ) {
          this._minimize();
        }

        if ( this._is_ontop ) {
          _OnTopIndex++;
          this._shuffle(_OnTopIndex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }

        this.$element.addClass("Current");
      }

      this._call("focus");
      this._current = true;
    },

    /**
     * Window::_blur() -- Set window to blurred state
     * @return void
     */
    _blur : function() {
      if ( this._current ) {
        this.$element.removeClass("Current");

        this._call("blur");
      }

      this.$element.find("textarea, input, select, button").each(function() {
        $(this).blur();
      });

      this._current = false;
    },

    /**
     * Window::_minimize() -- Set window to minimized state
     * @return void
     */
    _minimize : function() {
      if ( this._is_minimizable ) {
        var self = this;
        if ( this._is_minimized ) {
          this.$element.animate({opacity: 'show', height: 'show'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _WM.restoreWindow(self);
          }});

          this._is_minimized = false;
        } else {
          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            _WM.minimizeWindow(self);
          }});

          this._is_minimized = true;

          if ( this._current ) {
            _WM.blurWindow(self);
          }
        }

      }
    },

    /**
     * Window::_maximize() -- Set window to maximized state
     * @return void
     */
    _maximize : function() {
      var self = this;

      if ( this._is_maximizable ) {
        if ( this._is_maximized ) {
          if ( this._attrs_temp !== null ) {
            this._top = this._attrs_temp.top;
            this._left = this._attrs_temp.left;
            this._width = this._attrs_temp.width;
            this._height = this._attrs_temp.height;

            this.$element.animate({
              'top'    : this._top + 'px',
              'left'   : this._left + 'px',
              'width'  : this._width + 'px',
              'height' : this._height + 'px'
            }, {'duration' : ANIMATION_SPEED, 'complete' : function() {
              self._call("resize");
            }});

            this._attrs_temp = null;
          }

          this.$element.find(".ActionMaximize").parent().removeClass("Active");
          this._is_maximized = false;

          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").show();
          }
        } else {
          this._attrs_temp = {
            'top'    : this.$element.offset()['top'],
            'left'   : this.$element.offset()['left'],
            'width'  : this.$element.width(),
            'height' : this.$element.height()
          };

          var free      = _WM.getWindowSpace();
          this._left    = free.x;
          this._top     = free.y;
          this._width   = free.w;
          this._height  = free.h;

          this.$element.css({
            'top'    : (this._top) + 'px',
            'left'   : (this._left) + 'px'
          }).animate({
            'width'  : (this._width) + "px",
            'height' : (this._height)  + "px"
          }, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            self._call("resize");
          }}, function() {
            _WM.maximizeWindow(self);
          });

          this.$element.find(".ActionMaximize").parent().addClass("Active");
          this._is_maximized = true;

          if ( this._is_resizable ) {
            this.$element.find(".ui-resizable-handle").hide();
          }
        }
      }
    },

    /**
     * Window::_gravitate() -- Gravitate window
     * @param   String    dir       Direction/Location
     * @return void
     */
    _gravitate : function(dir) {
      dir = dir || this._gravity;
      if ( dir == "center" ) {
        var el = this.$element;
        var x  = (($(document).width() / 2) - ($(el).width() / 2));
        var y  = (($(document).height() / 2) - ($(el).height() / 2));

        // We do not want our windows to dissappear out of view, right ?
        if ( y < 0 ) {
          y = 0;
          if ( _Desktop ) {
            var panels = _Desktop.getPanels();
            var i = 0, l = panels.length;
            for ( i; i < l; i++ ) {
              if ( panels[i].getPosition() == "top" ) {
                y += panels[i].getHeight();
              }
            }
          }
        }

        this._move(x, y);
      }
    },

    /**
     * Window::_move() -- Move Window position
     * @param   int   left    New Left/X Position in px
     * @param   int   top     New top/Y Position in px
     * @return  void
     */
    _move : function(left, top) {
      this._left = left;
      this._top = top;

      this.$element.css({
        "left" : left + "px",
        "top" : top + "px"
      });
    },

    /**
     * Window::_resize() -- Resize window dimension
     * @param   int           width       New width in px
     * @param   int           height      New height in px
     * @param   DOMElement    el          Element
     * @return  void
     */
    _resize : function(width, height, el) {
      el = el || this.$element;

      if ( height ) {
        height = height < 128 ? 128 : height;
        if ( this._lock_height > 0 && height > this._lock_height ) {
          height = this._lock_height;
        }

        el.css("height", (height) + "px");
      } else {
        el.css("height", (this._height) + "px");
      }
      if ( width ) {
        width = width < 128 ? 128 : width;
        if ( this._lock_width > 0 && width > this._lock_width ) {
          width = this._lock_width;
        }

        el.css("width", (width) + "px");
      } else {
        el.css("width", (this._width) + "px");
      }
    },

    /**
     * Window::getWindowId() -- Get Window Id
     * @return String
     */
    getWindowId : function() {
      return this.$element.attr("id");
    },

    /**
     * Window::getAttributes() -- Get current Window attributes
     * @return Object
     */
    getAttributes : function() {
      if ( this._is_sessionable ) {
        return {
          is_maximized : this._is_maximized,
          is_minimized : this._is_minimized,
          is_ontop     : this._is_ontop,
          zindex       : this._zindex,
          width        : this._width,
          height       : this._height,
          top          : this._top,
          left         : this._left
        };
      }
      return false;
   }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // GTK+ Implementations
  /////////////////////////////////////////////////////////////////////////////


  /**
   * GtkWindow -- Gtk+ Window Class
   *
   * @extends Window
   * @class
   */
  var GtkWindow = Window.extend({

    /**
     * GtkWindow::init() -- Constructor
     * @see Window::init()
     * @constructor
     */
    init : function(window_name, window_dialog, app, attrs) {
      this.app = app;

      this._super(window_name, window_dialog, attrs);
    },

    /**
     * GtkWindow::create() -- Create DOM elements etc.
     * @see Window::create()
     * @return $
     */
    create : function(id, mcallback) {
      var el = this._super(id, mcallback);
      var self = this;

      if ( el ) {

        //
        // Menus
        //

        if ( el.find(".GtkMenuBar").length ) {
          var last_menu = null;

          el.find(".GtkMenuItem, .GtkImageMenuItem, .GtkRadioMenuItem").each(function() {
            var level = ($(this).parents(".GtkMenu").length);

            $(this).hover(function() {
              $(this).addClass("Hover").find("span:first").addClass("Hover");
            }, function() {
              $(this).removeClass("Hover").find("span:first").removeClass("Hover");
            });

            $(this).addClass("Level_" + level);
            if ( level > 0 ) {
              $(this).addClass("SubItem");

              if ( $(this).find(".GtkMenu").length ) {
                $(this).addClass("Subbed");
              }
            }

            if ( level > 0 ) {
              $(this).hover(function() {
                var c = $(this).find(".GtkMenu").first();
                if ( last_menu !== c ) {
                  if ( $(this).hasClass("Level_1") || $(this).hasClass("Level_2") ) {
                    $(this).parent().find(".GtkMenu").hide();
                  }

                  c.show().css({
                    'top'  : '0px',
                    'left' : $(this).parent().width() + 'px'
                  });
                }
              }, function() {
                $(this).find(".GtkMenu").first().hide();
              }).click(function(ev) {
                if ( !$(this).hasClass("Subbed") ) {
                  el.find(".GtkMenuItem .GtkMenu").hide();
                }
                ev.stopPropagation();
              });
            } else {
              $(this).click(function() {
                var c = $(this).find(".GtkMenu:first");
                if ( last_menu && c !== last_menu ) {
                  last_menu.hide();
                }
                last_menu = c.show();
              });
            }
          });

          $(document).click(function(ev) {
            var t = $(ev.target || ev.srcElement);
            if ( !$(t).closest(".GtkMenuBar").get(0) && !$(t).closest(".GtkMenu").get(0)  ) {
              el.find(".GtkMenuItem .GtkMenu").hide();
            }
          });
        }

        //
        // Elements
        //

        // Slider
        el.find(".GtkScale").slider();

        // Item Groups
        el.find(".GtkToolItemGroup").click(function() {
          $(this).parents(".GtkToolPalette").first().find(".GtkToolItemGroup").removeClass("Checked");

          if ( $(this).hasClass("Checked") ) {
            $(this).removeClass("Checked");
          } else {
            $(this).addClass("Checked");
          }
        });

        // Toggle buttons
        el.find(".GtkToggleToolButton button").click(function() {
          if ( $(this).parent().hasClass("Checked") ) {
            $(this).parent().removeClass("Checked");
          } else {
            $(this).parent().addClass("Checked");
          }
        });

        // Drawing areas (canvas)
        if ( OSjs.Compability.SUPPORT_CANVAS ) {
          el.find(".GtkDrawingArea").append("<canvas>");
        }

        // Tabs
        var CreateId = function() {
          var cn = "";
          var test = "";
          while ( !cn ) {
            test = "tabs-" + TEMP_COUNTER;
            if ( !document.getElementById(test) ) {
              cn = test;
            }
            TEMP_COUNTER++;
          }
          return cn;
        };

        el.find(".GtkNotebook ul:first-child li a").each(function(ind, el) {
          var href = $(el).attr("href").replace("#", "");
          var old = document.getElementById(href);
          var newn = CreateId();

          $(el).attr("href", "#" + newn);
          $(old).attr("id", newn);
        });

        el.find(".GtkNotebook").each(function() {
          // Store current selected tab for session usage
          var nbid = self._name + "_" + this.className.replace(/GtkNotebook|ui\-(.*)|\s/g, "");
          $(this).tabs({
            select : function(ev, ui) {
              if ( self.app ) {
                self.app._setArgv(nbid, ui.index);
              }
            }
          });

          var cur = self.app._getArgv(nbid);
          if ( cur !== null  ) {
            $(this).tabs("select", cur);
          }
        });


        // File-chooser
        el.find(".GtkFileChooserButton input[type=text]").attr("disabled", "disabled");

        // Misc
        el.find("input").attr("autocomplete", "off");

        //
        // Translation
        //
        var l = OSjs.Labels.GtkMenu;
        var t;
        for ( t in l ) {
          if ( l.hasOwnProperty(t) ) {
            el.find(".GtkMenuBar .imagemenuitem_" + t + " span").first().html(l[t]);
            el.find(".GtkMenuBar .menuitem_" + t + " span").first().html(l[t]);
          }
        }

        //
        // Box factors (LAST!)
        //

        setTimeout(function() {
          self.__calculateExpansion();
        }, 0);

        /*this._bind("resize", function() {
          self.__calculateExpansion();
        });*/
      }

      return el;
    },

    /**
     * GtkWindow::__calculateExpansion() -- Do GTK+ Expansions
     * @return void
     */
    __calculateExpansion : function() {
      this.$element.find("td.Fill").each(function() {
        if ( !$(this).hasClass("Expand") ) {
          //var height = parseInt($(this).css("height"), 10);
          //if ( !height || isNaN(height) ) {
          //}
          var first = $(this).find(".TableCellWrap :first-child");
          var height = parseInt(first.height(), 10);
          if ( !isNaN(height) && height ) {
            $(this).parent().css("height", height + "px");
            //$(this).css("height", height + "px");
          }
        }
      });
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Menu -- Menu for Window and Context Class
   *
   * @class
   */
  var Menu = Class.extend({

    $element : null,  //!< Menu DOM Element
    $focuser : null,  //!< DEPRECATED
    $clicked : null,  //!< Clicked elemenet

    /**
     * Menu::init() -- Constructor
     * @constructor
     */
    init : function(clicked) {
      this.$element = null;
      this.$clicked = clicked;

      console.group("Menu::init()");
      console.groupEnd();

      _Menu = this;
    },

    /**
     * Menu::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      console.group("Menu::destroy()");

      if ( this.$element ) {
        this.$element.remove();
        this.$element = null;
      }
      if ( this.$focuser ) {
        this.$focuser.remove();
        this.$focuser = null;
      }

      if ( _Menu ) {
        if ( _Menu !== this ) {
          _Menu.destroy();
        }
        _Menu = null;
      }

      console.groupEnd();
    },

    /**
     * Menu::_createItem() -- Create a new Menu Item
     * @param  DOMEvent   ev      DOM Event
     * @param  Object     iter    Menu Item Iter
     * @return DOMElement
     */
    _createItem : function(ev, iter) {
      var self = this;

      //console.log("Menu::_createItem()", iter);

      var li = $("<li class=\"GUIMenuItem\"></li>");
      var src;
      var disabled = false;

      if ( iter.icon ) {
        src = iter.icon.match(/^\//) ? iter.icon : sprintf(ICON_URI_16, iter.icon);
        li.append($(sprintf("<img alt=\"%s\" src=\"%s\" />", iter.title, src)));
      }

      if ( iter.title ) {
        li.append($(sprintf("<span class=\"%s\">%s</span>", (src ? "margin" : "") ,iter.title)));
      }

      if ( iter.disabled ) {
        li.addClass("Disabled");
        disabled = true;
      }

      if ( iter.attribute && iter.attribute == "header" ) {
        li.addClass("Header");
      }

      if ( typeof iter.method == "function" ) {
        li.click(function(ev) {
          if ( !disabled ) {
            iter.method(ev);
          }

          self.destroy();
          //self.$focuser.blur();
        });
      } else {
        li.click(function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        });
      }

      li.mousedown(function(ev) {
        ev.preventDefault();
      });

      if ( iter.items instanceof Array ) {
        li.addClass("HasChildren");
        var smenu = this._createMenu(ev, iter.items);

        li.append(smenu);
        li.hover(function() {
          smenu.css({
            "left"  : (li.width()) + "px",
            "top"   : (0 /*li.get(0).offsetTop*/) + "px"
          });

          smenu.show();
        }, function() {
          smenu.hide();
        });
      }

      return li;
    },

    /**
     * Menu::_createSeparator() -- Create a new Menu Separator Item
     * @param  DOMEvent   ev      DOM Event
     * @param  Object     iter    Menu Item Iter
     * @return DOMElement
     */
    _createSeparator : function() {
      var li = $("<li class=\"GUIMenuItem\"></li>");
      li.append("<hr />");
      return li;
   },

    /**
     * Menu::_createMenu() -- Create a new Menu
     * @param  DOMEvent   ev      DOM Event
     * @param  Array      menu    Menu
     * @return DOMElement
     */
    _createMenu : function(ev, menu) {
      var div = $("<div class=\"GUIMenu\"></div>");
      var ul  = $("<ul class=\"GUIMenuList\"></ul>");

      var i   = 0, l = menu.length;
      for ( i; i < l; i++ ) {
        iter = menu[i];
        if ( menu[i] == "---" ) {
          ul.append(this._createSeparator(ev));
        } else {
          ul.append(this._createItem(ev, menu[i]));
        }
      }

      div.append(ul);

      return div;
    },

    /**
     * Menu::create() -- Create a new Menu
     * @param  DOMEvent     ev    DOM Event
     * @param  Array        menu  Menu
     * @param  bool         show  Show on create
     * @return DOMElement
     */
    create : function(ev, menu, show) {
      console.group("Menu::create()");

      var div = this._createMenu(ev, menu);
      //var f   = $("<input type=\"text\" value=\"\" />");

      /*
      var self = this;
      f.focus(function() {
      });
      f.blur(function(ev) {
        self.destroy();
      });
      */
      //div.append(f);

      this.$element = div;
      //this.$focuser = f;

      if ( show === true ) {
        this.show(ev, this.$element);
      }

      //f.focus();


      console.groupEnd();

      return this.$element;
    },

    /**
     * Menu::show() -- Display the menu
     * @param  DOMEvent   ev    DOM Event
     * @param  DOMElement el    DOM Element
     * @return void
     */
    show : function(ev, el) {
      $("body").append(el);

      el.css({
        "top" : "-10000px",
        "left" : "-10000px"
      }).show();

      setTimeout(function() {
        console.group("Menu::show()");

        var y = ev.pageY;
        var x = ev.pageX;
        var w = el.width();
        var h = el.height();

        if ( (w + x) > $(document).width() ) {
          x -= (w + 10);
        }
        if ( (h + y) > $(document).height() ) {
          y -= (h + 10);
        }

        el.css({
          "top"   : y + "px",
          "left"  : x + "px"
        });

        console.log("Pos", x, "x", y);
        console.log("El", el);
        console.groupEnd();
      });
    },

    /**
     * Menu::handleGlobalClick() -- Handle Global Click event
     * @param  DOMEvent   ev      DOM Event
     * @return void
     */
    handleGlobalClick : function(ev) {
      var t = ev.target || ev.srcElement;
      if ( t ) {
        t = $(t);
        if ( !t.hasClass(".GUIMenu") && !t.parents(".GUIMenu").size() ) {
          this.destroy();
        }
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Dialog -- Dialog-Window class
   * Used for Alert and Confirm messages etc.
   *
   * @extends Window
   * @class
   */
  var Dialog = Window.extend({

    /**
     * Dialog::init() -- Constructor
     * @see Window::init()
     * @constructor
     */
    init : function(type, message, cmd_close, cmd_ok, cmd_cancel) {
      this.cmd_close  = cmd_close  || function() {};
      this.cmd_ok     = cmd_ok     || function() {};
      this.cmd_cancel = cmd_cancel || function() {};

      this._super("Dialog", type);
      this._width    = 220;
      this._height   = 90;
      this._gravity  = "center";
      this._content  = message;
      this._is_ontop = true;

      switch ( type ) {
        case "info"       :
        case "error"      :
        case "confirm"    :
        case "question"   :
        case "warning"    :
          this._title    = OSjs.Labels.DialogTitles[type];
        break;

        default :
          if ( !this._title ) {
            this._title  = OSjs.Labels.DialogTitles["default"];
          }
        break;
      }
    },

    /**
     * Dialog::create() -- Create DOM elements etc
     * @see Window
     * @return $
     */
    create : function(id, mcallback) {
      var self = this;
      var el = this._super(id, mcallback);

      var dc = el.find(".DialogContent").css({
        "top" : "auto",
        "left" : "auto",
        "bottom" : "auto",
        "right" : "auto"
      }).addClass("Message");

      this._resize(dc.width() + 20, dc.height() + 50);
      this._gravitate();

      if ( this._is_dialog == "confirm" ) {
        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Ok").show();
        this.$element.find(".DialogButtons .Cancel").show();
      }

      this.$element.find(".DialogButtons .Close").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_close();
      });
      this.$element.find(".DialogButtons .Ok").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_ok();
      });
      this.$element.find(".DialogButtons .Cancel").click(function() {
        self.$element.find(".ActionClose").click();
        self.cmd_cancel();
      });

      // Translate
      var l = OSjs.Labels.DialogButtons;
      var c;
      for ( c in l ) {
        if ( l.hasOwnProperty(c) ) {
          this.$element.find("button ." + c).html(l[c]);
        }
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // OPERATION DIALOG
  /////////////////////////////////////////////////////////////////////////////

  /**
   * OperationDialog -- Misc Operation Dialogs Class
   * Basis for extended variant of dialogs with interactions.
   *
   * @extends Window
   * @class
   *
   */
  var OperationDialog = Window.extend({

    /**
     * OperationDialog::init() -- Constructor
     * @constructor
     */
    init : function(type) {
      this._super("OperationDialog", type);
      this._width          = 400;
      this._height         = 200;
      this._gravity        = "center";
      this._is_minimizable = true;
      this._skip_taskbar   = true;
    },

    /**
     * OperationDialog::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this._super();
    },

    /**
     * OperationDialog::create() -- Create DOM elements etc.
     * @see    Window::create()
     * @return void
     */
    create : function(id, mcallback) {
      this._super(id, mcallback);

      var self = this;
      this.$element.find(".DialogButtons .Close").click(function() {
        self.$element.find(".ActionClose").click();
      });
      this.$element.find(".DialogButtons .Ok").click(function() {
        self.$element.find(".ActionClose").click();
      });
      this.$element.find(".DialogButtons .Cancel").click(function() {
        self.$element.find(".ActionClose").click();
      });

      // Translate
      var l = OSjs.Labels.DialogButtons;
      var c;
      for ( c in l ) {
        if ( l.hasOwnProperty(c) ) {
          this.$element.find(".DialogButtons ." + c).html(l[c]);
        }
      }
    }

  }); // @endclass

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Run OS.js
   * @return bool
   * @function
   */
  OSjs.__Run = function() {
    if ( !OSjs.Compability.SUPPORT_LSTORAGE ) {
      alert(OSjs.Labels.CannotStart);
      return false;
    }

    console.log("================================ [ OS.js ] ================================");
    console.log("=                    Copyright (c) 2012 Anders Evenrud                    =");
    console.log("===========================================================================");

    _StartStamp = ((new Date()).getTime());
    _Core       = new Core();

    try {
      delete OSjs.__Run;
    } catch (e) {}

    return true;
  }; // @endfunction

  /**
   * Stop OS.js
   * @return bool
   * @function
   */
  OSjs.__Stop = function() {
    if ( _Running && _Core ) {
      _Core.destroy();
      _Core     = null;
      _Running  = false;

      try {
        delete OSjs.__Stop;
      } catch (e) {}

      try {
        delete OSjs;
      } catch (e) {}

      window.onbeforeunload = null; // NOTE: Required!
    }

    return true;
  }; // @endfunction

  /**
   * Leave OS.js
   * @param   DOMEvent  ev    Event
   * @return  bool
   * @function
   */
  OSjs.__Leave = function(ev) {
  }; // @endfunction

})($);
