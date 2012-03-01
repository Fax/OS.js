<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Package Class
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
 * @created 2012-02-18
 */

/**
 * Package -- Package Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class Package
  extends CoreObject
{
  const TYPE_APPLICATION  = 1;
  const TYPE_PANELITEM    = 2;
  const TYPE_SERVICE      = 3;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_iType = -1;               //!< Package Type Identifier

  /**
   * @var Package Registry
   */
  public static $PackageRegister = Array(
    self::TYPE_APPLICATION  => Array(),
    self::TYPE_PANELITEM    => Array(),
    self::TYPE_SERVICE      => Array()
  );

  protected static $_LoadedApplications = false;    //!< Loading lock
  protected static $_LoadedPanelItems   = false;    //!< Loading lock

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct($type) {
    $this->_iType = (int) $type;
  }

  /////////////////////////////////////////////////////////////////////////////
  // MANAGMENT - STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new Zipped Package from Project path
   * @param  String     $project      Project absolute path
   * @param  String     $dst_path     Absolute destination path (Default = use internal)
   * @throws ExceptionPackage
   * @return bool
   */
  public static function CreatePackage($project, $dst_path) {
    $name = basename($project);
    $dest = sprintf("%s/%s.zip", $dst_path, $name);

    // Read all files from project directory
    $items = Array();
    if ( is_dir($project) && $handle = opendir($project)) {
      while (false !== ($file = readdir($handle))) {
        if ( substr($file, 0, 1) !== "." ) {
          if ( !is_dir("{$project}/{$file}") ) {
            $items[] = $file;
          }
        }
      }
    }

    if ( in_array("metadata.xml", $items) ) {
      $metadata  = sprintf("%s/%s", $project, "metadata.xml");
      $resources = Array("metadata.xml", "{$name}.class.php");

      if ( file_exists($metadata) && ($xml = file_get_contents($metadata)) ) {
        if ( $xml = new SimpleXmlElement($xml) ) {
          // Parse resources from Metadata
          if ( isset($xml['schema']) ) {
            $resources[] = (string) $xml['schema'];
          }
          if ( isset($xml->resource) ) {
            foreach ( $xml->resource as $r ) {
              $resources[] = (string) $r;
            }
          }

          // Select files to store in package
          $store = Array();
          foreach ( $resources as $r ) {
            if ( !in_array($r, $items) ) {
              throw new ExceptionPackage(ExceptionPackage::MISSING_FILE, Array($name, $r));
            }
            $store[$r] = file_get_contents(sprintf("%s/%s", $project, $r));
          }

          // Clean up
          unset($items);
          unset($resources);

          // Create a package
          $zip = new ZipArchive();
          if ( ($ret = $zip->open($dest, ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE)) === true ) {
            foreach ( $store as $file => $content ) {
              $zip->addFromString($file, $content);
            }
            if  ( $zip->close() ) {
              return true;
            }
          } else {
            throw new ExceptionPackage(ExceptionPackage::FAILED_CREATE, Array($name, $dest, $ret));
          }
        } else {
          throw new ExceptionPackage(ExceptionPackage::INVALID_METADATA, Array($name));
        }
      } else {
        throw new ExceptionPackage(ExceptionPackage::INVALID_METADATA, Array($name));
      }
    } else {
      throw new ExceptionPackage(ExceptionPackage::MISSING_METADATA, Array($name));
    }

    return false;
  }

  /**
   * Extract a Zipped Package to project directory
   * @param  String   $package      Absolute package path (zip-file)
   * @param  String   $dst_path     Absolute destination path
   * @throws ExceptionPackage
   * @return bool
   */
  public static function ExtractPackage($package, $dst_path) {
    $name = str_replace(".zip", "", basename($package));
    $dest = sprintf("%s/%s", $dst_path, $name);

    // Check if source exists
    if ( !file_exists($package) ) {
      throw new ExceptionPackage(ExceptionPackage::PACKAGE_NOT_EXISTS, Array($package));
    }

    // Check if target exists
    if ( !is_dir($dst_path) && !is_dir($dest) ) {
      throw new ExceptionPackage(ExceptionPackage::INVALID_DESTINATION, Array($dest));
    }

    $zip = new ZipArchive();
    if ( ($ret = $zip->open($package)) === true ) {
      $resources  = Array("{$name}.class.php");
      $packaged   = Array();
      $invalid    = false;

      // Read archived file-names
      for ( $i = 0; $i < $zip->numFiles; $i++ ) {
        $packaged[] = $zip->getNameIndex($i);
      }

      // Read metadata resources
      if ( !in_array("metadata.xml", $packaged) ) {
        throw new ExceptionPackage(ExceptionPackage::MISSING_METADATA, Array($package));
      }

      $mread = false;
      if ( $stream = $zip->getStream("metadata.xml") ) {
        $data = "";
        while ( !feof($stream) ) {
          $data .= fread($stream, 2);
        }
        fclose($stream);

        if ( $data && ($xml = new SimpleXmlElement($data)) ) {
          // Parse resources from Metadata
          if ( isset($xml['schema']) ) {
            $resources[] = (string) $xml['schema'];
          }
          if ( isset($xml->resource) ) {
            foreach ( $xml->resource as $r ) {
              $resources[] = (string) $r;
            }
          }

          $mread = true;
        }
      }

      // Make sure metadata was read
      if ( !$mread ) {
        throw new ExceptionPackage(ExceptionPackage::INVALID_METADATA, Array($package));
      }

      // Check that all files are in the archive
      foreach ( $resources as $r ) {
        if ( !in_array($r, $packaged) ) {
          throw new ExceptionPackage(ExceptionPackage::MISSING_FILE, Array($name, $r));
          break;
        }
      }

      unset($resources);
      unset($packaged);

      // Create destination
      if ( !mkdir($dest) ) {
        throw new ExceptionPackage(ExceptionPackage::FAILED_CREATE_DEST, Array($dest));
      }

      // Extract
      $result = false;
      if ( $zip->extractTo($dest) ) {
        $result = true;
      }

      $zip->close();

      return $result;
    } else {
      throw new ExceptionPackage(ExceptionPackage::FAILED_OPEN, Array($name, $package, $ret));
    }

    return false;
  }

  /**
   * Minimize Package
   * @param  String     $package      Package Name
   * @param  User       $user         User Instance
   * @param  bool       $system       System Application (default = true)
   * @return Mixed
   */
  public static function Minimize($package, User $user = null, $system = true) {
    $path     = self::_GetPackagePath($user, $system);
    $base     = sprintf("%s/%s", $path, $package);
    $metadata = sprintf("%s/%s", $base, "metadata.xml");
    $result   = false;

    if ( is_dir($base) && is_file($metadata) ) {
      if ( $xml = new SimpleXMLElement(file_get_contents($metadata)) ) {
        $result = Array();
        if ( isset($xml->resource) ) {
          foreach ( $xml->resource as $r ) {
            if ( $res = ResourceManager::MinimizeFile($base, (string) $r) ) {
              $result[] = $res;
            }
          }
        }
      }
    }

    return $result;
  }

  /**
   * Uninstall Package
   * @param  String     $package      Package Name
   * @param  User       $user         User Instance
   * @param  bool       $system       System Application (default = true)
   * @return Mixed
   */
  public static function Uninstall($package, User $user = null, $system = true) {
    $buildfile  = self::_GetPackageBuild($user, $system);
    $path       = self::_GetPackagePath($user, $system);
    $class      = get_called_class();
    $base       = sprintf("%s/%s", $path, $package);
    $nodeName   = ($class == "Application" ? "application" : "panelitem");

    $met_xml = simplexml_load_file("{$base}/metadata.xml");
    $res_xml = simplexml_load_file($buildfile);

    $removed = false;
    foreach ( $res_xml as $n ) {
      if ( ((string) $n['class']) == $package ) {
        $dom = dom_import_simplexml($n);
        $dom->parentNode->removeChild($dom);
        $removed = true;
        break;
      }
    }

    if ( $removed ) {
      $doc = new DomDocument("1.0");
      $doc->preserveWhiteSpace = false;
      $doc->formatOutput = true;
      $sxe = $doc->importNode(dom_import_simplexml($res_xml), true);
      $sxe = $doc->appendChild($sxe);

      return file_put_contents($buildfile, $doc->saveXML()) ? true : false;
    }

    return false;
  }

  /**
   * Install Package
   * @param  String     $package      Package Name
   * @param  User       $user         User Instance
   * @param  bool       $system       System Application (default = true)
   * @return Mixed
   */
  public static function Install($package, User $user = null, $system = true) {
    $buildfile  = self::_GetPackageBuild($user, $system, $system);
    $path       = self::_GetPackagePath($user, $system);
    $class      = get_called_class();
    $base       = sprintf("%s/%s", $path, $package);
    $nodeName   = ($class == "Application" ? "application" : "panelitem");

    $met_xml = simplexml_load_file("{$base}/metadata.xml");
    $res_xml = simplexml_load_file($buildfile);

    foreach ( $res_xml->$nodeName as $n ) {
      if ( $n['class'] == $package ) {
        return false;
      }
    }

    // Fix relative icon
    $picon = null;
    foreach ( $met_xml->property as $pp ) {
      if ( ((string)$pp['name']) == "icon" ) {
        $tmp = (string) $pp;
        if ( preg_match("/^\%/", $tmp) ) {
          $picon = sprintf(URI_PACKAGE_RESOURCE, $package, preg_replace("/^\%/", "", $tmp));
        }
        break;
      }
    }

    $tmp = new DomDocument("1.0");
    $sxe = $tmp->importNode(dom_import_simplexml($met_xml), true);

    if ( $picon ) {
      $break = false;
      foreach ( $sxe->childNodes as $nn ) {
        if ( $nn->nodeType == XML_ELEMENT_NODE && $nn->nodeName == "property" ) {
          foreach ( $nn->attributes as $p => $pp ) {
            if ( $p == "name" && $pp->nodeValue == "icon" ) {
              while ( $nn->hasChildNodes() ) {
                $nn->removeChild($nn->firstChild);
              }
              $nn->appendChild(new DomText($picon));
              $break = true;
              break;
            }
          }
        }

        if ( $break )
          break;
      }
    }

    $sxe = $tmp->appendChild($sxe);

    $node = $tmp->documentElement;
    $node->setAttribute("class", $package);

    $dom = new DomDocument("1.0");
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;
    $sxe = $dom->importNode(dom_import_simplexml($res_xml), true);
    $sxe = $dom->appendChild($sxe);
    $dom->documentElement->appendChild($dom->importNode($node, true));

    return file_put_contents($buildfile, $dom->saveXML()) ? true : false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // INSTANCES - STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Load A Package by name and type
   * @param  String     $name         Package name
   * @param  int        $type         Package type
   * @param  User       $u            User instance
   * @param  bool       $system       System Application (default = true)
   * @return void
   */
  public static function Load($name, $type = -1, User $user = null, $system = true) {
    switch ( (int) $type ) {
      case self::TYPE_APPLICATION :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = Application::LoadPackage($name, $user, $system) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load Application '{$name}'!");
          }
        }

        return self::$PackageRegister[$type][$name];
        break;

      case self::TYPE_PANELITEM :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = PanelItem::LoadPackage($name, $user, $system) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load PanelItem '{$name}'!");
          }
        }

        return self::$PackageRegister[$type][$name];
        break;

      /*
      case self::TYPE_SERVICE :
        if ( !isset(self::$PackageRegister[$type][$name]) ) {
          if ( $p = PanelItem::LoadPackage($name, $user, $system) ) {
            self::$PackageRegister[$type][$name] = $p[$name];
          } else {
            throw new Exception("Cannot Load BackgroundService '{$name}'!");
          }
        }

        return self::$PackageRegister[$type][$name];
        break;
      */

      default :
        throw new Exception("Cannot Load '{$name}' of type '{$type}'!");
        break;
    }

    return null;
  }

  /**
   * Load All Packages by type
   * @param  int        $type         Package type
   * @param  User       $user         User instance
   * @param  bool       $system       System Application (default = true)
   * @return void
   */
  public static function LoadAll($type = -1, User $user = null, $system = true) {
    $loaded = false;

    if ( ($type & self::TYPE_APPLICATION) ) {
      $loaded = true;
      if ( !self::$_LoadedApplications ) {
        if ( $p = Application::LoadPackage(null, $user, $system) ) {
          foreach ( $p as $k => $v ) {
            self::$PackageRegister[self::TYPE_APPLICATION][$k] = $v;
          }
        }
        ksort(self::$PackageRegister[self::TYPE_APPLICATION]);
        self::$_LoadedApplications = true;
      }
    }
    if ( ($type & self::TYPE_PANELITEM) ) {
      $loaded = true;
      if ( !self::$_LoadedPanelItems ) {
        if ( $p = PanelItem::LoadPackage(null, $user, $system) ) {
          foreach ( $p as $k => $v ) {
            self::$PackageRegister[self::TYPE_PANELITEM][$k] = $v;
          }
        }
        ksort(self::$PackageRegister[self::TYPE_PANELITEM]);
        self::$_LoadedPanelItems = true;
      }
    }
    /*
    if ( ($type & self::TYPE_SERVICE) ) {
      $loaded = true;
      if ( !self::$_LoadedPanelItems ) {
        if ( $p = PanelItem::LoadPackage(null, $user, $system) ) {
          foreach ( $p as $k => $v ) {
            self::$PackageRegister[self::TYPE_SERVICE][$k] = $v;
          }
        }
        ksort(self::$PackageRegister[self::TYPE_SERVICE]);
        self::$_LoadedPanelItems = true;
      }
    }
     */

    if ( !$loaded ) {
      throw new Exception("Cannot LoadAll type '{$type}'");
    }
  }

  /**
   * Load (a) Package(s)
   * @param  String     $name         Package name (if any)
   * @param  User       $user         User Reference
   * @param  bool       $system       System Application (default = true)
   * @return Mixed
   */
  public static function LoadPackage($name = null, User $user = null, $system = true) {
    $config = self::_GetPackageBuild($user, $system);

    if ( $xml = file_get_contents($config) ) {
      if ( $xml = new SimpleXmlElement($xml) ) {
        if ( $name === self::TYPE_APPLICATION ) {
          return $xml->application;
        } else if ( $name == self::TYPE_PANELITEM ) {
          return $xml->panelitem;
        } else if ( $name == self::TYPE_SERVICE ) {
          return $xml->service;
        }
        return $xml;
      }
    }

    return false;
  }

  /**
   * Get installed packages
   * @param  User     $user     User Reference
   * @return Array
   */
  public final static function GetInstalledPackages(User $user = null) {
    Package::LoadAll(Package::TYPE_APPLICATION | Package::TYPE_PANELITEM/* | Package::TYPE_SERVICE*/, $user);

    return Array(
      "Application"       => Package::GetPackageMeta(Package::TYPE_APPLICATION),
      "PanelItem"         => Package::GetPackageMeta(Package::TYPE_PANELITEM)/*,
      "BackgroundService" => Package::GetPackageMeta(Package::TYPE_SERVICE)*/
    );
  }

  /**
   * Get Package Metadata
   * @param   int     $type     Package Type
   * @return Array
   */
  public static function GetPackageMeta($type) {
    $result = Array();
    if ( isset(Package::$PackageRegister[$type]) ) {
      $result = Package::$PackageRegister[$type];
    }
    return $result;
  }

  /**
   * Get Package Path
   * @param  User       $user         User Reference
   * @param  bool       $system       System Application (default = true)
   * @return String
   */
  protected static function _GetPackagePath(User $user = null, $system = true) {
    /*
    if ( ($user instanceof User) && ($system === false) ) {
      return PATH_HTTP . "/media/User/Packages";
    }
     */
    return PATH_PACKAGES;
  }

  /**
   * Get Package Build File
   * @param  User       $user         User Reference
   * @param  bool       $system       System Application (default = true)
   * @return String
   */
  protected static function _GetPackageBuild(User $user = null, $system = true) {
    /*
    if ( ($user instanceof User) && ($system === false) ) {
      return PATH_HTTP . "/media/User/packages.xml";
    }
     */
    return PACKAGE_BUILD;
  }

  /////////////////////////////////////////////////////////////////////////////
  // EVENTS - STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Event performed by AJAX
   * @param  String     $action       Package Action
   * @param  Array      $args         Action Arguments
   * @see    Package::Handle
   * @return Mixed
   */
  public static function Event($action, Array $args) {
    return Array();
  }

  /**
   * Handle an Package event
   * @param  String       $action       Package Action
   * @param  Mixed        $instance     Package Instance
   * @param  int          $ptyp         Package Type Identifier
   * @return Mixed
   */
  public static function Handle($action, $instance, $ptype = null) {
    if ( $action && $instance ) {
      if ( isset($instance['name']) && isset($instance['action']) ) {
        $cname    = $instance['name'];
        $aargs    = isset($instance['args']) ? $instance['args'] : Array();
        $action   = $instance['action'];

        if ( Package::Load($cname, $ptype) ) {
          require_once PATH_PACKAGES . "/{$cname}/{$cname}.class.php";
        }

        if ( class_exists($cname) ) {
          return $cname::Event($action, $aargs);
        }
      }
    }

    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Package Type
   * @return int
   */
  public final function getPackageType() {
    return $this->_iType;
  }

}

?>
