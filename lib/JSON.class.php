<?php
/*!
 * @file
 * JSON.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
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
