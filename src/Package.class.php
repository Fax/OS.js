<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Package Class
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
   * Create a new Package Archive from Project path
   * @param  String     $project      Project absolute path
   * @param  String     $dst_path     Absolute destination path (Default = use internal)
   * @throws ExceptionPackage
   * @return bool
   */
  public static function CreateArchive($project, $dst_path) {
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
   * Extract a Package Archive to project directory
   * @param  String   $package      Absolute package path (zip-file)
   * @param  String   $dst_path     Absolute destination path
   * @throws ExceptionPackage
   * @return bool
   */
  public static function ExtractArchive($package, $dst_path) {
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
   * @return Mixed
   */
  public static function Minimize($package, User $user = null) {
    $path     = $user ? sprintf(PATH_VFS_PACKAGES, $user->id) : PATH_PACKAGES;
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

  /////////////////////////////////////////////////////////////////////////////
  // INSTANCES - STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Load (a) Package(s)
   * @param  Array     $iter     SimpleXML Iter
   * @see    Application
   * @see    PanelItem
   * @see    BackgroundService
   * @return Mixed
   */
  public static function LoadPackage($iter) {
    return false;
  }

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
