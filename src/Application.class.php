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
 * Application -- Base OS.js Application Class
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

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_sUUID = "";                   //!< Application's UUUID

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  public function __construct() {
    $this->_sUUID = UUID::v4();

    parent::__construct(Package::TYPE_APPLICATION);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Register an application
   * @param  String       $uuid         Application UUID
   * @param  Application  $instance     Application Instance
   * @return bool
   */
  public static function Register($uuid, $instance) {
    if ( $uuid ) {
      return true;
    }
    return false;
  }

  /**
   * Flush an application
   * @param  String       $uuid         Application UUID
   * @return bool
   */
  public static function Flush($uuid) {
    if ( $uuid ) {
      return true;
    }
    return false;
  }

  /**
   * Handle an application event
   * @param  String       $uuid         Application UUID
   * @param  String       $action       Application Action
   * @param  Application  $instance     Application Instance
   * @return Mixed
   */
  public static function Handle($uuid, $action, $instance) {
    if ( $uuid && $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        Application::init(APPLICATION_BUILD, $cname);

        if ( class_exists($cname) ) {
          return $cname::Event($uuid, $action, $aargs);
        }
      }
    }

    return false;
  }

  /**
   * Initialize application(s)
   * @param  String   $config       Configuration path
   * @param  String   $filename     Lock on class-name
   * @return void
   */
  public static function init($config, $classname = null) {
    $return = Array();

    // Parse application data
    if ( $xml = file_get_contents($config) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        foreach ( $xml->application as $app ) {
          $app_name     = (string) $app['name'];
          $app_title    = (string) $app['title'];
          $app_icon     = (string) $app['icon'];
          $app_class    = (string) $app['class'];
          $app_file     = (string) $app['file'];
          $app_system   = (string) $app['system'] == "true";
          $app_category = (string) $app['category'];
          $app_enabled  = $app['enabled'] === "true" ? true : false;
          $app_titles   = Array();

          if ( $classname !== null && $classname !== $app_class ) {
            continue;
          }

          $windows   = Array();
          $resources = Array();
          $mimes     = Array();

          foreach ( $app->window as $win ) {
            $win_id    = (string) $win['id'];
            $win_props = Array();
            $win_html  = "";

            foreach ( $win->property as $p ) {
              $pk = (string) $p['name'];
              $pv = (string) $p;

              switch ( $pk ) {
                case "properties" :
                  $win_props = JSON::decode($pv);
                  break;
                case "content" :
                  $win_html = $pv;
                  break;
              }
            }
            $windows[$win_id] = Array(
              "properties" => $win_props
            );
          }

          foreach ( $app->resource as $res ) {
            $resources[] = (string) $res;
          }

          foreach ( $app->mime as $mime ) {
            $mimes[] = (string) $mime;
          }

          if ( isset($app->title) ) {
            foreach ( $app->title as $title ) {
              $app_titles[((string)$title['language'])] = ((string) $title);
            }
          }

          $return[$app_class] = Array(
            "name"      => $app_name,
            "title"     => $app_title,
            "titles"    => $app_titles,
            "icon"      => $app_icon,
            "category"  => $app_category,
            "mimes"     => $mimes,
            "resources" => $resources/*,
            "class"     => $app_class,
            "windows"   => $windows,
            "system"    => $app_system*/
          );

          require_once PATH_APPS . "/{$app_class}/{$app_file}";
        }
      }
    }

    return $return;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET / GET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @see Package::getJSON()
   */
  public function getJSON() {
    return array_merge(Array("uuid" => $this->_sUUID), parent::getJSON());
  }

}

?>
