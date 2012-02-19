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
{
  const TYPE_APPLICATION  = 0;
  const TYPE_PANELITEM    = 1;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_iType = -1;               //!< Package Type Identifier
  private $_sUUID = "";               //!< Package Instance UUUID

  /**
   * @var Package Registry
   */
  public static $PackageRegister = Array(
    self::TYPE_APPLICATION  => Array(),
    self::TYPE_PANELITEM    => Array()
  );

  protected static $_LoadedApplications = false;
  protected static $_LoadedPanelItems = false;

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct($type) {
    $this->_iType = (int) $type;
    $this->_sUUID = UUID::v4();
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  public static function Install(Package $p, User $u) {
  }

  public static function Uninstall(Package $p, User $u) {
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

        return new $name();
        break;

      case self::TYPE_PANELITEM :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = PanelItem::LoadPackage($name) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load PanelItem '{$name}'!");
          }
        }

        return new $name();
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
    switch ( (int) $type ) {
      case self::TYPE_APPLICATION :
        if ( !self::$_LoadedApplications ) {
          if ( $p = Application::LoadPackage() ) {
            foreach ( $p as $k => $v ) {
              self::$PackageRegister[$type][$k] = $v;
            }
          }
          self::$_LoadedApplications = true;
        }
        break;

      case self::TYPE_PANELITEM :
        if ( !self::$_LoadedPanelItems ) {
          if ( $p = PanelItem::LoadPackage() ) {
            foreach ( $p as $k => $v ) {
              self::$PackageRegister[$type][$k] = $v;
            }
          }
          self::$_LoadedPanelItems = true;
        }
        break;

      default :
        throw new Exception("Cannot LoadAll type '{$type}'");
        break;
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
   * Get Package Metadata
   * @param   int     $type     Package Type
   * @return Array
   */
  public static function GetPackageMeta($type) {
    $result = Array();
    if ( isset(Package::$PackageRegister[$type]) ) {
      foreach ( Package::$PackageRegister[$type] as $k => $v ) {
        if ( $type == Package::TYPE_APPLICATION ) {
          unset($v['resources']);

          $result[$k] = $v;
        } else {
          unset($v['resources']);

          $result[$k] = $v;
        }
      }
    }
    return $result;
  }

  /**
   * Event performed by AJAX
   * @param  String     $uuid         Package UUID
   * @param  String     $action       Package Action
   * @param  Array      $args         Action Arguments
   * @see    Package::Handle
   * @return Mixed
   */
  public static function Event($uuid, $action, Array $args) {
    return Array();
  }

  /**
   * Handle an Package event
   * @param  String       $uuid         Package UUID
   * @param  String       $action       Package Action
   * @param  Package      $instance     Package Instance
   * @return Mixed
   */
  public static function Handle($uuid, $action, $instance) {
    return false;
  }

  /**
   * Register an package
   * @param  String       $uuid         Package UUID
   * @param  Package      $instance     Package Instance
   * @return bool
   */
  public static function Register($uuid, $instance) {
    if ( $uuid ) {
      return true;
    }
    return false;
  }

  /**
   * Flush an package
   * @param  String       $uuid         Package UUID
   * @return bool
   */
  public static function Flush($uuid) {
    if ( $uuid ) {
      return true;
    }
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

  /**
   * Get Package JSON data
   * @return Array
   */
  public function getJSON() {
    return array_merge(Array("uuid" => $this->_sUUID), self::$PackageRegister[$this->getPackageType()][get_class($this)]);
  }
}

?>
