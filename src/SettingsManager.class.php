<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains SettingsManager Class
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
{
  /**
   * @var Default Settings
   */
  public static $Session = Array();

  /**
   * @see CoreSettings.class.php
   * @var Default Settings
   */
  public static $Settings = Array
  (
    //
    // Window Manager
    //
    "wm.effects.enable" => Array(
      "type"      => "bool",
      "value"     => true
    ),

    //
    // Desktop
    //

    "desktop.wallpaper.path" => Array( // CoreSettings
      "type"  => "filename",
      "value" => ""
    ),
    "desktop.wallpaper.type" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),
    "desktop.background.color" =>  Array( // CoreSettings
      "type"  => "string",
      "value" => ""
    ),
    "desktop.theme" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),
    "desktop.font" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),
    "desktop.icon.theme" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),
    "desktop.cursor.theme" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),

    "desktop.panels" => Array( // CoreSettings
      "type" => "list",
      "items" => Array()
    ),

    "desktop.grid" => Array( // CoreSettings
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

    // Sounds
    "system.sounds.enable" => Array(
      "type" => "bool",
      "value" => true
    ),
    "system.sounds.volume" => Array(
      "type" => "integer",
      "value" => 100
    ),
    "system.sounds.theme" => Array( // CoreSettings
      "type"    => "array",
      "options" => Array(),
      "value"   => ""
    ),

    // Package managment
    /*
    "system.pm.repositories" => Array(
      "type" => "list",
      "items" => Array("localhost")
    ),
    "system.pm.updates.enable" => Array(
      "type" => "bool",
      "value" => true
    ),
    "system.pm.updates.interval" => Array(
      "type" => "integer",
      "value" => 1209600
    ),
     */

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

    "user.session.appmime" => Array(
      "type"  => "list",
      "items" => Array()
    ),

    "user.session.appstorage" => Array(
      "type"  => "list",
      "items" => Array()
    ),

    "user.first-run" => Array(
      "type" => "bool",
      "value" => true
    ),

    "user.autorun" => Array(
      "type" => "list",
      "items" => Array()
    ),
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
