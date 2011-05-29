<?php
/*!
 * @file
 * Contains IndexViewContoller Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-22
 */

require "apps/SystemAbout.class.php";
require "apps/SystemUser.class.php";
require "apps/SystemSettings.class.php";
require "apps/SystemLogout.class.php";

require "apps/ApplicationClock.class.php";
require "apps/ApplicationDraw.class.php";
require "apps/ApplicationFilemanager.class.php";
require "apps/ApplicationTextpad.class.php";
require "apps/ApplicationTerminal.class.php";
require "apps/ApplicationViewer.class.php";

/**
 * WindowManager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class WindowManager
{

  protected static $__Instance;

  protected function __construct() {
    date_default_timezone_set("Europe/Oslo");
    session_start();
  }

  public static function initialize() {
    if ( !self::$__Instance ) {
      self::$__Instance = new WindowManager();
    }
    return self::$__Instance;
  }

  public static function getSettings() {
    $apps = Array();

    foreach ( DesktopApplication::$Registered as $c ) {
      if ( !constant("{$c}::APP_HIDDEN") ) {
        $apps[$c] = Array(
          "title" => constant("{$c}::APP_TITLE"),
          "icon" => constant("{$c}::APP_ICON")
        );
      }
    }

    return Array(
      "desktop.wallpaper.path" => Array(
        "type"  => "filename",
        "value" => "/System/Wallpapers/rqofigt.png"
      ),
      "desktop.theme" => Array(
        "type"    => "array",
        "options" => Array("dark", "light"),
        "value"   => "dark"
      ),
      "system.app.registered" => Array(
        "type"    => "array",
        "options" => $apps,
        "hidden"  => true
      ),
      "system.app.handlers" => Array(
        "type" => "array",
        "hidden" => true,
        "options" => Array(
          "text/*"  => "ApplicationTextpad",
          "image/*" => "ApplicationViewer",
          "video/*" => "ApplicationViewer",
          "application/ogg" => "ApplicationViewer"
        )
      )
    );
  }

  public static function get() {
    return self::$__Instance;
  }

  public function getUser() {
    return UserQuery::create()->findPK(1);
  }

  public function doGET(Array $args) {
    // Upload "POST"
    if ( isset($args['ajax']) && isset($args['action']) && isset($args['qqfile']) && isset($args['path']) ) {
      return json_encode(ApplicationAPI::upload($args['path']));
    }

    return false;
  }

  public function doPOST(Array $args) {
    if ( sizeof($args) ) {

      if ( isset($args['ajax']) ) {
        $json = Array("success" => false, "error" => "Unknown error", "result" => null);

        if ( $args['action'] == "boot" ) {

        } else if ( $args['action'] == "shutdown" ) {
          $json['success'] = true;
          $json['result'] = true;

          $settings = isset($args['settings']) ? $args['settings'] : Array();
          $session  = isset($args['session'])  ? $args['session']  : Array();

          if ( $user = $this->getUser() ) {
            $user->setSavedSettings(json_encode($settings));
            $user->setSavedSession(json_encode($session));
            $user->save();

            $json['result'] = true;
            $json['success'] = true;
          }
        } else if ( $args['action'] == "user" ) {
          if ( $user = $this->getUser() ) {
            $json['success'] = true;
            $json['result'] = Array(
              "Username"   => $user->getUsername(),
              "Privilege"  => $user->getPrivilegeType(),
              "Name"       => $user->getName(),
              "Email"      => $user->getEmail(),
              "Company"    => $user->getCompanyName(),
              "Cellphone"  => $user->getCellphone()
            );
          } else {
            $json['error'] = "You are not logged in!";
          }
        } else if ( $args['action'] == "load" ) {
          $class = $args['app'];
          if ( class_exists($class) ) {
            $res = new $class();
            $json = Array("success" => true, "error" => null, "result" => $res->__toJSON());
          } else {
            $json['error'] = "Application '$class' does not exist";
          }
        } else if ( $args['action'] == "init" ) {

          $json = Array("success" => true, "error" => null, "result" => Array(
            "settings" => self::getSettings()
          ));
        } else if ( $args['action'] == "register" ) {
          if ( $uuid = $args['uuid'] ) {
            $_SESSION[$uuid] = $args['instance'];
          }
        } else if ( $args['action'] == "flush" ) {
          if ( $uuid = $args['uuid'] ) {
            unset($_SESSION[$uuid]);
          }
        } else if ( $args['action'] == "event" ) {
          if ( ($uuid = $args['uuid']) && ($action = $args['action']) ) {
            $instance = $args['instance'];
            $cname    = $instance['name'];
            $aargs    = $instance['args'];
            $action   = $instance['action'];

            $result = $cname::Event($uuid, $action, $aargs ? $aargs : Array());
            $json = Array("success" => true, "error" => null, "result" => $result);
          }
        } else if ( $args['action'] == "call" && isset($args['method']) && isset($args['args']) ) {
          $method = $args['method'];
          $argv   = $args['args'];

          if ( $method == "read" ) {
            if ( is_string($argv) ) {
              if ( ($content = ApplicationAPI::readfile($argv)) !== false ) {
                $json['result'] = $content;
                $json['success'] = true;
              } else {
                $json['error'] = "Path does not exist";
              }
            } else {
              $json['error'] = "Invalid argument";
            }
          } else if ( $method == "write" ) {
            if ( ApplicationAPI::writefile($argv) ) {
              $json['success'] = true;
              $json['result'] = true;
            } else {
              $json['error'] = "Failed to save '{$argv['file']}'";
            }
          } else if ( $method == "readdir" ) {
            $path    = $argv['path'];
            $ignores = isset($argv['ignore']) ? $argv['ignore'] : null;
            $mime    = isset($argv['mime']) ? ($argv['mime'] ? $argv['mime'] : Array()) : Array();

            if ( ($items = ApplicationAPI::readdir($path, $ignores, $mime)) !== false) {
              $json['result'] = $items;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read '{$argv['path']}'";
            }
          } else {
            if ( function_exists($method) ) {
              $json['result']  = call_user_func_array($method, $argv);
              $json['success'] = true;
            } else {
              $json['error'] = "Function does not exist";
            }
          }
        }

        return json_encode($json);
      }
    }

    return false;
  }

}

?>
