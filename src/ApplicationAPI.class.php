<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains ApplicationAPI Class
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
 * @created 2011-05-25
 */

/**
 * ApplicationAPI -- Application API Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
class ApplicationAPI
{

  /**
   * Read an URL
   * @param  String   $url        URL to read
   * @param  int      $timeout    Read timeout (default 30s)
   * @return String
   */
  public static function readurl($url, $timeout = 30) {
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
  }

  /**
   * Get Media-file information
   * @param  String   $fname      Audio-file path
   * @return Mixed
   */
  public static function mediaInfo($fname, $exists = true) {
    if ( !$exists || $path = ApplicationVFS::exists($fname, true) ) {
      if ( !$exists ) {
        $path = $fname;
      }

      $pcmd   = escapeshellarg($path);
      $result = exec("exiftool -j {$pcmd}", $outval, $retval);
      if ( $retval == 0 && $result ) {
        try {
          $json = (array) JSON::decode(implode("", $outval));
          $json = (array) reset($json);
        } catch ( Exception $e ) {
          $json = Array();
        }
      }

      if ( isset($json["SourceFile"]) ) {
        unset($json["SourceFile"]);
      }
      if ( isset($json["ExifToolVersion"]) ) {
        unset($json["ExifToolVersion"]);
      }
      if ( isset($json["Directory"]) ) {
        unset($json["Directory"]);
      }

      if ( $json ) {
        return $json;
      }
    }

    return false;
  }

  /**
   * Read PDF File
   * @param   String      $fname      Relative file name
   * @see     PDF
   * @return  Mixed
   */
  public static function readPDF($fname, $page = -1) {
    if ( $path = ApplicationVFS::exists($fname, true) ) {
      require PATH_PROJECT_LIB . "/PDF.class.php";
      if ( $ret = PDF::PDFtoSVG($path, $page) ) {
        return Array(
          "info" => PDF::PDFInfo($path),
          "document" => $ret
        );
      }
    }

    return false;
  }

}

?>
