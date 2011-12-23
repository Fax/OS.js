<?php
/*!
 * @file
 * Contains Core Class
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
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

  protected $_oTime = null;   //!< Current DateTime
  protected $_oZone = null;   //!< Current DateTimeZome

  /**
   * @var Current instance
   */
  protected static $__Instance;

  /**
   * @constructor
   */
  protected function __construct() {

    /*$user       = $this->getUser();
    $zone       = $user->getTimezone();*/
    $zone       = "Europe/Oslo";
    $tz         = new DateTimeZone($zone);
    $now        = new DateTime("now", $tz);

    date_default_timezone_set($zone);
    //session_start();

    $this->_oTime = $now;
    $this->_oZone = $tz;
  }

  /**
   * Initialize Core (Create Instance)
   * @return Core
   */
  public static function initialize() {
    if ( !self::$__Instance ) {
      self::$__Instance = new Core();
    }
    return self::$__Instance;
  }

  /**
   * Get the Settings Array
   * @return Array
   */
  public static function getSettings() {

    $panel = Array(
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
    );

    return SettingsManager::getSettings(Array(
      "system.app.registered" => Array(
        "options" => Application::$Registered
      ),
      "system.panel.registered" => Array(
        "options" => Panel::$Registered
      ),
      "desktop.panel.items" => Array(
        "items" => $panel
      )
    ));
  }

  /**
   * Get current Instance
   * @return Core
   */
  public static function get() {
    return self::$__Instance;
  }

  /**
   * Get Cursor StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getCursor($theme, $compress) {
    $path = sprintf("%s/cursor.%s.css", ($compress ? PATH_JSBASE_COMPRESSED : PATH_JSBASE), $theme);
    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }
    return false;
  }

  /**
   * Get Theme StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getTheme($theme, $compress) {
    $path = sprintf("%s/theme.%s.css", ($compress ? PATH_JSBASE_COMPRESSED : PATH_JSBASE), $theme);
    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }
    return false;
  }

  /**
   * Get Font StyleSheet
   * @param  String   $font         Font name
   * @param  bool     $compress     Enable Compression
   * @package OSjs.Sources
   * @return String
   */
  public static function getFont($font, $compress) {
    $italic = $font == "FreeSerif" ? "Italic" : "Oblique";
    $bos    = $font == "Sansation" ? "/*" : "";
    $boe    = $font == "Sansation" ? "*/" : "";

    $header = <<<EOCSS
@charset "UTF-8";
/*!
 * Font Stylesheet
 *
 * @package OSjs.Fonts
 * @author Anders Evenrud <andersevenrud@gmail.com>
 */

EOCSS;


    $template = <<<EOCSS
@font-face {
  font-family : CustomFont;
  src: url('/media/System/Fonts/%1\$s.ttf');
}
@font-face {
  font-family : CustomFont;
  font-weight : bold;
  src: url('/media/System/Fonts/%1\$sBold.ttf');
}
@font-face {
  font-family : CustomFont;
  font-style : italic;
  src: url('/media/System/Fonts/%1\$s{$italic}.ttf');
}
{$bos}
@font-face {
  font-family : CustomFont;
  font-weight : bold;
  font-style : italic;
  src: url('/media/System/Fonts/%1\$sBold{$italic}.ttf');
}
{$boe}

body {
  font-family : CustomFont, Arial;
}
EOCSS;

    $css = sprintf($template, addslashes($font));
    if ( $compress ) {
      $css = preg_replace("/\s/", "", $css);
      $css = preg_replace('%/\s*\*.*?\*/\s*%s', '', $css);
    }
    return ($header . $css);
  }

  /**
   * Get a resource file (CSS or JS) [with compression]
   * @param  bool     $resource     Resource file?
   * @param  String   $input        Filename
   * @param  String   $application  Application name (If any)
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getFile($resource, $input, $application, $compress) {
    $content = "";

    $type = preg_match("/\.js$/", $input) ? "js" : "css";
    $res  = str_replace(Array("../", "./"), Array("", ""), $input);
    $res  = addslashes($res);
    $app  = $application ? str_replace(Array("../", "./"), Array("", ""), $application): null;

    if ( $compress ) {
      if ( $resource ) {
        $path = sprintf("%s/%s", PATH_RESOURCES_COMPRESSED, $res);
      } else {
        $path = sprintf("%s/%s", PATH_JSBASE_COMPRESSED, $res);
      }
    } else {
      if ( $resource ) {
        if ( $app ) {
          $path = sprintf("%s/%s/%s", PATH_APPS, $application, $res);
        } else {
          $path = sprintf("%s/%s", PATH_RESOURCES, $res);
        }
      } else {
        $path = sprintf("%s/%s", PATH_JSBASE, $res);
      }
    }

    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }

    return false;
  }

  /**
   * Get the current Core User
   * @return User
   */
  public function getUser() {
    /*if ( !class_exists("UserQuery") ) {
      Propel::init(PROPEL_CONFIG);
    }*/

    return UserQuery::create()->findPK(1);
  }

  /**
   * Do a GET request
   * @param  Array    $args   Argument list
   * @return Mixed
   */
  public function doGET(Array $args) {
    /*
    // Upload "POST"
    if ( isset($args['ajax']) && isset($args['action']) && isset($args['qqfile']) && isset($args['path']) ) {
      return json_encode(ApplicationVFS::upload($args['path']));
    }
    */

    return false;
  }

  /**
   * Do a POST request
   * @param  Array    $args   Argument list
   * @return Mixed
   */
  public function doPOST(Array $args) {
    if ( sizeof($args) ) {

      // Make sure DB is running
      Propel::init(PROPEL_CONFIG);

      // API Operations
      if ( isset($args['ajax']) ) {
        $json = Array("success" => false, "error" => "Unknown error", "result" => null);

        if ( !isset($args['action']) ) {
          $json['error'] = "No action given!";
          return json_encode($json);
        }

        /**
         * MAIN
         */
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
        } else if ( $args['action'] == "init" ) {
          Application::init(APPLICATION_BUILD);

          $json = Array("success" => true, "error" => null, "result" => Array(
            "settings" => self::getSettings(),
            "config"   => Array(
              "cache" => ENABLE_CACHE
            )
          ));
        }

        /**
         * USER
         */
        else if ( $args['action'] == "user" ) {
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
        }

        /**
         * APPLICATIONS
         */
        else if ( $args['action'] == "load" ) {
          if ( $app = Application::Load($args['app']) ) {
            $json['success'] = true;
            $json['result']  = $app;
            $json['error']   = null;
          } else {
            $json['error'] = "Application '{$args['app']}' does not exist";
          }
        } else if ( $args['action'] == "register" ) {
          if ( Application::Register($args['uuid'], $args['instance']) ) {
            $json['success'] = true;
            $json['error']   = null;
          } else {
            $json['error'] = "Failed to flush application";
          }
        } else if ( $args['action'] == "flush" ) {
          if ( Application::Flush($args['uuid']) ) {
            $json['success'] = true;
            $json['error']   = null;
          } else {
            $json['error'] = "Failed to flush application";
          }
        } else if ( $args['action'] == "event" ) {
          if ( ($result = Application::Handle($args['uuid'], $args['action'], $args['instance'])) ) {
            $json['success'] = ($result === true) || is_array($result);
            $json['error']   = $json['success'] ? null : (is_string($result) ? $result : "Unknown error");
            $json['result']  = $json['success'] ? $result : null;
          } else {
            $json['error'] = "Failed to handle application";
          }
        }

        /**
         * Services
         */
        else if ( $args['action'] == "service" && isset($args['arguments']) ) {
          require PATH_PROJECT_LIB . "/Services.php";

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
                $json['error']   = "Failed to call Service!";
              }
            } else {
              $json['error']   = "Failed to construct Service!";
            }
          } else {
            $json['error']   = "Missing some arguments!";
          }
        }

        /**
         * VFS
         */
        else if ( $args['action'] == "call" && isset($args['method']) && isset($args['args']) ) {
          $method = $args['method'];
          $argv   = $args['args'];

          if ( $method == "read" ) {
            if ( is_string($argv) ) {
              if ( ($content = ApplicationVFS::cat($argv)) !== false ) {
                $json['result'] = $content;
                $json['success'] = true;
              } else {
                $json['error'] = "Path does not exist";
              }
            } else {
              $json['error'] = "Invalid argument";
            }
          } else if ( $method == "write" ) {
            // TODO: Overwrite parameter
            if ( ApplicationVFS::put($argv) ) {
              $json['success'] = true;
              $json['result'] = true;
            } else {
              $json['error'] = "Failed to save '{$argv['file']}'";
            }
          } else if ( $method == "readdir" ) {
            $path    = $argv['path'];
            $ignores = isset($argv['ignore']) ? $argv['ignore'] : null;
            $mime    = isset($argv['mime']) ? ($argv['mime'] ? $argv['mime'] : Array()) : Array();

            if ( ($items = ApplicationVFS::ls($path, $ignores, $mime)) !== false) {
              $json['result'] = $items;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read directory '{$argv['path']}'";
            }
          } else if ( $method == "rename" ) {
            list($path, $src, $dst) = $argv;

            if ( ApplicationVFS::mv($path, $src, $dst) ) {
              $json['result'] = $dst;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to rename '{$src}'";
            }
          } else if ( $method == "delete" ) {
            if ( ApplicationVFS::rm($argv) ) {
              $json['result'] = $argv;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to delete '{$argv}'";
            }
          } else if ( $method == "mkdir" ) {
            if ( $res = ApplicationVFS::mkdir($argv) ) {
              $json['result'] = $res;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to create directory '{$argv}'";
            }
          } else if ( $method == "readurl" ) {
            if ( $ret = ApplicationAPI::readurl($argv) ) {
              $json['result'] = $ret;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read '{$argv}'";
            }
          } else if ( $method == "readpdf" ) {
            $tmp  = explode(":", $argv);
            $pdf  = $tmp[0];
            $page = isset($tmp[1]) ? $tmp[1] : -1;

            if ( $ret = ApplicationAPI::readPDF($pdf, $page) ) {
              $json['result'] = $ret;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read '{$argv}'";
            }

          } else if ( $method == "fileinfo" ) {
            if ( $ret = ApplicationVFS::file_info($argv) ) {
              $json['result'] = $ret;
              $json['success'] = true;
            } else {
              $json['error'] = "Failed to read '{$argv}'";
            }
          }
        }/* else {
            if ( function_exists($method) ) {
              $json['result']  = call_user_func_array($method, $argv);
              $json['success'] = true;
            } else {
              $json['error'] = "Function does not exist";
            }
          }
        }*/

        return json_encode($json);
      }
    }

    return false;
  }

}

?>
