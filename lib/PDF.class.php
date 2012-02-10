<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - PDF.class.php
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
