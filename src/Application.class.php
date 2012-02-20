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
  public static function Uninstall($package, User $user, $system = true) {
    return parent::Uninstall($package, $user, $system);
  }

  /**
   * Install Application
   * @see Package::Install()
   */
  public static function Install($package, User $user, $system = true) {
    if ( $result = parent::Install($package, $user, $system) ) {
      list($doc, $xml) = $result;

      $project_name         = ((string) $xml['name']);
      $project_category     = ((string) $xml['category']);
      $project_enabled      = true;
      $project_title        = Application::APPLICATION_TITLE;
      $project_titles       = Array();
      $project_icon         = Application::APPLICATION_ICON;
      $project_system       = false;
      $project_compability  = Array();
      $project_mimes        = Array();
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
          case "system" :
            if ( $val == "true" ) {
              $project_system = true;
              $project_category = "system";
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

      // Fallbacks
      if ( !$project_category ) {
        $project_category = "unknown";
      }

      // Parse other nodes
      if ( isset($xml->compability) ) {
        foreach ( $xml->compability as $c ) {
          $project_compability[] = (string) $c;
        }
      }

      if ( isset($xml->mime) ) {
        foreach ( $xml->mime as $m ) {
          $project_mimes[] = (string) $m;
        }
      }

      if ( isset($xml->resource) ) {
        foreach ( $xml->resource as $r ) {
          $project_resources[] = (string) $r;
        }
      }

      $node = $doc->createElement("application");
      $node->setAttribute("name",     $project_name);
      $node->setAttribute("class",    $package);
      $node->setAttribute("title",    $project_title);
      $node->setAttribute("icon",     $project_icon);
      $node->setAttribute("system",   $project_system ? "true" : "false");
      $node->setAttribute("category", $project_category);

      foreach ( $project_titles as $tl => $tt ) {
        $n = $doc->createElement("title");
        $n->setAttribute("language", $tl);
        $n->appendChild(new DomText($tt));
        $node->appendChild($n);
      }
      foreach ( $project_resources as $r ) {
        $n = $doc->createElement("resource");
        $n->appendChild(new DomText($r));
        $node->appendChild($n);
      }
      foreach ( $project_mimes as $c ) {
        $n = $doc->createElement("mime");
        $n->appendChild(new DomText($c));
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
   * @see Package::Handle()
   */
  public static function Handle($action, $instance) {
    if ( $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        Package::Load($cname, Package::TYPE_APPLICATION);

        if ( class_exists($cname) ) {
          return $cname::Event($action, $aargs);
        }
      }
    }

    return false;
  }

  /**
   * @see Package::LoadPackage()
   */
  public static final function LoadPackage($name = null) {
    $return = Array();

    if ( $xml = Package::LoadPackage(Package::TYPE_APPLICATION) ) {
      foreach ( $xml as $app ) {
        $app_name     = (string) $app['name'];
        $app_title    = (string) $app['title'];
        $app_icon     = (string) $app['icon'];
        $app_class    = (string) $app['class'];
        $app_category = (string) $app['category'];
        $app_enabled  = $app['enabled'] === "true" ? true : false;

        if ( $name !== null && $name !== $app_class ) {
          continue;
        }

        $resources = Array();
        foreach ( $app->resource as $res ) {
          $resources[] = (string) $res;
        }

        $mimes     = Array();
        foreach ( $app->mime as $mime ) {
          $mimes[] = (string) $mime;
        }

        $app_titles   = Array();
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
          "resources" => $resources
        );

        require_once PATH_PACKAGES . "/{$app_class}/{$app_class}.class.php";
      }
    }

    return $return;
  }

}

?>
