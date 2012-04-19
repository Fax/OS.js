<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains BackgroundService Class
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

    if ( $xml = Package::LoadPackage(Package::TYPE_SERVICE, $user, $system) ) {
      foreach ( $xml as $pi ) {
        $sr_name          = (string) $pi['name'];
        $sr_title         = BackgroundService::SERVICE_TITLE;
        $sr_class         = (string) $pi['class'];
        $sr_description   = BackgroundService::SERVICE_DESC;
        $sr_descriptions  = Array();
        $sr_icon          = BackgroundService::SERVICE_ICON;
        $sr_class         = (string) $pi['class'];

        if ( $name !== null && $name !== $sr_class ) {
          continue;
        }

        foreach ( $pi->property as $prop ) {
          switch ( (string) $prop['name'] ) {
            case "title" :
              if ( isset($prop['language']) ) {
                $sr_titles[((string)$prop['language'])] = ((string) $prop);
              } else {
                $sr_title = (string) $prop;
              }
            break;
            case "description" :
              if ( isset($prop['language']) ) {
                $sr_descriptions[((string)$prop['language'])] = ((string) $prop);
              } else {
                $sr_description = (string) $prop;
              }
            break;
            case "icon" :
              $sr_icon = (string) $prop;
            break;
          }
        }

        if ( !$sr_title && isset($sr_titles[DEFAULT_LANGUAGE]) ) {
          $sr_title = $sr_titles[DEFAULT_LANGUAGE];
        }
        if ( !$sr_description && isset($sr_descriptions[DEFAULT_LANGUAGE]) ) {
          $sr_description = $sr_descriptions[DEFAULT_LANGUAGE];
        }

        $resources = Array();
        foreach ( $pi->resource as $res ) {
          $resources[] = (string) $res;
        }

        $return[$sr_class] = Array(
          "name"          => $sr_name,
          "title"         => $sr_title,
          "titles"        => $sr_titles,
          "description"   => $sr_description,
          "descriptions"  => $sr_descriptions,
          "icon"          => $sr_icon,
          "resources"     => $resources
        );

      }
    }

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
