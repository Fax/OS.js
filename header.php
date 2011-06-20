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
define("PROJECT_VERSION", "0.4-r5");

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
require "src/Functions.php";
require "src/UUID.class.php";
require "src/Glade.class.php";
require "src/ApplicationVFS.class.php";
require "src/ApplicationAPI.class.php";
require "src/Application.class.php";
require 'src/WindowManager.class.php';

Propel::init(PROPEL_CONFIG);

?>
