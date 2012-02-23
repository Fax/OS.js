<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - ResourceManager.class.php
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
 * @created 2012-02-05
 */

/**
 * ResourceManager -- Main OS.js resource Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class ResourceManager
  extends CoreObject
{

  /**
   * Minimize a File
   * @param  String   $base       Base absolute directory
   * @param  String   $filename   The file in directory to compress
   * @return Mixed
   */
  public static function MinimizeFile($base, $filename) {
    $mindir       = sprintf("%s/_min", $base);
    $cmd          = sprintf("%s/yui.sh %s/yuicompressor-2.4.6.jar", PATH_BIN, PATH_VENDOR);
    $type         = preg_match("/\.js$/", $filename) ? "js" : "css";
    $path         = sprintf("%s/%s", $base, $filename);
    $destination  = sprintf("%s/%s", $mindir, $filename);
    $tmp_path     = tempnam("/tmp", "OSjsMin");
    $result       = false;

    if ( file_exists($path) )
    {
      // Remove debugging etc.
      $content     = file_get_contents($path);
      $size_before = strlen($content);
      $content     = preg_replace("/(console)\.(log|info|error|warning|group|groupEnd)\((.*)\);/", "", $content);
      file_put_contents($tmp_path, $content);
      unset($content);

      // Create and execute command
      if ( strtolower($type) == "js" ) {
        $args = sprintf("--preserve-semi --type js --charset UTF-8 %s", escapeshellarg($tmp_path));
      } else {
        $args = sprintf("--preserve-semi --type css --charset UTF-8 %s", escapeshellarg($tmp_path));
      }

      $exec = sprintf("%s %s 2>&1", $cmd, $args);

      if ( !($content = shell_exec($exec)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      $size_after = strlen($content);

      // Create the '_min' directory
      if ( !is_dir($mindir) ) {
        mkdir($mindir);
      }

      // Save minimized file
      if ( file_put_contents($destination, $content) ) {
        $result = Array(
          "filename" => $filename,
          "before"   => $size_before,
          "after"    => $size_after,
          "diff"     => (($size_before - $size_after) / $size_before) * 100
        );
      }
    }

    // Remove temporary file
    unlink($tmp_path);

    return $result;
  }

  /**
   * Get Cursor StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getCursor($theme, $compress) {
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $path = sprintf("%s/%scursor.%s.css", PATH_JSBASE, ($compress ? "_min/" : ""), $theme);
    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }
    return false;
  }

  /**
   * Get Theme StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getTheme($theme, $compress) {
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $path = sprintf("%s/%stheme.%s.css", PATH_JSBASE, ($compress ? "_min/" : ""), $theme);
    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }
    return false;
  }

  /**
   * Get Font StyleSheet
   * @param  String   $font         Font name
   * @param  bool     $compress     Enable Compression
   * @return String
   */
  public static function getFont($font, $compress) {
    $font   = preg_replace("/[^a-zA-Z0-9]/", "", $font);
    $italic = $font == "FreeSerif" ? "Italic" : "Oblique";
    $bos    = $font == "Sansation" ? "/*" : "";
    $boe    = $font == "Sansation" ? "*/" : "";

    $doc_package = " * @package OSjs.Fonts"; // Fix for doxygen

    $header = <<<EOCSS
@charset "UTF-8";
/*!
 * Font Stylesheet
 *
{$doc_package}
 * @author Anders Evenrud <andersevenrud@gmail.com>
 */

EOCSS;


    $template = <<<EOCSS
@font-face {
  font-family : CustomFont;
  src: url('/media/System/Fonts/%1\$s.ttf');
}
@font-face {
  font-family : CustomFont;
  font-weight : bold;
  src: url('/media/System/Fonts/%1\$sBold.ttf');
}
@font-face {
  font-family : CustomFont;
  font-style : italic;
  src: url('/media/System/Fonts/%1\$s{$italic}.ttf');
}
{$bos}
@font-face {
  font-family : CustomFont;
  font-weight : bold;
  font-style : italic;
  src: url('/media/System/Fonts/%1\$sBold{$italic}.ttf');
}
{$boe}

body {
  font-family : CustomFont, Arial;
}
EOCSS;

    $css = sprintf($template, addslashes($font));
    if ( $compress ) {
      $css = preg_replace("/\s/", "", $css);
      $css = preg_replace('%/\s*\*.*?\*/\s*%s', '', $css);
    }
    return ($header . $css);
  }

  /**
   * Get a translation file
   * @param   String    $locale     Locale name
   * @param   boo       $compress   Enable Compression
   * @return  String
   */
  public static function getTranslation($locale, $compress) {
    $res = preg_replace("/[^a-zA-Z0-9_]/", "", $locale);
    if ( $compress ) {
      $filename = sprintf("%s/_min/%s.js", PATH_JSLOCALE, $res);
    } else {
      $filename = sprintf("%s/%s.js", PATH_JSLOCALE, $res);
    }

    if ( file_exists($filename) ) {
      return file_get_contents($filename);
    } else {
      if ( $compress ) {
        $filename = sprintf("%s/_min/%s.js", PATH_JSLOCALE, DEFAULT_LANGUAGE);
      } else {
        $filename = sprintf("%s/%s.js", PATH_JSLOCALE, DEFAULT_LANGUAGE);
      }
      return file_get_contents($filename);
    }

    return false;
  }

  /**
   * Get a resource file (CSS or JS) [with compression]
   * @param  String   $input        Filename
   * @param  String   $package      Package name (If any)
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getFile($input, $package, $compress) {
    $content = "";

    $res   = preg_replace("/\.+/", ".", preg_replace("/[^a-zA-Z0-9\.]/", "", $input));
    $pkg   = $package ? preg_replace("/[^a-zA-Z0-9]/", "", $package) : null;
    $type  = preg_match("/\.js$/", $res) ? "js" : "css";

    if ( $compress ) {
      if ( $pkg ) {
        $path = sprintf("%s/%s/_min/%s", PATH_PACKAGES, $package, $res);
      } else {
        $path = sprintf("%s/_min/%s", PATH_JSBASE, $res);
      }
    } else {
      if ( $pkg ) {
        $path = sprintf("%s/%s/%s", PATH_PACKAGES, $package, $res);
      } else {
        $path = sprintf("%s/%s", PATH_JSBASE, $res);
      }
    }

    if ( file_exists($path) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* FAILED TO GET CONTENTS */";
      }
      return $content;
    }

    return false;
  }

}


?>
