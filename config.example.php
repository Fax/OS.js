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

define("ENV_PRODUCTION",      false);
define("ENABLE_CACHE",        false);
define("ENV_DEMO",            false);
define("ENABLE_LOGGING",      true);
define("ENABLE_GETTEXT",      true);

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

define("SERVER_HOST",         "0.0.0.0");
//define("SERVER_HOST",       "localhost");
define("SERVER_PORT",         8888);
define("SERVER_BACKLOG",      20);
define("SERVER_NONBLOCK",     false); // TODO

//
// Database
//

define("DATABASE_HOST",       "localhost");
define("DATABASE_DSN",        "mysql:dbname=osjs;host=localhost");
define("DATABASE_USER",       "osjs");
define("DATABASE_PASS",       "IeDici7AhghaeG4athobas");

//
// External Services
//

define("GA_ENABLE",         ENV_PRODUCTION);    // Google Analytics enable
define("GA_ACCOUNT_ID",     "UA-26635797-1");   // Google Analytics account id

?>
