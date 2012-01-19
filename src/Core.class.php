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
  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  const DEFAULT_UID   = 1;    //!< Default User ID

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  //protected $_oTime = null;   //!< Current session DateTime
  //protected $_oZone = null;   //!< Current session DateTimeZome
  protected $_oUser = null;   //!< Current session User
  protected $_sTime = null;   //!< Current session TimeZone

  /**
   * @var Current instance
   */
  protected static $__Instance;

  /**
   * @var doPOST 'action' argument method mapping
   */
  protected static $__POSTEvents = Array(
    "boot"      => "doBoot",
    "shutdown"  => "doShutdown",
    "init"      => "doInit",
    "login"     => "doUserLogin",
    "logout"    => "doUserLogout",
    "user"      => "doUserInfo",
    "load"      => "doApplicationLoad",
    "register"  => "doApplicationRegister",
    "flush"     => "doApplicationFlush",
    "event"     => "doApplicationEvent",
    "service"   => Array(
      "method" => "doService",
      "depend" => Array("arguments")
    ),
    "call"      => Array(
      "method" => "doVFS",
      "depend" => Array("method", "args")
    )
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct() {
    $this->setTime(DEFAULT_TIMEZONE);
    session_start();
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize Core (Create Instance)
   * @return Core
   */
  public static function initialize() {
    $i = null;
    if ( self::$__Instance ) {
      $i = (self::$__Instance);
    } else {
      $i = (self::$__Instance = new Core());
    }

    if ( isset($_SESSION['user']) ) {
      $i->setUser($_SESSION['user']);
    }

    return $i;
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
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $path = sprintf("%s/%scursor.%s.css", PATH_JSBASE, ($compress ? "_min/" : ""), $theme);
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
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $path = sprintf("%s/%stheme.%s.css", PATH_JSBASE, ($compress ? "_min/" : ""), $theme);
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
    $font   = preg_replace("/[^a-zA-Z0-9]/", "", $font);
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

    $res   = preg_replace("/\.+/", ".", preg_replace("/[^a-zA-Z0-9\.]/", "", $input));
    $app   = $application ? preg_replace("/[^a-zA-Z0-9]/", "", $application) : null;
    $type  = preg_match("/\.js$/", $res) ? "js" : "css";

    if ( $compress ) {
      if ( $resource ) {
        if ( $app ) {
          $path = sprintf("%s/%s/_min/%s", PATH_APPS, $application, $res);
        } else {
          $path = sprintf("%s/_min/%s", PATH_RESOURCES, $res);
        }
      } else {
        $path = sprintf("%s/_min/%s", PATH_JSBASE, $res);
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
   * @param  Array    $args   Argument list
   * @return Mixed
   */
  public function doPOST(Array $args) {
    if ( sizeof($args) ) {

      // Require a specific parameter to trigger this function
      if ( isset($args['ajax']) ) {
        // Default output
        $json = Array(
          "success" => false,
          "error"   => "Unknown error",
          "result"  => null
        );

        // Map actions to methods
        if ( isset($args['action']) ) {
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
            $json['error'] = "Unknown action given!";
          }
        } else {
          $json['error'] = "No action given!";
        }

        // Remove error if successfull
        if ( $json['success'] !== false && $json['result'] !== null ) {
          $json['error'] = null;
        }

        return json_encode($json);
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
  }

  /**
   * Do a 'Core Init' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doInit(Array $args, Array &$json, Core $inst = null) {
    Application::init(APPLICATION_BUILD);

    $json = Array("success" => true, "error" => null, "result" => Array(
      "settings" => self::getSettings(),
      "config"   => Array(
        "cache" => ENABLE_CACHE
      ),
      "time"    => gmdate(DateTime::RFC1123)
    ));
  }

  /**
   * Do a 'Core Shutdown' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doShutdown(Array $args, Array &$json, Core $inst = null) {
    $settings = isset($args['settings']) ? $args['settings'] : Array();
    $session  = isset($args['session'])  ? $args['session']  : Array();

    $json['result']   = true;
    $json['success']  = true;

    $_SESSION['user'] = null;
  }

  /**
   * Do a 'User Login' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogin(Array $args, Array &$json, Core $inst = null) {
    $uname = "demo";
    $upass = "demo";
    $time  = isset($args['time']) ? $args['time'] : null;

    if ( isset($args['form']) ) {
      if ( isset($args['form']['username']) ) {
        $uname = $args['form']['username'];
      }
      if ( isset($args['form']['password']) ) {
        $upass = $args['form']['password'];
      }
    }

    $user = null;
    if ( $user = User::getByUsername($uname) ) {
      if ( $user->password == $upass ) {
        $json['success'] = true;
        $json['result'] = Array(
          "user"    => $user->getUserInfo()
        );
      }
    } else {
      $uid = self::DEFAULT_UID;
      $json['success'] = true;
      if ( ($user = User::getById($uid)) || ($user = User::createDefault()) ) {
        $json['result'] = Array(
          "user"    => $user->getUserInfo()
        );
      }
    }

    if ( $user && ($user instanceof User) ) {
      $_SESSION['user'] = $user;
    } else {
      $_SESSION['user'] = null;
    }
  }

  /**
   * Do a 'User Logout' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogout(Array $args, Array &$json, Core $inst = null) {
    $json['success']  = true;
    $_SESSION['user'] = null;
  }

  /**
   * Do a 'User Information' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserInfo(Array $args, Array &$json, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      $json['success'] = true;
      $json['result']  = $user->getUserInfo();
    } else {
      $json['error'] = "You are not logged in!";
    }
  }

  /**
   * Do a 'Application Load' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationLoad(Array $args, Array &$json, Core $inst = null) {
    if ( $app = Application::Load($args['app']) ) {
      $json['success'] = true;
      $json['result']  = $app;
      $json['error']   = null;
    } else {
      $json['error'] = "Application '{$args['app']}' does not exist";
    }
  }

  /**
   * Do a 'Application Register' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationRegister(Array $args, Array &$json, Core $inst = null) {
    if ( Application::Register($args['uuid'], $args['instance']) ) {
      $json['success'] = true;
      $json['error']   = null;
    } else {
      $json['error'] = "Failed to flush application";
    }
  }

  /**
   * Do a 'Application Flush' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationFlush(Array $args, Array &$json, Core $inst = null) {
    if ( Application::Flush($args['uuid']) ) {
      $json['success'] = true;
      $json['error']   = null;
    } else {
      $json['error'] = "Failed to flush application";
    }
  }

  /**
   * Do a 'Application Event' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationEvent(Array $args, Array &$json, Core $inst = null) {
    if ( ($result = Application::Handle($args['uuid'], $args['action'], $args['instance'])) ) {
      $json['success'] = ($result === true) || is_array($result);
      $json['error']   = $json['success'] ? null : (is_string($result) ? $result : "Unknown error");
      $json['result']  = $json['success'] ? $result : null;
    } else {
      $json['error'] = "Failed to handle application";
    }
  }

  /**
   * Do a 'Service' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doService(Array $args, Array &$json, Core $inst = null) {
    if ( !class_exists("Service") ) {
      require PATH_PROJECT_LIB . "/Services.php";
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
   * Do a 'VFS' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doVFS(Array $args, Array &$json, Core $inst = null) {
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
   * Set the current time/timezone of session
   * @param   String    $zone       Timezone
   * @param   bool      $update     Update the object(s) (Default = false)
   * @return  void
   */
  protected function setTime($zone, $update = false) {
    $this->_sTime = $zone;

    if ( $update ) {
      /*
      $tz         = new DateTimeZone($zone);
      $now        = new DateTime("now", $tz);

      $this->_oTime = $now;
      $this->_oZone = $tz;
      */

      date_default_timezone_set($zone);
    }
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
   * Get the current session time
   * @return String
   */
  public final function getTime() {
    return $this->_sTime;
  }

  /**
   * Get the current session TimeDate
   * @return DateTime
   */
  public final function getTimeDate() {
    return new DateTime("now", $this->getTimeZone());
    //return $this->_oTime;
  }

  /**
   * Get the current session TimeDateZone
   * @return DateTimeZone
   */
  public final function getTimeZone() {
    return new DateTimeZone($this->getTime());
    //return $this->oZone;
  }

}

?>
