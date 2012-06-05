<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - ResourceManager.class.php
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
 * @created 2012-02-05
 */

/**
 * ResourceManager -- Main OS.js resource Class
 *
 * This class handles resource requests.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     CoreSettings
 * @class
 */
abstract class ResourceManager
{

  /////////////////////////////////////////////////////////////////////////////
  // CACHE, COMPRESSION ETC
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Minimize a File
   * @param  String   $base       Base absolute directory
   * @param  String   $filename   The file in directory to compress
   * @return Mixed
   */
  public static function MinimizeFile($base, $filename) {
    $mindir       = sprintf("%s/_min", $base);
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
      $noout = false;
      if ( strtolower($type) == "js" ) {
        if ( BIN_CC_ENABLE ) {
          $args = sprintf("--js=%s --js_output_file=%s", escapeshellarg($tmp_path), escapeshellarg($destination));
          $exec = sprintf("%s %s 2>&1", BIN_CC, $args);
          $noout = true;
        } else {
          $args = sprintf("--preserve-semi --type js --charset UTF-8 %s", escapeshellarg($tmp_path));
          $exec = sprintf("%s %s 2>&1", BIN_YUI, $args);
        }
      } else {
        $args = sprintf("--preserve-semi --type css --charset UTF-8 %s", escapeshellarg($tmp_path));
        $exec = sprintf("%s %s 2>&1", BIN_YUI, $args);
      }

      if ( !$noout ) {
        if ( !($content = shell_exec($exec)) ) {
          $content = "/* FAILED TO GET CONTENTS */";
        }
        $size_after = strlen($content);
      } else {
        shell_exec($exec);
        if ( ($content = @file_get_contents($destination)) ) {
          $size_after = strlen($content);
        } else {
          $size_after = 0;
        }
      }

      // Create the '_min' directory
      if ( !is_dir($mindir) ) {
        mkdir($mindir);
      }

      // Save minimized file
      if ( $noout ? file_exists($destination) : file_put_contents($destination, $content) ) {
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

  /////////////////////////////////////////////////////////////////////////////
  // CORE RESOURCES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Cursor StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getCursor($theme, $compress) {
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $theme = sprintf("cursor.%s.css", $theme);
    $rpath = $compress ? RESOURCE_THEME_MIN : RESOURCE_THEME;

    if ( ENABLE_LOGGING )
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($theme, $compress))));

    if ( file_exists(( $path = sprintf($rpath, $theme) )) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* ERROR 204 */";
      }
      return $content;
    }
  }

  /**
   * Get Theme StyleSheet
   * @param  String   $theme        Theme name
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getTheme($theme, $compress) {
    $theme = preg_replace("/[^a-zA-Z0-9]/", "", $theme);
    $theme = sprintf("theme.%s.css", $theme);
    $rpath = $compress ? RESOURCE_THEME_MIN : RESOURCE_THEME;

    if ( ENABLE_LOGGING )
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($theme, $compress))));

    if ( file_exists(( $path = sprintf($rpath, $theme) )) ) {
      if ( !($content = file_get_contents($path)) ) {
        $content = "/* ERROR 204 */";
      }
      return $content;
    }
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

    if ( ENABLE_LOGGING )
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($font, $compress))));

    $font_name    = addslashes($font);
    $sources      = Array(
      "normal"   => sprintf("%s/%s.ttf",        URI_FONT, $font_name),
      "bold"     => sprintf("%s/%sBold.ttf",    URI_FONT, $font_name),
      "italic"   => sprintf("%s/%s%s.ttf",      URI_FONT, $font_name, $italic),
      "bitalic"  => sprintf("%s/%sBold%s.ttf",  URI_FONT, $font_name, $italic)
    );

    // Base64 Encode fonts
    try {
      $bdocument = @(new SimpleXMLElement(file_get_contents(FONT_CACHE)));
    } catch ( Exception $e ) {
      $bdocument = null;
    }

    foreach ( $sources as $face => $rpath )
    {
      // First check the cache
      if ( $bdocument ) {
        $filename = basename($rpath);
        foreach ( $bdocument as $bn ) {
          if ( ((string)$bn['name']) == $filename ) {
            $sources[$face] = sprintf("data:application/x-font-ttf;base64,%s", (string)$bn);
            break;
          }
        }
        unset($filename);
      }
    }

    unset($bdocument);

    $css = <<<EOCSS
