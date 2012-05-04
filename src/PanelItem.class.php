<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains PanelItem Class
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
 * PanelItem -- Panel Item Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Desktop
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
   * @see Package::LoadPackage()
   */
  public static function LoadPackage($iter) {
    $iter_name          = (string) $iter['name'];
    $iter_title         = PanelItem::PANELITEM_TITLE;
    $iter_description   = PanelItem::PANELITEM_DESC;
    $iter_descriptions  = Array();
    $iter_icon          = PanelItem::PANELITEM_ICON;

    foreach ( $iter->property as $prop ) {
      switch ( (string) $prop['name'] ) {
        case "title" :
          if ( isset($prop['language']) ) {
            $iter_titles[((string)$prop['language'])] = ((string) $prop);
          } else {
            $iter_title = (string) $prop;
          }
        break;
        case "description" :
          if ( isset($prop['language']) ) {
            $iter_descriptions[((string)$prop['language'])] = ((string) $prop);
          } else {
            $iter_description = (string) $prop;
          }
        break;
        case "icon" :
          $iter_icon = (string) $prop;
        break;
      }
    }

    if ( !$iter_title && isset($iter_titles[DEFAULT_LANGUAGE]) ) {
      $iter_title = $iter_titles[DEFAULT_LANGUAGE];
    }
    if ( !$iter_description && isset($iter_descriptions[DEFAULT_LANGUAGE]) ) {
      $iter_description = $iter_descriptions[DEFAULT_LANGUAGE];
    }

    $resources = Array();
    foreach ( $iter->resource as $res ) {
      $resources[] = (string) $res;
    }

    return Array(
      "type"          => (string) $iter['type'],
      "packagename"   => (string) $iter['packagename'],
      "name"          => $iter_name,
      "title"         => $iter_title,
      "titles"        => $iter_titles,
      "description"   => $iter_description,
      "descriptions"  => $iter_descriptions,
      "icon"          => $iter_icon,
      "resources"     => $resources
    );
  }

}

?>
