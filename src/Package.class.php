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

abstract class Package
{
  const TYPE_APPLICATION  = 0;
  const TYPE_PANELITEM    = 1;

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
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  public static function Install(Package $p, User $u) {
  }

  public static function Uninstall(Package $p, User $u) {
  }

  public static function Load($name, $type = -1, User $u = null) {
    switch ( (int) $type ) {
      case self::TYPE_APPLICATION :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = Application::init(PACKAGE_BUILD, $name) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load '{$name}'!");
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

  public static function LoadAll($type = -1, User $u = null) {
    switch ( (int) $type ) {
      case self::TYPE_APPLICATION :
        if ( !self::$_LoadedApplications ) {
          if ( $p = Application::init(PACKAGE_BUILD) ) {
            foreach ( $p as $k => $v ) {
              self::$PackageRegister[$type][$k] = $v;
            }
          }
          self::$_LoadedApplications = true;
        }
        break;

      default :
        throw new Exception("Cannot LoadAll type '{$type}'");
        break;
    }
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
   * Get Application JSON data
   * @return Array
   */
  public function getJSON() {
    return self::$PackageRegister[$this->getPackageType()][get_class($this)];
  }
}

?>
