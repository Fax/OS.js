<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains PanelItem Class
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

class       PanelItem
  extends   Package
{

  /**
   * @constructor
   */
  public function __construct() {
    parent::__construct(Package::TYPE_PANELITEM);
  }

  /**
   * @see Package::LoadPackage()
   */
  public static final function LoadPackage($name = null) {
    $return = Array();

    if ( $xml = Package::LoadPackage(Package::TYPE_PANELITEM) ) {
      foreach ( $xml as $pi ) {
        $pi_name          = (string) $pi['name'];
        $pi_title         = (string) $pi['title'];
        $pi_class         = (string) $pi['class'];
        $pi_file          = (string) $pi['file'];
        $pi_description   = (string) $pi['description'];
        $pi_descriptions  = Array();
        $pi_icon          = (string) $pi['icon'];
        $pi_class         = (string) $pi['class'];

        if ( $name !== null && $name !== $pi_class ) {
          continue;
        }

        foreach ( $pi->resource as $res ) {
          $resources[] = (string) $res;
        }

        if ( isset($pi->title) ) {
          foreach ( $pi->title as $title ) {
            $pi_titles[((string)$title['language'])] = ((string) $title);
          }
        }

        if ( isset($pi->description) ) {
          foreach ( $pi->description as $description ) {
            $pi_descriptions[((string)$description['language'])] = ((string) $description);
          }
        }

        $return[$pi_class] = Array(
          "name"          => $pi_name,
          "title"         => $pi_title,
          "titles"        => $pi_titles,
          "description"   => $pi_description,
          "descriptions"  => $pi_descriptions,
          "icon"          => $pi_icon,
          "resources"     => $resources
        );

        require_once PATH_PACKAGES . "/{$pi_class}/{$pi_file}";
      }
    }

    return $return;
  }

  /**
   * @see Package::Event()
   */
  public static function Event($uuid, $action, Array $args) {
    return parent::Event($uuid, $action, $args);
  }

  /**
   * @see Package::Handle()
   */
  public static function Handle($uuid, $action, $instance) {
    if ( /*$uuid &&*/ $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        Package::Load($cname, Package::TYPE_PANELITEM);

        if ( class_exists($cname) ) {
          return $cname::Event($uuid, $action, $aargs);
        }
      }
    }

    return false;
  }

  /**
   * @see Package::Flush()
   */
  public static function Register($uuid, $instance) {
    return parent::Flush($uuid, $instance);
  }

  /**
   * @see Package::Flush()
   */
  public static function Flush($uuid) {
    return parent::Flush($uuid);
  }

  /**
   * @see Package::getJSON()
   */
  public function getJSON() {
    return parent::getJSON();
  }

}

?>
