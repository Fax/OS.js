<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - JSON.class.php
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
 * @created 2012-01-20
 */

/**
 * JSON -- JSON Encoding/Decoding library
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class JSON
{
  /**
   * Encode Object to JSON String
   * @param   Mixed   $obj    JSON Object
   * @return  String
   */
  public static function encode($obj) {
    return json_encode($obj);
  }

  /**
   * Decode String to JSON Object/Array
   *
   * This function throws an error if JSON parsing
   * fails.
   *
   * @param   String    $json     JSON String
   * @param   bool      $assoc    Parse as assoc-array (Default = false)
   * @throws  Exception
   * @return  Mixed
   */
  public static function decode($json, $assoc = false) {
    $result = json_decode($json, $assoc);
    $error  = null;

    switch( json_last_error() ) {
      case JSON_ERROR_DEPTH:
        $error = "JSON Maximum stack depth exceeded";
        break;
      case JSON_ERROR_CTRL_CHAR:
        $error = "JSON Unexpected control character found";
        break;
      case JSON_ERROR_SYNTAX:
        $error = "JSON Syntax error, malformed JSON";
        break;
      case JSON_ERROR_NONE:
    }

    if ( $error !== null ) {
      throw new Exception($error);
    }

    return $result;
  }
}

?>
