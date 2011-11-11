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
