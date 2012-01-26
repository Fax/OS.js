<?php
/*!
 * @file
 * Contains Application Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-06-16
 */

/**
 * Application -- Base OS.js Application Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class Application
{
  const APPLICATION_TITLE   = __CLASS__;
  const APPLICATION_ICON    = "emblems/emblem-unreadable.png";

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_sUUID = "";                   //!< Application's UUUID

  /**
   * @var Registered Applications
   */
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

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Event performed by AJAX
   * @param  String     $uuid         Application UUID
   * @param  String     $action       Application Action
   * @param  Array      $args         Action Arguments
   * @return Mixed
   */
  public static function Event($uuid, $action, Array $args) {
    return Array();
  }

  /**
   * Load an application
   * @param  String     $classname      Class-name to use
   * @return Mixed
   */
  public static function Load($classname) {
    Application::init(APPLICATION_BUILD, $classname);
    if ( class_exists($classname) ) {
      $instance = new $classname();
      return $instance->getJSON();
    }

    return false;
  }

  /**
   * Register an application
   * @param  String       $uuid         Application UUID
   * @param  Application  $instance     Application Instance
   * @return bool
   */
  public static function Register($uuid, $instance) {
    if ( $uuid ) {
      //$_SESSION[$uuid] = $instance;
      return true;
    }
    return false;
  }

  /**
   * Flush an application
   * @param  String       $uuid         Application UUID
   * @return bool
   */
  public static function Flush($uuid) {
    if ( $uuid ) {
      //unset($_SESSION[$uuid]);
      return true;
    }
    return false;
  }

  /**
   * Handle an application event
   * @param  String       $uuid         Application UUID
   * @param  String       $action       Application Action
   * @param  Application  $instance     Application Instance
   * @return Mixed
   */
  public static function Handle($uuid, $action, $instance) {
    if ( $uuid && $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        Application::init(APPLICATION_BUILD, $cname);

        if ( class_exists($cname) ) {
          return $cname::Event($uuid, $action, $aargs);
        }
      }
    }

    return false;
  }

  /**
   * Initialize application(s)
   * @param  String   $config       Configuration path
   * @param  String   $filename     Lock on class-name
   * @return void
   */
  public static function init($config, $classname = null) {
    $return = null;

    // Parse application data
    if ( $xml = file_get_contents($config) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        foreach ( $xml->application as $app ) {
          $app_name     = (string) $app['name'];
          $app_title    = (string) $app['title'];
          $app_icon     = (string) $app['icon'];
          $app_class    = (string) $app['class'];
          $app_file     = (string) $app['file'];
          $app_system   = (string) $app['system'] == "true";
          $app_category = (string) $app['category'];
          $app_enabled  = $app['enabled'] === "true" ? true : false;

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
                  $win_props = JSON::decode($pv);
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
            $resources[] = (string) $res;
          }

          foreach ( $app->mime as $mime ) {
            $mimes[] = (string) $mime;
          }

          $return = Array(
            "name"      => $app_name,
            "title"     => $app_title,
            "icon"      => $app_icon,
            "category"  => $app_category,
            "mimes"     => $mimes,
            "resources" => $resources/*,
            "class"     => $app_class,
            "windows"   => $windows,
            "system"    => $app_system*/
          );

          Application::$Registered[$app_class] = $return;

          require_once PATH_APPS . "/{$app_class}/{$app_file}";
        }
      }

      ksort(Application::$Registered);
    } else {
      die("Failed to read application build-data!");
    }

    return $return;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET / GET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Application JSON data
   * @return Array
   */
  public function getJSON() {
    $cname = get_class($this);
    $reg   = self::$Registered[$cname];

    return array_merge(Array("uuid" => $this->_sUUID), $reg);
  }

}

?>
