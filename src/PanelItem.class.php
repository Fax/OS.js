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
  public static function Uninstall($package, User $user, $system = true) {
    return parent::Uninstall($package, $user, $system);
  }

  /**
   * Install PanelItem
   * @see Package::Install()
   */
  public static function Install($package, User $user, $system = true) {
    if ( $result = parent::Install($package, $user, $system) ) {
      list($doc, $xml) = $result;

      $project_name         = ((string) $xml['name']);
      $project_enabled      = true;
      $project_title        = PanelItem::PANELITEM_ICON;
      $project_titles       = Array();
      $project_description  = PanelItem::PANELITEM_DESC;
      $project_descriptions = Array();
      $project_icon         = PanelItem::PANELITEM_ICON;
      $project_resources    = Array();

      // Parse general attributes
      foreach ( $xml->property as $p ) {
        $val = ((string) $p);
        switch ( $p['name'] ) {
          case "enabled" :
            if ( $val == "false" ) {
              $project_enabled = false;
              break;
            }
            break;
          case "description" :
            if ( $val ) {
              if ( isset($p['language']) && !empty($p['language']) ) {
                $lang = ((string)$p['language']);
                $project_descriptions[$lang] = $val;
                if ( $lang == DEFAULT_LANGUAGE ) {
                  $project_description = $val;
                }
              } else {
                $project_tiles[DEFAULT_LANGUAGE] = $val;
                $project_description = $val;
              }
            }
            break;
          case "title" :
            if ( $val ) {
              if ( isset($p['language']) && !empty($p['language']) ) {
                $lang = ((string)$p['language']);
                $project_titles[$lang] = $val;
                if ( $lang == DEFAULT_LANGUAGE ) {
                  $project_title = $val;
                }
              } else {
                $project_tiles[DEFAULT_LANGUAGE] = $val;
                $project_title = $val;
              }
            }
            break;
          case "icon" :
            if ( $val ) {
              $project_icon = $val;
            }
            break;
        }
      }

      if ( ENV_PRODUCTION ) {
        if ( !$project_enabled ) {
          return false;
        }
      }

      if ( !isset($project_titles[DEFAULT_LANGUAGE]) ) {
        $project_titles[DEFAULT_LANGUAGE] = $project_title;
      }

      if ( isset($xml->resource) ) {
        foreach ( $xml->resource as $r ) {
          $project_resources[] = (string) $r;
        }
      }

      $node = $doc->createElement("panelitem");
      $node->setAttribute("name",         $project_name);
      $node->setAttribute("class",        $class_name);
      $node->setAttribute("title",        $project_title);
      $node->setAttribute("description",  $project_description);
      $node->setAttribute("icon",         $project_icon);

      foreach ( $project_titles as $tl => $tt ) {
        $n = $this->_oDocument->createElement("title");
        $n->setAttribute("language", $tl);
        $n->appendChild(new DomText($tt));
        $node->appendChild($n);
      }
      foreach ( $project_descriptions as $tl => $tt ) {
        $n = $this->_oDocument->createElement("description");
        $n->setAttribute("language", $tl);
        $n->appendChild(new DomText($tt));
        $node->appendChild($n);
      }

      foreach ( $project_resources as $r ) {
        $n = $this->_oDocument->createElement("resource");
        $n->appendChild(new DomText($r));
        $node->appendChild($n);
      }

      $doc->documentElement->appendChild($node);
      if ( $data = $doc->saveXML() ) {
        return self::_PackageOperationSave($data, $user, $system);
      }
    }

    return false;
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
        $pi_description   = (string) $pi['description'];
        $pi_icon          = (string) $pi['icon'];
        $pi_class         = (string) $pi['class'];

        if ( $name !== null && $name !== $pi_class ) {
          continue;
        }

        $resources = Array();
        foreach ( $pi->resource as $res ) {
          $resources[] = (string) $res;
        }

        if ( isset($pi->title) ) {
          foreach ( $pi->title as $title ) {
            $pi_titles[((string)$title['language'])] = ((string) $title);
          }
        }

        $pi_descriptions  = Array();
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

        require_once PATH_PACKAGES . "/{$pi_class}/{$pi_class}.class.php";
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

        Package::Load($cname, Package::TYPE_PANELITEM);

        if ( class_exists($cname) ) {
          return $cname::Event($action, $aargs);
        }
      }
    }

    return false;
  }

}

?>
