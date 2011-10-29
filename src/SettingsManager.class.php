<?php
/*!
 * @file
 * Contains SettingsManager Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-29
 */

/**
 * SettingsManager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Server.Core
 * @class
 */
class SettingsManager
{
  public static $Settings = Array(
    // User theme settings
    "desktop.wallpaper.path" => Array(
      "type"  => "filename",
      "value" => "/System/Wallpapers/go2cxpb.png"
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
    "desktop.panel.items" => Array(
      "type" => "list",
      "items" => Array() // Loaded
    ),
    "desktop.panel.position" => Array(
      "type" => "array",
      "options" => Array("top", "bottom"),
      "value" => "top"
    ),

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
