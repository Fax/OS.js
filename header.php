<?php
/*!
 * @file
 * header.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-19
 */
error_reporting(E_ALL | E_STRICT);

// Project
define("PROJECT_AUTHOR",  "Anders Evenrud");
define("PROJECT_CONTACT", "andersevenrud@gmail.com");
define("PROJECT_VERSION", "0.4-r2");

// Environment
define("ENV_PRODUCTION", false);
define("DEFAULT_TIMEZONE", "Europe/Oslo");
define("ENABLE_CACHE", false);

// Server
define("SERVER_HOST", "localhost");
define("SERVER_PORT", 8888);

// Path definitions
define("PATH_PROJECT",           dirname(__FILE__));
define("PATH_PROJECT_SRC",       PATH_PROJECT . "/src");
define("PATH_PROJECT_HTML",      PATH_PROJECT . "/public_html");
define("PATH_PROJECT_BUILD",     PATH_PROJECT . "/src/build");
define("PATH_PROJECT_LOG",       PATH_PROJECT . "/logs");
define("PATH_APPS",              PATH_PROJECT . "/src/apps");

define("APPLICATION_BUILD",      PATH_PROJECT_BUILD . "/applications.xml");

// Propel Config
$inifile = parse_ini_file(PATH_PROJECT . "/build.properties");
define("PROPEL_PROJECT",         $inifile["propel.project"]);
define("PROPEL_CONFIG",          sprintf("%s/conf/%s-conf.php", PATH_PROJECT_BUILD, PROPEL_PROJECT));

// Include paths
set_include_path(sprintf("%s/classes", PATH_PROJECT_BUILD) . PATH_SEPARATOR . get_include_path());
set_include_path(sprintf("%s/classes/%s", PATH_PROJECT_BUILD, PROPEL_PROJECT) . PATH_SEPARATOR . get_include_path());

// Vendor libraries
require 'vendor/Propel/runtime/lib/Propel.php';
require "vendor/AjaxUpload.php";

// Application
require "src/UUID.class.php";
require "src/Glade.class.php";
require "src/ApplicationAPI.class.php";
require "src/Application.class.php";
require 'src/WindowManager.class.php';

Propel::init(PROPEL_CONFIG);

// Parse application data
if ( $xml = file_get_contents(PATH_PROJECT_BUILD . "/applications.xml") ) {
  if ( $xml = new SimpleXmlElement($xml) ) {
    foreach ( $xml->application as $app ) {
      $app_name  = (string) $app['name'];
      $app_title = (string) $app['title'];
      $app_icon  = (string) $app['icon'];
      $app_class = (string) $app['class'];

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
          "properties" => $win_props,
          "html"       => $win_html
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

      foreach ( $app->mimes as $mime ) {
        $mimes[] = (string) $mime;
      }

      Application::$Registered[$app_class] = Array(
        "name"      => $app_name,
        "title"     => $app_title,
        "icon"      => $app_icon,
        "class"     => $app_class,
        "windows"   => $windows,
        "resources" => $resources,
        "mimes"     => $mimes
      );
    }
  }
} else {
  die("Failed to read application build-data!");
}

?>
