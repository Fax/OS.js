<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains SettingsManager Class
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
 * @created 2011-06-29
 */

/**
 * SettingsManager -- OS.js Settings Managment Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class SettingsManager
  extends CoreObject
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
    "desktop.panels" => Array(
      "type" => "list",
      "items" => Array()
    ),
    "desktop.grid" => Array(
      "type" => "list",
      "items" => Array()
    ),

    //
    // System
    //

    // System locale registry
    "system.locale.location" => Array(
      "type" => "array",
      "options" => Array(), // Later in Core::getSettings()
      "value" => "UTC"
    ),
    "system.locale.date-format" => Array(
      "type" => "string",
      "value" => "%d-%m-%Y"
    ),
    "system.locale.time-format" => Array(
      "type" => "string",
      "value" => "%H:%i:%s"
    ),
    "system.locale.timestamp-format" => Array(
      "type" => "string",
      "value" => "%d-%m-%Y %H:%i"
    ),
    "system.locale.language" => Array(
      "type" => "string",
      "value" => "default"
    ),

    //
    // USER
    //

    "user.session.confirm" => Array(
      "type" => "bool",
      "value" => true
    ),

    "user.session.autorestore" => Array(
      "type"  => "bool",
      "value" => true
    ),

    "user.session.autosave" => Array(
      "type"  => "bool",
      "value" => true
    ),

    "user.installed.packages" => Array(
      "type"  => "list",
      "items" => Array()
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
