<?php
/*!
 * @file
 * PDF.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-11
 */

/**
 * PDF -- Portable Document Format Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
abstract class PDF
{

  /**
   * PDFInfo -- Get information about a PDF document
   * @param   String    $path     The path to PDF
   * @return  Array
   */
  public final static function PDFInfo($path) {
    $exec = "/usr/bin/exiftool";
    if ( file_exists($exec) ) {
      if ( file_exists($path) ) {
        $run = sprintf("%s -ee -j %s", $exec, escapeshellarg($path));
        exec($run, $out, $retv);
        if ( is_array($out) ) {
          $out = implode("", $out);
        }

        if ( !$retv && strlen($out) ) {
          try {
            $json = json_decode($out);
            $json = (Array) reset($json);
          } catch ( Exception $e ) {
            $json = Array();
          }

          if ( $json ) {
            $result = Array();
            $accept = Array("FileSize", "PDFVersion", "PageCount", "Description", "ModifyDate", "CreateDate", "Title", "Creator", "Producer", "Author", "Subject", "Identifier");
            foreach ( $json as $key => $val ) {
              if ( in_array($key, $accept) ) {
                $result[$key] = trim($val);
              }
            }
            return $result;
          }
        }
      }
    }

    return false;
  }

  /**
   * PDFtoSVG -- Convert PDF Document to SVG
   * @param   String    $path       The path to PDF
   * @param   int       $page       Page number (default the first one)
   * @return  String
   */
  public final static function PDFtoSVG($path, $page = -1) {
    $exec = "/usr/bin/pdf2svg";
    if ( file_exists($exec) ) {
      if ( file_exists($path) ) {
        $src = $path;
        $dst = sprintf("/tmp/osjs_%s.tmp", time());
        if ( (int) $page > 0 ) {
          $run = sprintf("%s %s %s %d", $exec, escapeshellarg($src), escapeshellarg($dst), (int) $page);
        } else {
          $run = sprintf("%s %s %s", $exec, escapeshellarg($src), escapeshellarg($dst));
        }

        $out = "";
        exec($run, $out, $retv);
        if ( !$retv && file_exists($dst) ) {
          if ( $content = file_get_contents($dst) ) {
            return $content;
          }
          unlink($dst);
        }
      }
    }

    return false;
  }
}

?>
