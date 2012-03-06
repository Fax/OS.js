<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - download.php
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
// FILE DOWNLOADING
///////////////////////////////////////////////////////////////////////////////

$error_400 = false;
$error_401 = false;
$error_404 = false;

if ( (isset($_GET["file"]) && ($path = $_GET['file'])) ) {
  if ( (($user = Core::get()->getUser()) && ($uid = $user->id) ) ) {
    $download = isset($_GET['download']) && ($_GET['download'] === "true");
    $rpath    = dirname($path);
    $rname    = basename($path);

    if ( $rpath && $rname ) {
      $special_charsa = array("?", "[", "]", "/", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");
      $special_charsb = array("?", "[", "]", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");
      $filename       = trim(preg_replace('/\s+/', ' ', str_replace($special_charsa, '', $rname)), '.-_');
      $path           = trim(preg_replace('/\s+/', ' ', str_replace($special_charsb, '', $rpath)), '.-_');
      $base           = sprintf("%s/%d", PATH_VFS, $uid);
      $absolute       = sprintf("%s%s/%s", $base, $path, $filename);

      if ( file_exists($absolute) ) {
        $mime = VFS::GetMIME($absolute);
        header("Content-type: {$mime[1]}");

        if ( $download ) {
          $fsize = filesize($absolute);
          $fmod  = filemtime($absolute);
          $fmod  = strftime("D, d M Y H:i:s", $fmod);

          header("Pragma: public");
          header("Content-Description: File Transfer");
          header("Content-Disposition: attachment; filename=\"{$filename}\"");
          header("Content-Transfer-Encoding: binary");
          header("Content-Length: {$fsize}");
          header("Cache-Control: must-revalidate, post-check=0, pre-check=0, no-cache");
          header("Last-Modified: {$fmod} GMT");
          header("Expires: 0");

          ob_clean();
        }

        print file_get_contents($absolute);

        if ( $download ) {
          flush();
        }
        exit;
      } else {
        $error_404 = true;
      }
    } else {
      $error_400 = true;
    }
  } else {
    $error_401 = true;
  }
}

if ( $error_400 ) {
  header("HTTP/1.0 400 Bad Request");
} else if ( $error_401 ) {
  header("HTTP/1.0 401 Unauthorized");
} else if ( $error_404 ) {
  header("HTTP/1.0 404 Not Found");
} else {
  header("HTTP/1.0 412 Precondition Failed");
}

exit;
?>
