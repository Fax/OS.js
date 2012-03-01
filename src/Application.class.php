<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Application Class
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
 * @created 2011-06-16
 */

/**
 * Application -- Application Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class Application
  extends      Package
{
  const APPLICATION_TITLE   = __CLASS__;
  const APPLICATION_ICON    = "emblems/emblem-unreadable.png";

  /**
   * @constructor
   */
  public function __construct() {
    parent::__construct(Package::TYPE_APPLICATION);
  }

  /**
   * Uninstall Application
   * @see Package::Uninstall()
   */
  public static function Uninstall($package, User $user = null, $system = true) {
    return parent::Uninstall($package, $user, $system);
  }

  /**
   * Install Application
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

    if ( $xml = Package::LoadPackage(Package::TYPE_APPLICATION, $user, $system) ) {
      foreach ( $xml as $app ) {
        $app_name     = (string) $app['name'];
        $app_title    = Application::APPLICATION_TITLE;
        $app_icon     = Application::APPLICATION_ICON;
        $app_titles   = Array();
        $app_class    = (string) $app['class'];
        $app_category = (string) $app['category'];

        if ( $name !== null && $name !== $app_class ) {
          continue;
        }

        foreach ( $app->property as $prop ) {
          switch ( (string) $prop['name'] ) {
            case "title" :
              if ( isset($prop['language']) ) {
                $app_titles[((string)$prop['language'])] = ((string) $prop);
              } else {
                $app_title = (string) $prop;
              }
            break;
            case "icon" :
              $app_icon = (string) $prop;
            break;
            case "system" :
              if ( ((string) $prop) == "true" ) {
                $app_category = "system";
              }
            break;
          }
        }

        if ( !$app_title && isset($app_titles[DEFAULT_LANGUAGE]) ) {
          $app_title = $app_titles[DEFAULT_LANGUAGE];
        }
        if ( !$app_category ) {
          $app_category = "unknown";
        }

        $resources = Array();
        foreach ( $app->resource as $res ) {
          $resources[] = (string) $res;
        }

        $mimes     = Array();
        foreach ( $app->mime as $mime ) {
          $mimes[] = (string) $mime;
        }

        $return[$app_class] = Array(
          "name"      => $app_name,
          "title"     => $app_title,
          "titles"    => $app_titles,
          "icon"      => $app_icon,
          "category"  => $app_category,
          "mimes"     => $mimes,
          "resources" => $resources
        );

      }
    }

    return $return;
  }

  /**
   * @see Package::Handle()
   */
  public static function Handle($action, $instance, $ptype = null) {
    return parent::Handle($action, $instance, Package::TYPE_APPLICATION);
  }

}

?>
