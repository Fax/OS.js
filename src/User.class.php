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
 * @class
 */
class User
  extends CoreObject {

  const GROUP_NONE        = 0;
  const GROUP_GUEST       = 1;
  const GROUP_USER        = 2;
  const GROUP_ADMIN       = 4;
  const GROUP_PACKAGES    = 128;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  public $id                = -1;                   // User ID
  public $username          = "Undfined";           // User login name
  public $password          = "";                   // User Password
  public $privilege         = self::GROUP_NONE;     // User Group(s)
  public $real_name         = "Undefined";          // User's Real Name
  public $created_at        = null;                 // User Created Timestamp
  public $modified_at       = null;                 // User Modified Timestamp
  public $heartbeat_at      = null;                 // User Heartbeat Timestamp
  public $last_registry     = Array();              // User Last Registry
  public $last_login        = null;                 // User Last login
  public $last_logout       = null;                 // User Last logout
  public $last_session_id   = null;                 // User Last Session ID
  public $last_session      = Array();              // User Last Session
  public $logged_in         = false;                // User is logged in ?!

  public static $Groups = Array(
    self::GROUP_NONE        => "None",
    self::GROUP_GUEST       => "Guest",
    self::GROUP_USER        => "User",
    self::GROUP_PACKAGES    => "Packages"
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  public final function __construct(Array $data) {
    foreach ( $data as $k => $v ) {
      try {
        if ( $k == "last_registry" || $k == "last_session" ) {
          if ( $v ) {
            try {
              $v = JSON::decode($v);
            } catch ( Exception $e ) {
              $v = Array();
            }
          } else {
            $v = Array();
          }
        } elseif ( ($k == "created_at" || $k == "last_login" || $k == "last_logout" || $k == "modified_at" || $k == "heartbeat_at" ) && $v ) {
          $v = new DateTime($v);
        } else if ( $k == "logged_in" ) {
          $v = (int) $v;
        }
      } catch ( Exception $e ) {}

      $this->$k = $v;
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Check if User is in group Guest
   * @return bool
   */
  public final function isGuest() {
    return $this->privilege & self::GROUP_GUEST;
  }

  /**
   * Check if User is in group User
   * @return bool
   */
  public final function isUser() {
    return $this->privilege & self::GROUP_USER;
  }

  /**
   * Check if Admin is in group Admin
   * @return bool
   */
  public final function isAdmin() {
    return $this->privilege & self::GROUP_ADMIN;
  }

  /**
   * Check if User is in group Admin
   * @return bool
   */
  public final function isInGroup($group) {
    return $this->privilege & $group;
  }

  /**
   * Check if User is logged in
   * @return bool
   */
  public final function isLoggedIn() {
    return $this->logged_in === 1 ? true : false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get user Groups
   * @return Array
   */
  public final function getGroups() {
    $groups = Array();
    $group  = $this->privilege;
    foreach ( self::$Groups as $gid => $gname ) {
      if ( $group & $gid ) {
        $groups[$gid] = $gname;
      }
    }
    return $groups;
  }

  /**
   * Get user information JSON
   * @return Array
   */
  public final function getUserInfo() {
    return Array( // NOTE: Locale is client-side
      "User ID"        => $this->id,
      "Username"       => $this->username,
      "Name"           => $this->real_name,
      "Groups"         => $this->getGroups(),
      "Registered"     => ($this->created_at   ? $this->created_at->format("c")  : _("Unknown")),
      "Last Modified"  => ($this->modified_at  ? $this->modified_at->format("c") : _("Unknown")),
      "Last Login"     => ($this->last_login   ? $this->last_login->format("c")  : _("Unknown")),
      "Browser"        => Browser::getInfo()
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC INSTANCE FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new default instance
   * @return User
   */
  public static function createDefault() {
    return new self(Array(
      "username"    => "Guest",
      "password"    => "",
      "privilege"   => self::GROUP_GUEST,
      "real_name"   => "Guest User"
    ));
  }

  /**
   * Save this User instance
   * @param  User     $instance     User instance
   * @return Mixed
   */
  public static function save(User $instance) {
    $values = Array();
    foreach ( $instance as $k => $v ) {
      $values[$k] = $v;
    }

    if ( isset($instance->id) && (($id = $instance->id) > 0) ) {
      if ( DB::Update("user", $values, Array("id" => $id)) ) {
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

  /**
   * Get User by ID
   * @param  int      $id     User ID
   * @return Mixed
   */
  public static function getById($id) {
    if ( $res = DB::Select("user", "*", Array("id" => $id), 1) ) {
      return new User($res);
    }
    return null;
  }

  /**
   * Get User by Username
   * @param  String   $username   Username
   * @return Mixed
   */
  public static function getByUsername($username) {
    if ( $res = DB::Select("user", "*", Array("username" => $username), 1) ) {
      return new User($res);
    }
    return null;
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC CORE FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the Users default session
   * @see Core::_doInit
   * @return Array
   */
  public static function getDefaultSession() {
    return SettingsManager::$Session;
  }

  /**
   * Get the Users default reigstry
   * @see Core::_doInit
   * @return Array
   */
  public static function getDefaultRegistry($packages = Array(), $values = false) {
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
          "title"  => "Control Panel",
          "icon"   => "categories/preferences-system.png",
          "launch" => "SystemControlPanel"
        ),
        Array(
          "title"  => "Save and Quit",
          "icon"   => "actions/gnome-logout.png",
          "launch" => "SystemLogout"
        )
      )), "right:120"),
      Array("PanelItemSeparator", Array(), "right:205"),
      Array("PanelItemWeather", Array(), "right:215")
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
          "title"      => "Home",
          "icon"       => "places/user-home.png",
          "launch"     => "ApplicationFileManager",
          "arguments"  => Array("path" => "/User/Documents")
        ),
        Array(
          "title"     => "Browser Compability",
          "icon"      => "status/software-update-urgent.png",
          "launch"    => "API::CompabilityDialog",
          "arguments" => null
        )
      )
    );

    // System
    $merge["system.locale.location"] = Array(
      "options" => DateTimeZone::listIdentifiers()
    );

    $merge["user.autorun"] = Array(
      "items" => Array(
        "ServiceNoop"
      )
    );

    if ( $packages ) {
      $results = Array();
      foreach ( $packages['Application'] as $pkg_name => $pkg_opts ) {
        $results[] = $pkg_name;
      }
      foreach ( $packages['PanelItem'] as $pkg_name => $pkg_opts ) {
        $results[] = $pkg_name;
      }
      foreach ( $packages['BackgroundService'] as $pkg_name => $pkg_opts ) {
        $results[] = $pkg_name;
      }

      $merge["user.installed.packages"] = Array(
        "items" => $results
      );
    }

    $settings = SettingsManager::getSettings($merge);
    if ( $values ) {
      $values = Array();
      foreach ( $settings as $k => $item ) {
        if ( isset($item["value"]) ) {
          $values[$k] = $item["value"];
        } else if ( isset($item["items"]) ) {
          try {
            $values[$k] = JSON::encode($item["items"]);
          } catch ( Exception $e ) {
            $values[$k] = JSON::encode(Array());
          }
        } else if ( isset($item["array"]) ) {
          try {
            $values[$k] = JSON::encode($item["options"]);
          } catch ( Exception $e ) {
            $values[$k] = JSON::encode(Array());
          }
        }
      }
      return $values;
    }

    return $settings;
  }

}

?>
