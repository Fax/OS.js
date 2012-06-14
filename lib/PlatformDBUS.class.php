<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Platform DBUS API Class
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
 * @created 2011-06-03
 */

/**
 * PlatformDBUS -- The Platform DBUS API Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @link    http://pecl.php.net/package/DBus
 * @class
 */
abstract class PlatformDBUS extends Platform
{
  protected $_dbus = null; //!< Connection

  /**
   * Create a new DBUS Instance
   * @constructor
   */
  protected function __construct(Dbus $dbus) {
    $this->_dbus = $dbus;
  }

  /**
   * Create a DBUS Connection
   * @return <PlatformDBUS>
   */
  public static function Connect($type = Dbus::BUS_SESSION) {
    $dbus   = new Dbus($type);
    $class  = get_called_class();
    return new $class($dbus);
  }

  /**
   * Create a new DBUS Instance
   * @return <PlatformDBUS>
   */
  public static function Create($name = "org.OSjs.Core", $path = "/org/OSjs/Core", $type = Dbus::BUS_SESSION) {
    $dbus   = new Dbus($type, true);
    $class  = get_called_class();
    $dbus->requestName($name);
    $dbus->registerObject($path, NULL, $class);

    return new $class($dbus);
  }

  /**
   * Main loop
   * @return void
   */
  public function loop() {
    $s = $this->_dbus->waitLoop(1000);
  }

  /**
   * Perform introspection on a connection
   * @return Object
   */
  public function getIntrospect($conn, $obj) {
    $proxy = $this->_dbus->createProxy($conn, $obj, "org.freedesktop.DBus.Introspectable");
    return $proxy->Introspect();
  }
}

?>
