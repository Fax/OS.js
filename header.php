<?php
/*!
 * @file
 * header.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
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
define("PROJECT_VERSION",   "0.5-beta10"); // Next: 0.6
define("PROJECT_CODENAME",  "FoxTrot"); // Next: DiscoFox
define("PROJECT_HOST",      (php_uname('n')));

//
// Environment
//

define("ENV_PRODUCTION",      (PROJECT_HOST != "amitop"));
define("DEFAULT_TIMEZONE",    "UTC");
define("DEFAULT_LANGUAGE",    "en_US");
define("ENABLE_CACHE",        false);
define("ENABLE_LOGGING",      true);
define("ENABLE_GETTEXT",      true);
define("GETTEXT_DOMAIN",      "OSjs");

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
define("PATH_PROJECT_LOCALE",        PATH_PROJECT         . "/src/locale");
define("PATH_PROJECT_LOG",           PATH_PROJECT         . "/logs");
define("PATH_PROJECT_LOG_FILE",      PATH_PROJECT         . "/logs/messages");
define("PATH_APPS",                  PATH_PROJECT         . "/src/apps");
define("PATH_RESOURCES",             PATH_PROJECT         . "/src/resources");
define("PATH_JSBASE",                PATH_PROJECT         . "/src/base");
define("PATH_JSLOCALE",              PATH_PROJECT         . "/src/base/locale");

define("MINIMIZE_CACHE",             PATH_PROJECT_BUILD   . "/minimize.cache");
define("APPLICATION_BUILD",          PATH_PROJECT_BUILD   . "/applications.xml");
define("DATABASE_FILE",              PATH_PROJECT_BUILD   . "/database.sdb");
define("MIME_MAGIC",                 PATH_PROJECT_VENDOR  . "/mime.mgc");

//
// Database
//

define("DATABASE_DSN",      "sqlite:" . DATABASE_FILE);
define("DATABASE_HOST",     "localhost");
define("DATABASE_USER",     "");
define("DATABASE_PASS",     "");

//
// Includes
//

// Internal libraries
require "lib/Functions.php";
require "lib/JSON.class.php";
require "lib/UUID.class.php";
require "lib/Logger.class.php";
require "lib/DB.class.php";
require "lib/DBObject.class.php";

// Main sources (Rest is loaded dynamically)
require "src/Core.class.php";
require "src/User.class.php";

// Misc Initialization
date_default_timezone_set(DEFAULT_TIMEZONE);

DB::init();

?>
