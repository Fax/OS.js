<?php
/*!
 * @file
 * Contains Application Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * Application Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
abstract class Application
{
  const APPLICATION_TITLE   = __CLASS__;
  const APPLICATION_ICON    = "emblems/emblem-unreadable.png";
  const APPLICATION_SYSTEM  = false;
  const APPLICATION_ENABLED = true;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_sUUID = "";

  public static $Registered = Array();

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  public function __construct() {
    $this->_sUUID = UUID::v4();
  }

  /**
   * @return String
   */
  public function __toJSON() {
    $cname = get_class($this);

    return array_merge(Array(
      "class"     => $cname,
      "uuid"      => $this->_sUUID,
      "content"   => self::$Registered[$cname]["html"],
      "resources" => self::$Registered[$cname]["resources"],
      "mime"      => self::$Registered[$cname]["mime"],
      ), self::$Registered[$cname]["window"]
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance of Application
   *
   * @return Application
   */
  public final static function create() {
    return new Application();
  }

  public final static function RegisterStatic($cname, Array $window, $html, Array $resources = Array(), Array $mimes = Array()) {
    self::$Registered[$cname] = Array(
      "html"      => $html,
      "window"    => $window,
      "resources" => $resources,
      "mime"      => $mimes
    );
  }

  public final static function Register($cname, $file, Array $resources = Array(), Array $mimes = Array(), Array $extra = Array()) {
    $html   = "";
    $window = Array();

    $fname = str_replace(".class.php", "", basename($file));
    if ( $app = WindowManager::getApplication($fname) ) {
      foreach ( $app->property as $p ) {
        $pk = (string) $p['name'];
        $pv = (string) $p;

        if ( $pk == "html" ) {
          $html = $pv;
        } else if ( $pk == "window" ) {
          $window = (Array) json_decode($pv);
        }
      }

    }

    foreach ( $extra as $k => $v ) {
      $window[$k] = $v;
    }

    self::$Registered[$cname] = Array(
      "html"      => $html,
      "window"    => $window,
      "resources" => $resources,
      "mime"      => $mimes
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Event performed by AJAX
   * @return Mixed
   */
  public static function Event($uuid, $action, Array $args) {
    return Array();
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

}

?>
