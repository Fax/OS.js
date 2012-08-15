<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - REST.class.php
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
 * @created 2012-08-15
 */

/**
 * REST -- HTTP REST Library
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
abstract class REST
{

  /**
   * Perform a HTTP Request and return content
   *
   * If a GET request is performed the $args array
   * will be applied automagically to the URL. If the user has specified
   * the arguments in the URL, $args is ignored.
   *
   * Plain-text format is the default content-type, available types are:
   * - application/json
   * - application/xml
   *
   * Returns FALSE on error, NULL on no content, String on success (if
   * MIME is specified, a [Resource]). This method contains no error handing.
   *
   * @param   String    $req      Request type
   * @param   String    $url      URL/Host
   * @param   Array     $args     Request arguments (POST/PUT)
   * @param   Array     $headers  Extra HTTP headers
   * @param   String    $mime     Resulted data content-type to return
   *
   * @throws  Exception   From PHP on failure
   * @throws  Error       From PHP on failure
   *
   * @return  Mixed
   */
  public static function performRequest($req, $url, Array $args, Array $headers, $mime) {
    // Apply arguments to URL if not specified by user
    if ( "GET" == strtoupper($req) ) {
      $tst = strstr($url, "?");
      if ( (false === $tst) || (1 === strlen($tst)) ) {
        $url = "{$url}?" . http_build_query($args);
      }

      $args = null;
    }

    if ( $ch = curl_init($url) ) {
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST,   $req);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER,  true);

      // Always ignore if not set
      if ( $args !== null ) {
        curl_setopt($ch, CURLOPT_POST,          true);
        curl_setopt($ch, CURLOPT_POSTFIELDS,    http_build_query($args));
      }
      if ( sizeof($headers) )
        curl_setopt($ch, CURLOPT_HTTPHEADER,    $headers);

      $res = curl_exec($ch);
      curl_close($ch);

      if ( $res ) {
        if ( $mime === "application/json" ) {
          return json_decode($res);
        } else if ( $mime === "application/xml" ) {
          return SimpleXMLElement($res);
        }
      }

      return null;
    }

    return false;
  }

  /**
   * @see REST::performRequest()
   */
  public static function performGET($url, Array $args = Array(), Array $headers = Array(), $mime = null) {
    return self::performRequest("GET", $url, $args, $headers, $mime);
  }

  /**
   * @see REST::performRequest()
   */
  public static function performPOST($url, Array $args = Array(), Array $headers = Array(), $mime = null) {
    return self::performRequest("POST", $url, $args, $headers, $mime);
  }

  /**
   * @see REST::performRequest()
   */
  public static function performDELETE($url, Array $args = Array(), Array $headers = Array(), $mime = null) {
    return self::performRequest("DELETE", $url, $args, $headers, $mime);
  }

  /**
   * @see REST::performRequest()
   */
  public static function performPUT($url, Array $args = Array(), Array $headers = Array(), $mime = null) {
    return self::performRequest("PUT", $url, $args, $headers, $mime);
  }

}

?>
