<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - index.php
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
 * index.php: Handles AJAX and Template
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-05-26
 */

require "_header.php";

///////////////////////////////////////////////////////////////////////////////
// AJAX
///////////////////////////////////////////////////////////////////////////////

// POST operations
//if ( !($json = $core->doPOST(file_get_contents('php://input'), true)) === false ) {
if ( !($json = $core->doPOST($_POST)) === false ) {
  // AJAX Does not cache anyway, but we do this anyway
  $now = gmdate( 'D, d M Y H:i:s' );
  header("Expires: Fri, 01 Jan 2010 05:00:00 GMT");
  header("Last-Modified: $now GMT");
  header("Cache-Control: maxage=1, no-cache, no-store, must-revalidate, post-check=0, pre-check=0");
  header("Pragma: no-cache");

  header("Content-Type: " . MIME_JSON);
  die($json);
}

///////////////////////////////////////////////////////////////////////////////
// HTML
///////////////////////////////////////////////////////////////////////////////

header(sprintf("Content-Type: %s; charset=utf-8", MIME_HTML));
require PATH_TEMPLATES . "/index.php";

?>
