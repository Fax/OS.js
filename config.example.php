<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Configuration
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
 * @created 2011-04-26
 */

//
// Environment
//

define("ENV_PRODUCTION",      false);                 // Disable debugging, logging. Enable compression
define("ENABLE_CACHE",        ENV_PRODUCTION);        // Enable HTTP cache, used for production environments (AJAX is never cached)
define("ENV_DEMO",            false);                 // Enable DEMO environment, changes login and disables some "root" features

define("ENABLE_LOGGING",      !ENV_PRODUCTION);       // Enable Backend logging
define("ENABLE_GETTEXT",      true);                  // Enable Backend locales
define("ENABLE_GZIP",         true);                  // Enable Gzipped output (Only on supported browsers)

define("DEFAULT_TIMEZONE",    "UTC");                 // Locale: Timezone
define("DEFAULT_LANGUAGE",    "en_US");               // Locale: Language

define("CACHE_EXPIRE_ADD",          60);              // Cache: Expiration date forward in time - in seconds
define("CACHE_COMBINED_RESOURCES",  ENV_PRODUCTION);  // Cache: Combile all CSS/JS resources that are normally preloaded in browser, speeds up loading

define("HOST_FRONTEND",       "osjs.local");
define("HOST_API",            "api.osjs.local");
define("HOST_STATIC",         "osjs.local");

// Login
define("ENABLE_REGISTRATION",     true);              // Enable user registration on login screen
define("AUTOLOGIN_ENABLE",        false);             // Automatic login
define("AUTOLOGIN_USERNAME",      "");                // ... username
define("AUTOLOGIN_PASSWORD",      "");                // ... password
define("AUTOLOGIN_CONFIRMATION",  !AUTOLOGIN_ENABLE); // Confirmation dialog on session duplicates etc

//
// VFS Permissions etc.
//

define("VFS_SET_PERM",        false);                 // TODO
define("VFS_USER",            "www-data");            // Apache/WebServer User
define("VFS_GROUP",           "www-data");            // Apache/WebServer Group
define("VFS_FPERM",           "0555");                // Default File permission
define("VFS_DPERM",           "0555");                // Default Directory permission
define("VFS_UMASK",           "");                    // TODO

//
// Server
//

define("SERVER_HOST",         "0.0.0.0");             // WebSocket Server Host
define("SERVER_PORT",         8888);                  // WebSocket Server Port
define("SERVER_BACKLOG",      20);                    // TODO
define("SERVER_NONBLOCK",     false);                 // TODO

//
// Database
//

// Refer to the PHP PDO Manual
define("DATABASE_HOST",       "localhost");
define("DATABASE_DSN",        "mysql:dbname=osjs;host=localhost");
define("DATABASE_USER",       "osjs");
define("DATABASE_PASS",       "IeDici7AhghaeG4athobas");

//
// External Services
//

define("GA_ENABLE",         ENV_PRODUCTION);          // Google Analytics enable
define("GA_ACCOUNT_ID",     "UA-26635797-1");         // Google Analytics account id

?>