@font-face {
  font-family : OSjsFont;
  src: url("{$sources['normal']}");
}
@font-face {
  font-family : OSjsFont;
  font-weight : bold;
  src: url("{$sources['bold']}");
}
@font-face {
  font-family : OSjsFont;
  font-style : italic;
  src: url("{$sources['italic']}");
}

{$bos}
@font-face {
  font-family : OSjsFont;
  font-weight : bold;
  font-style : italic;
  src: url("{$sources['bitalic']}");
}
{$boe}

body {
  font-family : OSjsFont, Arial;
}
EOCSS;

    if ( $compress ) {
      $css = preg_replace("/\s/", "", $css);
      $css = preg_replace('%/\s*\*.*?\*/\s*%s', '', $css);
    }

    return (file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "resource.css")) . $css);
  }

  /**
   * Get a translation file
   * @param   String    $locale     Locale name
   * @param   boo       $compress   Enable Compression
   * @return  String
   */
  public static function getTranslation($locale, $compress) {
    $locale = preg_replace("/[^a-zA-Z0-9_]/", "", $locale);
    $locale = sprintf("%s.js", $locale);
    $rpath  = $compress ? RESOURCE_LOCALE_MIN : RESOURCE_LOCALE;

    if ( ENABLE_LOGGING )
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($locale, $compress))));

    if ( file_exists(( $path = sprintf($rpath, $locale) )) ) {
      return file_get_contents($path);
    } else {
      return file_get_contents(sprintf($rpath, DEFAULT_LANGUAGE . ".js"));
    }

    return false;
  }

  /**
   * Get a resource file (CSS or JS) [with compression]
   * @param  String   $file         Filename
   * @param  String   $package      Package name (If any)
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getResource($file, $package, $compress) {
    $file     = preg_replace("/\.+/", ".", preg_replace("/[^a-zA-Z0-9\.\-\_]/", "", $file));
    $package  = $package ? preg_replace("/[^a-zA-Z0-9\-\_]/", "", $package) : null;
    $mime     = "text/plain";
    $content  = null;

    if ( ENABLE_LOGGING )
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($file, $package, $compress))));

    if ( $package ) {
      if ( $result = Package::GetResource($package, $file, $compress) ) {
        $mime = $result["mime"];
        $content = $result["content"];
      }
    } else {
      $type = null;
      if ( preg_match("/\.js$/", $file) ) {
        $type = "javascript";
      } else if ( preg_match("/\.css$/", $file) ) {
        $type = "stylesheet";
      }

      $rpath  = $compress ? RESOURCE_CORE_MIN : RESOURCE_CORE;
      $path   = sprintf($rpath, $file);

      if ( file_exists($path) ) {
        $mime = ($type == "javascript") ? "application/x-javascript" : "text/css";
        if ( !($content = file_get_contents($path)) ) {
          $content = "/* ERROR 204 */";
        }
      } else {
        $content = "/* ERROR 404 */";
      }
    }

    return Array($mime, $content);
  }

  /////////////////////////////////////////////////////////////////////////////
  // MISC STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get all preload resources
   * @return Array
   */
  public static function getPreloads() {
    $result  = CoreSettings::getCorePreloads();
    $modules = CoreSettings::getModuleResources();
    foreach ( $modules as $name => $opts ) {
      foreach ( $opts["resources"] as $res ) {
        $result["resources"][] = $res;
      }
    }
    return $result;
  }

  /**
   * Get all resources
   * @see bin/update-compression
   * @return Array
   */
  public static function getAllResources() {
    $result = Array(
      "locales"   => Array(),
      "resources" => Array(),
      "packages"  => Array()
    );

    // Locales
    foreach ( CoreSettings::getLocaleResources() as $locale ) {
      $result['locales'][] = sprintf("%s/%s", PATH_JSLOCALE, $locale);
    }

    // Main Resources
    foreach ( CoreSettings::getCoreResources() as $res ) {
      $result['resources'][] = sprintf("%s/%s", PATH_JSBASE, $res);
    }

    // Dialogs
    foreach ( CoreSettings::getModuleResources() as $name => $opts ) {
      foreach ( $opts["resources"] as $res ) {
        $result['resources'][] = sprintf("%s/%s", PATH_JSBASE, $res);
      }
    }

    // Packages
    if ( $xml = file_get_contents(PACKAGE_BUILD) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        foreach ( $xml as $app ) {
          if ( isset($app->resource) ) {
            foreach ( $app->resource as $r ) {
              $result['packages'][] = sprintf("%s/%s/%s", PATH_PACKAGES, ((string) $app['packagename']), ((string) $r));
            }
          }
        }
      }
    }

    return $result;
  }

}


?>
