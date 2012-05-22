<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - _header.php
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
 * @package OSjs.Frontend
 * _header.php: Main frontend bootstrap
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-02-10
 */

// Initialize core
require "../header.php";
if ( !($core = Core::initialize()) ) {
  die("Failed to initialize OS.js Core");
}

// Output compression
if ( ENABLE_GZIP && !defined("DISABLE_GZIP") ) {
  if ( isset($_SERVER) && isset($_SERVER["HTTP_ACCEPT_ENCODING"]) ) {
    $use_gzip = substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip');
    if ( !$use_gzip || !ob_start("ob_gzhandler") ) {
      flush();
      while (ob_get_level()) {
        ob_end_flush();
      }
      ob_start();
    }
  }
}

// Output cache
// NOTE: This may be overridden in scripts that include this header file.
//       Mostly in AJAX POST scripts where no cache is available/working.
if ( ENABLE_CACHE ) {
  $time   = time();
  $now    = ($time + CACHE_EXPIRE_ADD);
  $max    = ($now - $time);
  $stamp  = gmdate('D, d M Y H:i:s', $now);

  header("Expires: $stamp GMT");
  header("Cache-Control: maxage=$max, public");
} else {
  $now = gmdate( 'D, d M Y H:i:s' );
  header("Expires: Fri, 01 Jan 2010 05:00:00 GMT");
  header("Last-Modified: $now GMT");
  header("Cache-Control: maxage=1, no-cache, no-store, must-revalidate, post-check=0, pre-check=0");
  header("Pragma: no-cache");
}

// Custom HTTP response headers
$loc = $core->getLocale();
header("X-OSjs-Version: " . PROJECT_VERSION);
header("X-OSjs-Locale: "  . $loc["locale_language"]);
header("X-OSjs-Cache: "   . (ENABLE_CACHE ? "true" : "false"));
header("X-Provider: ObjectCore");

// NOTE: http://www.p3pwriter.com/LRN_111.asp
//header("P3P: CP=\"IDC DSP COR CURa ADMa OUR IND PHY ONL COM STA\"");
//header("P3P: CP=\"NOI DSP COR CURa ADMa OUR NOR COM STA\"");

?>
