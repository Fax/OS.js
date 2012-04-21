<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Bootstrap PHP Script
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-02-19
 */

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - PHP [INI] SETTINGS
///////////////////////////////////////////////////////////////////////////////

// For the rest see vhost
ini_set("session.upload_progress.enabled",  true);
ini_set("post_max_size",                    "256M");
ini_set("upload_max_filesize",              "256M");
ini_set("expose_php",                       "off");
ini_set("display_errors",                   "off");
//ini_set("session.upload-progress.name",     "OSjs");

error_reporting(-1); // E_ALL | E_STRICT

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - GLOBAL DEFINITIONS
///////////////////////////////////////////////////////////////////////////////

//
// Project
//

define("PROJECT_AUTHOR",    "Anders Evenrud");
define("PROJECT_CONTACT",   "andersevenrud@gmail.com");
define("PROJECT_VERSION",   "0.7.002");
define("PROJECT_CODENAME",  "Catwalk");
define("PROJECT_HOST",      (php_uname('n')));
define("PROJECT_BUILD",     "bb98b4e");
define("PROJECT_MODIFIED",  "1335015676");

//
// Environment
//

define("ENV_PRODUCTION",      (PROJECT_HOST != "amitop"));
define("DEFAULT_TIMEZONE",    "UTC");
define("DEFAULT_LANGUAGE",    "en_US");
define("ENABLE_CACHE",        false);
define("ENABLE_LOGGING",      true);
define("ENABLE_GETTEXT",      true);
define("GETTEXT_DOMAIN",      "messages");

//
// Cache (Production)
//
define("CACHE_EXPIRE_ADD",    60); // FIXME

//
// VFS Permissions etc.
//

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

define("PATH",                 dirname(__FILE__));
define("PATH_DOC",             PATH . "/doc");
define("PATH_BIN",             PATH . "/bin");
define("PATH_SRC",             PATH . "/src");
define("PATH_LIB",             PATH . "/lib");
define("PATH_VENDOR",          PATH . "/vendor");
define("PATH_HTML",            PATH . "/public_html");
define("PATH_BUILD",           PATH . "/src/build");
define("PATH_LOCALE",          PATH . "/src/locale");
define("PATH_LOG",             PATH . "/logs");
define("PATH_LOG_FILE",        PATH . "/logs/messages");
define("PATH_PACKAGES",        PATH . "/src/packages");
define("PATH_JSBASE",          PATH . "/src/javascript");
define("PATH_JSLOCALE",        PATH . "/src/javascript/locale");
define("PATH_MEDIA",           PATH . "/public_html/media");
define("PATH_VFS",             PATH . "/VFS");

//
// Resources (Core, Package, etc.)
//

define("RESOURCE_CORE",         PATH_JSBASE . "/%s");
define("RESOURCE_CORE_MIN",     PATH_JSBASE . "/_min/%s");
define("RESOURCE_PACKAGE",      PATH_PACKAGES . "/%s/%s");
define("RESOURCE_PACKAGE_MIN",  PATH_PACKAGES . "/%s/_min/%s");
define("RESOURCE_LOCALE",       PATH_JSLOCALE . "/%s");
define("RESOURCE_LOCALE_MIN",   PATH_JSLOCALE . "/_min/%s");
define("RESOURCE_THEME",        PATH_JSBASE . "/%s");
define("RESOURCE_THEME_MIN",    PATH_JSBASE . "/_min/%s");
define("RESOURCE_CURSOR",       PATH_JSBASE . "/%s");
define("RESOURCE_CURSOR_MIN",   PATH_JSBASE . "/_min/%s");

define("URI_FONT",              "/media/System/Fonts");
define("URI_API_OPERATION",     "/API/%s");
define("URI_PACKAGE_RESOURCE",  "/VFS/resource/%s/%s");

//
// Misc. files
//

define("MINIMIZE_CACHE",       PATH_BUILD   . "/minimize.cache");
define("FONT_CACHE",           PATH_BUILD   . "/fontcache.xml");
define("PACKAGE_BUILD",        PATH_BUILD   . "/packages.xml");
define("MIME_MAGIC",           PATH_VENDOR  . "/mime.mgc");

//
// Database
//

