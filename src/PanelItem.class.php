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

/**
 * PanelItem -- Panel Item Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
class       PanelItem
  extends   Package
{
  const PANELITEM_TITLE   = __CLASS__;
  const PANELITEM_ICON    = "emblems/emblem-unreadable.png";
  const PANELITEM_DESC    = __CLASS__;

  /**
   * @constructor
   */
  public function __construct() {
    parent::__construct(Package::TYPE_PANELITEM);
  }

  /**
   * Uninstall PanelItem
   * @see Package::Uninstall()
   */
  public static function Uninstall($package, User $user = null, $system = true) {
    return parent::Uninstall($package, $user, $system);
  }

  /**
   * Install PanelItem
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

    if ( $xml = Package::LoadPackage(Package::TYPE_PANELITEM, $user, $system) ) {
      foreach ( $xml as $pi ) {
        $pi_name          = (string) $pi['name'];
        $pi_title         = PanelItem::PANELITEM_TITLE;
        $pi_class         = (string) $pi['class'];
        $pi_description   = PanelItem::PANELITEM_DESC;
        $pi_descriptions  = Array();
        $pi_icon          = PanelItem::PANELITEM_ICON;
        $pi_class         = (string) $pi['class'];

        if ( $name !== null && $name !== $pi_class ) {
          continue;
        }

        foreach ( $pi->property as $prop ) {
          switch ( (string) $prop['name'] ) {
            case "title" :
              if ( isset($prop['language']) ) {
                $pi_titles[((string)$prop['language'])] = ((string) $prop);
              } else {
                $pi_title = (string) $prop;
              }
            break;
            case "description" :
              if ( isset($prop['language']) ) {
                $pi_descriptions[((string)$prop['language'])] = ((string) $prop);
              } else {
                $pi_description = (string) $prop;
              }
            break;
            case "icon" :
              $pi_icon = (string) $prop;
            break;
          }
        }

        if ( !$pi_title && isset($pi_titles[DEFAULT_LANGUAGE]) ) {
          $pi_title = $pi_titles[DEFAULT_LANGUAGE];
        }
        if ( !$pi_description && isset($pi_descriptions[DEFAULT_LANGUAGE]) ) {
          $pi_description = $pi_descriptions[DEFAULT_LANGUAGE];
        }

        $resources = Array();
        foreach ( $pi->resource as $res ) {
          $resources[] = (string) $res;
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

      }
    }

    return $return;
  }

  /**
   * @see Package::Handle()
   */
  public static function Handle($action, $instance) {
    if ( $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        if ( Package::Load($cname, Package::TYPE_PANELITEM) ) {
          require_once PATH_PACKAGES . "/{$cname}/{$cname}.class.php";
        }

        if ( class_exists($cname) ) {
          return $cname::Event($action, $aargs);
        }
      }
    }

    return false;
  }

}

?>
