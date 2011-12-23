<?php
/*!
 * @file
 * header.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-19
 */

//
// PHP internals
//

error_reporting(E_ALL | E_STRICT);

ini_set("session.upload_progress.enabled",  true);
ini_set("post_max_size",                    "256M");
ini_set("upload_max_filesize",              "256M");
//ini_set("session.upload-progress.name",     "OSjs");

//
// Project
//

define("PROJECT_AUTHOR",    "Anders Evenrud");
define("PROJECT_CONTACT",   "andersevenrud@gmail.com");
define("PROJECT_VERSION",   "0.5-beta8"); // Next: 0.6
define("PROJECT_CODENAME",  "FoxTrot"); // Next: DiscoFox
define("PROJECT_HOST",      (php_uname('n')));

//
// Environment
//

define("ENV_PRODUCTION",      (PROJECT_HOST != "amitop"));
define("DEFAULT_TIMEZONE",    "Europe/Oslo");
define("ENABLE_CACHE",        false);
define("ENABLE_LOGGING",      true);

define("VFS_SET_PERM",        false);
define("VFS_USER",            "www-data"); //(PROJECT_HOST != "amitop" ? "www-data" : "apache")); // chown() user
define("VFS_GROUP",           "www-data"); //(PROJECT_HOST != "amitop" ? "www-data" : "apache")); // chown() group
define("VFS_FPERM",           "0555"/*0644*/); // chmod() for uploaded files
define("VFS_DPERM",           "0555"/*0644*/); // chmod() for uploaed dirs
define("VFS_UMASK",           ""); // umask()

//
// Server
//

define("SERVER_HOST",     "0.0.0.0");
//define("SERVER_HOST",   "localhost");
define("SERVER_PORT",     8888);
define("SERVER_BACKLOG",  20);
define("SERVER_NONBLOCK", false); // TODO

//
// Paths
//

define("PATH_PROJECT",               dirname(__FILE__));
define("PATH_PROJECT_DOC",           PATH_PROJECT         . "/doc");
define("PATH_PROJECT_BIN",           PATH_PROJECT         . "/bin");
define("PATH_PROJECT_SRC",           PATH_PROJECT         . "/src");
define("PATH_PROJECT_LIB",           PATH_PROJECT         . "/lib");
define("PATH_PROJECT_VENDOR",        PATH_PROJECT         . "/vendor");
define("PATH_PROJECT_HTML",          PATH_PROJECT         . "/public_html");
define("PATH_PROJECT_BUILD",         PATH_PROJECT         . "/src/build");
define("PATH_PROJECT_LOG",           PATH_PROJECT         . "/logs");
define("PATH_PROJECT_LOG_FILE",      PATH_PROJECT         . "/logs/messages");
define("PATH_APPS",                  PATH_PROJECT         . "/src/apps");
define("PATH_RESOURCES",             PATH_PROJECT         . "/src/resources");
define("PATH_JSBASE",                PATH_PROJECT         . "/src/base");

define("APPLICATION_BUILD",          PATH_PROJECT_BUILD   . "/applications.xml");
define("MIME_MAGIC",                 PATH_PROJECT_VENDOR  . "/mime.mgc");

//
// Propel Config
//

$inifile = parse_ini_file(PATH_PROJECT . "/build.properties");
define("PROPEL_PROJECT",  $inifile["propel.project"]);
define("PROPEL_CONFIG",   sprintf("%s/conf/%s-conf.php", PATH_PROJECT_BUILD, PROPEL_PROJECT));
unset($inifile);

set_include_path(sprintf("%s/classes", PATH_PROJECT_BUILD) . PATH_SEPARATOR . get_include_path());
set_include_path(sprintf("%s/classes/%s", PATH_PROJECT_BUILD, PROPEL_PROJECT) . PATH_SEPARATOR . get_include_path());

//
// Includes
//

// Vendor libraries
require 'vendor/Propel/runtime/lib/Propel.php';

// Internal libraries
require "lib/Functions.php";
require "lib/UUID.class.php";
require "lib/Logger.class.php";

// Main sources
require 'src/Core.class.php';
require "src/SettingsManager.class.php";
require "src/ApplicationVFS.class.php";
require "src/ApplicationAPI.class.php";

// Extension sources
require "src/Panel.class.php";
require "src/Dialog.class.php";
require "src/Application.class.php";

// Misc Initialization
date_default_timezone_set("UTC");

?>
