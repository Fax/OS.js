<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Core API Class
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
 * @created 2012-05-15
 */

/**
 * API -- Core API Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class API
{
  /////////////////////////////////////////////////////////////////////////////
  // AJAX STUFF
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var doPOST 'action' argument method mapping
   */
  protected static $__POSTEvents = Array(
    "bug"               => "doBugReport",
    "boot"              => "doBoot",
    "shutdown"          => "doShutdown",
    "snapshotList"      => "doSnapshotList",
    "snapshotSave"      => "doSnapshotSave",
    "snapshotLoad"      => "doSnapshotLoad",
    "snapshotDelete"    => "doSnapshotDelete",
    "updateCache"       => "doCacheUpdate",
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
   * Call a static function by name and argument(s)
   * @param  String     $name       Static Function Name
   * @param  Mixed      $arguments  Function Call Arguments
   * @return Mixed
   */
  public static function __callStatic($name, $arguments) {
    $arguments = reset($arguments); // NOTE: Bugfix for assicative arrays
    if ( (isset(self::$__POSTEvents[$arguments['action']])) && ($pev = self::$__POSTEvents[$arguments['action']]) ) {
      $method   = "_";
      $continue = true;

      // Check for dependencies here, generate method name
      if ( is_array($pev) ) {
        $method .= $pev['method'];
        foreach ( $pev['depend'] as $v ) {
          if ( !isset($arguments[$v]) ) {
            $continue = false;
            break;
          }
        }
      } else {
        $method .= $pev;
      }

      // Run method
      if ( $continue && method_exists(__CLASS__, $method) ) {
        if ( ENABLE_LOGGING )
          Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($name, $method, $arguments))));

        return self::$method($arguments, Core::get());
      }

      return true;
    }

    return false;
  }

  /**
   * Check if API method requires a user
   * @return bool
   */
  public static final function MethodRequresUser($m) {
    return in_array($m, self::$__POSTEventsSecure);
  }

  /**
   * Check if given API method exists
   * @return bool
   */
  public static final function MethodExists($m) {
    return isset(self::$__POSTEvents[$m]);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CORE AJAX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'Bug Report' AJAX Call
   * @return  Array
   */
  protected static final function _doBugReport(Array $args, Core $inst = null) {
    if ( BUGREPORT_ENABLE && isset($args['data']) ) {
      require_once PATH_LIB . "/IMAP.php";
      $d = new DateTime();
      $success = false;

      $template = <<<EOHTML
<h1>OS.js Bugreport</h1>
<hr />
Date: %s

<h2>Exception</h2>
<div>
  <pre>%s</pre>
</div>

<h2>User info:</h2>
<div>
  <pre>%s</pre>
</div>
EOHTML;

      if ( floatval(phpversion()) < 5.4 ) {
        $html = sprintf($template,
                        $d->format("r"),
                        htmlspecialchars(json_encode($args['error'])),
                        htmlspecialchars(json_encode($args['data'])));
      } else {
        $html = sprintf($template,
                        $d->format("r"),
                        htmlspecialchars(json_encode($args['error'], JSON_PRETTY_PRINT)),
                        htmlspecialchars(json_encode($args['data'], JSON_PRETTY_PRINT)));
      }

      $myargs = Array(
        "from"        => BUGREPORT_MAIL_FROM,
        "to"          => BUGREPORT_MAIL_TO,
        "subject"     => BUGREPORT_MAIL_SUBJECT,
        "attachments" => Array(),
        "plain"       => "",
        "html"        => $html
      );

      $success = @SMTP::send(IMAPMail::compose($myargs), Array(
        "host"      => BUGREPORT_SMTP_HOST,
        "username"  => BUGREPORT_SMTP_USER,
        "password"  => BUGREPORT_SMTP_PASS
      ), Array());
    }

    return Array(
      "success" => $success
    );
  }

  /**
   * Do a 'Core Boot' AJAX Call
   * @return Array
   */
  protected static final function _doBoot(Array $args, Core $inst = null) {
    if ( isset($args['compability']) && (is_array($args['compability'])) ) {
      Session::setCompabilityFlags($args['compability']);
    }
    if ( isset($args['navigator']) && (is_array($args['navigator'])) ) {
      Session::setBrowserFlags($args['navigator']);
    }

    return Array(
      "success" => true,
      "result" => Array(
        "environment" => Array(
          "bugreporting"=> BUGREPORT_ENABLE,
          "production"  => ENV_PRODUCTION,
          "demo"        => ENV_DEMO,
          "cache"       => ENABLE_CACHE,
          "connection"  => ENV_PLATFORM,
          "ssl"         => ENV_SSL,
          "hosts"       => Array(
            "server"        => sprintf("%s:%s", SERVER_HOST, SERVER_PORT),
            "frontend"      => HOST_FRONTEND,
            "api"           => HOST_API,
            "static"        => HOST_STATIC
          ),
          "api_format"  => API_FORMAT,
          "autologin"   => Array(
            "enable"       => AUTOLOGIN_ENABLE,
            "username"     => AUTOLOGIN_USERNAME,
            "password"     => AUTOLOGIN_PASSWORD,
            "confirmation" => AUTOLOGIN_CONFIRMATION
          ),
        )
      )
    );
  }

  /**
   * Do a 'Core Cache Update' AJAX Call
   * @return Array
   */
  protected static final function _doCacheUpdate(Array $args, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      return Array(
        "success" => true,
        "result" => Array(
          "packages" => PackageManager::GetPackages($user)
        )
      );
    }
    return false;
  }

  /**
   * Do a 'Core Settings' AJAX Call
   * @return Array
   */
  protected static final function _doSettings(Array $args, Core $inst = null) {
    $json = Array();
    if ( ($inst instanceof Core) ) {
      $user   = $inst->getUser();
      $failed = true;

      try {
        $registry = (isset($args['registry'])) ? JSON::decode($args['registry'], true) : Array();
      } catch ( Exception $e ) {
        error_log("Failed to load registry somehow in _doSettings()");
        $registry = Array();
      }

      if ( is_array($registry)  ) {
        $locale = Array(
          "locale_location" => $registry["system.locale.location"],
          "locale_time"     => $registry["system.locale.time-format"],
          "locale_date"     => $registry["system.locale.date-format"],
          "locale_stamp"    => $registry["system.locale.timestamp-format"],
          "locale_language" => $registry["system.locale.language"]
        );

        if ( $locale["locale_language"] == "default" ) {
          $locale["locale_language"] = DEFAULT_LANGUAGE;
        } else if ( $locale["locale_language"] == "auto" ) {
          $locale["locale_language"] = Core::getBrowserLanguage();
        }

        $inst->setLocale($locale);
        Session::setLocale($locale);

        $user->last_registry = $registry;

        $failed = false;
      }

      if ( !$failed && User::save($user, Array("last_registry")) ) {
        $json['success'] = true;
        $json['result']  = true;
      } else {
        $json['error'] = _("Failed to save user!");
      }
    }
    return $json;
  }

  /**
   * Do a 'Core Shutdown' AJAX Call
   * @return Array
   */
  protected static final function _doShutdown(Array $args, Core $inst = null) {
    $registry  = isset($args['registry'])  ? $args['registry']   : ""; // JSON STRING here
    $session   = isset($args['session'])   ? $args['session']    : ""; // JSON STRING here
    $save      = isset($args['save'])      ? ($args['save'] == "true" ? true : false) : false;

    $json['result']   = true;
    $json['success']  = true;

    if ( ($user = $inst->getUser()) ) {
      $only = Array("last_logout", "logged_in");
      if ( $registry ) {
        $user->last_registry  = JSON::decode($registry, true);
        $only[] = "last_registry";
      }
      if ( $save ) {
        $user->last_session   = JSON::decode($session, true);
        $only[] = "last_session";
      }
      $user->last_logout = new DateTime();
      $user->logged_in   = 0;

      $json = Array();
      if ( User::save($user, $only) ) {
        Session::clearSession();

        $json['success'] = true;
      } else {
        $json['result']  = false;
        $json['success'] = false;
        $json['error']   = _("Failed to save user!");
      }
      return $json;
    }

    return false;
  }

  /**
   * Do a 'User Login' AJAX Call
   * @return Array
   */
  protected static final function _doUserLogin(Array $args, Core $inst = null) {
    $json     = Array();
    $uname    = "";
    $upass    = "";
    $time     = isset($args['time'])       ? $args['time']      : null;

    if ( isset($args['form']) ) {
      $uname = isset($args['form']['username']) ? trim($args['form']['username']) : "";
      $upass = isset($args['form']['password']) ? trim($args['form']['password']) : "";
    }

    $user = null;
    if ( $uname && $upass ) {
      if ( !$user = User::getByUsername($uname) ) {
        if ( ENV_DEMO ) {
          if ( !$user = User::createNew($uname, $upass) ) {
            $json['error'] = _("The username already exists!");
          }
        } else {
          $json['error'] = _("Check username and password!");
        }
      } else {
        if ( $user->password != $upass ) {
          $json['error'] = _("Check username and password!");
        }
      }
    }

    if ( $user && !isset($json['error']) ) {
      if ( !($registry = $user->last_registry) ) {
        $registry = Array();
      }

      // Session restore is handled by frontend
      if ( !($session = $user->last_session) ) {
        $session = User::getDefaultSession();
      }

      $json['success'] = true;
      $json['result'] = Array(
        "user"          => Array(
          "sid"           => session_id(),
          "info"          => $user->getUserInfo(),
          "duplicate"     => $user->isLoggedIn()
        ),
        "registry"      => Array(
          "revision"      => 1,
          "settings"      => User::getDefaultRegistry(),
          "packages"      => PackageManager::GetPackages($user),
          "preload"       => ResourceManager::getPreloads(!(ENV_PRODUCTION && CACHE_COMBINED_RESOURCES)),
        ),
        "restore"       => Array(
          "registry"      => $registry,
          "session"       => $session
        ),
        "locale"        => Array(
          "system"        => DEFAULT_LANGUAGE,
          "browser"       => Core::getBrowserLanguage(),
        )
      );

      $user->last_login       = new DateTime();
      $user->last_session_id  = session_id();
      if ( !$user->isLoggedIn() ) {
        $user->logged_in      = 1;
      }

      User::save($user, Array("last_login", "last_session_id", "logged_in"));
    }

    Session::setUser(($user && ($user instanceof User)) ? $user : null);

    return $json;
  }

  /**
   * Do a 'User Logout' AJAX Call
   * @return Array
   */
  protected static final function _doUserLogout(Array $args, Core $inst = null) {
    $json = Array();
    if ( ($user = $inst->getUser()) ) {
      $user->last_logout = new DateTime();
      $user->logged_in   = 0;

      if ( User::save($user, Array("last_logout", "logged_in")) ) {
        $json['success']  = true;
      } else {
        $json['error'] = _("Failed to save user!");
      }

      Session::clearSession();
    }
    return $json;
  }

  /**
   * Do a 'Package Operation' AJAX Call
   * @return Array
   */
  protected static final function _doPackageOperation(Array $args, Core $inst = null) {
    $json = Array();
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
    return $json;
  }

  /**
   * Do a 'Save Session Snapshot' AJAX Call
   * @return Array
   */
  protected static final function _doSnapshotSave(Array $args, Core $inst = null) {
    $json = Array();
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
    return $json;
  }

  /**
   * Do a 'Load Session Snapshot' AJAX Call
   * @return Array
   */
  protected static final function _doSnapshotLoad(Array $args, Core $inst = null) {
    $json = Array();
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

    return $json;
  }

  /**
   * Do a 'Delete Session Snapshot' AJAX Call
   * @return Array
   */
  protected static final function _doSnapshotDelete(Array $args, Core $inst = null) {
    $json = Array();
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

    return $json;
  }

  /**
   * Do a 'List Session Snapshot' AJAX Call
   * @return Array
   */
  protected static final function _doSnapshotList(Array $args, Core $inst = null) {
    $json = Array();
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
    return $json;
  }

  /**
   * Do a 'User Operation' AJAX Call
   * @return Array
   */
  protected static final function _doUserOperation(Array $args, Core $inst = null) {
    $json = Array();
    if ( ($user = $inst->getUser()) ) {
      $error  = null;
      $result = null;
      $arg    = isset($args['method']) ? $args['method']     : null;
      $ruid   = isset($args['uid'])    ? ((int)$args['uid']) : null;

      if ( !ENV_DEMO && $user->isAdmin() ) {
        switch ( $arg ) {
          case "list" :
            $result = Array();
            foreach ( User::getUserList() as $u ) {
              $result[] = $u->getUserInfo();
            }
          break;
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

    return $json;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PACKAGE AJAX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'Application Event' AJAX Call
   * @return Array
   */
  protected static final function _doApplicationEvent(Array $args, Core $inst = null) {
    $action   = $args['action'];
    $instance = $args['instance'];
    $result   = null;
    $json     = Array();

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
      $json['success'] = ($result !== false && $result !== null); //($result === true) || is_array($result);
      $json['error']   = $json['success'] ? null : (is_string($result) ? $result : _("Unknown error")); //FIXME
      $json['result']  = $json['success'] ? $result : null;

      if ( ENABLE_DEBUGGING ) {
        $json['debug'] = Array(
          "input"  => $args,
          "result" => $result
        );
      }
    } else {
      $json['error'] = _("Failed to handle application");
    }

    return $json;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SERVICE AJAX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'Service' AJAX Call
   * @return Array
   */
  protected static final function _doService(Array $args, Core $inst = null) {
    require_once PATH_LIB . "/Services.php";

    $json  = Array();
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

    return $json;
  }

  /////////////////////////////////////////////////////////////////////////////
  // WRAPPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'VFS' AJAX Call
   * @return Array
   */
  protected static final function _doVFS(Array $args, Core $inst = null) {
    $method = $args['method'];
    $argv   = $args['args'];
    $json   = Array();

    try {
      $json['result']  = call_user_func_array(Array("VFS", $method), Array($argv));
      if ( ($json['result']) !== false ) {
        $json['success'] = true;
      } else {
        $json['error']   = _("Failed to perform operation or permission denied!");
      }
    } catch ( Exception $e ) {
      $json['result'] = false;
      $json['error']  = $e->getMessage();
    }

    return $json;
  }

}

?>
