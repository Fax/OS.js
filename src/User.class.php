<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - User.class.php
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
 * @created 2012-01-04
 */

class Session extends DBObject {
  public static $Table = "session";
  public static $Columns = Array(
    "id"            => "int",
    "user_id"       => "int",
    "session_name"  => "str",
    "session_config"  => "str",
    "created_at"    => "date",
    "modified_at"   => "date"
  );

  public static function getBySnapshot($uid, $name) {
    return self::getByColumn(null, null, null, Array("user_id" => $uid, "session_name" => $name), 1);
  }
}

/**
 * User -- Application User Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     DBObject
 * @class
 */
class User extends DBObject {

  public static $Table = "user";
  public static $Columns = Array(
    "id"          => "int",
    "username"    => "str",
    "password"    => "str",
    "privilege"   => "int",
    "real_name"   => "str",
    "created_at"  => "date",
    "settings"    => "str"
  );

  public final function __construct() {
  }

  public final function saveUser(Array $session, Array $settings) {
    $this->settings = JSON::encode($settings);
    if ( User::save($this, null, "id") ) {
      $this->settings = $settings;
      return true;
    }
    $this->settings = $settings;
    return false;
  }

  public final function snapshotSave($name, $config) {
    $sess               = new Session();
    $sess->user_id      = $this->id;
    $sess->session_name = $name;
    $sess->session_config = JSON::encode($config);
    $sess->created_at   = time();

    if ( $sess = Session::save($sess) ) {
      return $sess;
    }

    return false;
  }

  public final function snapshotLoad($name) {
    return Session::getBySnapshot($this->id, $name);
  }

  public final function getUserInfo() {
    return Array(
      "Username"   => $this->username,
      "Privilege"  => $this->privilege,
      "Name"       => $this->real_name
    );
  }

  public static function createDefault() {
    $u = new self();
    $u->username    = "Guest";
    $u->password    = "";
    $u->privilege   = 1;
    $u->real_name   = "Guest User";

    return $u;
  }

  public static function getByUsername($username, DB $db = null) {
    return self::getByColumn($db, null, null, Array("username" => $username), 1);
  }

  public static function getDefaultSettings($packages) {
    if ( !class_exists("SettingsManager") ) {
      require "SettingsManager.class.php";
    }

    $merge = Array();

    // Panel(s)
    $panel = Array(
      Array("PanelItemMenu", Array(), "left:0"),
      Array("PanelItemSeparator", Array(), "left:38"),
      Array("PanelItemWindowList", Array(), "left:48"),
      Array("PanelItemClock", Array(), "right:0"),
      Array("PanelItemSeparator", Array(), "right:115"),
      Array("PanelItemDock", Array(Array(
        Array(
          "title"  => "About",
          "icon"   => "actions/gtk-about.png",
          "launch" => "SystemAbout"
        ),
        Array(
          "title"  => "System Settings",
          "icon"   => "categories/applications-system.png",
          "launch" => "SystemSettings"
        ),
        Array(
          "title"  => "User Information",
          "icon"   => "apps/user-info.png",
          "launch" => "SystemUser"
        ),
        Array(
          "title"  => "Save and Quit",
          "icon"   => "actions/gnome-logout.png",
          "launch" => "SystemLogout"
        )
      )), "right:120"),
      Array("PanelItemSeparator", Array(), "right:230"),
      Array("PanelItemWeather", Array(), "right:250")
    );

    $merge["desktop.panels"] = Array(
      "items" => Array(
        Array(
          "name"  => "Default",
          "index" => 0,
          "items" => $panel,
          "position" => "top"
        )
      )
    );

    // Desktop Grid
    $merge["desktop.grid"] = Array(
      "items" => Array(
        Array(
          "title"  => "Home",
          "icon"   => "places/user-home.png",
          "launch" => "ApplicationFileManager"
        ),
        Array(
          "title"  => "Browser Compability",
          "icon"   => "status/software-update-urgent.png",
          "launch" => "API::CompabilityDialog"
        )
      )
    );

    // System
    $merge["system.locale.location"] = Array(
      "options" => DateTimeZone::listIdentifiers()
    );

    if ( $packages ) {
      $results = Array();
      foreach ( $packages['Application'] as $pkg_name => $pkg_opts ) {
        $results[] = $pkg_name;
      }
      foreach ( $packages['PanelItem'] as $pkg_name => $pkg_opts ) {
        $results[] = $pkg_name;
      }

      $merge["system.installed.packages"] = Array(
        "items" => $results
      );
    }

    return SettingsManager::getSettings($merge);
  }

}

?>
