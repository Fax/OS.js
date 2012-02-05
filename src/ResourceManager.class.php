<?php
/*!
 * @file
 * ResourceManager.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-02-05
 */

/**
 * ResourceManager -- Main OS.js resource Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
abstract class ResourceManager
{

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
   * @package OSjs.Sources
   * @return String
   */
  public static function getFont($font, $compress) {
    $font   = preg_replace("/[^a-zA-Z0-9]/", "", $font);
    $italic = $font == "FreeSerif" ? "Italic" : "Oblique";
    $bos    = $font == "Sansation" ? "/*" : "";
    $boe    = $font == "Sansation" ? "*/" : "";

    $header = <<<EOCSS
@charset "UTF-8";
/*!
 * Font Stylesheet
 *
 * @package OSjs.Fonts
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
   * @param  bool     $resource     Resource file?
   * @param  String   $input        Filename
   * @param  String   $application  Application name (If any)
   * @param  bool     $compress     Enable Compression
   * @return Mixed
   */
  public static function getFile($resource, $input, $application, $compress) {
    $content = "";

    $res   = preg_replace("/\.+/", ".", preg_replace("/[^a-zA-Z0-9\.]/", "", $input));
    $app   = $application ? preg_replace("/[^a-zA-Z0-9]/", "", $application) : null;
    $type  = preg_match("/\.js$/", $res) ? "js" : "css";

    if ( $compress ) {
      if ( $resource ) {
        if ( $app ) {
          $path = sprintf("%s/%s/_min/%s", PATH_APPS, $application, $res);
        } else {
          $path = sprintf("%s/_min/%s", PATH_RESOURCES, $res);
        }
      } else {
        $path = sprintf("%s/_min/%s", PATH_JSBASE, $res);
      }
    } else {
      if ( $resource ) {
        if ( $app ) {
          $path = sprintf("%s/%s/%s", PATH_APPS, $application, $res);
        } else {
          $path = sprintf("%s/%s", PATH_RESOURCES, $res);
        }
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
