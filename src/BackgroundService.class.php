<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains BackgroundService Class
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
 * @created 2012-02-19
 */

/**
 * BackgroundService -- Panel Item Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Desktop
 * @class
 */
class       BackgroundService
  extends   Package
{
  const SERVICE_TITLE   = __CLASS__;
  const SERVICE_ICON    = "emblems/emblem-unreadable.png";
  const SERVICE_DESC    = __CLASS__;

  /**
   * @constructor
   */
  public function __construct() {
    parent::__construct(Package::TYPE_SERVICE);
  }

  /**
   * Uninstall BackgroundService
   * @see Package::Uninstall()
   */
  public static function Uninstall($package, User $user = null, $system = true) {
    return parent::Uninstall($package, $user, $system);
  }

  /**
   * Install BackgroundService
   * @see Package::Install()
   */
  public static function Install($package, User $user = null, $system = true) {
    return parent::Install($package, $user, $system);
  }

  /**
   * @see Package::LoadPackage()
   */
  public static final function LoadPackage($name = null, User $user = null, $system = true) {
    $return = Array();
    return $return;
  }

  /**
   * @see Package::Handle()
   */
  public static function Handle($action, $instance, $ptype = null) {
    return parent::Handle($action, $instance, Package::TYPE_SERVICE);
  }

}

?>
