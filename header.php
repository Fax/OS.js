<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Bootstrap PHP Script
 *
 * Copyright (c) 2011, Anders Evenrud
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
define("PROJECT_VERSION",   "0.6-alpha4"); // Next: 0.7
define("PROJECT_CODENAME",  "DiscoFox"); // Next: ???
define("PROJECT_HOST",      (php_uname('n')));
define("PROJECT_BUILD",     "git-9999");

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

define("PATH",               dirname(__FILE__));
define("PATH_DOC",           PATH . "/doc");
define("PATH_BIN",           PATH . "/bin");
define("PATH_SRC",           PATH . "/src");
define("PATH_LIB",           PATH . "/lib");
define("PATH_VENDOR",        PATH . "/vendor");
define("PATH_HTML",          PATH . "/public_html");
define("PATH_BUILD",         PATH . "/src/build");
define("PATH_LOCALE",        PATH . "/src/locale");
define("PATH_LOG",           PATH . "/logs");
define("PATH_LOG_FILE",      PATH . "/logs/messages");
define("PATH_PACKAGES",      PATH . "/src/packages");
define("PATH_JSBASE",        PATH . "/src/javascript");
define("PATH_JSLOCALE",      PATH . "/src/javascript/locale");

define("MINIMIZE_CACHE",     PATH_BUILD   . "/minimize.cache");
define("PACKAGE_BUILD",      PATH_BUILD   . "/packages.xml");
define("DATABASE_FILE",      PATH_BUILD   . "/database.sdb");
define("MIME_MAGIC",         PATH_VENDOR  . "/mime.mgc");

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
require "lib/Logger.class.php";
require "lib/DB.class.php";

// Autoloading
spl_autoload_register(function($cn) {
  if ( !class_exists($cn) )
    require PATH_SRC . "/{$cn}.class.php";
});

//
// Default initialization
//

abstract class CoreObject {}

// Misc Initialization
date_default_timezone_set(DEFAULT_TIMEZONE);

DB::init();

?>
