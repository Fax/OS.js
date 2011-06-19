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
    return Array(
      "uuid"      => $this->_sUUID,
      "title"     => self::$Registered[$cname]['title'],
      "icon"      => self::$Registered[$cname]['icon'],
      "resources" => self::$Registered[$cname]['resources'],
      "mime"      => self::$Registered[$cname]['mimes']
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
  // SET / GET
  /////////////////////////////////////////////////////////////////////////////

}

?>
