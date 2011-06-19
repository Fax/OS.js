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

  public static function init($config, $classname = null) {

    // Parse application data
    if ( $xml = file_get_contents($config) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        foreach ( $xml->application as $app ) {
          $app_name   = (string) $app['name'];
          $app_title  = (string) $app['title'];
          $app_icon   = (string) $app['icon'];
          $app_class  = (string) $app['class'];
          $app_file   = (string) $app['file'];
          $app_system = (string) $app['system'] == "true";

          if ( $classname !== null && $classname !== $app_class ) {
            continue;
          }

          $windows   = Array();
          $resources = Array();
          $mimes     = Array();

          foreach ( $app->window as $win ) {
            $win_id    = (string) $win['id'];
            $win_props = Array();
            $win_html  = "";

            foreach ( $win->property as $p ) {
              $pk = (string) $p['name'];
              $pv = (string) $p;

              switch ( $pk ) {
                case "properties" :
                  $win_props = json_decode($pv);
                  break;
                case "content" :
                  $win_html = $pv;
                  break;
              }
            }
            $windows[$win_id] = Array(
              "properties" => $win_props
            );
          }

          foreach ( $app->resource as $res ) {
            $res = (string) $res;

            $type = preg_match("/\.css$/", $res) ? "css" : "js";
            $path = sprintf("%s/%s/%s", PATH_PROJECT_HTML, $type, $res);

            if ( file_exists($path) ) {
              $resources[] = $res;
            }
          }

          foreach ( $app->mime as $mime ) {
            $mimes[] = (string) $mime;
          }

          Application::$Registered[$app_class] = Array(
            "name"      => $app_name,
            "title"     => $app_title,
            "icon"      => $app_icon,
            "class"     => $app_class,
            "windows"   => $windows,
            "resources" => $resources,
            "mimes"     => $mimes,
            "system"    => $app_system
          );

          require PATH_APPS . "/{$app_file}";
        }
      }

      ksort(Application::$Registered);
    } else {
      die("Failed to read application build-data!");
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET / GET
  /////////////////////////////////////////////////////////////////////////////

}

?>
