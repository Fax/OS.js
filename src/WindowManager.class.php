<?php
/*!
 * @file
 * Contains IndexViewContoller Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-22
 */

require "apps/SystemUser.class.php";
require "apps/SystemSettings.class.php";
require "apps/SystemLogout.class.php";

// TODO: On-Demand
require "apps/ApplicationClock.class.php";
require "apps/ApplicationFilemanager.class.php";
require "apps/ApplicationTextpad.class.php";
require "apps/ApplicationBrowser.class.php";
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

  public static function initialize() {
    return new WindowManager();
  }

  public function getUser() {
    return UserQuery::create()->findPK(1);
  }

  public function doGET(Array $args) {
    // Upload "POST"
    if ( isset($args['ajax']) && isset($args['action']) && isset($args['qqfile']) ) {
      return json_encode(ApplicationAPI::upload());
    }

    return false;
  }

  public function doPOST(Array $args) {

    if ( sizeof($args) ) {

      if ( isset($args['ajax']) ) {
        $json = Array("success" => false, "error" => "Unknown error", "result" => null);

        if ( $args['action'] == "boot" ) {

        } else if ( $args['action'] == "logout" ) {

          if ( $args['session'] && $args['save'] ) {
            $this->getUser()->setSavedSession(json_encode($args['session']));
          } else {
            $this->getUser()->setSavedSession(null);
          }

          $this->getUser()->save();

          $json['success'] = true;
          $json['result'] = true;
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
          $apps = Array();

          foreach ( DesktopApplication::$Registered as $c ) {
            if ( !constant("{$c}::APP_HIDDEN") ) {
              $apps[$c] = Array(
                "title" => constant("{$c}::APP_TITLE"),
                "icon" => constant("{$c}::APP_ICON")
              );
            }
          }

          $json = Array("success" => true, "error" => null, "result" => Array(
            "applications"   => $apps,
            "settings"       => UserSetting::getUserSettings($this->getUser()),
            "mime_handlers"  => Array(
              "text/*"  => "ApplicationTextpad",
              "image/*" => "ApplicationViewer",
              "video/*" => "ApplicationViewer"
            ),
            "session"        => json_decode($this->getUser()->getSavedSession())
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
              $path = PATH_PROJECT_HTML . "/media/" . $argv;
              if ( file_exists($path) && is_file($path) ) {
                $json['result'] = file_get_contents($path);
                $json['success'] = true;
              } else {
                $json['error'] = "Path does not exist";
              }
            } else {
              $json['error'] = "Invalid argument";
            }
          } else if ( $method == "write" ) {

            $path = PATH_PROJECT_HTML . "/media/" . $argv['file'];
            if ( file_exists($path) && is_file($path) ) {
              if ( file_put_contents($path, $argv['content']) ) {
                $json['success'] = true;
                $json['result'] = true;
              } else {
                $json['error'] = "Failed to save '{$argv['file']}'";
              }
            } else {
              $json['error'] = "Failed to read '{$argv['file']}'";
            }

          } else if ( $method == "readdir" ) {
            if ( ($items = ApplicationAPI::readdir($argv)) !== false) {
              $json['result'] = $items;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read '$argv'";
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
