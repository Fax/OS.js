<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Package Class
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
 * @created 2012-02-18
 */

/**
 * Package -- Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
abstract class Package
  extends CoreObject
{
  const TYPE_APPLICATION  = 1;
  const TYPE_PANELITEM    = 2;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_iType = -1;               //!< Package Type Identifier

  /**
   * @var Package Registry
   */
  public static $PackageRegister = Array(
    self::TYPE_APPLICATION  => Array(),
    self::TYPE_PANELITEM    => Array()
  );

  protected static $_LoadedApplications = false;    //!< Loading lock
  protected static $_LoadedPanelItems   = false;    //!< Loading lock

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct($type) {
    $this->_iType = (int) $type;
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  public static function Install(Package $p, User $u) {
    if ( $u->isInGroup(User::GROUP_PACKAGES) ) {
      /*
      $class = get_class($p);
      $path  = sprintf("%s/%s/metadata.xml", PATH_PACKAGES, $p);
      if ( file_exists($path) ) {
        return true;
      }
       */
    } else if ( $u->isUser() ) {
    }

    return false;
  }

  public static function Uninstall(Package $p, User $u = null) {
    return false;
  }

  /**
   * Load A Package by name and type
   * @param  String   $name       Package name
   * @param  int      $type       Package type
   * @param  User     $u          User instance
   * @return void
   */
  public static function Load($name, $type = -1, User $u = null) {
    switch ( (int) $type ) {
      case self::TYPE_APPLICATION :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = Application::LoadPackage($name) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load Application '{$name}'!");
          }
        }

        return self::$PackageRegister[$type][$name];
        break;

      case self::TYPE_PANELITEM :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = PanelItem::LoadPackage($name) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load PanelItem '{$name}'!");
          }
        }

        return self::$PackageRegister[$type][$name];
        break;

      default :
        throw new Exception("Cannot Load '{$name}' of type '{$type}'!");
        break;
    }

    return null;
  }

  /**
   * Load All Packages by type
   * @param  int      $type       Package type
   * @param  User     $u          User instance
   * @return void
   */
  public static function LoadAll($type = -1, User $u = null) {
    $loaded = false;

    if ( ($type & self::TYPE_APPLICATION) ) {
      $loaded = true;
      if ( !self::$_LoadedApplications ) {
        if ( $p = Application::LoadPackage() ) {
          foreach ( $p as $k => $v ) {
            self::$PackageRegister[self::TYPE_APPLICATION][$k] = $v;
          }
        }
        ksort(self::$PackageRegister[self::TYPE_APPLICATION]);
        self::$_LoadedApplications = true;
      }
    }
    if ( ($type & self::TYPE_PANELITEM) ) {
      $loaded = true;
      if ( !self::$_LoadedPanelItems ) {
        if ( $p = PanelItem::LoadPackage() ) {
          foreach ( $p as $k => $v ) {
            self::$PackageRegister[self::TYPE_PANELITEM][$k] = $v;
          }
        }
        ksort(self::$PackageRegister[self::TYPE_PANELITEM]);
        self::$_LoadedPanelItems = true;
      }
    }

    if ( !$loaded ) {
      throw new Exception("Cannot LoadAll type '{$type}'");
    }
  }

  /**
   * Load (a) Package(s)
   * @param  String     $name     Package name (if any)
   * @return Mixed
   */
  public static function LoadPackage($name = null) {
    $config = PACKAGE_BUILD;

    if ( $xml = file_get_contents($config) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        if ( $name === self::TYPE_APPLICATION ) {
          return $xml->application;
        } else if ( $name == self::TYPE_PANELITEM ) {
          return $xml->panelitem;
        }
        return $xml;
      }
    }

    return false;
  }

  /**
   * Get installed packages
   * @param  User     $user     User Reference
   * @return Array
   */
  public final static function GetInstalledPackages(User $user) {
    Package::LoadAll(Package::TYPE_APPLICATION | Package::TYPE_PANELITEM, $user);

    return Array(
      "Application" => Package::GetPackageMeta(Package::TYPE_APPLICATION),
      "PanelItem"   => Package::GetPackageMeta(Package::TYPE_PANELITEM)
    );
  }

  /**
   * Get Package Metadata
   * @param   int     $type     Package Type
   * @return Array
   */
  public static function GetPackageMeta($type) {
    $result = Array();
    if ( isset(Package::$PackageRegister[$type]) ) {
      $result = Package::$PackageRegister[$type];
    }
    return $result;
  }

  /**
   * Event performed by AJAX
   * @param  String     $action       Package Action
   * @param  Array      $args         Action Arguments
   * @see    Package::Handle
   * @return Mixed
   */
  public static function Event($action, Array $args) {
    return Array();
  }

  /**
   * Handle an Package event
   * @param  String       $action       Package Action
   * @param  Package      $instance     Package Instance
   * @return Mixed
   */
  public static function Handle($action, $instance) {
    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Package Type
   * @return int
   */
  public final function getPackageType() {
    return $this->_iType;
  }

}

?>
