/*!
 * OS.js - JavaScript Operating System - Core File
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
  var WINDOW_MIN_HEIGHT   = 128;
  var WINDOW_MIN_WIDTH    = 128;
  // @endconstants

  /**
   * @constants Local settings
   */
  var ANIMATION_SPEED        = 400;                 //!< Animation speed in ms
  var TEMP_COUNTER           = 1;                   //!< Internal temp. counter
  var NOTIFICATION_TIMEOUT   = 5000;                //!< Desktop notification timeout
  var MAX_PROCESSES          = 50;                  //!< Max processes running (except core procs)
  var WARN_STORAGE_SIZE      = (1024 * 4) * 1000;   //!< Warning localStorage size
  var MAX_STORAGE_SIZE       = (1024 * 5) * 1000;   //!< Max localstorage size
  var STORAGE_SIZE_FREQ      = 1000;                //!< Storage check usage frequenzy
  var ONLINECHK_FREQ         = 2500;                //!< On-line checking frequenzy
  var SESSION_CHECK          = 5000;                //!< Connection by session check freq
  var SESSION_KEY            = "PHPSESSID";         //!< The Server session cookie-key
  var TIMEOUT_CSS            = (1000 * 10);         //!< CSS loading timeout
  var DEFAULT_USERNAME       = "demo";              //!< Default User Username
  var DEFAULT_PASSWORD       = "demo";              //!< Default User Password
  var AUTOMATIC_LOGIN        = false;              //!< Wherever to turn on automatic login
  var SESSION_CONFIRM        = true;                //!< Wherever to turn on confirmation of session collision
  var ENV_CACHE              = undefined;           //!< Server-side cache enabled state
  var ENV_PRODUCTION         = undefined;           //!< Server-side production env. state
  var ENV_DEMO               = undefined;           //!< Server-side demo env. state
  var ENV_BUGREPORT          = false;               //!< Enable posting of errors (reporting, server-side mailing)
  var SAVE_APPREG            = false;               //!< Always store applicaion data in registry
  var STORAGE_ENABLE         = false;
  // @endconstants

  /**
   * @constants URIs
   */
  var WEBSOCKET_URI    = "localhost:8888";          //!< WebSocket URI (Dynamic)
  var ROOT_URL         = "http://osjs.local";       //!< URL: Dynamic content
  var STATIC_URL       = "http://osjs.local";       //!< URL: Static content
  var AJAX_URI         = "/";                       //!< AJAX URI (POST)
  var RESOURCE_URI     = "/VFS/resource/";          //!< Resource loading URI (GET)
  var THEME_URI        = "/VFS/theme/";             //!< Themes loading URI (GET)
  var FONT_URI         = "/VFS/font/";              //!< Font loading URI (GET)
  var CURSOR_URI       = "/VFS/cursor/";            //!< Cursor loading URI (GET)
  var LANGUAGE_URI     = "/VFS/language/";          //!< Language loading URI (GET)
  var UPLOAD_URI       = "/API/upload";             //!< File upload URI (POST)
  var ICON_URI         = "/UI/icon/%s/%s/%s";       //!< Icons URI (GET)
  var SOUND_URI        = "/UI/sound/%s/%s.%s";      //!< Sound URI (GET)
  var PKG_RES_URI      = RESOURCE_URI + "%s/%s";    //!< Package Resource URI (GET)
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

  /**
   * @constants Key Codes
   */
  var KEYCODES = {
    ctrl  : 17,
    alt   : 18,
    shift : 16,
    esc   : 27,
    tab   : 9,
    enter : 13,
    up    : 38,
    down  : 40
  };

  /////////////////////////////////////////////////////////////////////////////
  // PRIVATE VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Local references
   */
  var _Connection      = null;                            //!< Main Socket Connection instance (For standalone)
  var _Core            = null;                            //!< Core instance [dependency]
  var _Resources       = null;                            //!< ResourceManager instance [dependency]
  var _Settings        = null;                            //!< SettingsManager instance [dependency]
  var _WM              = null;                            //!< WindowManager instance [not required]
  var _Desktop         = null;                            //!< Desktop instance [not required]
  var _Window          = null;                            //!< Current Window instance [dynamic]
  var _PackMan         = null;                            //!< Current PackageManager instance [dynamic]
  var _Menu            = null;                            //!< Current Menu instance
  var _VFS             = null;                            //!< Current Storage (VFS) instance
  var _Processes       = [];                              //!< Process instance list
  var _TopIndex        = (ZINDEX_WINDOW + 1);             //!< OnTop z-index
  var _OnTopIndex      = (ZINDEX_WINDOW_ONTOP + 1);       //!< OnTop instances index
  var _StartStamp      = -1;                              //!< Starting timestamp
  var _SessionId       = "";                              //!< Server session id
  var _SessionValid    = true;                            //!< Session is valid
  var _HasCrashed      = false;                           //!< If system has crashed
  var _IsFullscreen    = false;                           //!< If we are in fullscreen mode
  var _OnLine          = true;                            //!< If we are on-line
  var _OldErrorHandler = undefined;                       //!< window.onerror backup reference

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


    if ( !_OnLine ) {
      callback({
        error     : OSjs.Labels.DoPostOffline,
        success   : false,
        result    : false
      });
      return;
    }

    if ( _HasCrashed || !_SessionValid ) {
      callback({
        error     : OSjs.Labels.DoPostInvalid,
        success   : false,
        result    : false
      });
      return;
    }

    var ajax_args = {'ajax' : true};
    var i;
    for ( i in args ) {
      if ( args.hasOwnProperty(i) ) {
        ajax_args[i] = args[i];
      }
    }

    // Callback wrapper
    var _callback = function(data) {
      callback(data);
      if ( data && data.error && data.exception ) {
        _HasCrashed = true;
      }
    };

    if ( _Connection ) {
      _Connection.call(ajax_args, function(data) {
        _callback(data);
      });
    } else {
      $.ajax({
        type      : "POST",
        url       : AJAX_URI,
        data      : ajax_args,
        success   : function(data) {
          _callback(data);
        },
        error     : function (xhr, ajaxOptions, thrownError){
          callback_error(xhr, ajaxOptions, thrownError);
        }
      });
    }

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

    if ( type == "error" ) {
      PlaySound("dialog-warning");
    } else {
      PlaySound("dialog-information");
    }

    if ( _WM ) {
      API.ui.dialog(type, msg, callback, misc);
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
   * @param   String    type      Package type
   * @return  bool
   * @function
   */
  function InitLaunch(name, type) {
    var i, msg, trace;

    // First check if avail
    var found = _PackMan.getPackage(name, "PanelItem");
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

    return found;
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
        application._kill();
      } catch ( eee ) {
        console.error(">>>>>>>>>>", "ooopsie", app_name, application);
      }

      PlaySound("dialog-warning");
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
      PlaySound("dialog-warning");
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

    var spl = str.split("::");
    spl.shift();
    if ( spl.length ) {
      var operation = spl[0];
      var error     = false;
      switch ( operation ) {
        case 'CompabilityDialog' :
          try {
            _WM.addWindow(new OSjs.Dialogs.CompabilityDialog(Window, API, args));
          } catch ( eee ) {
            console.error(eee);
          }
        break;

        case 'Launch' :
          if ( args && args.path && args.mime.match(/(.*)\/(.*)/) ) {
            API.system.run(args.path, args.mime);
          } else {
            error = true;
          }
        break;

        case 'Run' :
          if ( spl[1] ) {
            API.system.launch(spl[1], args);
          }
        break;

        default :
          error = true;
        break;
      }

      if ( error ) {
        MessageBox(sprintf(OSjs.Labels.ErrorLaunchString, operation));
      }
    }
  } // @endfunction

  /**
   * LaunchProcess() - Launch a process by name, type and args
   * @param   String    name      Package name
   * @param   String    type      Package type
   * @param   Object    args      Arguments to send
   * @param   Function  callback  Callback When launched/failed
   * @return  void
   * @function
   */
  function LaunchProcess(name, type, args, callback) {
    args = args || {};
    callback = callback || function() {};

    var process = InitLaunch(name, type);

    console.group("LaunchProcess()");
    console.log("Name", name);
    console.log("Type", type);
    console.log("Args", args);
    console.log("Found?", process);
    console.groupEnd();

    if ( !process ) {
      callback(false);
      return;
    }

    API.ui.cursor("wait");

    var resources = process.resources;
    _Resources.addResources(resources, name, function(error) {
      if ( !error ) {
        var obj;
        var crashed   = false;
        var runnable  = false;
        var ref       = OSjs.Packages[name];

        console.log("LaunchProcess()", name, ">", "Launching...");

        switch ( type ) {
          case "PanelItem" :
            try {
              var argv  = args.opts || [];
              var pref  = args.panel;
              var psave = args.save === undefined ? false : (args.save ? true : false);
              var pargs = { // We need only required parameters, make a slim-copy
                index     : args.index,
                name      : args.name,
                align     : args.align,
                position  : args.position
              };

              obj = new ref(PanelItem, pref, API, argv || {});
              pref.addItem(obj, pargs, psave);
            } catch ( ex ) {
              CrashApplication(name, obj, ex);
              obj = null;
              crashed = true;
            }
          break;

          case "Service"           :
          case "BackgroundService" :
            try {
              obj = new ref(BackgroundService, API, args.argv || {});
              runnable = true;
            } catch ( ex ) {
              CrashApplication(name, obj, ex);
              crashed = true;
            }
          break;

          default :
            if ( ref ) {
              try {
                obj = new ref(GtkWindow, Application, API, args.argv || {}, args.restore || []);
                obj._checkCompability();
                runnable = true;
              } catch ( ex ) {
                CrashApplication(name, obj, ex);
                crashed = true;
              }
            }
          break;
        }

        if ( !crashed ) {
          console.log("LaunchProcess()", name, ">", "Launched!");
          if ( runnable ) {
            setTimeout(function() {
              try {
                obj.run();
              } catch ( ex ) {
                CrashApplication(name, obj, ex);
              }
            }, 50);
          }
        }
      } else {
        console.log("LaunchProcess()", name, "<", "ERROR");

        var extra   = "\n\n" + OSjs.Labels.CrashProcessResource;
        var errors  = [];
        var eargs   = [];
        var x, a;
        for ( x in resources ) {
          errors.push(resources[x]);
        }

        if ( !errors.length ) {
          errors = ["<unknown>"];
        }

        for ( a in args ) {
          eargs.push(args[a]);
        }

        CrashApplication(name, {
          _name : name
        }, {
          message : sprintf(OSjs.Labels.CrashLaunchResourceMessage, errors.join(", ") + extra),
          stack   : sprintf(OSjs.Labels.CrashLaunchResourceStack, "LaunchProcess", name, eargs.join(", "))
        });
      }

      setTimeout(function() {
        callback(!error);
      }, 0);

      setTimeout(function() {
        API.ui.cursor("default");
      }, 50);

    });
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
      var apps        = _PackMan.getPackages(true);
      var found       = [];
      var list        = [];
      var inmime      = mime.split("/");
      var launched    = false;

      var i;

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
            if ( app.mimes && app.mimes.length ) {
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
            API.ui.dialog_launch({'mime' : mime, 'list' : list, 'on_apply' : function(mapp, set_default) {
              __run(mapp);
              if ( set_default ) {
                SetVFSObjectDefault(mapp, path, mime);
              }
            }});
          }
        } else {
          API.ui.dialog_launch({'list' : all_apps, 'on_apply' : function(mapp, set_default) {
            __run(mapp);
            if ( set_default ) {
              SetVFSObjectDefault(mapp, path, mime);
            }
          }, 'not_found' : true});
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
          iter._call("vfs", params);
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

    var apps  = API.user.settings.packages("16x16", true, false, false);
    var i, iter, cat;
    for ( i in apps ) {
      if ( apps.hasOwnProperty(i) ) {
        iter = apps[i];
        if ( (iter.type == "Application") ) {
          cat = cats[iter.category] ? iter.category : "unknown";
          cats[cat].items.push({
            "title"   : iter.label,
            "icon"    : GetIcon(iter.icon, "16x16", iter.packagename),
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
   * PlaySound() -- Play a specified sound
   * @return void
   */
  function PlaySound(type) {
    if ( !_Core || !_Core.running )
      return;

    var se = (_Settings._get("system.sounds.enable") === "true");
    var sv = parseInt(_Settings._get("system.sounds.volume"), 10);
    if ( sv < 0 ) {
      sv = 0;
    } else if ( sv > 100 ) {
      sv = 100;
    }

    if ( se && OSjs.Compability.SUPPORT_AUDIO ) {
      var src = null;
      var filetype = "oga";

      if ( !OSjs.Compability.SUPPORT_AUDIO_OGG && OSjs.Compability.SUPPORT_AUDIO_MP3 ) {
        filetype = "mp3";
      }

      switch ( type ) {
        default :
          src = type;
        break;
      }

      if ( src ) {
        var aud     = GetSound(src, filetype);
        aud.volume  = (sv / 100);
        aud.play();
      }
    }
  }

  /**
   * GetIcon() -- Get a icon by name/size/resource
   * @param   String    name      Icon name (filename)
   * @param   String    size      Icon size (Optional)
   * @param   String    pkg       Package Name (Optional)
   * @return  String
   * @function
   */
  function GetIcon(name, size, pkg) {
    if ( name.match(/^\//) ) {
      return name;
    } else {
      if ( pkg && !name.match(/(.*)\/(.*)/) ) {
        return sprintf(PKG_RES_URI, pkg, name);
      } else {
        var theme = "Default"; //_Settings._get("system.sounds.theme") || "Default";
        return sprintf(ICON_URI, theme, size, name);
      }
    }

    return null;
  }

  /**
   * GetSound() -- Get a Audio clip by name
   * @param   String    src       Sound Source Path
   * @param   String    filetype  Sound Type (Extension)
   * @param   Function  onerror   Error callback
   * @param   Function  onloaded  Loaded callback
   * @return  Audio
   * @function
   */
  function GetSound(src, filetype, onerror, onloaded) {
    var theme     = "Default"; //_Settings._get("system.sounds.theme") || "Default";
    var aud       = new Audio();

    if ( onerror ) {
      aud.onerror = onerror;
    }

    if ( onloaded ) {
      aud.addEventListener('canplaythrough', function(ev) {
        onloaded();
        aud.removeEventListener('canplaythrough', function(ev) {
          onloaded();
        }, false );
      }, false );
    }

    aud.preload   = "auto";
    aud.src       = sprintf(SOUND_URI, theme, src, filetype);
    return aud;
  }

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
    // API: INPUT
    //
    'input' : {
      'modkeys' : function() {
        return {
          'ctrl'  : KEY_CTRL,
          'shift' : KEY_SHIFT,
          'alt'   : KEY_ALT
        };
      }
    },

    //
    // API::UI
    //

    'ui' : {
      'getIcon' : function(name, size, pkg) {
        return GetIcon(name, size, pkg);
      },

      'getWindowSpace' : function() {
        if ( _WM ) {
          return _WM.getWindowSpace();
        }
        return false;
      },

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
        var clocked = false;

        return function(c, l) {
          if ( l !== undefined )
            clocked = l;
          if ( clocked === true )
            return;

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
      })(),

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
        console.log("Method", "API.ui.dialog");
        console.log("Type", type);
        console.groupEnd();

        return _WM.addWindow(new Dialog(type, message, cmd_close, cmd_ok, cmd_cancel));
      },

      'dialog_input' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_input");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.InputOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_rename' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_rename");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.RenameOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_upload' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_upload");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.UploadOperationDialog(OperationDialog, API, [UPLOAD_URI, args]));
      },

      'dialog_file' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_file");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FileOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_file_operation' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_file_operation");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.CopyOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_launch' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_launch");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.LaunchOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_color' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_color");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.ColorOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_font' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_font");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FontOperationDialog(OperationDialog, API, [args]));
      },

      'dialog_properties' : function(args) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return null;
        }

        console.group("=== API OPERATION ===");
        console.log("Method", "API.ui.dialog_properties");
        console.groupEnd();

        return _WM.addWindow(new OSjs.Dialogs.FilePropertyOperationDialog(OperationDialog, API, [args]));
      }


    },

    //
    // API::SYSTEM
    //

    'system' : {

      'storageUsage' : function() {
        return _Settings.getStorageUsage();
       },

      'getVFSStorage' : function() {
        return _VFS ? _VFS.getInstance() : null;
      },

      'language' : function() {
        return GetLanguage();
      },

      'languages' : function() {
        return GetLanguages();
      },

      'sound' : function(type) {
        return PlaySound(type);
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
          // Check for orphans
          var wins = _WM ? _WM.stack : [];
          var i = 0, l = wins.length, ref;
          for ( i; i < l; i++ ) {
            ref = wins[i];
            if ( ref.app && ref.app._name == app_name ) {
              if ( ref._is_orphan ) {
                console.group("=== API OPERATION ===");
                console.log("Method", "API.system.launch");
                console.log("Message", "Launch was denied (is_orphan)");
                console.groupEnd();

                _WM.focusWindow(ref);
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
          LaunchProcess(app_name, "Application", {"argv" : app_args, "restore" : windows});
        } else {
          LaunchString(app_name, app_args, windows);
        }
      },

      'call' : function(method, argv, callback, show_alert) {
        if ( _VFS ) {
          _VFS.op(method, argv, callback, show_alert);
          console.group("=== API OPERATION ===");
          console.log("Method", "API.system.call");
          console.log("Arguments", method, argv);
          console.groupEnd();
        }
      },

      'post' : function(args, callback) {
        DoPost(args, callback);
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
      },

      'default_application_menu' : function(ev, el) {
        return CreateDefaultApplicationMenu(ev, el);
      },

      'notification' : function(title, message, icon, duration) {
        if ( _Desktop ) {
          if ( !(icon.match(/^\//) || icon.match(/^(https?)/)) ) {
            icon = GetIcon(icon, "32x32");
          }

          _Desktop.createNotification(title, message, icon, duration);
        }
      }
    },

    //
    // API::USER
    //

    'user' : {
      'settings' : {
        'save' : function(settings, callback) {
          _Settings._apply(settings, callback);

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

        'user_admin' : function(argv, callback) {
          callback = callback || function() {};
          argv = argv || {};
          argv.action = "user";

          DoPost(argv, function(data) {
            if ( data.success ) {
              callback(true, data.result);
            } else {
              callback(false, data.error);
            }
          });
        },

        'package_uninstall' : function(p, callback, reterror) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_uninstall");
          console.log("Arguments", p, reterror);
          console.groupEnd();

          _PackMan.uninstall(p, callback, reterror);
        },
        'package_install' : function(p, callback, reterror) {
          callback = callback || function() {};

          console.group("=== API OPERATION ===");
          console.log("Method", "API.user.settings.package_install");
          console.log("Arguments", p, reterror);
          console.groupEnd();

          _PackMan.install(p, callback, reterror);
        },

        'packages' : function(icons, apps, pitems, sitems) {
          return _PackMan.getUserPackages(icons, apps, pitems, sitems);
        }
      },

      'logout' : function(save) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.user.logout");
        console.groupEnd();

        return _Core.shutdown(save);
      }
    },

    //
    // API::SESSION
    //

    'session' : {

      'snapshot_create' : function(name, callback) {
        callback = callback || function() {};

        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_create", name);
        console.groupEnd();

        if ( name ) {
          var data = JSON.stringify({
            "session"   : _Core.getSession(),
            "registry"  : _Settings.getRegistry()
          });

          DoPost({'action' : 'snapshotSave', 'session' : {'name' : name, 'data' : data}}, function(result) {
            callback(result);
          });
        }
      },

      'snapshot_restore' : function(name, callback) {
        callback = callback || function() {};

        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_restore", name);
        console.groupEnd();

        if ( name ) {
          DoPost({'action' : 'snapshotLoad', 'session' : {'name' : name}}, function(result) {
            callback(result);
          });
        }
      },

      'snapshot_delete' : function(name, callback) {
        callback = callback || function() {};

        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_delete", name);
        console.groupEnd();

        if ( name ) {
          DoPost({'action' : 'snapshotDelete', 'session' : {'name' : name}}, function(result) {
            callback(result);
          });
        }
      },

      'snapshot_list' : function(callback) {
        callback = callback || function() {};

        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.snapshot_list");
        console.groupEnd();

        DoPost({'action' : 'snapshotList'}, function(result) {
          callback(result);
        });
      },

      'shutdown' : function(save) {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.shutdown");
        console.groupEnd();

        return _Core.shutdown(save);
      },

      'restart' : function() {
        console.group("=== API OPERATION ===");
        console.log("Method", "API.session.restart");
        console.groupEnd();

        DoPost({'action' : 'logout'}, function(data) {
          if ( data.success ) {
            __CoreReboot__();
          }
        });
      },

      /*
      'getProcess' : function(pid) {
        return _Core.getProcess(pid, false);
      },
      */

      'processes' : function() {
        return _Core.getProcesses();
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

    ___pid        : -1,                     //!< Process ID
    ___started    : null,                   //!< Process started date
    ___proc_name  : "(unknown)",            //!< Process name identifier
    ___proc_icon  : "mimetypes/exec.png",   //!< Process icon
    ___locked     : false,

    /**
     * Process::init() -- Constructor
     * @param   String    name          Process Name
     * @param   String    icon          Process Icon
     * @param   bool      locked        Not stoppable by user
     * @constructor
     */
    init : function(name, icon, locked) {
      console.group("Process::init()");

      this.___pid       = (_Processes.push(this) - 1);
      this.___proc_name = (name !== undefined && name)  ? name    : "(unknown)";
      this.___proc_icon = (icon !== undefined && icon)  ? icon    : "mimetypes/exec.png";
      this.___locked    = (locked !== undefined)        ? locked  : false;
      this.___started   = new Date();

      console.log("PID", this.___pid, this.___proc_name, this.___locked);
      console.groupEnd();
    },

    /**
     * Process::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      console.group("Process::destroy()");

      if ( this.___pid >= 0 ) {
        _Processes[this.___pid] = undefined;
      }

      this.___started = null;

      console.groupEnd();
    },

    /**
     * Process::_kill() -- Kill process
     * @return bool
     */
    _kill : function() {
      if ( !this.___locked ) {
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
      this._name    = name                  || "Unknown";
      this._type    = parseInt(type, 10)    || SERVICE_GET;
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
      console.log("Recieved", data);

      var js = null;
      var err = null;
      try {
        var tmp = data.substr(0, 1);
        if ( tmp !== "{" ) {
          data = data.substr(1, data.length);
        }
        js = JSON.parse(data);
      } catch ( e ) {
        err = e;
      } // FIXME

      console.log("Data", js);
      console.groupEnd();

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
        throw ("Cannot create WebWorker: " + OSjs.Labels.CompabilityErrors.worker);
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
  // LOGIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * LoginManager -- Login Manager
   * @class
   */
  var LoginManager = {

    confirmation : null, // set in show()

    /**
     * LoginManager::disableInputs() -- Disable Input Buttons
     * @return void
     */
    disableInputs : function() {
      $("#LoginButton").attr("disabled", "disabled");
      $("#CreateLoginButton").attr("disabled", "disabled");
      $("#LoginUsername").attr("disabled", "disabled").addClass("loading");
      $("#LoginPassword").attr("disabled", "disabled").addClass("loading");
    },

    /**
     * LoginManager::enableInputs() -- Enable Input Buttons
     * @return void
     */
    enableInputs : function() {
      $("#LoginButton").removeAttr("disabled");
      $("#CreateLoginButton").removeAttr("disabled");
      $("#LoginUsername").removeAttr("disabled").removeClass("loading");
      $("#LoginPassword").removeAttr("disabled").removeClass("loading");
    },

    /**
     * LoginManager::handleLogin() -- Handle a login POST result
     * @return void
     */
    handleLogin : function(response, dcallback) {
      dcallback = dcallback || function() {};

      if ( response.duplicate ) {
        var con = !LoginManager.confirmation || confirm(OSjs.Labels.LoginConfirm);
        if ( con ) {
          _Core.login(response);
        } else {
          dcallback();
        }
      } else {
        _Core.login(response);
      }
    },

    /**
     * LoginManager::postLogin() -- POST a login form
     * @return void
     */
    postLogin : function(form, create) {
      LoginManager.disableInputs();

      console.group("Core::_login()");
      console.log("Login data:", form);
      console.log("Create login:", create);
      console.groupEnd();

      DoPost({'action' : 'login', 'form' : form, 'create' : create}, function(data) {
        console.log("Login success:", data.success);
        console.log("Login result:", data.result);

        if ( data.success ) {
          $("#LoginForm").get(0).onsubmit = null;
          LoginManager.handleLogin(data.result, function() {
            LoginManager.enableInputs();
          });
        } else {
          LoginManager.enableInputs();
          if ( create ) {
            MessageBox(sprintf(OSjs.Labels.CreateLoginFailure, data.error));
          } else {
            MessageBox(sprintf(OSjs.Labels.LoginFailure, data.error));
          }
        }

      }, function() {
        if ( create ) {
          MessageBox(OSjs.Labels.CreateLoginFailureOther);
        } else {
          MessageBox(OSjs.Labels.LoginFailureOther);
        }
        LoginManager.enableInputs();
      });
    },

    /**
     * LoginManager::run() -- Init the Login
     * @return void
     */
    run : function(username, password, auto, confirmation) {
      LoginManager.confirmation = confirmation;

      $("#LoginWindow").show();

      $("#LoginButton").click(function() {
        LoginManager.postLogin({
          "username" : $("#LoginUsername").val(),
          "password" : $("#LoginPassword").val()
        }, false);
      });
      $("#CreateLoginButton").click(function() {
        LoginManager.postLogin({
          "username" : $("#LoginUsername").val(),
          "password" : $("#LoginPassword").val()
        }, true);
      });

      $("#LoginUsername").keydown(function(ev) {
        var key = ev.keyCode || ev.which;
        if ( key == KEYCODES.enter ) {
          $("#LoginPassword").focus();
          ev.preventDefault();
          ev.stopPropagation();
        }
      });

      $("#LoginPassword").keydown(function(ev) {
        var key = ev.keyCode || ev.which;
        if ( key == KEYCODES.enter ) {
          $("#LoginButton").click();
          ev.preventDefault();
          ev.stopPropagation();
        }
      });

      LoginManager.enableInputs();

      $("#LoginUsername").val(username);
      $("#LoginPassword").val(password);
      $("#LoginUsername").focus();

      if ( auto ) {
        $("#LoginButton").click();
        $("#LoginButton").attr("disabled", "disabled");
      }
    },

    /**
     * LoginManager::hide() -- Hide and destroy login window
     * @return void
     */
    hide : function() {
      $("#LoginWindow").fadeOut(ANIMATION_SPEED, function() {
        $("#LoginWindow").remove();
      });
    }

  };

  /////////////////////////////////////////////////////////////////////////////
  // CORE
  /////////////////////////////////////////////////////////////////////////////

  /**
   * CoreVFS -- Core VFS Storage Instance
   *
   * Handles API VFS calls for Browser and Server
   * files.
   *
   * @extends Process
   * @see     VFS
   * @class
   */
  var CoreVFS = Process.extend({
    _s        : null,     //!< Storage instance
    _running  : false,    //!< If VFS is up and running

    /**
     * CoreVFS::init() -- Constructor
     * @constructor
     */
    init : function() {
      this._super("(CoreVFS)", "devices/gtk-floppy.png", true);
    },

    /**
     * CoreVFS::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this._s ) {
        this._s.destroy();
        this._s = null;
      }

      this._super();

      /*
      // >>> REMOVE GLOBAL <<<
      if ( _VFS )
        _VFS = null;
        */
    },

    /**
     * CoreVFS::run() -- Set up and start
     * @param   Function    callback      Callback function to run when done
     * @return  void
     */
    run : function(callback) {
      if ( STORAGE_ENABLE && OSjs.Compability.SUPPORT_FS ) {
        try {
          var self = this;
          this._s = new OSjs.Classes.VFSPersistent(function() {
            callback();
            self._running = true;
          });
        } catch ( ex ) {
          console.error("CoreVFS::init()", ex);
          if ( !self._running )
            callback();
        }
      } else {
        callback();
      }
    },

    /**
     * CoreVFS::op() -- Do a operation
     * @param   String        method        Method name
     * @param   Mixed         argv          Argument(s)
     * @param   Function      callback      Callback function
     * @param   bool          show_alert    Show internal alert?
     * @return  Mixed
     */
    op : function(method, argv, callback, show_alert) {
      var self  = this;
      var rpath = null;
      var re    = /^\/User\/WebStorage/;
      if ( typeof argv === "object" ) {
        rpath = !!(argv.path && argv.path.match(re));
      } else if ( typeof argv === "string" ) {
        rpath = !!(argv && argv.match(re));
      }

      if ( rpath ) {
        switch ( method ) {
          case "read"  :
          case "touch" :
          case "mkdir" :
          case "rm"    :
          case "cat"   :
            if ( method == "cat" )
              method = "read";
            if ( method == "delete" )
              method = "rm";

            return this.call(method, [argv.replace(re, ""), function(result) {
              callback(result, null);
            }, function() {
              callback(null, true); // FIXME
            }]);
          break;

          case "write" :
            return this.call(method, [argv.path.replace(re, ""), argv.content, function(result) {
              callback(result, null);
            }, function() {
              callback(null, true); // FIXME
            }]);
          break;

          case "lswrap"  :
          case "readdir" :
          case "ls" :
            var __createFileIter = function(i) {
              return {
                "icon"       : i.icon       || "mimetypes/binary.png",
                "path"       : i.path       || "/",
                "size"       : i.size       || 0,
                "hsize"      : i.hsize      || "0b",
                "type"       : i.type       || "file",
                "protected"  : i['protected'] === undefined ? 0 : i['protected'],
                "name"       : escapeHtml(i.name       || "."),
                "mime"       : escapeHtml(i.mime       || "")
              };
            };


            return this.call("ls", [argv.path.replace(re, ""), function(result) {
              if ( !result || !result.length )
                result = [];

              var iter  = __createFileIter({"path" : "/User", "type" : "dir", "name" : "..", "icon" : "status/folder-visiting.png", "protected" : 1});
              var list  = [iter];
              var i = 0, l = result.length, it;
              for ( i; i < l; i++ ) {
                it        = result[i];
                iter      = __createFileIter({
                  "icon"       : (it.isDirectory ? "places/folder.png" : "mimetypes/binary.png"),
                  "path"       : argv.path + it.fullPath,
                  "type"       : (it.isDirectory ? "dir" : "file"),
                  "name"       : basename(it.fullPath),
                  "mime"       : "text/plain"
                });
                list.push(iter);
              }


              if ( method == "lswrap" ) {
                var data = {
                  'path'  : argv.path,
                  'total' : list.length,
                  'bytes' : 0,
                  'items' : list
                };
                callback(data, null);
              } else {
                callback(list, null);
              }

            }, function() {
              callback(null, true); // FIXME
            }]);
          break;

          default:
            callback(false, "Not implemented in VFS yet!");
            return false;
          break;
        }
      }

      return this.ajax.apply(this, arguments);
    },

    /**
     * CoreVFS::call() -- Call a storage function on client
     * @return  Mixed
     */
    call : function(m, args) {
      if ( this._running ) {
        this._s[m].apply(this._s, args);
        return true;
      }

      if ( m == "ls" ) {
        args[1]([]);
      }

      return false;
    },

    /**
     * CoreStorate::ajax() -- Call a storage function on server
     * @return  null
     */
    ajax : function(method, argv, callback, show_alert) {
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

      return null;
    },

    /**
     * CoreVFS::getInstance() -- Get the current storage instance
     * @return  VFS
     */
    getInstance : function() {
      return this._s;
    }
  });

  /**
   * CoreConnection -- Core Connection Process
   *
   * @extends Socket
   * @class
   */
  var CoreConnection = Socket.extend({

    _connected : false,   //!< Connection state
    _callbacks : {},      //!< Callbacks

    /**
     * CoreConnection::init() -- Initialize Main Socket
     * @constructor
     */
    init : function(callback) {
      callback = callback || function() {};

      this._super("(CorePlatformConnection)");

      var self = this;
      this.on_message = function(ev, js) {
        if ( self._connected ) {
          self._handle(js);
        }
      };
      this.on_close = function(ev) {
        if ( !self._connected ) {
          callback(false);
        }
        self._connected = false;
      };
      this.on_open = function(ev) {
        if ( !self._connected ) {
          callback(true);
        }

        self._connected = true;
      };

      this.connect();
    },

    /**
     * CoreConnection::call() -- Call a backend Platfor Method
     * @param   Mixed     data        Data
     * @return  void
     */
    call : function(data) {
      if ( this._connected ) {
        var s = null;
        try {
          s = JSON.stringify(data);
        } catch ( e ) {
          s = "" + data;
        }

        console.log("CoreConnection::call()", s);

        this.send(s);
      }
    },

    /**
     * CoreConnection::_handle() -- Handle a message recieved
     * @param   JSON      j         Data
     * @return  void
     */
    _handle : function(j) {
      console.log("CoreConnection::_handle()", j);
      if ( data.id !== undefined && data.data !== undefined ) {
        if ( this._callbacks[data.id] ) {
          this._callbacks[data.id](data.data);

          var self = this;
          setTimeout(function() {
            try {
              self._callbacks[data.id] = null;
              delete self._callbacks[data.id];
            } catch ( eee ) {}
          }, 0);
        }
      }
    }
  }); // @endclass

  /**
   * Core -- Main Process
   *
   * @extends Process
   * @class
   */
  var Core = Process.extend({

    running     : false,        //!< If core is running
    olint       : null,         //!< On-line checker interval
    cuint       : null,         //!< Cache update interval
    sclint      : null,         //!< Cache  interval

    /**
     * Core::init() -- Constructor
     * @constructor
     */
    init : function() {
      var self = this;

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
      var self = this;
      console.group("Core::destroy()");

      // Unbind global events
      if ( this.running ) {
        console.log("Unbinding events...");

        $(window).unbind("focus",                       this.global_focus);
        $(window).unbind("blur",                        this.global_blur);
        //$(window).unbind("offline",                   this.global_offline);
        $(document).unbind("keydown",                 this.global_keydown);
        //$(document).unbind("keypress",                this.global_keypress);
        $(document).unbind("keyup",                   this.global_keyup);
        $(document).unbind("mousedown",               this.global_mousedown);
        $(document).unbind("mouseup",                 this.global_mouseup);
        $(document).unbind("mousemove",               this.global_mousemove);
        $(document).unbind("click",                   this.global_click);
        $(document).unbind("dblclick",                this.global_dblclick);
        $(document).unbind("contextmenu",             this.global_contextmenu);
        //$(document).unbind("fullscreenchange",        this.global_fullscreen);
        //$(document).unbind("mozfullscreenchange",     this.global_fullscreen);
        //$(document).unbind("webkitfullscreenchange",  this.global_fullscreen);

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

      console.group("Shutting down 'PackageManager'");
      if ( _PackMan ) {
        _PackMan.destroy();
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

      if ( _Connection ) {
        console.group("Shutting down 'CorePlatformConnection'");
        try {
          _Connection.destroy();
        } catch ( eee ) {}
        console.groupEnd();
      }

      if ( _VFS ) {
        console.group("Shutting down 'CoreVFS'");
        try {
          _VFS.destroy();
        } catch ( eee ) {}
        console.groupEnd();
      }

      console.log("Nulling instance...");

      _Connection = null;
      _Core       = null;
      _Resources  = null;
      _Settings   = null;
      _Desktop    = null;
      _WM         = null;
      _Window     = null;
      _PackMan    = null;
      _Menu       = null;
      _VFS        = null;
      _Processes  = [];
      _TopIndex   = 11;

      // Try to remove remaining events
      console.log("Unbinding remaining...");
      try {
        $("*").unbind();
        $("*").die();
      } catch ( eee ) { }

      // Unbind the current eventhandler
      window.onerror = _OldErrorHandler;

      console.groupEnd();

      this._super();
    },

    /**
     * Core::boot() -- Main booting procedure
     *
     * Sends browser information to the backend. The response
     * is the base configuration. After environment is set-up
     * the LoginManager is run.
     *
     * @return void
     */
    boot : function() {
      var self = this;
      if ( this.running ) {
        return;
      }


      var login = function(alogin) {
        if ( alogin.enable ) {
          LoginManager.run(alogin.username, alogin.password, true, alogin.confirmation);
        } else {
          LoginManager.run("", "", false, true);
        }
      };

      DoPost({'action' : 'boot', 'navigator' : OSjs.Navigator, 'compability' : OSjs.Compability}, function(response) {
        var data    = response.result;
        var env     = data.environment;
        var alogin  = env.autologin;

        ENV_BUGREPORT   = env.bugreporting;
        ENV_CACHE       = env.cache;
        ENV_PRODUCTION  = env.production;
        ENV_DEMO        = env.demo;

        WEBSOCKET_URI   = env.hosts.server;
        ROOT_URL        = (env.ssl ? "https://" : "http://") + env.hosts.frontend;  // FIXME: https
        STATIC_URL      = (env.ssl ? "https://" : "http://") + env.hosts['static']; // FIXME: https

        /*
        ICON_URI        = STATIC_URL + ICON_URI;
        SOUND_URI       = STATIC_URL + SOUND_URI;
        THEME_URI       = STATIC_URL + THEME_URI;
        FONT_URI        = STATIC_URL + FONT_URI;
        CURSOR_URI      = STATIC_URL + CURSOR_URI;
        LANGUAGE_URI    = STATIC_URL + LANGUAGE_URI;
        */

        /*
        RESOURCE_URI    = STATIC_URL + RESOURCE_URI;
        PKG_RES_URI     = STATIC_URL + PKG_RES_URI;
        */

        if ( env.connection ) {
          _Connection = new CoreConnection(function(result) {
            if ( result ) {
              login(alogin);
            } else {
              alert("Failed to establish socket!"); // FIXME: Locale
            }
          });
        } else {
          login(alogin);
        }
      }, function(xhr, ajaxOptions, thrownError) {
        alert("A network error occured while booting OS.js: " + thrownError);
        throw("Initialization error: " + thrownError);
      });
    },

    /**
     * Core::login() -- Main login procedure
     *
     * This function is called after the backend has sucessfully
     * registered the user into session. The response is the
     * session data tree.
     *
     * All base instances are created and initialized here.
     *
     * @param  Object   response      Response from LoginManager
     * @see LoginManager
     * @return void
     */
    login : function(response) {
      var self = this;
      if ( this.running ) {
        return;
      }

      $("#LoginDemoNotice").hide();
      $("#LoadingBarContainer").show();

      // Globals
      _SessionId        = response.sid;
      _BrowserLanguage  = response.lang_browser;
      _SystemLanguage   = response.lang_user;

      // Initialize base classes
      _Settings   = new SettingsManager(response.registry.tree);
      _Resources  = new ResourceManager();
      _PackMan    = new PackageManager();
      _VFS        = new CoreVFS();

      OSjs.Classes.ProgressBar($("#LoadingBar"), 10);

      // Now fire them up
      _VFS.run(function() {
        _Settings.run(response.registry.stored);
        _PackMan.run(response.packages);
        _Resources.run(response.preload, function() {
          self.run(response.session);
        });
      });
    },

    /**
     * Core::shutdown() -- Main shutdown procedure
     *
     * Logs out the user and kills all running processes.
     *
     * @param  bool  save    Save session ?
     * @see    Core::destroy()
     * @return void
     */
    shutdown : function(save) {
      var usession  = JSON.stringify(save ? _Core.getSession() : {});
      var duration  = ((new Date()).getTime()) - _StartStamp;

      console.group("Core::shutdown()");
      console.log("Session duration", duration);
      console.groupEnd();

      var _shutdown = function() {
        DoPost({'action' : 'shutdown', 'session' : usession, 'duration' : duration, 'save' : save}, function(data) {
          if ( data.success ) {
            console.log("Core::shutdown()", "Shutting down...");

            PlaySound("service-logout");

            __CoreShutdown__();
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
     * NOTE: 'this' is not instance here!
     * @return void
     */
    leaving : function(ev) {
      ev = ev || window.event;

      if ( _Core.running ) {
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
     * Core::run() -- Main startup procedure wrapper
     *
     * This function is called when all base instances are running,
     * resources fully loaded and the used has logged in.
     * The session is from the login response.
     *
     * @param  Object   session       Session to restore (if any)
     * @see    Core::login()
     * @return void
     */
    run : function(session) {
      if ( this.running ) {
        return;
      }
      var self = this;

      API.ui.cursor("wait", true);

      // Bind global events
      $(window).bind("focus",         this.global_focus);
      $(window).bind("blur",          this.global_blur);
      $(window).bind("beforeunload",  this.leaving);
      //$(window).bind("offline",       this.global_offline);
      $(document).bind("keydown",     this.global_keydown);
      //$(document).bind("keypress",    this.global_keypress);
      $(document).bind("keyup",       this.global_keyup);
      $(document).bind("mousedown",   this.global_mousedown);
      $(document).bind("mouseup",     this.global_mouseup);
      $(document).bind("mousemove",   this.global_mousemove);
      $(document).bind("click",       this.global_click);
      $(document).bind("dblclick",    this.global_dblclick);
      $(document).bind("contextmenu", this.global_contextmenu);
      //$(document).bind("fullscreenchange",        this.global_fullscreen);
      //$(document).bind("mozfullscreenchange",     this.global_fullscreen);
      //$(document).bind("webkitfullscreenchange",  this.global_fullscreen);

      this.olint = setInterval(function(ev) {
        self.global_offline(ev, !(navigator.onLine === false));
      }, ONLINECHK_FREQ);
      this.sclint = setInterval(function(ev) {
        self.global_endsession(ev, GetCookie(SESSION_KEY));
      }, SESSION_CHECK);

      OSjs.Classes.ProgressBar($("#LoadingBar"), 50);

      // Initialize session
      this._initializeWindowManager(function() {
        OSjs.Classes.ProgressBar($("#LoadingBar"), 60);
      });

      this._initializeDesktop(function() {
        if ( self.running )
          return;
        self.running = true;

        OSjs.Classes.ProgressBar($("#LoadingBar"), 80);

        // NOTE: Fixes global_keydown "not responding upon init" issues
        $(document).focus();

        // New error handler
        _OldErrorHandler  = window.onerror;
        window.onerror    = self.global_error;

        PlaySound("service-login");
        API.ui.cursor("default", false);

        self._initializeSession(session);

        OSjs.Classes.ProgressBar($("#LoadingBar"), 100);

        setTimeout(function() {
          LoginManager.hide();
        }, 50);
      });
    },

    //
    // SESSIONS
    //

    /**
     * Core::_initializeWindowManager() -- Initialize Window Manager
     * @return void
     */
    _initializeWindowManager : function(callback) {
      _WM = new WindowManager();
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

      callback();
    },

    /**
     * Core::_initializeDesktop() -- Initialize Desktop
     * @return void
     */
    _initializeDesktop : function(callback) {
      _Desktop = new Desktop();

      try {
        _Desktop.run(callback);
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

        callback();
      }
    },

    /**
     * Core::_initializeSession() -- Initialize User Session
     * @return void
     */
    _initializeSession : function(session) {
      // Run user-defined processes
      var autostarters = _Settings._get("user.autorun", true);
      if ( autostarters ) {
        var ai = 0, al = autostarters.length;
        for ( ai; ai < al; ai++ ) {
          LaunchProcess(autostarters[ai], "BackgroundService");
        }
      }

      // Restore Previous Session
      if ( _Settings._get("user.session.autorestore") === "true" ) {
        _Core.setSession(session);
      }

      // Show compability dialog on first run
      if ( _Settings._get("user.first-run") === "true" ) {
        LaunchString("API::CompabilityDialog");
        _Settings._set("user.first-run", "false");

        if ( ENV_DEMO ) {
          setTimeout(function() {
            var _l = OSjs.Labels.FirstRun;
            var _i = GetIcon("emotes/face-smile-big.png", "32x32");
            API.application.notification(_l.title, _l.message, _i);

          }, 500);
        }
      }
    },


    //
    // EVENTS
    //

    /**
     * Core::global_error() -- The Window error handler. Overrides default browser handler
     * @param   String    msg     Exception Message
     * @param   String    url     Exception URL
     * @param   int       lno     Exception Line Number
     * @return  bool
     */
    global_error : function(msg, url, lno) {
      url = url || window.location.href;
      var title = msg.split(":", 1).shift();

      CrashCustom("_" + title, msg, sprintf("in %s on line %d", url, lno));

      if ( ENV_BUGREPORT ) {
        try {
          DoPost({
            'action' : 'bug',
            'data'   : {
              'browser' : OSjs.Navigator
            },
            'error'  : {
              'message' : msg,
              'url'     : url,
              'line'    : lno
            }
          });
        } catch (eee) {}
      }
      return false; // Bubble down
    },

    /**
     * Core::global_endsession() -- The Browser 'session cache clear' event handler
     * @param   DOMEvent    ev      DOM Event
     * @param   bool        state   If we went off-line
     * @return  void
     */
    global_endsession : function(ev, sid) {
      //console.info("Session valid", _SessionValid, "Registered", _SessionId, "Current", sid);
      if ( !_Connection ) {
        if ( _SessionValid ) {
          if ( !sid || (_SessionId != sid) ) {
            var ico = GetIcon("status/network-error.png", "32x32");
            var title = OSjs.Labels.GlobalOfflineTitle;
            var msg = OSjs.Labels.GlobalOfflineMessage;
            API.application.notification(title, msg, ico);

            _SessionValid = false;
          }
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
        if ( _OnLine ) {
          _OnLine = false;
          API.application.notification(OSjs.Labels.GlobalOfflineWarningTitle, OSjs.Labels.WentOffline);

          console.log("Core::global_offline()", _OnLine);
        }
      } else { // Online
        if ( !_OnLine ) {
          _OnLine = true;
          API.application.notification(OSjs.Labels.GlobalOfflineInfoTitle, OSjs.Labels.WentOnline);

          console.log("Core::global_offline()", _OnLine);
        }
      }
    },

    /**
     * Core::global_focus() -- When browser gets focus
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_focus : function(ev) {
      KEY_ALT = KEY_SHIFT = KEY_CTRL = false;
    },

    /**
     * Core::global_blur() -- When browser gets blurred
     * @param   DOMEvent    ev      DOM Event
     * @return  void
     */
    global_blur : function(ev) {
      KEY_ALT = KEY_SHIFT = KEY_CTRL = false;
    },

    /**
     * Core::global_keyup() -- Global Event Handler: keyup
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
     */
    global_keyup : function(ev) {
      var key = ev.keyCode || ev.which;

      if ( key == KEYCODES.ctrl ) {
        KEY_CTRL = false;
      } else if ( key == KEYCODES.alt ) {
        KEY_ALT = false;
        if ( _WM ) {
          _WM.toggleWindow(false);
        }
        ret = false;
      } else if ( key == KEYCODES.shift ) {
        KEY_SHIFT = false;
      }

      return true;
    },

    /**
     * Core::global_keypress() -- Global Event Handler: keypress
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
    global_keypress : function(ev) {
      return true;
    },
     */

    /**
     * Core::global_keydown() -- Global Event Handler: keydown
     * @param   DOMEvent    ev      DOM Event
     * @return  bool
     */
    global_keydown : function(ev) {
      var key     = ev.keyCode || ev.which;
      var target  = ev.target  || ev.srcElement;
      var ret     = true;

      if ( key == KEYCODES.ctrl ) {
        KEY_CTRL = true;
      } else if ( key == KEYCODES.alt ) {
        KEY_ALT = true;
        ret = false;
      } else if ( key == KEYCODES.shift ) {
        KEY_SHIFT = true;
      }

      // Pager
      if ( KEY_ALT && KEY_SHIFT ) {
        if ( _WM ) {
          ev.preventDefault();
          ev.stopPropagation();
          _WM.toggleWindow();
          return false;
        }
      }

      // Menus
      if ( _Menu ) {
        if ( KEY_CTRL || KEY_ALT || KEY_SHIFT || (key == KEYCODES.esc) ) {
          $(document).click(); // TRIGGER GLOBAL CONTEXTMENU
        }

        // Navigation
        if ( key == KEYCODES.up ) {
          return _Menu.handleGlobalKey(ev, "up");
        } else if ( key == KEYCODES.down ) {
          return _Menu.handleGlobalKey(ev, "down");
        } else if ( key == KEYCODES.enter ) {
          return _Menu.handleGlobalKey(ev, "enter");
        }
      }

      // Windows
      if ( _Window && _Window._showing ) {
        if ( (key == KEYCODES.esc) ) {
          // Close dialogs
          if ( _Window._is_dialog ) {
            _Window.$element.find(".ActionClose").click();
            return false;
          }
        } else if ( KEY_ALT ) {
          // Menu hints
          var k = String.fromCharCode(key).toUpperCase();
          var h = _Window._getKeyboardBinding(k);
          if ( h ) {
            ev.preventDefault();
            ev.stopPropagation();
            try {
              h.click();
              return false;
            } catch ( eee ) {
            }
          }
        } else {
          // All other keys
          if ( _Window._handleGlobalKey(ev, key) ) {
            return false;
          }
        }
      }

      if ( target ) {
        // TAB key only in textareas
        if ( key === KEYCODES.tab ) {
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


      return ret;
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
    },

    /**
     * Core::global_dblclick() -- Global Event Handler: dblclick
     * @param   DOMEvent    ev      DKM Event
     * @return  void
     */
    global_dblclick : function(ev) {
    },

    /**
     * Core::global_mousedown() -- Global Event Handler: mousedown
     * @param   DOMEvent    ev      DKM Event
     * @return  bool
     */
    global_mousedown : function(ev) {
      var t = ev.target || ev.srcElement;
      if ( t && t.tagName ) {
        var tmp = $(t);
        if ( !(tmp.attr("draggable") === "true" || tmp.closest("*[draggable=true]", tmp).length) && !tmp.hasClass("GtkTextView") && !tmp.hasClass("textarea") && !tmp.parents(".textarea").length ) {
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
      var t = e.target || e.srcElement;
      if ( $(e.target).hasClass("ContextMenu") || $(e.target).hasClass("Menu") || $(e.target).parent().hasClass("ContextMenu") || $(e.target).parent().hasClass("Menu") ) {
        return false;
      }

      if ( e.target.id === "Desktop" || e.target.id === "Panel" || e.target.id === "ContextMenu" ) {
        return false;
      }
      return true;
    },

    /**
     * Core::global_fullscreen() -- Global Event Handler: fullscreen
     * @param   DOMEvent    e       DOM Event
     * @return void
     */
    /*
    global_fullscreen : function(e) {
      if ( "fullscreen" in document ) {
        _IsFullscreen = document.fullscreen ? true : false;
      } else if ( "mozFullScreen" in document ) {
        _IsFullscreen = document.mozFullScreen ? true : false;
      } else if ( "webkitIsFullScreen" in document ) {
        _IsFullscreen = document.webkitIsFullScreen ? true : false;
      }

      console.log("Core::global_fullscreen()", e, _IsFullscreen);
    },
     */

    // GETTERS / SETTERS

    /**
     * Core::getProcess() -- Get a running process by id
     * @param  int      pid       Process ID
     * @param  bool     root      Give access to "locked" processes ?
     * @return Process
     */
    getProcess : function(pid, root) {
      pid = parseInt(pid, 10) || 0;
      if ( (pid >= 0) && _Processes[pid] ) {
        if ( root || !(_Processes[pid].___locked) ) {
          return _Processes[pid];
        }
      }
      return null;
    },

    /**
     * Core::getProcesses() -- Get all running processes
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
                return pp._kill();
              };
            })(p);

            procs.push({
              'pid'     : p.___pid,
              'name'    : p._name,
              'time'    : (now - p.___started.getTime()),
              'icon'    : p.___proc_icon,
              'title'   : p.___proc_name,
              'locked'  : p.___locked,
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
    setSession : function(session) {
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
          var _i = GetIcon("status/appointment-soon.png", "32x32");
          API.application.notification(_l.title, _l.message, _i);
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

    resources : {},       //!< Loaded Resources list

    /**
     * ResourceManager::init() -- Constructor
     * @constructor
     */
    init : function() {
      console.group("ResourceManager::init()");
      console.groupEnd();

      this.resources  = {};
      this._super("(ResourceManager)", "apps/system-software-install.png", true);
    },


    /**
     * ResourceManager::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this.resources = {};
      this._super();
    },

    /**
     * ResourceManager::run() -- Start instance
     *
     * Handles preloading of resources.
     *
     * @return void
     */
    run : function(preload, callback) {
      var self = this;

      // Compile a list of resources compatible with external loader
      var _images     = preload.images    || [];
      var _sounds     = preload.sounds    || [];
      var _resources  = preload.resources || [];
      var _list       = [];

      var i = 0, l = _images.length;
      for ( i; i < l; i++ ) {
        if ( _images[i].match(/^\//) ) {
          _list.push({"type" : "image", "src" : _images[i]});
        } else {
          _list.push({"type" : "image", "src" : GetIcon(_images[i], "16x16")});
        }
      }

      if ( OSjs.Compability.SUPPORT_AUDIO ) {
        var filetype = "oga";
        var theme    = _Settings._get("system.sounds.theme") || "Default";
        if ( !OSjs.Compability.SUPPORT_AUDIO_OGG && OSjs.Compability.SUPPORT_AUDIO_MP3 ) {
          filetype = "mp3";
        }

        var j = 0, k = _sounds.length;
        for ( j; j < k; j++ ) {
          _list.push({"type" : "sound", "src" : sprintf(SOUND_URI, theme, _sounds[j], filetype)});
        }
      }

      var r = 0, e = _resources.length;
      for ( r; r < e; r++ ) {
        i = _resources[r];
        if ( i.match(/\.js$/i) ) {
          _list.push({"type" : "javascript", "src" : (RESOURCE_URI + i)});
        } else if ( i.match(/\.css$/i) ) {
          _list.push({"type" : "css", "src" : (RESOURCE_URI + i)});
        }
      }

      // First load static content, then go for internal resources
      var _loader;
      var _loader_done = function() {
        try {
          _loader.destroy();
          delete _loader;
        } catch ( eee ) {}

        callback();
      };

      var cur  = 10;
      var diff = (50 - cur);
      var step = parseInt(Math.min(cur / diff), 10) || 1;

      _loader = new OSjs.Classes.Preloader(_list, function(loaded, errors) {
        console.log("ResourceManager::run() Preloaded", loaded, "of", errors, "failed");
        _loader_done();
      }, function() {
        OSjs.Classes.ProgressBar($("#LoadingBar"), (cur += step));
      }, function() {
        OSjs.Classes.ProgressBar($("#LoadingBar"), (cur += step));
      });

    },

    /**
     * ResourceManager::updateManifest() -- Force MANIFEST update
     * @return void
     */
    /*
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
     */

    /**
     * ResourceManager::addResources() -- Add an array with resources and call-back
     * @param   Array     res         Resource URI array
     * @param   String    app         Application Name (if any)
     * @param   Function  callback    Call when done adding
     * @return  void
     */
    addResources : function(res, app, callback) {
      var self = this;

      if ( res ) {
        app       = app || "";
        callback  = callback || function() {};

        console.group("ResourceManager::addResources()");
        console.log("Adding", res);
        console.log("Application", app);
        console.groupEnd();

        var _list  = [];
        var _loader;
        var _loader_done = function(failed) {
          try {
            _loader.destroy();
            delete _loader;
          } catch ( eee ) {}

          callback(failed);
        };

        var i = 0, l = res.length, name, src;
        for ( i; i < l; i++ ) {
          // Ignore non-valid or already added
          name = (app ? (app + "/" + res) : (res));
          if ( this.resources[name] || (res[i].match(/^worker\./) || res[i].match(/[^(\.js|\.css)]$/)) ) {
            continue;
          }

          // Go by file-extensions
          src = app ? sprintf("%s%s/%s", RESOURCE_URI, app, res[i]) : sprintf("%s%s", RESOURCE_URI, res[i]);
          if ( res[i].match(/\.js/i) ) {
            _list.push({"type" : "javascript", "src" : src});
          } else if ( res[i].match(/\.css/i) ) {
            _list.push({"type" : "css", "src" : src});
          }
        }

        // Use external loader
        if ( _list.length ) {
          _loader = new OSjs.Classes.Preloader(_list, function(loaded, errors) {
            console.log("ResourceManager::addResources()", "Preloader loaded",loaded, "with", errors, "errors");
            _loader_done(errors > 0);
          }, function(res) {
            self.resources[(app ? (app + "/" + res) : (res))] = true;
          }, function(res) {
            self.resources[(app ? (app + "/" + res) : (res))] = false;
          });
        } else {
          _loader_done(false);
        }
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

      // Make sure registry is up to date
      var j;
      for ( j in this._registry ) {
        if ( this._registry.hasOwnProperty(j) ) {
          if ( j == "user.session.appstorage" && !SAVE_APPREG )
            continue;

          console.log("> Injecting", j);
          //if ( !localStorage.getItem(j) ) {
            if ( this._registry[j].type == "list" ) {
              try {
                localStorage.setItem(j, JSON.stringify(this._registry[j].items));
              }  catch ( eee ) {
                localStorage.setItem(j, []);
              }
            } else if ( this._registry[j].type == "bool" ) {
              var val = "false";
              if ( this._registry[j].value == "true" || this._registry[j].value === true ) {
                val = "true";
              }
              localStorage.setItem(j, val);
            } else {
              localStorage.setItem(j, this._registry[j].value || null);
            }
          //}
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
      localStorage.removeItem("user.installed.applications");
      localStorage.removeItem("user.installed.packages");
      localStorage.removeItem("desktop.panel.items");
      localStorage.removeItem("desktop.panel.position");
      localStorage.removeItem("applications");
      localStorage.removeItem("settings");
      localStorage.removeItem("defaults");
      localStorage.removeItem("session");
      localStorage.removeItem("SETTINGS_REVISION");
      localStorage.removeItem("SETTING_REVISION");

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

      if ( this._cinterval ) {
        clearInterval(this._cinterval);
      }
      this._cinterval = null;

      this._super();
    },

    reset : function() {

    },

    /**
     * SettingsManager::run() -- Run
     * @param  Object   user_registry   User registry
     * @return void
     */
    run : function(user_registry) {
      console.group("SettingManager::run()");
      this._applyUserRegistry(user_registry);
      console.groupEnd();
    },

    /**
     * SettingsManager::_applyUserRegistry() -- Apply user registry settings
     * @see SettingsManager::run()
     * @return void
     */
    _applyUserRegistry : function(registry) {
     console.group("SettingsManager::_applyUserSettings()");
     if ( !(registry instanceof Object) || !registry ) {
       registry = {};
     }
     console.log("Registry", registry);

      var i;
      for ( i in registry ) {
        if ( registry.hasOwnProperty(i) ) {
          if ( !this._registry[i] )
            continue;

        if ( i == "user.session.appstorage" && !SAVE_APPREG )
          continue;

          console.log("> ", i, this._registry[i].type, registry[i]);

          switch ( this._registry[i].type ) {
            case "bool":
              var val = "false";
              if ( registry[i] === "true" || registry[i] === true ) {
                val = "true";
              }
              this._set(i, val);
            break;

            //case "array":
            case "list":
              try {
                this._set(i, JSON.parse(registry[i]));
              } catch ( eee ) {
                this._set(i, []);
              }
            break;

            default :
              this._set(i, registry[i]);
            break;
          }
        }
      }

      console.groupEnd();
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
            API.ui.alert(sprintf(OSjs.Labels.StorageWarning, size, WARN_STORAGE_SIZE), "warning", function() {
              warnOpen = false;
            });
            warnOpen = true;
          }
        }
        if ( size >= MAX_STORAGE_SIZE ) {
          if ( !alertOpen ) {
            API.ui.alert(sprintf(OSjs.Labels.StorageAlert, size, MAX_STORAGE_SIZE), "error", function() {
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
     * @return  Mixed
     */
    savePackageStorage : function(name, props) {
      var storage = this._get("user.session.appstorage", true);
      if ( !(storage instanceof Object) || (storage instanceof Array) ) {
        storage = {};
      }

      storage[name] = props;

      this._set("user.session.appstorage", storage);

      console.group("SettingsManager::savePackageStorage()");
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
      var res = this._get("user.session.appstorage", true);
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
        var session = [];
        var panels  = _Desktop ? _Desktop.getPanels() : [];

        var i = 0, l = panels.length;
        for ( i; i < l; i++ ) {
          session.push(panels[i].getSession());
        }

        console.group("SettingsManager::savePanel()");
        console.log(p, session);
        console.groupEnd();

        this._set("desktop.panels", session);
        this._save(false);

        return true;
      }
      return false;
    },

    /**
     * SettingsManager::_apply() -- Apply a changeset
     * @param   Object    settings    Settings Array
     * @param   Function  callback    Callback function
     * @return  void
     */
    _apply : function(settings, callback) {
      console.group("SettingsManager::_apply()");
      console.log("Applying", settings);

      var internal = !callback;
      var changed = false;
      callback = callback || function() {};

      var i;
      for ( i in settings ) {
        if ( settings.hasOwnProperty(i) ) {
          this._set(i, settings[i]);

          changed = true;
        }
      }

      if ( changed ) {
        this._save(internal, function() {
          callback();
          console.groupEnd();
        });
      } else {
        console.groupEnd();
        callback();
      }
    },

    /**
     * SettingsManager::_save() -- Save settings
     * @return void
     */
    _save : function(internal, callback) {
      internal = internal === undefined ? true : (internal ? true : false);
      callback = callback || function() {};

      var uregistry = JSON.stringify(this.getRegistry());
      var pargs     = {"action" : "settings", "registry" : uregistry};

      DoPost(pargs, function(data) {
        if ( data.error ) {
          if ( internal ) {
            API.application.notification(OSjs.Labels.SettingsNotifyTitle, OSjs.Labels.SettingsNotifyFailSave, GetIcon("emblems/emblem-important.png", "32x32"));
          }
          callback(false);
        } else {
          if ( internal ) {
            API.application.notification(OSjs.Labels.SettingsNotifyTitle, OSjs.Labels.SettingsNotifySave, GetIcon("emblems/emblem-default.png", "32x32"));
          }
          callback(true);
        }
      }, function() {
        if ( internal ) {
          API.application.notification(OSjs.Labels.SettingsNotifyTitle, OSjs.Labels.SettingsNotifyFailSaveServer, GetIcon("emblems/emblem-important.png", "32x32"));
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
      if ( (typeof v === "boolean") || (v instanceof Boolean) ) {
        v = (v ? "true" : "false");
      } else if ( (v instanceof Object || v instanceof Array) ) {
        v = JSON.stringify(v);
      }
      localStorage.setItem(k, v);
        /*
      try {
      } catch ( e ) {
        // Caught by interval!
        //  if ( e == QUOTA_EXCEEDED_ERR ) {
        //    (function() {})();
      }
      */
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
     * @return  Mixed
     */
    setDefaultApplication : function(app, mime, path) {
      var list = this._get("user.session.appmime", true);
      if ( !(list instanceof Object) || (list instanceof Array) ) {
        list = {};
      }

      list[mime] = app;

      this._set("user.session.appmime", list);
      this._save(false);

      console.group("SettingsManager::setDefaultApplication()");
      console.log(list);
      console.groupEnd();

      return list;
    },

    /**
     * SettingsManager::getDefaultApplications() -- Get default applications for MIME
     * @return Object
     */
    getDefaultApplications : function() {
      var list = this._get("user.session.appmime", true);
      if ( !(list instanceof Object) || (list instanceof Array) ) {
        list = {};
      }
      return list;
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
      var i;

      for ( i in this._registry ) {
        if ( i == "user.session.appstorage" && !SAVE_APPREG )
          continue;

        exp[i] = this._get(i, in_array(this._registry[i], ["list", "array"]));
      }
      return exp;
    },

    /**
     * SettingsManager::getStorageUsage() -- Get storage usage
     * @return Array
     */
    getStorageUsage : function() {
      var ls = 0;
      var l;

      for ( l in localStorage ) {
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
  // PACKAGEMANAGER
  /////////////////////////////////////////////////////////////////////////////

  /**
   * PackageManager -- Package Manager
   *
   * @extends Process
   * @class
   */
  var PackageManager = Process.extend({
    cache : {},         //!< Cached packages
    running : false,    //!< Running state

    /**
     * PackageManager::init() -- Constructor
     * @constructor
     */
    init : function() {
      console.group("PackageManager::init()");
      this._super("(PackageManager)", "emblems/emblem-package.png", true);
      this.reset();
      console.groupEnd();
    },

    /**
     * PackageManager::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      this.reset();
      this._super();
    },

    /**
     * PackageManager::reset() -- Reset instance
     * @return void
     */
    reset : function() {
      this.running = false;
      this.cache = {
        'User'    : {},
        'System'  : {}
      };
    },

    /**
     * PackageManager::run() -- Run
     * @param  Object   packages   Packages
     * @return void
     */
    run : function(packages) {
      if ( !this.running )
        this.setPackages(packages);
      this.running = true;
    },

    /**
     * PackageManager::install() -- Install Package from Archive
     * @param  String   p           Package Archive Path
     * @param  Function callback    Callback function
     * @param  bool     reterror    Callback on error instead of alert
     * @return void
     */
    install : function(p, callback, reterror) {
      var self = this;
      DoPost({'action' : 'package', 'operation' : 'install', 'archive' : p}, function(res) {
        if ( res.error ) {
          if ( reterror ) {
            callback(false, res.error);
          } else {
            MessageBox(res.error);
          }
        } else {
          _PackMan.setPackages(null, function() {
            callback(res);
          });
        }
      });
    },

    /**
     * PackageManager::uninstall() -- Uninstall Package(s)
     * @param  Array    p           Package list
     * @param  Function callback    Callback function
     * @param  bool     reterror    Callback on error instead of alert
     * @return void
     */
    uninstall : function(p, callback, reterror) {
      var self = this;
      DoPost({'action' : 'package', 'operation' : 'uninstall', 'package' : p}, function(res) {
        if ( res.error ) {
          if ( reterror ) {
            callback(false, res.error);
          } else {
            MessageBox(res.error);
          }
        } else {
          _PackMan.setPackages(null, function() {
            callback(res);
          });
        }
      });
    },

    /**
     * PackageManager::setPackages() -- Apply user package settings
     * @see SettingsManager::run()
     * @return void
     */
    setPackages : function(packages, callback) {
      var self = this;
      callback = callback || function() {};
      if ( packages ) {
        this.cache = packages;

        console.group("PackageManager::setPackages()");
        console.log("Cache", this.cache);
        console.groupEnd();
      } else {
        DoPost({'action' : 'updateCache'}, function(data) {
          if ( data.result ) {
            self.cache = data.result.packages;

            console.group("PackageManager::setPackages()");
            console.log("Cache", self.cache);
            console.groupEnd();

            setTimeout(function() {
              callback();
            }, 0);
          }
        });
      }
    },

    /**
     * PackageManager::getUserPackages() -- Get user packages
     * @param  bool   icons       Enumerate Icons
     * @param  bool   apps        Enumerate Application items
     * @param  bool   pitems      Enumerate PanelItem items
     * @param  bool   sitems      Enumerate Service items
     * @return Mixed
     */
    getUserPackages : function(icons, apps, pitems, sitems) {
      var result = [];

      apps    = (apps === undefined)    ? true : apps;
      pitems  = (pitems === undefined)  ? true : pitems;
      sitems  = (sitems === undefined)  ? true : sitems;

      if ( icons === true )
        icons = "32x32";

      var cat, lst, iter, item;
      for ( cat in this.cache ) {
        if ( this.cache.hasOwnProperty(cat) ) {
          lst = this.cache[cat];
          for ( iter in lst ) {
            if ( lst.hasOwnProperty(iter) ) {
              item = lst[iter];
              if ( item.type == "Application" && apps ) {
                result.push({
                  name      : iter,
                  label     : item.titles[GetLanguage()] || item.title,
                  type      : 'Application',
                  locked    : cat == "System",
                  icon      : item.icon,
                  icon      : (icons ? GetIcon(item.icon, icons, iter) : item.icon),
                  category  : item.category
                });
              } else if ( item.type == "PanelItem" && pitems ) {
                result.push({
                  name    : iter,
                  label   : item.title,
                  type    : 'PanelItem',
                  locked  : cat == "System",
                  icon    : (icons ? GetIcon(item.icon, icons, iter) : item.icon)
                });
              } else if ( (item.type == "Service" || item.type == "BackgroundService") && sitems ) {
                result.push({
                  name    : iter,
                  label   : item.title,
                  type    : 'BackgroundService',
                  locked  : cat == "System",
                  icon    : (icons ? GetIcon(item.icon, icons, iter) : item.icon)
                });
              }
            }
          }
        }
      }

      return result;
    },

    /**
     * PackageManager::getPackage() -- Get a package
     * @param  String   name      Package Name
     * @param  String   type      Package Type
     * @return Mixed
     */
    getPackage : function(name, type) {
      var i;
      for ( i in this.cache.System ) {
        if ( this.cache.System.hasOwnProperty(i) ) {
          if ( i == name ) {
            return this.cache.System[i];
          }
        }
      }
      for ( i in this.cache.User ) {
        if ( this.cache.User.hasOwnProperty(i) ) {
          if ( i == name ) {
            return this.cache.User[i];
          }
        }
      }

      return null;
    },

    /**
     * PackageManager::getPackagesByType() -- Get packages by type
     * @param  String   type      Package Type
     * @return Object
     */
    getPackagesByType : function(type) {
      var result = {};
      var i;
      for ( i in this.cache.System ) {
        if ( this.cache.System.hasOwnProperty(i) ) {
          if ( this.cache.System[i].type == type ) {
            result[i] = this.cache.System[i];
          }
        }
      }
      for ( i in this.cache.User ) {
        if ( this.cache.User.hasOwnProperty(i) ) {
          if ( this.cache.User[i].type == type ) {
            result[i] = this.cache.User[i];
          }
        }
      }
      return result;
    },

    /**
     * PackageManager::getPackage() -- Get package(s)
     * @param  bool   merged      Get merged object
     * @return Mixed
     */
    getPackages : function(merged) {
      if ( merged ) {
        var result = {}, i;
        for ( i in this.cache.System ) {
          if ( this.cache.System.hasOwnProperty(i) ) {
            result[i] = this.cache.System[i];
          }
        }
        for ( i in this.cache.User ) {
          if ( this.cache.User.hasOwnProperty(i) ) {
            result[i] = this.cache.User[i];
          }
        }
        return result;
      }

      return this.cache;
    }

  });

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

    _argv             : {},           //!< Application staring arguments (argv)
    _name             : "",           //!< Application name
    _running          : false,        //!< Application running state
    _root_window      : null,         //!< Application root Window
    _windows          : [],           //!< Application Window list
    _storage          : {},           //!< Application Storage
    _storage_on       : false,        //!< Application Storage enabled state
    _storage_restore  : true,         //!< Application Storage Restore enabled
    _compability      : [],           //!< Application compability list
    _workers          : {},           //!< Application WebWorker(s)
    _sockets          : {},           //!< Applicaiton Socket(s)
    _bindings         : {},           //!< Application Binding(s)

    /**
     * Application::init() -- Constructor
     * @param   String    name      Application Name
     * @param   Array     argv      Application Staring arguments (argv)
     * @constructor
     */
    init : function(name, argv) {
      this._argv            = argv || {};
      this._name            = name;
      this._running         = false;
      this._root_window     = null;
      this._windows         = [];
      this._storage         = {};
      this._storage_on      = false;
      this._storage_restore = true;
      this._compability     = [];
      this._workers         = {};
      this._sockets         = {};
      this._bindings        = {
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
            var i = 0, l = self._windows.length;
            for ( i; i < l; i++ ) {
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
     *
     * Final process in the initialization. Restores any previous
     * stored [application-specific] settings, and binds the given
     * window to the running process so it can shutdown cleanly.
     *
     * @param   Window    root_window   Bind a Window as main Window
     * @return  void
     */
    run : function(root_window) {
      var self = this;

      if ( !this._running ) {

        this._restoreStorage();
        if ( root_window instanceof Window ) {
          this._root_window = root_window;
          this.___proc_icon   = root_window._icon;

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
        var i = 0, l = this._bindings[name].length;
        for ( i; i < l; i++ ) {
          this._bindings[name][i](args);
        }
      }
    },

    /**
     * Application::_createSocket() -- Create a new Socket instance
     * @see     Socket
     * @return  Socket
     */
    _createSocket : function(name, uri) {
      var s = new Socket(this._name, uri);
      this._removeSocket(name);
      this._sockets[name] = s;
      return s;
    },

    /**
     * Application::_removeSocket() -- Remove a Socket
     * @param   String    name      Socket name
     * @return  bool
     */
    _removeSocket : function(name) {
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
      var i;
      for (i in this._sockets ) {
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
     * @param   Object    opts      Options
     * @return  void
     */
    defaultFileUpload : function(dir, callback, opts) {
      var self = this;

      this.createUploadDialog({'path' : dir, 'on_success' : function(dir, fmime, response) {
        VFSEvent("update", {'file' : dir, 'mime' : fmime}, self);
        callback(dir, fmime, response);
      }, 'options' : opts});
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

      this.createFileDialog({'on_apply' : function(fname, mime) {
        var cont = true;
        if ( check_mime ) {
          if ( mime && mimes && mimes.length ) {
            var found = false;
            var tspl1 = mime.split("/").shift();
            var i = 0, l = mimes.length;

            for ( i; i < l; i++ ) {
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
      }, 'mime' : mimes, 'type' : "open", 'cwd' : dir});
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
        var aargs = {'path' : file, 'content' : content};
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
        this.createFileDialog({'on_apply' : function(file, mime) {
          _func(file, mime);
        }, 'mime' : mimes, type : "save", 'cwd' : dir});
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
     * @see     API.ui.dialog
     * @return  void
     */
    createMessageDialog : function(args) {
      this.__addWindow(API.ui.dialog(args.type, args.message, args.on_close, args.on_ok, args.on_cancel));
    },

    /**
     * Application::createColorDialog() -- Create Dialog: Color Chooser
     * @see     API.ui.dialog_color
     * @return  void
     */
    createColorDialog : function(args) {
      this.__addWindow(API.ui.dialog_color(args));
    },

    /**
     * Application::createFontDialog() -- Create Dialog: Font Chooser
     * @see     API.ui.dialog_font
     * @return  void
     */
    createFontDialog : function(args) {
      this.__addWindow(API.ui.dialog_font(args));
    },

    /**
     * Application::createUploadDialog() -- Create Dialog: Upload File
     * @see     API.ui.dialog_upload
     * @return  void
     */
    createUploadDialog : function(args) {
      this.__addWindow(API.ui.dialog_upload(args));
    },

    /**
     * Application::createFileDialog() -- Create Dialog: File Operation Dialog
     * @see     API.ui.dialog_file
     * @return  void
     */
    createFileDialog : function(args) {
      this.__addWindow(API.ui.dialog_file(args));
    },

    /**
     * Application::createFileCopyDialog() -- Create Dialog: File Operation Dialog
     * @see     API.ui.dialog_file
     * @return  void
     */
    createFileCopyDialog : function(args) {
      if ( !(args instanceof Object) ) {
        args = {};
      }
      args.type = "copy";

      this.__addWindow(API.ui.dialog_file_operation(args));
    },

    /**
     * Application::createFileMoveDialog() -- Create Dialog: File Operation Dialog
     * @see     API.ui.dialog_file
     * @return  void
     */
    createFileMoveDialog : function(args) {
      if ( !(args instanceof Object) ) {
        args = {};
      }
      args.type = "move";

      this.__addWindow(API.ui.dialog_file_operation(args));
    },

    /**
     * Application::createLaunchDialog() -- Create Dialog: Launch Application
     * @see     API.ui.dialog_launch
     * @return  void
     */
    createLaunchDialog : function(args) {
      this.__addWindow(API.ui.dialog_launch(args));
    },

    /**
     * Application::createRenameDialog() -- Create Dialog: Rename File
     * @see     API.ui.dialog_rename
     * @return  void
     */
    createRenameDialog : function(args) {
      this.__addWindow(API.ui.dialog_rename(args));
    },

    /**
     * Application::createInputDialog() -- Create Dialog: Input Box
     * @see     API.ui.dialog_input
     * @return  void
     */
    createInputDialog : function(args) {
      this.__addWindow(API.ui.dialog_input(args));
    },

    /**
     * Application::createFilePropertyDialog() -- Create Dialog: File properties
     * @see     API.ui.dialog_properties
     * @return  void
     */
    createFilePropertyDialog : function(args) {
      this.__addWindow(API.ui.dialog_properties(args));
    },

    /**
     * Application::_addWorker() -- Create a WebWorker
     * @param   String    name        Worker name
     * @param   String    resource    Worker resource name (worker.NAME.js)
     * @param   Function  mcallback   Process callback function
     * @param   Function  ecallback   Error callback function
     * @see     WebWorker
     * @return  WebWorker
     */
    _addWorker : function(name, resource, mcallback, ecallback) {
      if ( !this._workers[name] ) {
        var w = new WebWorker(RESOURCE_URI + sprintf("%s/%s", this._name, resource), mcallback, ecallback);
        this._workers[name] = w;
        return w;
      }

      return true;
    },

    /**
     * Application::_removeWorker() -- Remove a WebWorker
     * @param   String  name      Worker name
     * @see     WebWorker
     * @return  bool
     */
    _removeWorker : function(name) {
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
      var _mapping = {
        "canvas"          : OSjs.Compability.SUPPORT_CANVAS,
        "webgl"           : OSjs.Compability.SUPPORT_WEBGL,
        "audio"           : OSjs.Compability.SUPPORT_AUDIO,
        "audio_ogg"       : OSjs.Compability.SUPPORT_AUDIO_OGG,
        "audio_mp3"       : OSjs.Compability.SUPPORT_AUDIO_MP3,
        "audio_wav"       : OSjs.Compability.SUPPORT_AUDIO_WAV,
        "video"           : OSjs.Compability.SUPPORT_VIDEO,
        "video_webm"      : OSjs.Compability.SUPPORT_VIDEO_WEBM,
        "video_h264"      : OSjs.Compability.SUPPORT_VIDEO_H264,
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
        "worker"          : OSjs.Compability.SUPPORT_WORKER,
        "filesystem"      : OSjs.Compability.SUPPORT_FS,
        "svg"             : OSjs.Compability.SUPPORT_SVG
      };

      function __check(key) {
        var error = false;

        // First check if we have a sub-compability check
        var tmp = key.match(/\_/) ? ((key.split("_")).pop()) : null;
        if ( tmp === "audio" || tmp === "video" ) {
          if ( _mapping[tmp] !== true ) {
            error = OSjs.Labels.CompabilityErrors[tmp];
          }
        }

        // Then check main-type
        if ( error === false ) {
          if ( _mapping[key] !== true ) {
            error = OSjs.Labels.CompabilityErrors[key];
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
          var i = 0, l = this._compability.length;
          for ( i; i < l; i++ ) {
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
     * Application::_addWindow() -- Add a new window to application
     * @param   Window    win     Window to add
     * @return  void
     */
    _addWindow : function(win) {
      if ( _WM ) {

        // Check for orphans
        if ( win._is_orphan ) {
          var x = 0, l = this._windows.length, y = null;
          for ( x; x < l; x++ ) {
            y = this._windows[x];
            if ( y._name == win._name ) {
              if ( y._is_orphan ) {
                _WM.focusWindow(y);
                return false;
              }
            }
          }
        }

        if ( _WM.addWindow(win) ) {
          return this.__addWindow(win) ? true : false;
        }
      }

      return false;
    },

    /**
     * Application::__addWindow() -- Add a new window to application (internal)
     * @param   Window    win     Window to add
     * @return  void
     */
    __addWindow : function(win) {
      return this._windows.push(win);
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
     * @return Mixed
     */
    _restoreStorage : function() {
      if ( this._name && this._storage_on && this._storage_restore ) {
        var s = _Settings.loadPackageStorage(this._name);
        if ( s !== false ) {
          this._storage = s;
        }
      }

      console.group("Application::_restoreStorage()");
      console.log(this._name);
      console.log("Result", this._storage);
      console.groupEnd();

      return this._storage;
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
     *
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
      console.log("Application::_setArgv()", a, v);

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
      var i;

      for ( i in this._workers ) {
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
        var win   = this._root_window._getAttributes();

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
        var i = 0, l = this.bindings[mname].length;
        for ( i; i < l; i++ ) {
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
     * WindowManager::togleWindow() -- Handle window switching via keyboard shortcut
     * @param   Mixed     arg   Swithing argument
     * @return  void
     */
    toggleWindow : (function() {

      var _t = -1;
      var _l = null;
      var _m = 0;
      var _last = -1;

      function _createList() {
        _l = _WM.getStack();
        _m = _l.length - 1;

        var r = $("#WindowTogglerList ul");
        var e;
        var i = 0, l = _l.length;

        for ( i; i < l; i++ ) {
          if ( _l[i].skip_pager )
            continue;

          e = $(sprintf("<li><img alt=\"%s\" src=\"%s\" /></li>", _l[i].title, _l[i].icon));
          r.append(e);
        }
      }

      function _toggleRect() {
        $("#WindowTogglerList ul li").removeClass("Current");
        if ( _l[_t] ) {
          var item = $($("#WindowTogglerList ul li").get(_t));
          item.addClass("Current");
          $("#WindowTogglerTitle span").html(item.find("img").attr("alt"));

          var win = $("#" + _l[_t].id);

          $("#WindowTogglerRect").css({
            "top" : win.css("top"),
            "left" : win.css("left"),
            "width" : win.css("width"),
            "height" : win.css("height")
          }).show();

          console.log(win, $("WindowTogglerRect"));
        }
      }

      function _focus() {
        if ( _t >= 0 ) {
          if ( _l[_t] ) {
            _l[_t].focus();
          }
        }
      }

      return function(arg) {
        console.group("WindowManager::toggleWindow()", arg);
        if ( arg === false ) {
          _focus();

          $("#WindowTogglerRect").hide();
          $("#WindowTogglerList ul").empty();
          $("#WindowTogglerTitle span").html("Empty");

          _l = null;
          _t = -1;

          $("#WindowToggler").hide();
        } else {

          if ( _l === null ) {
            _createList();
            _t = -1;
          }

          if ( _l && _l.length ) {
            // Next
            _t++;
            if ( _t > _m ) {
              _t = 0;
            }

            // Now select current item
            _toggleRect();

            console.log("Selected", _t);

            _last = _t;
          } else {
            $("#WindowTogglerTitle span").html("Empty");

            console.log("Empty");
          }

          $("#WindowToggler").show();
        }

        console.groupEnd();
      };

    })(),

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
        var i = 0, l = this.stack.length;

        for ( i; i  < l; i++ ) {
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
      var i;

      for ( i in map ) {
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
          if ( p ) {
            if ( p.getPosition() == "top" ) {
              result.y += p.getHeight();
              result.h -= p.getHeight();
            } else {
              //result.y += p.getHeight();
              result.h -= p.getHeight();
            }
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
      var i = 0, l = this.stack.length, iter;

      for ( i; i < l; i++ ) {
        iter = this.stack[i];
        stack.push({
          id            : iter._getWindowId(),
          title         : iter._getTitle(),
          icon          : iter._getIcon(),
          skip_pager    : iter._skip_pager,
          skip_taskbar  : iter._skip_taskbar,

          focus         : (function(w) {
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
   * DesktopIconView -- Desktop Icon View class
   *
   * @extends Classes.Iconview
   * @class
   */
  var DesktopIconView = OSjs.Classes.Iconview.extend({
    init : function() {
      var el = $("#DesktopGrid");
      var inner = $("<div class=\"GtkIconView\"></div>");
      el.append(inner);

      this._super(inner, "icon", {'dnd' : true, 'dnd_items' : false, 'multiselect' : false});
    },

    createItem : function(view, iter) {
      var title = iter.title;

      var el = $(sprintf("<li class=\"GtkIconViewItem\"><div class=\"Image\"><img alt=\"\" src=\"%s\" /></div><div class=\"Label\">%s</div></li>",
                       API.ui.getIcon(iter.icon, "32x32"),
                       title));

      el.data("title",      iter.title);
      el.data("path",       iter.path);
      el.data("mime",       iter.mime);
      el.data("protected",  iter['protected']);

      return el;
    },

    onItemActivate : function(ev, el, item) {
      if ( el && item ) {
        API.system.launch(item.launch, item['arguments']);
      }
      return this._super(ev, el, item);
    },

    onItemContextMenu : function(ev, el, item) {
      var self = this;
      var result = this._super(ev, el, item);
      API.application.context_menu(ev, this, [
        {"title" : OSjs.Labels.DesktopGridHeader, "attribute" : "header"},
        {"title" : OSjs.Labels.DesktopGridRemove, "disabled" : item['protected'] == "1", "method" : function() { self.removeItem(el, item); }}
      ], true);
      return result;
    },

    onDragAction : function(ev, action, item, args) {
      var result = this._super(ev, action, item, args);
      if ( (action == "drop") && (result instanceof Object) && result.json ) {
        if ( result.json.path && result.json.mime ) {
          var iter;
          var data = result.json;

          if ( data.mime.match(/^OSjs/) ) {
            if ( data.mime == "OSjs/Application" ) {
              iter = {
                'title'     : data.name,
                'icon'      : data.icon,
                'launch'    : "API::Run::" + basename(data.path),
                'arguments' : {},
                'protected' : false
              };
            }
          } else {
            iter = {
              'title'     : data.name,
              'icon'      : data.icon,
              'launch'    : "API::Launch",
              'arguments' : {path: data.path, mime: data.mime},
              'protected' : false
            };
          }

          if ( iter ) {
            this.addItem(iter);
          }
        }
      }
      return result;
    },

    addItem : function(data) {
      var self = this;
      var list = _Settings._get("desktop.grid", true);
      if ( !list || !(list instanceof Array) ) {
        list = [];
      }

      list.push(data);

      _Settings._apply({"desktop.grid" : list}, function() {
        self.update();
      });
    },

    removeItem : function(el, item) {
      var self = this;
      var list = _Settings._get("desktop.grid", true);
      if ( !list || !(list instanceof Array) ) {
        list = [];
      } else {
        list.splice($(el).index(), 1);
      }

      _Settings._apply({"desktop.grid" : list}, function() {
        self.update();
      });
    },

    update : function() {
      var list = _Settings._get("desktop.grid", true);
      if ( !list || !(list instanceof Array) ) {
        list = [];
      }
      this.render(list);
    }

  });

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
      if ( this._rtimeout ) {
        clearTimeout(this._rtimeout);
      }

      $(window).unbind("resize");

      // Remove panel
      if ( this.panels ) {
        var i = 0;
        var l = this.panels.length;

        for ( i; i < l; i++ ) {
          if ( this.panels[i] instanceof Panel ) {
            this.panels[i].destroy();
          }
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
      this.setWallpaperType(null);
      this.setBackgroundColor(null);
      this.setCursorTheme(null);
      this.setTheme(null);
      this.setFont(null);

      this.running = false;
      this._rtimeout = null;

      this._super();

      // >>> REMOVE GLOBAL <<<
      if ( _Desktop )
        _Desktop = null;
    },

    /**
     * Desktop::run() -- Run DOM operations etc.
     * @param   Function    finished_callback     Call when done
     * @return  void
     */
    run : function(finished_callback) {
      finished_callback = finished_callback || function() {};

      var self = this;
      if ( this.running ) {
        return;
      }

      var finished = false;

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
      // Desktop Grid - Icon View
      //
      console.log("Registering desktop grid...");
      try {
        self.iconview = new DesktopIconView();
        self.iconview.update();
      } catch ( exception ) {
        throw new OSjs.Classes.ProcessException(self, OSjs.Labels.CrashDesktopIconView, exception);
      }

      //
      // Create panel and items from localStorage
      //
      console.log("Registering panels...");
      try {
        var panels = _Settings._get("desktop.panels", true);
        console.log("Panels", panels);

        if ( panels && panels.length ) {

          // Func: Add panel items
          var _addPanelItems = function(panel, items, callback) {
            var size = items.length;
            var current = 0;

            // Func: Add Panel item (inner)
            var _addPanelItem = function(index) {
              var el      = items[index];
              el.panel    = panel;

              LaunchProcess(el.name, "PanelItem", el, function() {
                current++;
                if ( current < size ) {
                  _addPanelItem(current);
                } else {
                  callback(panel);
                }
              });
            };

            if ( size > 0 ) {
              _addPanelItem(0);
            }
          };

          // Func: Check if panel adding is finished
          var _checkFinished = function(_cur, _len) {
            if ( _cur >= _len ) {
              if ( !finished ) {
                finished = true;
                finished_callback();
              }
            }
          };

          // Add panels
          var panel, iter;
          var x = 0, l = panels.length;
          for ( x; x < l; x++ ) {
            iter  = panels[x];
            panel = new Panel(iter.index, iter.name, iter.position, iter.style);

            if ( !self.addPanel(panel) ) {
              try {
                panel.destroy();
                panel = null;
              } catch ( eee ) { // TODO Error handling ?!
              }
              continue;
            }

            // Now add items if any
            if ( iter.items.length ) {
              _addPanelItems(panel, iter.items, (function(_cur, _len) {
                return function(pref) {
                  _checkFinished(_cur, _len);
                };
              })(x, (l - 1)));
            } else {
              _checkFinished(x, (l - 1));
            }

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

      if ( !finished ) {
        finished_callback();
        finished = true;
      }

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
        if ( panels && panels.length ) {
          var i = 0, l = panels.length;

          for ( i; i < l; i++ ) {
            if ( panels[i] instanceof Panel ) {
              panels[i].redraw(e, ee);
            }
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
      var self = this;

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
          API.ui.dialog_file({'on_apply' : function(fname) {
            API.user.settings.save({
              "desktop.wallpaper.path" : fname
            });
          }, 'mime' : ["image/*"], 'type' : "open", 'cwd' : dir});
        }},
        {"title" : labels.sort, "method" : function() {
          API.ui.windows.tile();
        }},
        {"title" : labels.panels, "method" : function() {
          self.showPanelPreferences();
        }}
      ], true);

      /*if ( ev.which > 1 ) {
      ev.preventDefault();
      }*/

      return ret;
    },

    /**
     * Desktop::showPanelPreferences() -- Show Panel preferences dialog
     * @return void
     */
    showPanelPreferences : function() {
      var self = this;
      if ( _WM ) {
        var win = new OSjs.Dialogs.PanelPreferencesOperationDialog(OperationDialog, API, [function(panel, key, value) {
          if ( _Desktop ) {
            panel = _Desktop.getPanel(panel.index);
            if ( panel ) {
              var style = panel.getStyle();
              style[key] = value;
              panel.setStyle(style, true);

              console.log("Desktop::showPanelPreferences()", "__onchange", panel, [key, value], style);
              var session = [];
              var panels  = self.getPanels();

              var i = 0, l = panels.length;
              for ( i; i < l; i++ ) {
                session.push(panels[i].getSession());
              }

              _Settings._apply({"desktop.panels" : session}, function() {
                // void -- removes message
              });
            }
          }
        }]);
        _WM.addWindow(win);
      }
    },

    /**
     * Desktop::addPanel() -- Add Panel
     * @param   Panel     p           Panel or null
     * @return  bool
     */
    addPanel : function(p) {
      if ( p instanceof Panel ) {
        if ( p.run() ) {
          this.updatePanelPosition(p);
          this.panels.push(p);

          return true;
        }
      }

      return false;
    },

    /**
     * Desktop::removePanel() -- Remove Panel
     * @param   Panel     p           Panel or null
     * @param   bool      destroyed   Set if action comes from Panel::destroy()
     * @return  void
     */
    removePanel : function(p, destroyed) {
      var i;
      console.log("Desktop::removePanel()", p, destroyed);
      for ( i in this.panels ) {
        if ( this.panels.hasOwnProperty(i) ) {
          if ( this.panels[i] === p ) {
            if ( !destroyed ) {
              this.panels[i].destroy();
            }

            console.log("Desktop::removePanel()", "found", i, p);

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
      var i;

      for ( i in map ) {
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
        $("body").css("background-image", "");
        //$("body").css("background-image", "url('/img/blank.gif')");
      }
    },

    /**
     * Desktop::setWallpaperType() -- Set the wallpaper type
     * @param   String    t       Wallpaper type
     * @return  void
     */
    setWallpaperType : function(t) {
      if ( !t ) {
        $("body").css("background-repeat",    "");
        $("body").css("background-position",  "");
        $("body").css("background-size",      "");
        return;
      }

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
      c = c || "inherit";

      $("body").css("background-color", c);
    },

    /**
     * Desktop::setTheme() -- Set new theme
     * @param   String    theme   Theme name
     * @return  void
     */
    setTheme : function(theme) {
      theme = theme || "none";

      var css = $("#ThemeFace");
      var href = THEME_URI + theme.toLowerCase();
      if ( $(css).attr("href") != href ) {
        $(css).attr("href", href);
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

      PlaySound("message");

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
      var i = 0, l = this.panels.length;

      for ( i; i < l; i++ ) {
        panels.push(this.panels[i].getSession());
      }

      return {
        "panels" : panels
      };
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
    dragging      : false,      //!< Current panel dragging
    idragging     : false,      //!< Current item dragging
    width         : -1,         //!< Current width
    btype         : "",         //!< Background Type
    bbackground   : "",         //!< Background Value
    bopacity      : "",         //!< Background Opacity

    /**
     * Panel::init() -- Constructor
     * @constructor
     */
    init : function(index, name, pos, style) {
      var self = this;

      console.group("Panel::init()");
      console.log("Index", index);
      console.log("Name", name);
      console.log("Position", pos);

      this.$element     = $('<div class="DesktopPanel"><div class=\"Background\"></div><ul></ul></div>');
      this.pos          = pos;
      this.items        = [];
      this.running      = false;
      this.index        = parseInt(index, 10);
      this.name         = name || "Panel";
      this.width        = -1;

      this.setStyle(style || {}, true);

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
          }}
        ], true);

        return false;
      });

      // Add Panel item function
      var addItem = function(pos_ev) {
        if ( !_WM ) {
          MessageBox(OSjs.Labels.WindowManagerMissing);
          return;
        }

        var items = _PackMan.getPackagesByType("PanelItem");
        var win = new OSjs.Dialogs.PanelAddItemOperationDialog(OperationDialog, API, [this, items, function(selected) {
          var pos = pos_ev.pageX;
          LaunchProcess(selected, "PanelItem", {"index" : self.items.length, "argv" : [], "align" : "left", "position" : pos, "panel" : self, "save" : true});
        }]);
        _WM.addWindow(win);
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
      var i = 0, l = this.items.length;

      for ( i; i < l; i++ ) {
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

      this.dragging = null;
      this.idragging = null;
      this.running = false;

      this._super();
    },

    /**
     * Panel::run() -- Set panel to running state
     * @return  void
     */
    run : function() {
      if ( this.running )
        return false;

      var id = "Panel_" + this.index;
      var ul = this.$element.find("ul").first();

      ul.attr("id", id);

      $("#Desktop").append(this.$element);

      this.running = true;

      var self = this;
      $(document).mouseup(function(ev) {
        if ( self.idragging ) {
          self._stopItemDrag(ev);
        }
      });

      return true;
    },

    /**
     * Panel::_startItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _startItemDrag : function(ev, item) {
      var self = this;
      if ( !this.idragging ) {

        var dw = $(document).width();
        var off = item.$element.offset();
        var ghost = $("<li class=\"Ghost PanelItemSeparator\"></li>");
        ghost.css("left", ev.pageX + "px");
        ghost.css({
          "left"   : off['left'] + "px",
          "width"  : item.$element.width() + "px",
          "height" : item.$element.height() + "px"
        });

        console.log("Panel::_startItemDrag()", item, off);

        this.idragging = {
          'start'   : item._align == "right" ? (dw - (off['left'] + item.$element.width())) : off['left'],
          'item'    : item,
          'result'  : null,
          'ghost'   : ghost,
          'startX'  : ev.pageX
        };

        console.log("Panel::_startItemDrag()", ev, this.idragging);

        $(document).bind("mousemove", function(ev) {
          self._handleItemDrag(ev);
        });

        this.$element.append(this.idragging.ghost);
      }
    },

    /**
     * Panel::_stopItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _stopItemDrag : function(ev) {
      var self = this;
      if ( this.idragging ) {
        console.log("Panel::_stopItemDrag()", ev, this.idragging);

        $(document).unbind("mousemove", function(ev) {
          self._handleItemDrag(ev);
        });

        this.idragging.item.setPosition(this.idragging.result, true);

        this.idragging.ghost.remove();
      }
      this.idragging = false;
    },

    /**
     * Panel::_handleItemDrag() -- PanelItem Dragging
     * @param DOMEvent    ev      DOM Event
     * @return void
     */
    _handleItemDrag : function(ev) {
      if ( this.idragging ) {
        var cur, diff = this.idragging.startX - ev.pageX;
        if ( this.idragging.item._align == "left" ) {
          cur = this.idragging.start - diff;
          this.idragging.result = {"left" : (cur + "px"), "right" : "auto"};
        } else {
          cur = this.idragging.start + diff;
          this.idragging.result = {"right" : (cur + "px"), "left" : "auto"};
        }
        this.idragging.ghost.css(this.idragging.result);
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
        var i = 0, l = this.items.length;

        for ( i; i < l; i++ ) {
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
     * @param   Object      opts    Item Options
     * @param   bool        save    Save panel (Default = undefined)
     * @return  Mixed
     */
    addItem : function(i, opts, save) {
      if ( i instanceof PanelItem ) {

        console.group("Panel::addItem()");
        console.log(i, save, opts);
        console.groupEnd();

        i._panel = this;
        i._index = this.items.length;
        var el = i.create(opts);
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
      var i = 0;
      var l = this.items.length;

      for ( i; i < l; i++ ) {
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
     * Panel::setStyle() -- Set panel style
     * @param  Object   style     Style Object
     * @param  bool     append    Append to DOM
     * @return void
     */
    setStyle : function(style, append) {
      this.btype        = (style.type)       ? style.type        : "default";
      this.bbackground  = (style.background) ? style.background  : null;
      this.bopacity     = (style.opacity)    ? style.opacity     : "default";

      console.log("Panel::setStyle()", style, append);

      if ( append ) {
        var background = false;
        var opacity    = false;

        if ( style.type === "transparent" ) {
          background = "transparent";
        } else {
          if ( style.background ) {
            if ( style.type == "background" ) {
              background = "url('" + style.background + "')";
            } else if ( style.type == "solid" ){
              background = style.background;
            }
          }
        }

        // Reset to default
        this.$element.css("background", "");
        this.$element.css("opacity", "1.0");
        this.$element.removeClass("Transparent");

        if ( !isNaN(style.opacity) ) {
          opacity = parseInt(style.opacity, 10) / 100;
        }

        if ( background !== false ) {
          this.$element.css("background", background);
          if ( background === "transparent" ) {
            this.$element.addClass("Transparent");
          }
        }

        if ( opacity !== false ) {
          this.$element.css("opacity", opacity);
        }

      }
    },

    /**
     * Panel::getHeight() -- Get panel height
     * @return String
     */
    getHeight : function() {
      return this.$element.height();
    },

    /**
     * Panel::getPosition() -- Get placed position
     * @return String
     */
    getPosition : function() {
      return this.pos;
    },

    /**
     * Panel::getStyle() -- Get style
     * @return Object
     */
    getStyle : function() {
      return {
        "type"        : this.btype,
        "background"  : this.bbackground,
        "opacity"     : this.bopacity
      };
    },

    /**
     * Panel::getSession() -- Get the panel session
     * @return Object
     */
    getSession : function() {
      var self = this;
      var items = [];

      var i = 0, l = this.items.length;
      for ( i; i < l; i++ ) {
        items.push(this.items[i].getSession());
      }

      return {
        "name"      : self.name,
        "index"     : self.index,
        "items"     : items,
        "position"  : self.pos,
        "style"     : self.getStyle()
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
    init : function(name)  {
      this._name         = name;
      this._named        = name;
      this._align        = "left";
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
     * @param   Object      lopts   Item Options
     * @return  $
     */
    create : function(lopts) {
      var self = this;

      this._align     = lopts.align || this._align;
      this._index     = lopts.index || this._index;
      this._position  = lopts.position;

      this.$element = $("<li></li>");
      this.$element.addClass("PanelItem " + this._name);

      var cpos;
      if ( this._align == "right" ) {
        this.$element.addClass("AlignRight");
        cpos = {"left" : "auto", "right" : (self._position + "px")};
      } else {
        this.$element.removeClass("AlignRight");
        cpos = {"right" : "auto", "left" : (self._position + "px")};
      }

      console.log("PanelItem::create()", lopts, cpos);

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
        ev.stopPropagation();
        return false;
      });

      this.setPosition(cpos);

      return this.$element;
    },

    /**
     * PanelItem::run() -- Run PanelItem
     * @return void
     */
    run : function() {
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
      this.$element.html("<img alt=\"\" src=\"" + GetIcon("status/error.png", "16x16") + "\"/><span>" + error + "</span>");

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

      if ( (this._configurable) && _WM ) {
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
     * @param   String    align     Alignment
     * @return  void
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
          API.ui.dialog("confirm", OSjs.Labels.PanelItemRemove, null, function() {
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
        "index"     : this._index,
        "name"      : this._name,
        "opts"      : [],
        "align"     : this._align,
        "position"  : this._position
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
    _is_moving        : false,                            //!< If window was moved recently
    _global_dnd       : false,                            //!< Enable DnD support on window globally
    _bindings         : {},                               //!< Event bindings list
    _hints            : {},                               //!< Keyboard shortcuts

    /**
     * Window::init() -- Constructor
     *
     * @param String   name       Name of window
     * @param String   dialog     Dialog type if any
     * @param Object   largv      Extra win attributes (used to restore from sleep etc)
     * @constructor
     */
    init : function(name, dialog, largv) {
      // Check if we are restoring a window
      var restore = null;
      if ( largv instanceof Object ) {
        if ( largv[name] !== undefined ) {
          restore = largv[name];
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
      this._global_dnd       = false;
      this._is_moving        = false;

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
      this._hints          = {};
      this._bindings       = {
        "die"     : [],
        "focus"   : [],
        "blur"    : [],
        "resize"  : [],
        "keydown" : [],
        "dnd"     : []
      };

      console.group("Window::init()");
      console.log("Name", name);
      console.log("Dialog", dialog);
      console.log("Argv", largv);
      console.groupEnd();
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
        this._bindings   = {};
        this._hints      = {};
        this._is_moving  = false;

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
     * @param   Mixed     args      Arguments to give (optional)
     * @return  bool
     */
    _call : function(mname, args) {
      if ( this._bindings && this._showing ) {
        var fs = this._bindings[mname];
        if ( fs ) {
          var i = 0, l = fs.length;

          for ( i; i < l; i++ ) {
            fs[i](args);
          }

          return fs.length > 0;
        }
      }
      return false;
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
        var el    = null;

        if ( this._is_dialog ) {
          el = $("<div class=\"Window Dialog\"><div class=\"WindowTop\"><div class=\"WindowTopInner\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div><div class=\"WindowTopControllers\"><div class=\"WindowTopController ActionClose\"><span>x</span></div></div></div><div class=\"WindowContent\"><div class=\"WindowContentInner\"><div class=\"DialogContent\"></div><div class=\"DialogButtons\"><button class=\"Choose\" style=\"display:none;\">Choose</button><button class=\"Ok\" style=\"display:none;\">Ok</button><button class=\"Close\">Close</button><button class=\"Cancel\" style=\"display:none;\">Cancel</button></div></div></div></div>");
        } else {
          el = $("<div class=\"Window\"><div class=\"WindowTop\"><div class=\"WindowTopInner\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div><div class=\"WindowTopControllers\"><div class=\"WindowTopController\"><div class=\"ActionMinimize\">&nbsp;</div></div><div class=\"WindowTopController\"><div class=\"ActionMaximize\">&nbsp;</div></div><div class=\"WindowTopController\"><div class=\"ActionClose\">&nbsp;</div></div></div></div><div class=\"WindowContent\"><div class=\"WindowContentInner\"></div></div></div>");
        }

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
              el.find(".WindowTopInner img").attr("src", GetIcon(sprintf("status/gtk-dialog-%s.png", icon), "16x16"));
            } else {
              el.find(".WindowTopInner img").hide();
            }
          }
        } else {
          el.find(".WindowTopInner img").attr("src", this._getIcon());
          el.find(".WindowContentInner").html(this._content);

          el.find(".WindowTopInner img").click(function(ev) {
            if ( self._is_moving )
              return;

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
          })./*mousedown(function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
          }).*/dblclick(function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
          });
        }

        //
        // Events
        //

        el.bind('contextmenu', function(ev) {
          ev.stopPropagation();
          $(document).click(); // TRIGGER GLOBAL CONTEXTMENU

          var t = ev.target || ev.srcElement;
          if ( t.tagName ) {
            var tn = t.tagName.toLowerCase();
            if ( tn  == "textarea" || (tn == "input") ) {
              return true;
            }
          }

          ev.preventDefault();
          return false;
        });

        el.bind('mousedown', function(ev) {
          self.focus();
          if ( ev.which > 1 ) { // Menu only NOTE
            ev.stopPropagation();
            $(document).click(); // TRIGGER GLOBAL CONTEXTMENU
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

        el.find(".WindowTopController").mousedown(function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        }).dblclick(function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        });

        if ( this._is_closable ) {
          el.find(".ActionClose").click(function() {
            if ( self._is_moving )
              return;

            self.close();
          });
        } else {
          el.find(".ActionClose").parent().hide();
        }

        if ( this._is_minimizable ) {
          el.find(".ActionMinimize").click(function() {
            if ( self._is_moving )
              return;

            self._minimize();
          });
        } else {
          el.find(".ActionMinimize").parent().hide();
        }

        if ( this._is_maximizable ) {
          el.find(".ActionMaximize").click(function() {
            if ( self._is_moving )
              return;

            self._maximize();
          });
        } else {
          el.find(".ActionMaximize").parent().hide();
        }

        // Insert into DOM
        if ( _WM )
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
          if ( _WM ) {
            var _ws = _WM.getWindowSpace();
            this._top = _ws.y;
            this._left = _ws.x;
          }
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

              self._is_moving = true;

              return true;
            },
            stop : function() {

              el.removeClass("Blend");
              API.ui.cursor("default");

              self._left = self.$element.offset()['left'];
              self._top = self.$element.offset()['top'];

              setTimeout(function() {
                self._is_moving = false;
              }, 50); // NOTE: This timeout prevents close/min/max while dragging
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
        // DnD
        //
        if ( (OSjs.Compability.SUPPORT_DND) && this._global_dnd ) {
          var dnd_hover = $("<div class=\"TempDnD\"></div>");

          var ___showing = false;
          var ___show = function() {
            if ( ___showing )
              return;

            /*
            var pos = el.offset();
            el.addClass("DND-Over");
            dnd_hover.css({
              "left"  : pos.left    + "px",
              "top"   : pos.top     + "px",
              "width" : el.width()  + "px",
              "height": el.height() + "px"
            });

            $("body").append(dnd_hover);

            ___showing = true;
            */
          };
          var ___hide = function() {
            if ( ___showing ) {
              el.removeClass("DND-Over");
              dnd_hover.remove();
              ___showing = false;
            }
          };

          var dnd = el;// .find(".WindowContent").first();
          dnd.bind("dragover", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.originalEvent.dataTransfer.dropEffect = 'link';
            return false;
          });
          dnd.bind("dragleave", function(ev) {
            ___hide();
            return false;
          });
          dnd.bind("dragenter", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            ___show();
            return false;
          });
          dnd.bind("dragend", function(ev) {
            ___hide();
            return false;
          });
          dnd.bind("drop", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();

            var path  = null;
            var mime  = "";
            var data  = ev.originalEvent.dataTransfer;
            var files = ev.originalEvent.dataTransfer.files;

            if ( data ) {
              var plain = data.getData("text/plain");
              if ( plain ) {
                try {
                  plain = JSON.parse(plain);
                  if ( plain && plain.path ) {
                    path = plain.path;
                    mime = plain.mime || "";
                  }
                } catch ( eee ) {}
              }
            }

            self._call("dnd", {
              // Internal
              'path'  : path,
              'mime'  : mime,

              // Browser
              'files' : files,
              'data'  : data,
              'event' : ev
            });

            ___hide();
            return false;
          });
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

        //
        // Fixes
        //

        el.find("img").each(function(ind, elm) {
          elm = $(elm);
          if ( elm.attr("src").match(/^\/img\/icons\/(\d+x\d+)/) ) {
            var tmp = elm.attr("src").split("/img/icons/").pop().split("/");
            var size = tmp.shift();
            var name = tmp.join("/");
            elm.attr("src", GetIcon(name, size));
          }
        });

        //
        // Finish
        //

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
     * Window::_addObject() -- Fix events and browser bugs from things in 'classes.js'
     * @param   Class     o         Object to check
     * @return  void
     */
    _addObject : function(o) {
      if ( o ) {
        var self = this;
        if ( o instanceof OSjs.Classes.Iconview ) {
          this._bind("keydown", function(a) {
            o.onKeyPress(a.ev, a.key);
          });
        } else if ( o instanceof OSjs.Classes.IFrame ) {
          o.onFocus = function() {
            self.focus();
          };
          /*this.richtext.onBlur = function() {
            self.blur();
          };*/
          this._bind("focus", function() {
            o.focus();
          });
          this._bind("blur", function() {
            o.blur();
          });
        }
      }
    },

    /**
     * Window::_handleGlobalKey() -- This event comes from global handler
     * @see     Core::global_keydown()
     * @return  void
     */
    _handleGlobalKey : function(ev, key) {
      return this._call("keydown", {'ev' : ev, 'key' : key});
    },

    /**
     * Window::show() -- Show window (add)
     * @see WidowManager::addWindow()
     * @return void
     */
    show : function() {
      if ( !this._showing ) {
        if ( _WM ) {
          _WM.addWindow(this);
        }

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
        if ( _WM ) {
          _WM.removeWindow(this, true);
        }

        this._showing = false;
      }
    },

    /**
     * Window::focus() -- Focus window
     * @see WindowManager::focusWindow()
     * @return void
     */
    focus : function() {
      if ( _WM )
        _WM.focusWindow(this);
    },

    /**
     * Window::blur() -- Blur window
     * @see WindowManager::blurWindow()
     * @return void
     */
    blur : function() {
      if ( _WM )
        _WM.blurWindow(this);
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

        console.log("Window::_shuffle()", zi);
      }
    },

    /**
     * Window::_ontop() -- Set Window on-top state
     * @param   bool    t     State
     * @return  void
     */
    _ontop : function(t) {
      console.group("Window::_ontop()", this, t);
      t = (t === undefined) ? this._is_ontop : t;
      if ( t ) {
        if ( this._oldZindex > 0 ) {
          this._shuffle(this._oldZindex);
        } else {
          _TopIndex++;
          this._shuffle(_TopIndex);
        }
      } else {
        _OnTopIndex++;
        this._shuffle(_OnTopIndex, true);
      }

      this._is_ontop = t;

      console.log("state", this._is_ontop);
      console.groupEnd();
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
            if ( _WM )
              _WM.restoreWindow(self);
          }});

          this._is_minimized = false;
        } else {
          this.$element.animate({opacity: 'hide', height: 'hide'}, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            if ( _WM )
              _WM.minimizeWindow(self);
          }});

          this._is_minimized = true;

          if ( this._current ) {
            if ( _WM )
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

          if ( _WM ) {
            var free      = _WM.getWindowSpace();
            this._left    = free.x;
            this._top     = free.y;
            this._width   = free.w;
            this._height  = free.h;
          }

          this.$element.css({
            'top'    : (this._top) + 'px',
            'left'   : (this._left) + 'px'
          }).animate({
            'width'  : (this._width) + "px",
            'height' : (this._height)  + "px"
          }, {'duration' : ANIMATION_SPEED, 'complete' : function() {
            self._call("resize");
          }}, function() {
            if ( _WM )
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
        height = height < WINDOW_MIN_HEIGHT ? WINDOW_MIN_HEIGHT : height;
        if ( this._lock_height > 0 && height > this._lock_height ) {
          height = this._lock_height;
        }

        el.css("height", (height) + "px");
      } else {
        el.css("height", (this._height) + "px");
      }
      if ( width ) {
        width = width < WINDOW_MIN_WIDTH ? WINDOW_MIN_WIDTH : width;
        if ( this._lock_width > 0 && width > this._lock_width ) {
          width = this._lock_width;
        }

        el.css("width", (width) + "px");
      } else {
        el.css("width", (this._width) + "px");
      }
    },

    /**
     * Window::_setTitle() -- Set Window title
     * @param   String    t         Title
     * @return  void
     */
    _setTitle : function(t) {
      if ( t != this._title ) {
        this._title = t;
        this.$element.find(".WindowTopInner span").html(this._title);

        if ( _WM )
          _WM.updateWindow(this);
      }
    },

    /**
     * Window::_getTitle() -- Get Window title
     * @return String
     */
    _getTitle : function() {
      return this._title;
    },

    /**
     * Window::_getIcon() -- Get Window full icon path
     * @param   String    size      Size (default = 16x16)
     * @return  String
     */
    _getIcon : function(size) {
      return GetIcon(this._icon, size || "16x16");
    },

    /**
     * Window::_getWindowId() -- Get Window Id
     * @return String
     */
    _getWindowId : function() {
      return this.$element.attr("id");
    },

    /**
     * Window::_getAttributes() -- Get current Window attributes
     * @return Object
     */
    _getAttributes : function() {
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
   },

    /**
     * Window::_getKeyboardBinding() -- Get current Window keyboard modifiers
     * @return  Mixed
     */
    _getKeyboardBinding : function(mod) {
      return !mod ? this._hints : this._hints[mod] || null;
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

    app    : null,  //!< Application reference (see constructor)

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
     * GtkWindow::destroy() -- Destructor
     * @see Window::destroy()
     * @destructor
     */
    destroy : function() {
      this.app = null;
      this._super();
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
        //el.addClass(this._name);

        if ( this.app ) {
          if ( !el.hasClass(this.app._name) ) {
            el.find(".WindowContentInner").addClass(this.app._name);
          }
        }

        //
        // Menus
        //

        if ( el.find(".GtkMenuBar").length ) {

          el.find(".GtkMenuBar span u").each(function() {
            self._hints[($(this).html()).toUpperCase()] = $(this).parents(".GtkMenuItem");
          });

          el.find(".GtkMenuBar > li").each(function() {
            $(this).mousedown(function(ev) {
              ev.preventDefault();
              return false;
            });
            $(this).click(function(ev) {
              $(document).click(); // TRIGGER GLOBAL CONTEXTMENU
              ev.preventDefault();
              ev.stopPropagation();
              ((new GtkWindowMenu($(this))).create(ev, null, true));
              return false;
            });
          });

          el.find(".GtkMenuBar").click(function(ev) {
            var t = $(ev.target || ev.srcElement);
            if ( $(t).hasClass("GtkMenuBar") ) {
              $(document).click();
            }
          });
        }

        //
        // Elements
        //

        // Slider
        el.find(".GtkScale div").slider();

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
        el.find(".GtkToggleToolButton").click(function() {
          if ( $(this).hasClass("Checked") ) {
            $(this).removeClass("Checked");
          } else {
            $(this).addClass("Checked");
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
        el.find(".GtkSeparatorMenuItem").parent().addClass("Separator");

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

      }

      return el;
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
    $clicked : null,  //!< Clicked elemenet
    _curpos  : -1,    //!< Current item position (index)
    _maxpos  : -1,    //!< Maximum item position (index)

    /**
     * Menu::init() -- Constructor
     * @constructor
     */
    init : function(clicked) {
      this.$element = null;
      this.$clicked = clicked;
      this._curpos  = -1;
      this._maxpos  = -1;

      $(this.$clicked).bind("contextmenu", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      });

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
      this.$clicked = null;
      this._curpos = -1;
      this._maxpos = -1;

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
     * @param  DOMEvent   ev        DOM Event
     * @param  Object     iter      Menu Item Iter
     * @param  int        index     Item index
     * @return DOMElement
     */
    _createItem : function(ev, iter, index) {
      var self = this;

      //console.log("Menu::_createItem()", iter);

      var li = $("<li class=\"GUIMenuItem\"></li>");
      var src;
      var disabled = false;

      if ( iter.icon ) {
        src = GetIcon(iter.icon, "16x16");
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

      li.hover(function() {
        self._curpos = index;
        $(this).parents("ul").find("li").removeClass("hover");
        $(this).addClass("hover");
      }, function() {
        $(this).removeClass("hover");
      });

      if ( (iter.items instanceof Array) ) {
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

      this._maxpos++;

      return li;
    },

    /**
     * Menu::_createSeparator() -- Create a new Menu Separator Item
     * @param  DOMEvent   ev      DOM Event
     * @return DOMElement
     */
    _createSeparator : function(ev, index) {
      var li = $("<li class=\"GUIMenuItem\"></li>");
      li.append("<hr />");
      this._maxpos++;
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

      var i = 0, l = menu.length;
      for ( i; i < l; i++ ) {
        iter = menu[i];
        if ( menu[i] == "---" ) {
          ul.append(this._createSeparator(ev, i));
        } else {
          ul.append(this._createItem(ev, menu[i], i));
        }
      }

      div.append("<input type=\"text\" class=\"GUIMenuFocus\" />");
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

      this._curpos = -1;
      this._maxpos = -1;

      var div = this._createMenu(ev, menu);
      this.$element = div;

      this.$element.bind("contextmenu", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      });

      if ( show === true ) {
        this.show(ev, this.$element);
      }

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
      this._curpos = -1;

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

        try {
          el.find(".GUIMenuFocus").focus();
        } catch ( eee ) {}
      }, 0);
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
    },

    /**
     * Menu::handleGlobalKey() -- Handle Globak Key events
     * @return  void
     */
    handleGlobalKey : function(ev, key) {
      if ( key == "up" ) {
        if ( this._curpos > 0 ) {
          $(this.$element.find("li").get(this._curpos)).trigger("mouseleave");
          this._curpos--;
        }
        $(this.$element.find("li").get(this._curpos)).trigger("mouseenter");

      } else if ( key == "down" ) {
        if ( this._curpos < this._maxpos ) {
          $(this.$element.find("li").get(this._curpos)).trigger("mouseleave");
          this._curpos++;
        }
        $(this.$element.find("li").get(this._curpos)).trigger("mouseenter");

      } else if ( key == "enter" ) {
        if ( this._curpos >= 0 )
          $(this.$element.find("li").get(this._curpos)).click();

        this.handleGlobalClick(ev);
      }

      return false;
    }

  }); // @endclass

  /**
   * GtkWindowMenu -- Menu for GtkMenuBar in Windows
   *
   * @extends Menu
   * @class
   */
  var GtkWindowMenu = Menu.extend({
    /**
     * GtkWindowMenu::init() -- Constructor
     * @constructor
     */
    init : function(clicked) {
      this._super(clicked);
    },

    /**
     * GtkWindowMenu::destroy() -- Destructor
     * @destructor
     */
    destroy : function() {
      if ( this.$element ) {
        this.$element.hide();
      }

      this.$element = null;
      this.$clicked = null;
      this._curpos  = -1;
      this._maxpos  = -1;

      if ( _Menu ) {
        if ( _Menu !== this ) {
          _Menu.destroy();
        }
        _Menu = null;
      }
    },

    /**
     * GtkWindowMenu::_createItem() -- Create a new Menu Item
     * @return DOMElement
     */
    _createItem : function(ev, iter, index) {
      var disabled = iter.hasClass(".Disabled");

      iter.hover(function() {
        self._curpos = index;
        $(this).parents("ul").find("li").removeClass("hover");
        $(this).addClass("hover");
      }, function() {
        $(this).removeClass("hover");
      });
      iter.mousedown(function(ev) {
        ev.preventDefault();
      });

      if ( !disabled ) {
        var self = this;
        iter.click(function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          self.destroy();
          return false;
        });
      }
    },

    /**
     * GtkWindowMenu::create() -- Create a new Menu
     * @return DOMElement
     */
    create : function(ev, menu, show) {
      this._curpos  = -1;
      this._maxpos  = -1;
      this.$element = this.$clicked.find("> .GtkMenu");
      var els = this.$element.find("li");

      var i = 0, l = els.size();
      for ( i; i < l; i++ ) {
        this._createItem(ev, $(els.get(i)), i);
        this._maxpos++;
      }

      this.$element.bind("contextmenu", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      });

      if ( show === true )
        this.show(ev, this.$element);

      return this.$element;
    },

    /**
     * GtkWindowMenu::show() -- Display the menu
     * @return void
     */
    show : function(ev, el) {
      $(el).show();

      try {
        el.find(".GUIMenuFocus").focus();
      } catch ( eee ) {}
    }
  });

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
      this._width    = 250;
      this._height   = 120;
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

      // Focus default button
      if ( this._is_dialog == "confirm" ) {
        this.$element.find(".DialogButtons .Cancel").focus();
      } else {
        this.$element.find(".DialogButtons .Close").focus();
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
      var el = this._super(id, mcallback);

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

      return el;
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
  var __CoreBoot__ = function() {

    console.log("                                                                               ");
    console.log("                        ____      ____                                         ");
    console.log("                       6MMMMb    6MMMMb\     68b                               ");
    console.log("                      8P    Y8  6M'    `     Y89                               ");
    console.log("                     6M      Mb MM           ___   ____                        ");
    console.log("                     MM      MM YM.          `MM  6MMMMb\                      ");
    console.log("                     MM      MM  YMMMMb       MM MM'    `                      ");
    console.log("                     MM      MM      `Mb      MM YM.                           ");
    console.log("                     MM      MM       MM      MM  YMMMMb                       ");
    console.log("                     YM      M9       MM      MM      `Mb                      ");
    console.log("                      8b    d8  L    ,M9 68b  MM L    ,MM                      ");
    console.log("                       YMMMM9   MYMMMM9  Y89  MM MYMMMM9                       ");
    console.log("                                              MM                               ");
    console.log("                                          (8) M9                               ");
    console.log("                                           YMM9                                ");
    console.log("                                                                               ");
    console.log("                      Copyright (c) 2012 Anders Evenrud                        ");
    console.log("                                                                               ");

    _StartStamp = ((new Date()).getTime());
    _Core       = new Core();


    /*
    var v = new OSjs.Classes.VFSPersistent(function() {
      v.ls("/", function(result) {
        console.log("ls", "/", result);
      });
    });
    console.log("Instance", v);
    */


    return true;
  }; // @endfunction

  /**
   * Restart OS.js
   * @return void
   * @function
   */
  var __CoreReboot__ = function() {
    window.onbeforeunload = null;
    $(window).unbind("beforeunload"); // NOTE: Required!
    window.location.reload();
  }; // @endfunction

  /**
   * Stop OS.js
   * @return bool
   * @function
   */
  var __CoreShutdown__ = function() {
    if ( _Core && _Core.running ) {
      _Core.destroy();
      _Core     = null;

      try {
        delete OSjs;
      } catch (e) {}

      window.onbeforeunload = null;
      $(window).unbind("beforeunload"); // NOTE: Required!
    }

    return true;
  }; // @endfunction

  /**
   * window::unload() -- Browser event: Unload
   * @see __CoreShutdown__()
   * @function
   */
  $(window).unload(function() {
    return __CoreShutdown__();
  });

  /**
   * window::ready() -- Browser event: Content loaded
   * @see __CoreBoot__()
   * @function
   */
  $(document).ready(function() {
    if ( !OSjs.Compability.SUPPORT_LSTORAGE ) {
      alert(OSjs.Labels.CannotStart);
      return false;
    }
    return __CoreBoot__();
  });

})($);
