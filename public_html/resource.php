<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - resource.php
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
 * @package OSjs.Frontend
 * resource.php: Handles Resource Handling
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-02-10
 */

require "_header.php";

///////////////////////////////////////////////////////////////////////////////
// STYLESHEET LOADING
///////////////////////////////////////////////////////////////////////////////

if ( isset($_GET['font']) && !empty($_GET['font']) ) {
  header("Content-Type: text/css; charset=utf-8");
  print ResourceManager::getFont($_GET['font'], ENV_PRODUCTION);
  exit;
}

if ( isset($_GET['theme']) && !empty($_GET['theme']) ) {
  if ( ($content = ResourceManager::getTheme($_GET['theme'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header("Content-Type: text/css; charset=utf-8");
  print $content;
  exit;
}

if ( isset($_GET['cursor']) && !empty($_GET['cursor']) ) {
  if ( ($content = ResourceManager::getCursor($_GET['cursor'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header("Content-Type: text/css; charset=utf-8");
  print $content;
  exit;
}

///////////////////////////////////////////////////////////////////////////////
// RESOURCE LOADING
///////////////////////////////////////////////////////////////////////////////

if ( isset($_GET['resource']) && !empty($_GET['resource']) ) {
  $pkg  = isset($_GET['package']) ? $_GET['package'] : null;
  if ( ($file = ResourceManager::getResource($_GET['resource'], $pkg, ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  list($mime, $content) = $file;
  header(sprintf("Content-Type: %s; charset=utf-8", $mime));
  print $content;
  exit;
} else if ( isset($_GET['language']) ) {
  if ( ($content = ResourceManager::getTranslation($_GET['language'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header("Content-Type: application/x-javascript; charset=utf-8");
  print $content;
  exit;
}

?>
