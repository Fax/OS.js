<?php
/*!
 * @file
 * Contains IndexViewContoller Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-22
 */

require PATH_APPS . "/SystemAbout.class.php";
require PATH_APPS . "/SystemUser.class.php";
require PATH_APPS . "/SystemSettings.class.php";
require PATH_APPS . "/SystemLogout.class.php";

require PATH_APPS . "/ApplicationClock.class.php";
require PATH_APPS . "/ApplicationFileManager.class.php";
require PATH_APPS . "/ApplicationTerminal.class.php";
require PATH_APPS . "/ApplicationTextpad.class.php";

/**
 * WindowManager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class WindowManager
{

  protected $_oTime = null;
  protected $_oZone = null;
  protected static $__Instance;

  protected function __construct() {

    $user       = $this->getUser();
    $zone       = $user->getTimezone();
    $tz         = new DateTimeZone($zone);
    $now        = new DateTime("now", $tz);

    date_default_timezone_set($zone);
    session_start();

    $this->_oTime = $now;
    $this->_oZone = $tz;
  }

  public static function initialize() {
    if ( !self::$__Instance ) {
      self::$__Instance = new WindowManager();
    }
    return self::$__Instance;
  }

  public static function getSettings() {
    $apps = Array();

    foreach ( Application::$Registered as $c => $opts ) {
      if ( !constant("{$c}::APPLICATION_SYSTEM") ) {
        $apps[$c] = Array(
          "title" => constant("{$c}::APPLICATION_TITLE"),
          "icon"  => constant("{$c}::APPLICATION_ICON"),
          "mime"  => $opts["mime"]
        );
      }
    }

    $pitems = Array(
      "PanelItemSeparator" => Array(
        "title"       => "Separator",
        "description" => "Separator",
        "icon"        => "/img/icons/32x32/actions/gtk-remove.png"
      ),
      "PanelItemClock" => Array(
        "title"       => "Clock",
        "description" => "Clock with date",
        "icon"        => "/img/icons/32x32/status/appointment-soon.png"
      ),
      "PanelItemMenu" => Array(
        "title"       => "Menu",
        "description" => "Display a menu",
        "icon"        => "/img/icons/32x32/actions/window_new.png"
      ),
      "PanelItemWindowList" => Array(
        "title"       => "Window List",
        "description" => "Display desktop windows",
        "icon"        => "/img/icons/32x32/apps/xfwm4.png"
      ),
      "PanelItemDock" => Array(
        "title"       => "Launcher Dock",
        "description" => "Application launcher dock",
        "icon"        => "/img/icons/32x32/actions/system-run.png"
      ),
      "PanelItemWeather" => Array(
        "title"       => "Weather",
        "description" => "Weather (geolocation) forecast",
        "icon"        => "/img/icons/32x32/status/weather-few-clouds.png"
      )
    );

    return Array(
      "desktop.wallpaper.path" => Array(
        "type"  => "filename",
        "value" => "/System/Wallpapers/go2cxpb.png"
      ),
      "desktop.theme" => Array(
        "type"    => "array",
        "options" => Array("dark", "light"),
        "value"   => "dark"
      ),
      "desktop.panel.items" => Array(
        "type" => "list",
        "items" => Array(
          Array("PanelItemMenu", Array(), "left"),
          Array("PanelItemSeparator", Array(), "left"),
          Array("PanelItemWindowList", Array(), "left"),
          Array("PanelItemClock", Array(), "right"),
          Array("PanelItemSeparator", Array(), "right"),
          Array("PanelItemDock", Array(Array(
            Array(
              "title"  => "About",
              "icon"   => "actions/gtk-about.png",
              "launch" => "SystemAbout"
            ),
            Array(
              "title"  => "System Settings",
              "icon"   => "categories/applications-system.png",
              "launch" => "SystemSettings"
            ),
            Array(
              "title"  => "User Information",
              "icon"   => "apps/user-info.png",
              "launch" => "SystemUser"
            ),
            Array(
              "title"  => "Save and Quit",
              "icon"   => "actions/gnome-logout.png",
              "launch" => "SystemLogout"
            )
          )), "right"),
          Array("PanelItemSeparator", Array(), "right"),
          Array("PanelItemWeather", Array(), "right")
        ),
      ),
      "desktop.panel.position" => Array(
        "type" => "array",
        "options" => Array("top", "bottom"),
        "value" => "top"
      ),
      "system.app.registered" => Array(
        "type"    => "array",
        "options" => $apps,
        "hidden"  => true
      ),
      "system.panel.registered" => Array(
        "type"    => "array",
        "options" => $pitems,
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
            "settings" => self::getSettings(),
            "config"   => Array(
              "cacne" => ENABLE_CACHE
            )
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

            $success = ($result === true) || is_array($result);
            $error   = $success ? null : (is_string($result) ? $result : "Unknown error");
            $result  = $success ? $result : null;

            $json = Array("success" => $success, "error" => $error, "result" => $result);
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
          } else if ( $method == "rename" ) {
            list($path, $src, $dst) = $argv;

            if ( ApplicationAPI::rename($path, $src, $dst) ) {
              $json['result'] = $dst;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to rename '{$src}'";
            }
          } else if ( $method == "delete" ) {
            if ( ApplicationAPI::delete($argv) ) {
              $json['result'] = $argv;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to rename '{$src}'";
            }
          } else if ( $method == "readurl" ) {
            if ( $ret = ApplicationAPI::readurl($argv) ) {
              $json['result'] = $ret;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to rename '{$src}'";
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
