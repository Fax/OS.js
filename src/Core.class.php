<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Core Class
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
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-05-22
 */

/**
 * Core -- Main OS.js interfacing Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
class Core
{
  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_oUser = null;       //!< Current session User
  protected $_aLocale = Array();  //!< Current session Locale

  /**
   * @var Current instance
   */
  protected static $__Instance;

  /**
   * @var doPOST 'action' argument method mapping
   */
  protected static $__POSTEvents = Array(
    "boot"              => "doBoot",
    "shutdown"          => "doShutdown",
    "snapshotList"      => "doSnapshotList",
    "snapshotSave"      => "doSnapshotSave",
    "snapshotLoad"      => "doSnapshotLoad",
    "snapshotDelete"    => "doSnapshotDelete",
    "updateCache"       => "doCacheUpdate",
    "init"              => "doInit",
    "settings"          => "doSettings",
    "login"             => "doUserLogin",
    "logout"            => "doUserLogout",
    "user"              => "doUserOperation",
    "event"             => "doApplicationEvent",
    "package"           => "doPackageOperation",
    "service"           => Array(
      "method" => "doService",
      "depend" => Array("arguments")
    ),
    "call"          => Array(
      "method" => "doVFS",
      "depend" => Array("method", "args")
    )
  );

  /**
   * @var doPOST 'action' argument security mapping (session required)
   */
  protected static $__POSTEventsSecure = Array(
    "shutdown", "snapshotList", "snapshotLoad", "snapshotSave", "snapshotDelete", "updateCache",
    "init", "settings", "logout", "user", "event", "package", "service", "call"
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct() {
    // Start session
    Session::initSession();

    // Set user from session
    if ( $u = Session::getUser() ) {
      $this->setUser($u);
    }

    // Set timezone from session
    if ( $l = Session::getLocale() ) {
      $this->setLocale($l);
    } else {
      Session::setLocale($this->setLocale(null));
    }

    self::$__Instance = $this;
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize Core (Create Instance)
   * @return Core
   */
  public static function initialize() {
    return self::$__Instance ? self::$__Instance : (new Core());
  }

  /**
   * Get current Instance
   * @return Core
   */
  public static function get() {
    return self::$__Instance;
  }

  /////////////////////////////////////////////////////////////////////////////
  // MEMBER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a GET request
   * @param  Array    $args   Argument list
   * @return Mixed
   */
  public function doGET(Array $args) {
    return false;
  }

  /**
   * Do a POST request
   * @param  String    $args    Argument list (raw data)
   * @param  bool      $is_raw  Format if raw data
   * @return Mixed
   */
  public function doPOST($data, $is_raw = false) {
    $args = Array();

    if ( $data && $is_raw ) {
      try {
        $args = (Array)JSON::decode($data, true);
      } catch ( Exception $e ) {
        error_log($raw);
      }
    } else if ( is_array($data) ) {
      $args = $data;
    }

    if ( sizeof($args) ) {

      // Require a specific parameter to trigger this function
      if ( isset($args['ajax']) ) {
        // Default output
        $json = Array(
          "success" => false,
          "error"   => _("Unknown error"),
          "result"  => null
        );

        // Check if we are logged in
        $uid        = 0;
        $user       = null;
        $logged_in  = 0;
        if ( (($user = Core::get()->getUser()) && ($uid = $user->id) ) ) {
          $user->heartbeat_at = new DateTime();
          User::save($user, Array("heartbeat_at"));

          $logged_in = 1;
        }

        // Map actions to methods
        if ( isset($args['action']) ) {

          // Check if a user session is required!
          if ( in_array($args['action'], self::$__POSTEventsSecure) ) {
            if ( !$logged_in ) {
              $json["error"] = _("You are not logged in!");

              $json["exception"] = Array(
                "type"  => "session",
                "value" => "user"
              );
              return JSON::encode($json);
            }
          }

          if ( !ENV_PRODUCTION ) {
            if ( $args['action'] == "debug" ) {
              return JSON::encode(Array(
                "post"    => $_POST,
                "get"     => $_GET,
                "session" => Session::getSession(),
                "core"    => $this
              ));
            }
          }

          if ( (isset(self::$__POSTEvents[$args['action']])) && ($pev = self::$__POSTEvents[$args['action']]) ) {
            $method   = "_";
            $continue = true;

            // Check for dependencies here, generate method name
            if ( is_array($pev) ) {
              $method .= $pev['method'];
              foreach ( $pev['depend'] as $v ) {
                if ( !isset($args[$v]) ) {
                  $continue = false;
                  break;
                }
              }
            } else {
              $method .= $pev;
            }

            // Run method
            if ( $continue && method_exists($this, $method) ) {
              self::$method($args, $json, $this);
            }
          } else {
            $json['error'] = _("Unknown action given!");
          }
        } else {
          $json['error'] = _("No action given!");
        }

        // Remove error if successfull
        if ( $json['success'] !== false && $json['result'] !== null ) {
          $json['error'] = null;
        }

        return JSON::encode($json);
      }
    }

    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // AJAX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'Core Boot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doBoot(Array $args, Array &$json, Core $inst = null) {
    $json['success'] = true;
    $json['result']  = Array(
      "production"  => ENV_PRODUCTION,
      "demo"        => ENV_DEMO,
      "cache"       => ENABLE_CACHE,
      "preload"     => ResourceManager::getAllPreloads("boot"),
      "registry"    => User::getDefaultRegistry()
    );
  }

  /**
   * Do a 'Package Operation' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doPackageOperation(Array $args, Array &$json, Core $inst = null) {
    if ( ($user = $inst->getUser()) && ($user->isInGroup(User::GROUP_PACKAGES)) ) {
      if ( $args['operation'] == "install" ) {
        $archive = $args['archive'];
        if ( $result = PackageManager::InstallPackage($archive, $user, true) ) {
          $json['success'] = true;
          $json['result']  = true;
        } else {
          $json['error'] = sprintf(_("Failed to install '%s'. Archive, Permission or Duplicate error!"), basename($archive));
        }
      } else if ( $args['operation'] == "uninstall" ) {
        $package = $args['package']['name'];
        if ( $result = Package::FindPackage($package, $user) ) {
          if ( $result["found"] && $result["user"] ) {
            if ( PackageManager::UninstallPackage($package, $user, true) ) {
              $json['success'] = true;
              $json['result']  = true;
            } else {
              $json['error'] = sprintf(_("Failed to uninstall '%s'. Package or permission error!"), $package);
            }
          } else {
            $json['error'] = sprintf(_("Failed to uninstall '%s'. Package not found!"), $package);
          }
        }
      }
    }
  }

  /**
   * Do a 'Core Cache Update' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doCacheUpdate(Array $args, Array &$json, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      $json['success'] = true;
      $json['result']  = Array(
        "packages" => PackageManager::GetPackages($user)
      );
    }
  }

  /**
   * Do a 'Core Init' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doInit(Array $args, Array &$json, Core $inst = null) {
    $json['success'] = true;
    $json['result']  = true;
  }

  /**
   * Do a 'Core Settings' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSettings(Array $args, Array &$json, Core $inst = null) {
    if ( ($inst instanceof Core) ) {
      $user = $inst->getUser();

      if ( (isset($args['registry'])) && ($registry = JSON::decode($args['registry'], true)) ) {
        $locale = Array(
          "locale_location" => $registry["system.locale.location"],
          "locale_time"     => $registry["system.locale.time-format"],
          "locale_date"     => $registry["system.locale.date-format"],
          "locale_stamp"    => $registry["system.locale.timestamp-format"],
          "locale_language" => $registry["system.locale.language"]
        );

        $inst->setLocale($locale);
        Session::setLocale($locale);

        $user->last_registry = $registry;
      }

      if ( User::save($user, Array("last_registry")) ) {
        $json['success'] = true;
        $json['result']  = true;
      } else {
        $json['error'] = _("Failed to save user!");
      }
    }
  }

  /**
   * Do a 'Core Shutdown' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doShutdown(Array $args, Array &$json, Core $inst = null) {
    $session  = isset($args['session'])  ? $args['session']  : Array();
    $save     = isset($args['save'])     ? ($args['save'] == "true" ? true : false) : false;

    $json['result']   = true;
    $json['success']  = true;

    if ( ($user = $inst->getUser()) ) {
      $only = Array("last_logout", "logged_in");
      if ( $save ) {
        $user->last_session = JSON::decode($session);
        $only[] = "last_session";
      }
      $user->last_logout = new DateTime();
      $user->logged_in   = 0;

      if ( User::save($user, $only) ) {
        $json['success'] = true;
      } else {
        $json['result']  = false;
        $json['success'] = false;
        $json['error']   = _("Failed to save user!");
      }
    }

    Session::clearSession();
  }

  /**
   * Do a 'Save Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotSave(Array $args, Array &$json, Core $inst = null) {
    if ( (($inst instanceof Core) && ($user = $inst->getUser())) ) {
      $name     = "";
      $session  = Array();

      if ( isset($args['session']) ) {
        $name = $args['session']['name'];
        try {
          $session  = JSON::encode($args['session']['data']);
        } catch ( Exception $e ) {
          $session = JSON::encode(Array(
            "registry" => Array(),
            "session"  => Array()
          ));
        }
      }

      if ( $name && $session ) {
        if ( !($snapshot = Session::snapshotLoad($user, $name)) ) {
          if ( ($snapshot = Session::snapshotSave($user, $name, $session)) ) {
            $json['success'] = true;
            $json['result']  = $snapshot;
          } else {
            $json['error'] = _("Cannot save snapshot. Failed to save in database!");
          }
        } else {
          $json['error'] = _("Cannot save snapshot. Snapshot name already used!");
        }
      } else {
        $json['error'] = _("Cannot save snapshot. No input data given!");
      }
    } else {
      $json['error'] = _("Cannot save snapshot. No running session found!");
    }
  }

  /**
   * Do a 'Load Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotLoad(Array $args, Array &$json, Core $inst = null) {
    if ( (($inst instanceof Core) && ($user = $inst->getUser())) ) {
      $name     = "";
      if ( isset($args['session']) ) {
        $name     = $args['session']['name'];
      }

      if ( $name ) {
        if ( ($snapshot = Session::snapshotLoad($user, $name)) ) {

          $user->last_registry = $snapshot->session_data->registry;
          $user->last_session  = $snapshot->session_data->session;
          $user->logged_in     = 0;

          if ( User::save($user, Array("last_registry", "last_session", "logged_in")) ) {
            $json['success'] = true;
            $json['result']  = true;
          } else {
            $json['error'] = _("Cannot load snapshot. Failed to save to database!");
          }
        } else {
          $json['error'] = _("Cannot load snapshot. Failed to load from database!");
        }
      } else {
        $json['error'] = _("Cannot load snapshot. No input data given!");
      }
    } else {
      $json['error'] = _("Cannot load snapshot. No running session found!");
    }
  }

  /**
   * Do a 'Delete Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotDelete(Array $args, Array &$json, Core $inst = null) {
    if ( (($inst instanceof Core) && ($user = $inst->getUser())) ) {
      $name     = "";
      if ( isset($args['session']) ) {
        $name     = $args['session']['name'];
      }

      if ( $name ) {
        if ( Session::snapshotDelete($user, $name) ) {
          $json['success'] = true;
          $json['result']  = true;
        } else {
          $json['error'] = _("Cannot delete snapshot. Failed to delete from database!");
        }
      } else {
        $json['error'] = _("Cannot delete snapshot. No input data given!");
      }
    } else {
      $json['error'] = _("Cannot delete snapshot. No running session found!");
    }
  }

  /**
   * Do a 'List Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotList(Array $args, Array &$json, Core $inst = null) {
    if ( (($inst instanceof Core) && ($user = $inst->getUser())) ) {
      if ( ($list = Session::snapshotList($user)) ) {
        $snapshots = Array();
        foreach ( $list as $l ) {
          $snapshots[] = $l->session_name;
        }
        $json['success'] = true;
        $json['result']  = $snapshots;
      } else {
        $json['error'] = _("Cannot list snapshots. Failed to list from database!");
      }
    } else {
      $json['error'] = _("Cannot list snapshots. No running session found!");
    }
  }

  /**
   * Do a 'User Login' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogin(Array $args, Array &$json, Core $inst = null) {
    $uname  = "demo";
    $upass  = "demo";
    $time   = isset($args['time'])   ? $args['time'] : null;
    $create = isset($args['create']) ? $args['create'] === "true" : false;

    if ( isset($args['form']) ) {
      if ( isset($args['form']['username']) ) {
        $uname = $args['form']['username'];
      }
      if ( isset($args['form']['password']) ) {
        $upass = $args['form']['password'];
      }
    }

    $user = null;
    $errored = true;
    if ( $create ? ($user = User::createNew($uname, $upass)) : ($user = User::getByUsername($uname)) ) {
      if ( $user->password == $upass ) {
        $init_language      = "default"; // NOTE: Should be set to user ? used as 'SystemLanguage'
        $browser_language   = self::_getBrowserLanguage();
        $resources          = ResourceManager::getAllPreloads("login");
        $packages           = PackageManager::GetPackages($user);


        if ( !($registry = $user->last_registry) ) {
          $registry = User::getDefaultRegistry(true);
        }
        if ( !($session = $user->last_session) ) {
          $session = User::getDefaultSession();
        }

        $json['success'] = true;
        $json['result'] = Array(
          "user"          => $user->getUserInfo(),
          "registry"      => $registry,
          "session"       => $session,
          "packages"      => $packages,
          "preload"       => Array(
            "resources" => $resources
          ),
          "sid"           => session_id(),
          "lang_system"   => DEFAULT_LANGUAGE,
          "lang_user"     => $init_language,
          "lang_browser"  => $browser_language,
          "duplicate"     => $user->isLoggedIn()
        );

        $user->last_login       = new DateTime();
        $user->last_session_id  = session_id();
        if ( !$user->isLoggedIn() ) {
          $user->logged_in      = 1;
        }

        User::save($user, Array("last_login", "last_session_id", "logged_in"));

        $errored = false;
      }
    }

    if (  $errored ) {
      if ( $create ) {
        $json['error'] = _("The username already exists!");
      } else {
        $json['error'] = _("Check username and password!");
      }
    }

    Session::setUser(($user && ($user instanceof User)) ? $user : null);
  }

  /**
   * Do a 'User Logout' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogout(Array $args, Array &$json, Core $inst = null) {
    if ( ($user = $inst->getUser()) ) {
      $user->last_logout = new DateTime();
      $user->logged_in   = 0;

      if ( User::save($user, Array("last_logout", "logged_in")) ) {
        $json['success']  = true;
      } else {
        $json['error'] = _("Failed to save user!");
      }

      //Session::clearSession();
    }

  }

  /**
   * Do a 'User Operation' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserOperation(Array $args, Array &$json, Core $inst = null) {
    if ( !ENV_DEMO && ($user = $inst->getUser()) ) {
      $error  = null;
      $result = null;
      $arg    = isset($args['type']) ? $args['type'] : null;
      $ruid   = isset($args['uid'])  ? ((int)$args['uid']) : null;

      if ( $user->isAdmin() ) {
        switch ( $arg ) {
          case "create" :
            $new_user = User::createDefault();
            $new_user->username   = $args['form']['username'];
            $new_user->password   = $args['form']['password'];
            $new_user->privilege  = (int) $args['form']['privilege'];
            $new_user->real_name  = $args['form']['real_name'];
            $new_user->created_at = new DateTime();

            if ( ($new_user = User::save($new_user)) ) {
              $result = Array(
                "instance"  => (array) $new_user,
                "formatted" => $new_user->getUserInfo()
              );
            } else {
              $error = _("Failed to create user!");
            }
          break;

          case "update" :
            if ( $ruid ) {
              if ( $new_user = User::getById($ruid) ) {
                $new_user->username   = $args['form']['username'];
                $new_user->password   = $args['form']['password'];
                $new_user->privilege  = (int) $args['form']['privilege'];
                $new_user->real_name  = $args['form']['real_name'];

                if ( ($new_user = User::save($new_user)) ) {
                  $result = Array(
                    "instance"  => (array) $new_user,
                    "formatted" => $new_user->getUserInfo()
                  );
                } else {
                  $error = _("Failed to create user!");
                }
              } else {
                $error = _("Invalid user!");
              }
            } else {
              $error = _("Invalid user!");
            }
          break;

          case "delete" :
            if ( $ruid ) {
              if ( $new_user = User::getById($ruid) ) {
                $result = false; // TODO
              } else {
                $error = _("Invalid user!");
              }
            } else {
              $error = _("Invalid user!");
            }
          break;

          case "info" :
          default     :
            $result = $user->getUserInfo();
          break;
        }
      } else {
        if ( !$arg || $arg == "info" ) {
          $result = $user->getUserInfo();
        } else {
          $error = _("You do not have the privileges to perform this operation!");
        }
      }

      if ( $result ) {
        $json['success'] = true;
        $json['result']  = $result;
      } else {
        if ( $error ) {
          $json['error'] = $error;
        }
      }
    }
  }

  /**
   * Do a 'Application Event' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationEvent(Array $args, Array &$json, Core $inst = null) {
    $action   = $args['action'];
    $instance = $args['instance'];
    $result   = null;

    if ( $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = preg_replace("/[^A-z0-9]/", "", $instance['name']);
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];
        $root     = PATH_PACKAGES . "/{$cname}/{$cname}.class.php";

        // Make sure call is from a system package
        $packages = PackageManager::GetSystemPackages();
        if ( isset($packages[$cname]) ) {
          if ( file_exists($root) ) {
            require_once $root;
          }

          $result = $cname::Event($action, $aargs); // NOTE: Do not use 'class_exists'
        }
      }
    }

    if ( $result ) {
      $json['success'] = ($result === true) || is_array($result);
      $json['error']   = $json['success'] ? null : (is_string($result) ? $result : _("Unknown error"));
      $json['result']  = $json['success'] ? $result : null;
    } else {
      $json['error'] = _("Failed to handle application");
    }
  }

  /**
   * Do a 'Service' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doService(Array $args, Array &$json, Core $inst = null) {
    if ( !class_exists("Service") ) {
      require PATH_LIB . "/Services.php";
    }

    $iargs = $args['arguments'];
    if ( isset($iargs['type']) && isset($iargs['uri']) && isset($iargs['data']) && isset($iargs['options']) && isset($iargs['timeout']) ) {
      if ( $s = Service::createFromType($iargs['type']) ) {
        $uri      = $iargs['uri'];
        $data     = $iargs['data'];
        $timeout  = $iargs['timeout'];
        $options  = $iargs['options'];

        if ( $res = $s->call($uri, $data, $timeout, $options) ) {
          $json['success'] = true;
          $json['error']   = null;
          $json['result']  = $res;
        } else {
          $json['error']   = _("Failed to call Service!");
        }
      } else {
        $json['error']   = _("Failed to construct Service!");
      }
    } else {
      $json['error']   = _("Missing some arguments!");
    }
  }

  /**
   * Do a 'VFS' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doVFS(Array $args, Array &$json, Core $inst = null) {
    $method = $args['method'];
    $argv   = $args['args'];

    if ( method_exists("VFS", $method) ) {
      try {
        $json['result']  = call_user_func_array(Array("VFS", $method), Array($argv));
        if ( ($json['result']) !== false ) {
          $json['success'] = true;
        } else {
          throw new ExceptionVFS(ExceptionVFS::GENERIC, Array($argv));
        }
      } catch ( ExceptionVFS $e ) {
        $json['success'] = false;
        $json['error'] = $e->getMessage();
      }
    }
  }

  /**
   * Get browser language by looking at headers
   * @return String
   */
  protected static final function _getBrowserLanguage() {
    $browser_language = DEFAULT_LANGUAGE;

    if ( function_exists('apache_request_headers') ) {
      if ( $headers = apache_request_headers() ) {
        if ( isset($headers["Accept-Language"]) ) {
          if ( $langs = explode(",", $headers["Accept-Language"]) ) {
            $browser_language = reset($langs);
            $browser_language = explode(";", $browser_language);
            $browser_language = str_replace("-", "_", end($browser_language));
          }
        }
      }
    }

    return $browser_language;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Set the User of current session
   * @param   User    $u      User Object (or NULL)
   * @return  void
   */
  protected function setUser(User $u = null) {
    $this->_oUser = $u;
  }

  /**
   * Set the current session locale
   * @param   Array     $locale       Locale
   * @return  Array
   */
  protected function setLocale(Array $locale = null) {
    if ( is_array($locale) ) {
      $this->_aLocale = $locale;
    } else {
      $this->_aLocale = Array(
        "locale_location" => SettingsManager::$Settings['system.locale.location']['value'],
        "locale_date"     => SettingsManager::$Settings['system.locale.date-format']['value'],
        "locale_time"     => SettingsManager::$Settings['system.locale.time-format']['value'],
        "locale_stamp"    => SettingsManager::$Settings['system.locale.timestamp-format']['value'],
        "locale_language" => SettingsManager::$Settings['system.locale.language']['value']
      );
    }

    date_default_timezone_set($this->_aLocale["locale_location"]);

    //
    // i18n
    //

    if ( ENABLE_GETTEXT ) {
      // Figure out language
      $lang = $this->_aLocale["locale_language"];
      if ( $lang == "default" ) {
        $lang = self::_getBrowserLanguage();
      }

      $ulang = "{$lang}.utf8";
      if ( !defined("LC_MESSAGES") ) {
        define("LC_MESSAGES", $lang);
      }

      // Env locale
      putenv("LANG={$ulang}");
      putenv("LANGUAGE={$ulang}");
      putenv("LC_ALL={$ulang}");

      // System locale
      setlocale(LC_ALL,       $ulang);
      setlocale(LC_MESSAGES,  $ulang);
      setlocale(LC_CTYPE,     $ulang);

      // Gettext locale
      bind_textdomain_codeset(GETTEXT_DOMAIN, "UTF-8");
      bindtextdomain(GETTEXT_DOMAIN, PATH_LOCALE);
      textdomain(GETTEXT_DOMAIN);
    }

    return $this->_aLocale;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the current session user
   * @return User
   */
  public final function getUser() {
    return $this->_oUser;
  }

  /**
   * Get the current session locale
   * @return Array
   */
  public final function getLocale() {
    $loc  = $this->_aLocale;
    $lang = $loc["locale_language"];
    if ( $lang == "default" ) {
      $lang = self::_getBrowserLanguage();
    } else {
      $lang = "{$lang}";
    }

    $loc['locale_language'] = $lang;

    return $loc;
  }

}

?>
