<?php
/*!
 * @file
 * Contains SettingsManager Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-06-29
 */

/**
 * SettingsManager -- OS.js Settings Managment Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
class SettingsManager
{
  /**
   * @var Default Settings
   */
  public static $Settings = Array
  (
    //
    // Window Manager
    //
    "wm.animation.speed" => Array(
      "type"      => "array",
      "options"   => Array("default", "slow", "medium", "fast"),
      "value"     => "default"
    ),
    "wm.animation.windowOpen" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll", "grow"),
      "value"     => "default"
    ),
    "wm.animation.windowClose" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll", "shrink"),
      "value"     => "default"
    ),
    "wm.animation.windowMaximize" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "grow"),
      "value"     => "default"
    ),
    "wm.animation.windowMinimize" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll", "shrink"),
      "value"     => "default"
    ),
    "wm.animation.windowRestore" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll", "grow"),
      "value"     => "default"
    ),
    "wm.animation.menuOpen" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll"),
      "value"     => "default"
    ),
    "wm.animation.menuClose" => Array(
      "type"      => "array",
      "options"   => Array("none", "default", "fade", "scroll"),
      "value"     => "default"
    ),
    "wm.opacity.windowNormal" => Array(
      "type"      => "integer",
      "value"     => 100
    ),
    "wm.opacity.windowMove" => Array(
      "type"      => "integer",
      "value"     => 90
    ),
    "wm.shadows.show" => Array(
      "type"      => "bool",
      "value"     => true
    ),
    "wm.vd.cound" => Array(
      "type"      => "integer",
      "value"     => 2
    ),

    //
    // Desktop
    //

    // User theme settings
    "desktop.wallpaper.path" => Array(
      "type"  => "filename",
      "value" => "/System/Wallpapers/go2cxpb.png"
    ),
    "desktop.wallpaper.type" => Array(
      "type"    => "array",
      "options" => Array("Tiled Wallpaper", "Centered Wallpaper", "Stretched Wallpaper", "Color only"),
      "value"   => "Tiled Wallpaper"
    ),
    "desktop.background.color" =>  Array(
      "type"  => "string",
      "value" => "#005A77"
    ),
    "desktop.theme" => Array(
      "type"    => "array",
      "options" => Array("dark", "light"),
      "value"   => "dark"
    ),
    "desktop.font" => Array(
      "type"    => "array",
      "options" => Array("Sansation", "FreeMono", "FreeSans", "FreeSerif"),
      "value"   => "Sansation"
    ),
    "desktop.cursor.theme" => Array(
      "type"    => "array",
      "options" => Array("Default", "Experimental"),
      "value"   => "Default"
    ),

    // Desktop panel settings
    "desktop.panels" => Array(
      "type" => "list",
      "items" => Array() // Loaded
    ),
    "desktop.panel.position" => Array(
      "type" => "array",
      "options" => Array("top", "bottom"),
      "value" => "top"
    ),

    //
    // System
    //

    // Application registry
    "system.app.registered" => Array(
      "type"    => "array",
      "options" => Array(), // Loaded
      "hidden"  => true
    ),
    "system.panel.registered" => Array(
      "type"    => "array",
      "options" => Array(), // Loaded
      "hidden"  => true
    ),

    // System locale registry
    "system.locale.location" => Array(
      "type" => "array",
      "options" => Array("UTC", "GMT", "Europe/Oslo"),
      "value" => "GMT"
    ),
    "system.locale.date-format" => Array(
      "type" => "string",
      "value" => "%Y%d%m"
    ),
    "system.locale.time-format" => Array(
      "type" => "string",
      "value" => "%H:%i:%s"
    ),
    "system.locale.timestamp-format" => Array(
      "type" => "string",
      "value" => "%Y/%m/%d %H:%i"
    ),
    "user.first-run" => Array(
      "type" => "bool",
      "value" => true
    )
  );

  /**
   * Get the current Settings array
   * @param  Array   $merge    Merge with this array
   * @return Array
   */
  public final static function getSettings(Array $merge) {
    $settings = self::$Settings;
    foreach ( $merge as $mk => $mopts ) {
      if ( isset($settings[$mk]) ) {
        foreach ( $mopts as $ok => $ov ) {
          if ( isset($settings[$mk][$ok]) ) {
            $settings[$mk][$ok] = $ov;
          }
        }
      }
    }
    return $settings;
  }

}

?>
