<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - MediaFile.class.php
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
 * @created 2011-11-11
 */

/**
 * MediaFile -- Media File Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
abstract class MediaFile
{

  /**
   * PreviewFile() -- Get a preview of a file
   * @param   String    $path     The VFS path
   * @param   String    $source   The Filesystem path
   * @param   String    $mime     MIME Type
   * @param   bool      $iframe   Return HTML Content
   * @return  Mixed
   */
  public static function PreviewFile($path, $source, $mime, $iframe = false) {
    $result = false;
    $max_width    = 240;
    $max_height   = 240;

    if ( preg_match("/^image\//", $mime) && function_exists("ImageCopyResized") ) {
      if ( $iframe ) {
        $ImageMethod  = null;
        $source       = null;

        if ( preg_match("/\.png$/i", $path) ) {
          $ImageMethod = "ImageCreateFromPNG";
        } else if ( preg_match("/\.jpe?g$/i", $path) ) {
          $ImageMethod = "ImageCreateFromJPEG";
        } else if ( preg_match("/\.gif$/i", $path) ) {
          $ImageMethod = "ImageCreateFromGIF";
        }

        if ( $ImageMethod && $source = $ImageMethod($source) ) {
          list($width, $height) = GetImageSize($path);
          if ( $image = ImageCreateTrueColor($max_width, $max_height) ) {
            ImageCopyResized($image, $source, 0, 0, 0, 0, $max_width, $max_height, $width, $height);

            $data = null;
            ob_start();
              ImagePNG($image);
              $data = ob_get_contents();
            ob_end_clean();

            if ( $data ) {
              $src    = sprintf("data:image/png;base64,%s", base64_encode($data));
              $result = sprintf('<img alt="%s" src="%s" width="%d" height="%d" />', basename($path), $src, $max_width, $max_height);
            }

            ImageDestroy($image);
          }

          ImageDestroy($source);
        }
      }
    } else if ( preg_match("/^video\//", $mime) ) {
      if ( $iframe ) {
        $result = sprintf('<video src="/media%s" width="%d" height="%d"></video>', $path, $max_width, $max_height);
      }
    } else if ( preg_match("/^audio\//", $mime) ) {
      if ( $iframe ) {
        $result = sprintf('<audio src="/media%s" width="%d" height="%d"></audio>', $path, $max_width, $max_height);
      }
    } else if ( preg_match("/^text\//", $mime) ) {
      if ( $iframe ) {
        if ( $content = file_get_contents($source) ) {
          $result = sprintf("<pre>%s</pre>", htmlspecialchars(substr($content, 0, 255)));
        }
      }
    }

    return $result;
  }

  /**
   * GetInfo() -- Get information about a media file
   * @param  String   $path   Destination
   * @return Mixed
   */
  public static function GetInfo($path) {
    $result = exec(sprintf("exiftool -j %s", escapeshellarg($path)), $outval, $retval);
    $json   = Array();

    if ( $retval == 0 && $result ) {
      try {
        $json = (array) JSON::decode(implode("", $outval));
        $json = (array) reset($json);
      } catch ( Exception $e ) {
        $json = Array();
      }
    }

    unset($json["FilePermissions"]);
    unset($json["SourceFile"]);
    unset($json["ExifToolVersion"]);
    unset($json["Directory"]);

    return $json;
  }

}

?>