define("DATABASE_HOST",     "localhost");
define("DATABASE_DSN",      "mysql:dbname=osjs;host=localhost");
define("DATABASE_USER",     "osjs");
define("DATABASE_PASS",     "IeDici7AhghaeG4athobas");

//
// External Services
//

define("GA_ENABLE",         ENV_PRODUCTION);    // Google Analytics enable
define("GA_ACCOUNT_ID",     "UA-26635797-1");   // Google Analytics account id

///////////////////////////////////////////////////////////////////////////////
// DEPENDENCIES
///////////////////////////////////////////////////////////////////////////////

require "lib/Functions.php";
require "lib/JSON.class.php";
require "lib/Logger.class.php";
require "lib/DB.class.php";
require "lib/Browser.class.php";

// Internal Automatic loading of source classes
spl_autoload_register(function($cn) {
  if ( !class_exists($cn) )
    require PATH_SRC . "/{$cn}.class.php";
});

///////////////////////////////////////////////////////////////////////////////
// LOW-LEVEL CLASSES AND FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

abstract class CoreObject {}

class ExceptionVFS
  extends Exception
{
  const DOES_NOT_EXIST    = 1;
  const ALREADY_EXISTS    = 2;
  const PERMISSION_DENIED = 3;
  const GENERIC           = 254;

  public function __construct($type, Array $args = Array()) {
    $message = _("Unknown VFS Error occured");

    switch ( $type ) {
      case self::DOES_NOT_EXIST :
        $message = vsprintf(_("The file '%s' does not exist!"), $args);
      break;
      case self::ALREADY_EXISTS :
        $message = vsprintf(_("The file '%s' already exists!"), $args);
      break;
      case self::PERMISSION_DENIED :
        $message = vsprintf(_("You do not have permission to '%s'!"), $args);
      break;
      case self::GENERIC :
        $tmp = reset($args);
        if ( $tmp && is_array($tmp) ) {
          $args = Array(isset($tmp['file']) ? $tmp['file'] : (isset($tmp['path']) ? $tmp['path'] : current($tmp)));
        }
        $message = vsprintf(_("Failed to handle '%s'. Make sure you have permissions in this directory!"), $args);
      break;
    }

    parent::__construct($message);
  }
}

class ExceptionPackage
  extends Exception
{
  const PACKAGE_NOT_EXISTS    = 0;
  const PACKAGE_EXISTS        = 0;
  const MISSING_METADATA      = 1;
  const INVALID_METADATA      = 2;
  const MISSING_FILE          = 3;
  const FAILED_CREATE         = 4;
  const FAILED_OPEN           = 5;
  const INVALID_DESTINATION   = 6;
  const FAILED_CREATE_DEST    = 7;

  const INVALID               = 255;

  public function __construct($type, Array $args = Array()) {
    $message = _("Unknown Package Error occured");

    switch ( $type ) {
      case self::PACKAGE_NOT_EXISTS :
        $message = vsprintf(_("The package archive '%s' does not exist!"), $args);
      break;
      case self::PACKAGE_EXISTS :
        $message = vsprintf(_("The package already exists in '%s'!"), $args);
      break;
      case self::MISSING_METADATA :
        $message = vsprintf(_("'%s' is missing metadata.xml!"), $args);
      break;
      case self::INVALID_METADATA :
        $message = vsprintf(_("'%s' has invalid metadata.xml!"), $args);
      break;
      case self::MISSING_FILE :
        $message = vsprintf(_("'%s' is missing the file '%s'!"), $args);
      break;
      case self::FAILED_CREATE :
        $message = vsprintf(_("Failed to create archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::FAILED_OPEN :
        $message = vsprintf(_("Failed to open archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::INVALID_DESTINATION :
        $message = vsprintf(_("The destination '%s' is invalid!"), $args);
      break;
      case self::FAILED_CREATE_DEST :
        $message = vsprintf(_("The destination '%s' cannot be created!"), $args);
      break;
      case self::INVALID :
        $message = vsprintf(_("The package archive '%s' is invalid!"), $args);
      break;
    }

    parent::__construct($message);
  }
}

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

date_default_timezone_set(DEFAULT_TIMEZONE);

if ( !DB::init() ) {
  die("Failed to initialize OS.js Database!");
}

?>
