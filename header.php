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
ini_set("session.gc_probability",           0);
//ini_set("session.upload-progress.name",     "OSjs");

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - GLOBAL DEFINITIONS
///////////////////////////////////////////////////////////////////////////////

// Modified after including config.php
error_reporting(E_ALL | E_STRICT); 
ini_set("display_errors", "on");

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - GLOBAL DEFINITIONS
///////////////////////////////////////////////////////////////////////////////

//
// Project
//

define("PROJECT_AUTHOR",    "Anders Evenrud");
define("PROJECT_CONTACT",   "andersevenrud@gmail.com");
define("PROJECT_VERSION",   "0.7.250");
define("PROJECT_CODENAME",  "Catwalk");
define("PROJECT_HOST",      (php_uname('n')));
define("PROJECT_COPYRIGHT", "2012 " . PROJECT_AUTHOR . " <" . PROJECT_CONTACT . ">");
define("PROJECT_BUILD",     "1edb5a8");
define("PROJECT_MODIFIED",  "1335991259");

//
// Cache (Production)
//
define("CACHE_EXPIRE_ADD",    60); // FIXME

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
define("PATH_TEMPLATES",       PATH . "/src/templates");
define("PATH_JSBASE",          PATH . "/src/javascript");
define("PATH_JSLOCALE",        PATH . "/src/javascript/locale");
define("PATH_MEDIA",           PATH . "/public_html/media");
define("PATH_VFS",             PATH . "/VFS");
define("PATH_VFS_USER",        PATH . "/VFS/%d");
define("PATH_VFS_PACKAGES",    PATH_VFS_USER . "/Packages");

//
// Resources (Core, Package, etc.)
//

define("RESOURCE_CORE",             PATH_JSBASE       . "/%s");
define("RESOURCE_CORE_MIN",         PATH_JSBASE       . "/_min/%s");
define("RESOURCE_PACKAGE",          PATH_PACKAGES     . "/%s/%s");
define("RESOURCE_PACKAGE_MIN",      PATH_PACKAGES     . "/%s/_min/%s");
define("RESOURCE_LOCALE",           PATH_JSLOCALE     . "/%s");
define("RESOURCE_LOCALE_MIN",       PATH_JSLOCALE     . "/_min/%s");
define("RESOURCE_THEME",            PATH_JSBASE       . "/%s");
define("RESOURCE_THEME_MIN",        PATH_JSBASE       . "/_min/%s");
define("RESOURCE_CURSOR",           PATH_JSBASE       . "/%s");
define("RESOURCE_CURSOR_MIN",       PATH_JSBASE       . "/_min/%s");
define("RESOURCE_VFS_PACKAGE",      PATH_VFS_PACKAGES . "/%s/%s");
define("RESOURCE_VFS_PACKAGE_MIN",  PATH_VFS_PACKAGES . "/%s/_min/%s");

define("URI_SOUND",             "/sounds/%s");
define("URI_FONT",              "/media/System/Fonts");
define("URI_API_OPERATION",     "/API/%s");
define("URI_PACKAGE_RESOURCE",  "/VFS/resource/%s/%s");
define("URI_VFS_USER",          "/VFS/%d");
define("URI_VFS_USER_METADATA", "/VFS/%d/packages.xml");
define("URI_VFS_USER_PACKAGES", "/VFS/%d/Packages");

//
// Misc. files
//

define("SETTINGS_CONFIG",      PATH         . "/config.php");
define("MINIMIZE_CACHE",       PATH_BUILD   . "/minimize.cache");
define("FONT_CACHE",           PATH_BUILD   . "/fontcache.xml");
define("PACKAGE_BUILD",        PATH_BUILD   . "/packages.xml");
define("PACKAGE_USER_BUILD",   PATH_VFS     . "/%d/packages.xml");
define("MIME_MAGIC",           PATH_VENDOR  . "/mime.mgc");
define("VFS_TEMPLATE",         PATH_VFS     . "/0");

///////////////////////////////////////////////////////////////////////////////
// DEPENDENCIES
///////////////////////////////////////////////////////////////////////////////

require "lib/Functions.php";
require "lib/JSON.class.php";
require "lib/Logger.class.php";
require "lib/DB.class.php";
require "lib/Browser.class.php";
require "src/Misc.php";

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION - LOCAL DEFINITIONS
///////////////////////////////////////////////////////////////////////////////

require SETTINGS_CONFIG;

if ( !defined("ENV_PRODUCTION") )
  define("ENV_PRODUCTION",      false);
if ( !defined("ENV_DEMO") )
  define("ENV_DEMO",            false);
if ( !defined("DEFAULT_TIMEZONE") )
  define("DEFAULT_TIMEZONE",    "UTC");
if ( !defined("DEFAULT_LANGUAGE") )
  define("DEFAULT_LANGUAGE",    "en_US");
if ( !defined("GETTEXT_DOMAIN") )
  define("GETTEXT_DOMAIN",      "messages");
if ( !defined("ENABLE_REGISTRATION") )
  define("ENABLE_REGISTRATION", true);

if ( !defined("AUTOLOGIN_ENABLE") )
  define("AUTOLOGIN_ENABLE",    false);
if ( !defined("AUTOLOGIN_USERNAME") )
  define("AUTOLOGIN_USERNAME",  "");
if ( !defined("AUTOLOGIN_PASSWORD") )
  define("AUTOLOGIN_PASSWORD",  "");
if ( !defined("AUTOLOGIN_CONFIRMATION") )
  define("AUTOLOGIN_CONFIRMATION", true);

if ( !defined("BIN_YUI") )
  define("BIN_YUI",             sprintf("%s/yui.sh %s/yuicompressor-2.4.6.jar", PATH_BIN, PATH_VENDOR));

// ERROR REPORTING
if ( ENV_PRODUCTION || ENV_DEMO ) {
  error_reporting(-1);
  ini_set("display_errors", "off");
}

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

// Internal Automatic loading of source classes
spl_autoload_register(function($cn) {
  if ( !class_exists($cn) )
    require PATH_SRC . "/{$cn}.class.php";
});

// Locales
date_default_timezone_set(DEFAULT_TIMEZONE);

// Database
if ( !DB::init() ) {
  if ( !defined("NODB") ) {
    die("Failed to initialize OS.js Database!");
  }
}

?>
