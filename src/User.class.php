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

/**
 * User -- Application User Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     DBObject
 * @class
 */
class User
  extends CoreObject {

  const GROUP_NONE        = 0;
  const GROUP_GUEST       = 1;
  const GROUP_USER        = 2;
  const GROUP_PACKAGES    = 128;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  public $id          = -1;
  public $username    = "Undfined";
  public $password    = "";
  public $privilege   = self::GROUP_NONE;
  public $real_name   = "Undefined";
  public $settings    = "{}";

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  public final function __construct(Array $data) {
    foreach ( $data as $k => $v ) {
      $this->$k = $v;
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // METHODS
  /////////////////////////////////////////////////////////////////////////////

  public final function isGuest() {
    return $this->privilege & self::GROUP_GUEST;
  }
  public final function isUser() {
    return $this->privilege & self::GROUP_USER;
  }
  public final function isInGroup($group) {
    return $this->privilege & $group;
  }

  public final function saveUser(Array $session, Array $settings) {
    $this->settings = JSON::encode($settings);
    if ( User::save($this) ) {
      $this->settings = $settings;
      return true;
    }
    $this->settings = $settings;
    return false;
  }

  public final function snapshotSave($name, $config) {
    $sess               = new Session(Array(
      "user_id"         => $this->id,
      "session_name"    => $name,
      "session_config"  => JSON::encode($config),
      "created_at"      => time()
    ));

    if ( $sess = Session::save($sess) ) {
      return $sess;
    }

    return false;
  }

  public final function snapshotLoad($name) {
    return Session::getBySnapshot($this->id, $name);
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTERS
  /////////////////////////////////////////////////////////////////////////////

  public final function getUserInfo() {
    return Array(
      "Username"   => $this->username,
      "Privilege"  => $this->privilege,
      "Name"       => $this->real_name
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  public static function createDefault() {
    return new self(Array(
      "username"    => "Guest",
      "password"    => "",
      "privilege"   => 1,
      "real_name"   => "Guest User"
    ));
  }

  public static function save(User $instance) {
    $values = Array();
    foreach ( $instance as $k => $v ) {
      $values[$k] = $v;
    }

    if ( isset($user->id) && $user->id ) {
      if ( DB::Update("user", $values, Array("id" => $user->id)) ) {
        return $instance;
      }
    } else {
      if ( $id = DB::Insert("user", $values) ) {
        $instance->id = $id;
        return $instance;
      }
    }
    return false;
  }

  public static function getById($id) {
    if ( $res = DB::Select("user", "*", Array("id" => $id), 1) ) {
      return new User($res);
    }
  }

  public static function getByUsername($username) {
    if ( $res = DB::Select("user", "*", Array("username" => $username), 1) ) {
      return new User($res);
    }
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

      $merge["user.installed.packages"] = Array(
        "items" => $results
      );
    }

    return SettingsManager::getSettings($merge);
  }

}

?>
