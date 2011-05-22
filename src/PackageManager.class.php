<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - PackageManager.class.php
 *
 * Handles Packages for System and Users
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
 * @created 2012-02-05
 */

/**
 * PackageManager -- Package Managment Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class PackageManager
{

  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Read an XML File
   * @param  String   $config     File to read
   * @return Mixed
   */
  protected static function _readXML($config) {
    if ( file_exists($config) ) {
      if ( $xml = file_get_contents($config) ) {
        if ( $xml = new SimpleXmlElement($xml) ) {
          return $xml;
        }
      }
    }
    return false;
  }

  /**
   * Save an XML File
   * @param  String   $config     File to save
   * @param  XML      $data       SimpleXML Data
   * @return bool
   */
  protected static function _saveXML($config, $data) {
    $dom                      = new DOMDocument('1.0');
    $dom->preserveWhiteSpace  = false;
    $dom->formatOutput        = true;
    $dom->loadXML($data->asXML());
    return file_put_contents($config, $dom->saveXML()) !== false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // METADATA
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Generate a Metadata file
   *
   * This method Generates a Metadata file containing
   * meta information about a list of packages.
   * Only packages with the property "enabled" is enumerated.
   *
   * @param  String     $dir      Directory to seek
   * @return String
   */
  public static function GenerateMetadata($dir) {
    if ( $dh = opendir($dir) ) {
      $dom                      = new DOMDocument('1.0');
      $dom->preserveWhiteSpace  = false;
      $dom->formatOutput        = true;
      $dom->formatOutput        = true;

      $root = $dom->createElement("packages");

      while (false !== ($filename = readdir($dh))) {
        $abspath  = "{$dir}/{$filename}";
        $absmeta  = "{$dir}/{$filename}/metadata.xml";
        $continue = true;

        if ( is_dir($abspath) && file_exists($absmeta) ) {
          if ( $xml = self::_readXML($absmeta) ) {
            // Search for enabled state
            if ( isset($xml->property) ) {
              foreach ( $xml->property as $prop ) {
                if ( strtolower((string) $prop['name']) == "enabled" ) {
                  if ( strtolower((string) $prop) === "false" ) {
                    $continue = false;
                  }
                  break;
                }
              }
            }

            if ( $continue ) {
              $sxe = $dom->importNode(dom_import_simplexml($xml), true);
              $sxe->setAttribute("packagename", $filename);
              $sxe = $root->appendChild($sxe);
            }
          }

        }
      }

      $dom->appendChild($root);

      return $dom->saveXML();
    }

    return false;
  }

  /**
   * Refresh a Metadata file by seeking in directory
   * @param  User     $user     If defined, User VFS is used
   * @return bool
   */
  public static function RefreshMetadata(User $user = null) {
    $config = PACKAGE_BUILD;
    $dir    = PATH_PACKAGES;
    if ( $user ) {
      $config = sprintf(PACKAGE_USER_BUILD, $user->id);
      $dir    = sprintf(PATH_VFS_PACKAGES, $user->id);
    }
    return file_put_contents($config, self::GenerateMetadata($dir)) !== false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // INSTALL / UNINSTALL
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Uninstall a package from Metadata file
   * @param  String   $package    Package name
   * @param  User     $user       User
   * @param  bool     $removal    Remove files ?
   * @return bool
   */
  public static function UninstallPackage($package, User $user, $removal = false) {
    $config = sprintf(PACKAGE_USER_BUILD, $user->id);
    if ( $data = self::_readXML($config) ) {
      $found = false;
      foreach ( $data as $k => $n ) {
        if ( ((string) $n['packagename']) == $package ) {
          $found = $package;
          break;
        }
      }


      if ( $found ) {
        if ( self::_saveXML($config, $data) ) {
          if ( $removal ) {
            $path = sprintf(RESOURCE_VFS_PACKAGE, $user->id, $found, "");
            if ( is_dir($path) ) {
              rrmdir($path);
              if ( !is_dir($path) ) {
                return self::RefreshMetadata($user);
              }
            }
            return false;
          }

          return true;
        }
      }
    }
    return false;
  }

  /**
   * Install a package into Metadata file
   * @param  String   $package  Package name or archive path
   * @param  User     $user     User
   * @return bool
   */
  public static function InstallPackage($package, User $user) {
    $pname    = $package;

    // Extract the archive
    if ( preg_match("/\.zip$/", strtolower($package)) ) {
      $package  = preg_replace("/^\/User/", "", $package);
      $dest     = sprintf(PATH_VFS_PACKAGES, $user->id);
      $archive  = sprintf(PATH_VFS_USER, $user->id) . $package;

      try {
        if ( !Package::ExtractArchive($archive, $dest) ) {
          return false;
        }
      } catch ( Exception $eee ) {
        error_log("EXCEPTION");
        return false;
      }

      $pname = basename($package, ".zip");
    }

    // Now check if the package was installed
    $package = sprintf(RESOURCE_VFS_PACKAGE, $user->id, $pname, "metadata.xml");
    if ( $package = self::_readXML($package) ) {
      if ( ($res = Package::FindPackage($pname, $user)) && !($res["found"]) ) {
        // Now we can compress the resources

        Package::Minimize($pname, $user);

        return self::RefreshMetadata($user);
      }
    }
    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // LISTS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get all packages (internal)
   * @param  User     $user     If defined, User VFS is used
   * @return Array
   */
  protected static function _getPackages(User $user = null) {
    $config = $user ? sprintf(PACKAGE_USER_BUILD, $user->id) : PACKAGE_BUILD;
    if ( $metadata = self::_readXML($config) ) {
      $result = Array();
      foreach ( $metadata as $iter ) {
        $name = ((string) $iter["packagename"]);
        $type = ((string) $iter["type"]);
        if ( $type == "Service" )
          $type = "BackgroundService";

        $result[$name] = $type::LoadPackage($iter);
      }

      ksort($result);

      return $result;
    }

    return Array();
  }

  /**
   * @see PackageManager::GetPackages()
   */
  public static function GetUserPackages(User $user = null) {
    if ( $user ) {
      return self::_getPackages($user);
    }
    return Array();
  }

  /**
   * @see PackageManager::GetPackages()
   */
  public static function GetSystemPackages() {
    return self::_getPackages();
  }

  /**
   * Get all packages
   * @param  User     $user     If defined, User VFS is used
   * @return Array
   */
  public static function GetPackages(User $user = null) {
    return Array(
      "User"    => self::GetUserPackages($user),
      "System"  => self::GetSystemPackages()
    );
  }

}

?>
