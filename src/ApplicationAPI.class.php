<?php
/*!
 * @file
 * Contains ApplicationAPI Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-25
 */

/**
 * ApplicationAPI Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationAPI
{

  public static function readurl($url, $timeout = 30) {
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
  }

  public static function audioInfo($fname) {
    if ( $path = ApplicationVFS::exists($fname) ) {
      $pcmd   = escapeshellarg($path);
      $result = exec("exiftool -j {$pcmd}", $outval, $retval);
      if ( $retval == 0 && $result ) {
        try {
          $json = (array) json_decode(implode("", $outval));
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

}

?>
