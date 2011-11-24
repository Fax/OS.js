<?php
/*!
 * @file
 * Contains ApplicationAPI Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
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
   * Get Audio-file information
   * @param  String   $fname      Audio-file path
   * @return Mixed
   */
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

  /**
   * Read PDF File
   * @param   String      $fname      Relative file name
   * @see     PDF
   * @return  Mixed
   */
  public static function readPDF($fname, $page = -1) {
    if ( $path = ApplicationVFS::exists($fname) ) {
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
