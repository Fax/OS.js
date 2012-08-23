<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains VFS Class
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
 * @created 2011-06-19
 */

/**
 * VFS -- Application VFS (Virtual Filesystem) Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     CoreSettings
 * @class
 */
abstract class VFS
{

  /////////////////////////////////////////////////////////////////////////////
  // AJAX STUFF
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Available Function Calls
   * @desc The 'key' is the called name
   *       'value' 0 is class method,
   *       'value' 1 splits arguments from call into method parameters
   */
  protected static $_calls = Array(
    "exists"          => Array("Exists"),
    "readdir"         => Array("ListDirectory"),
    "ls"              => Array("ListDirectory"),
    "delete"          => Array("Delete"),
    "rm"              => Array("Delete"),
    "mv"              => Array("Move", Array("path", "file")),
    "rename"          => Array("Move", Array("path", "file")),
    "read"            => Array("ReadFile"),
    "cat"             => Array("ReadFile"),
    "touch"           => Array("TouchFile"),
    "put"             => Array("WriteFile", Array("file", "content", "encoding")),
    "write"           => Array("WriteFile", Array("file", "content", "encoding")),
    "mkdir"           => Array("CreateDirectory"),
    "file_info"       => Array("FileInformation"),
    "fileinfo"        => Array("FileInformation"),
    "readurl"         => Array("ReadURL"),
    "readpdf"         => Array("ReadPDF"),
    "cp"              => Array("Copy", Array("source", "destination")),
    "copy"            => Array("Copy", Array("source", "destination")),
    "upload"          => Array("Upload", Array("file", "path")),
    "ls_archive"      => Array("ListArchive"),
    "extract_archive" => Array("ExtractArchive", Array("archive", "destination"))
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Call a static function by name and argument(s)
   * @param  String     $name       Static Function Name
   * @param  Mixed      $arguments  Function Call Arguments
   * @return Mixed
   */
  public static function __callStatic($name, $arguments) {
    if ( isset(self::$_calls[$name]) ) {
      $iter = self::$_calls[$name];
      $func = $iter[0];
      $args = isset($iter[1]) ? $iter[1] : null;

      if ( $args ) {
        $tmp = Array();
        $arg = reset($arguments);
        foreach ( $args as $a ) {
          $tmp[] = isset($arg[$a]) ? $arg[$a] : false;
        }
        $arguments = $tmp;
      }

      if ( ENABLE_LOGGING )
        Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($name, $func, $arguments))));

      return call_user_func_array(Array(__CLASS__, $func), $arguments);
    }

    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Check the VFS for permission
   * @param  String     $path         The relative path
   * @param  int        $method       Requested Attribute
   * @see    VFS::buildPath()
   * @return bool
   */
  public static function checkVirtual($path, $method = VFS_ATTR_READ) {
    // Skip root directory if we are doing a write operation
    if ( ($method & VFS_ATTR_WRITE) ) {
      if ( $path == "/" ) {
        if ( ENABLE_LOGGING && ENABLE_DEBUGGING ) {
          Logger::logInfo(sprintf("%s: %s", __METHOD__, "Skipping directory '$path', root or system dir"));
        }
        return false;
      }
    }

    $result = true;
    $virtual = CoreSettings::getVFSMeta();
    foreach ( $virtual as $k => $v ) {
      if ( startsWith($path, $k) ) {
        // Check given permission against virtual folder
        $attr = (int)$v['attr'];
        if ( ($attr < VFS_ATTR_READ) || (($attr == VFS_ATTR_READ) && ($method != VFS_ATTR_READ)) || !($attr & $method) ) {
          $result = false;
          break;
        }

        // User directories requires a user
        if ( ($v['type'] == "chroot") || ($v['type'] == "user") ) {
          if ( Core::get() && !(($user = Core::get()->getUser()) && ($uid = $user->id) ) ) {
            $result = false;
            break;
          }
        }

        break;
      }
    }

    return $result;
  }

  /**
   * Build a absolute path and check permissions in VFS
   * @param  String     $path         The relative path
   * @param  int        $method       Requested Attribute
   * @return Array
   */
  public static function buildPath($path, $method = VFS_ATTR_READ) {
    $blacklist  = array("?", "[", "]", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");
    $path       = preg_replace("/\/+/", "/", preg_replace("/\/$/", "", str_replace($blacklist, "", $path)));
    $permission = false;

    // Create and validate absoulte path
    if ( preg_match("/^\/User/", $path) ) {
      $uid = 0;
      if ( (Core::get()) && ($user = Core::get()->getUser()) ) {
        $uid = $user->id;
      }
      $root = sprintf(PATH_VFS_USER, $uid);
      $path = preg_replace("/\/+/", "/", preg_replace("/^\/User/", "/", $path));
    } else {
      $root = PATH_MEDIA;
    }

    $abs = get_absolute_path(sprintf("%s%s", $root, $path));
    if ( preg_match(sprintf("/^%s/", preg_quote($root, "/")) , $abs) ) {
      $permission = self::checkVirtual($path, $method);
    }

    return Array(
      "path" => $path,
      "root" => $abs,
      "perm" => $permission
    );
  }

  /**
   * Fix unknown MIME by using file extension
   * @param  String   $mime   MIME Type
   * @param  String   $ext    File Extenstion
   * @return String
   */
  /**
   * MediaInformation() -- Get information about a media file
   * @param  String   $path   Destination
   * @param  bool     $bpath  Build Path?
   * @return Mixed
   */
  public static function MediaInformation($path, $bpath = false) {
    require_once PATH_LIB . "/MediaFile.class.php";
    if ( $bpath ) {
      $tmp = self::buildPath($path);
      if ( !$tmp["perm"] ) {
        return false;
      }
      $path = $tmp["root"];
    }

    if ( ($json = MediaFile::GetInfo($path)) ) {
      $json["MIMEType"] = self::GetMIME($path, true);
      return $json;
    }

    return false;
  }

  /**
   * GetMIME() -- Get a file MIME information
   * @return Array
   */
  public static function GetMIME($path, $fixed_only = false) {
    $expl = explode(".", $path);
    $ext  = @strtolower(end($expl));

    $fi = new finfo(FILEINFO_MIME);
    $finfo = $fi->file($path);
    //$mime  = explode("; charset=", $finfo);
    $mime  = explode(";", $finfo);
    $mime  = trim(reset($mime));
    $fmime = $mime;

    // Fix mime type by extension
    $fixes = CoreSettings::getMimeFixes();
    if ( isset($fixes[$mime]) ) {
      if ( isset($fixes[$mime][$ext]) ) {
        $fmime = $fixes[$mime][$ext];
      }
    }

    return $fixed_only ? $fmime : Array($mime, $fmime);
  }

  /**
   * Set permissions
   * @return void
   */
  protected static function _permissions($dest, $dir = false) {
    if ( VFS_SET_PERM ) {
      if ( $u = VFS_USER ) {
        chown($dest, $u);
      }
      if ( $g = VFS_GROUP ) {
        chgrp($dest, $g);
      }
      if ( $dir ) {
        if ( $p = VFS_DPERM ) {
          chmod($dest, $p);
        }
      } else {
        if ( $p = VFS_FPERM ) {
          chmod($dest, $p);
        }
      }
      if ( $m = VFS_UMASK ) {
        umask($dest, $m);
      }
    }
  }

  /**
   * Get file icon from MIME and Extension
   * @param  String   $mime       Full mime type
   * @param  String   $ext        File-extension
   * @param  String   $icon       Default icon
   * @see    VFS::_$MimeIcons
   * @see    VFS::_$IconsExt
   * @return String
   */
  public final static function getFileIcon($mime, $ext, $icon = "mimetypes/binary.png") {
    $ext = strtolower($ext);

    if ( $ecions = CoreSettings::getExtIcons() ) {
      if ( isset($ecions[$ext]) ) {
        return $ecions[$ext];
      }
    }

    if ( ($micons = CoreSettings::getMimeIcons()) ) {
      $tmpx   = explode("/", $mime);
      $mmime  = reset($tmpx);

      if ( isset($micons[$mmime]) ) {
        $iter = $micons[$mmime];
        if ( is_string($iter) ) {
          $icon = $iter;
        } else {
          if ( isset($iter[$mime]) ) {
            if ( is_string($iter[$mime]) ) {
              $icon = $iter[$mime];
            } else {
              if ( isset($iter[$mime][$ext]) ) {
                $icon = $iter[$mime][$ext];
              } else {
                if ( isset($iter[$mime]["_"]) ) {
                  $icon = $iter[$mime]["_"];
                }
              }
            }
          } else {
            if ( isset($iter["_"]) ) {
              $icon = $iter["_"];
            }
          }
        }
      }
    }

    return $icon;
  }

  /////////////////////////////////////////////////////////////////////////////
  // METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * ListDirectory() -- List directory contents
   * @param  Array    $argv     Arguments
   * @return Array
   */
  public static function ListDirectory($argv) {
    $path    = $argv['path'];
    $ignores = isset($argv['ignore']) ? $argv['ignore'] : null;
    $mimes   = isset($argv['mime']) ? ($argv['mime'] ? $argv['mime'] : Array()) : Array();
    $uid     = 0;

    if ( !(($user = Core::get()->getUser()) && ($uid = $user->id)) ) {
      return false;
    }

    if ( $ignores === null ) {
      $ignores = CoreSettings::getIgnoreFiles();
    }

    $base     = PATH_MEDIA;
    $absolute = "{$base}{$path}";
    $apps     = false;
    $chroot   = false;
    $uchroot  = false;

    $virtual = CoreSettings::getVFSMeta();
    foreach ( $virtual as $k => $v ) {
      if ( startsWith($path, $k) ) {
        if ( $v['type'] == "system_packages" ) {
          $apps = 1;
        } else if ( $v['type'] == "user_packages" ) {
          $apps = 2;
        } else if ( $v['type'] == "chroot" ) {
          $chroot = true;
        } else if ( $v['type'] == "user" ) {
          $uchroot = true;
        }
        break;
      }
    }

    // If we are browsing apps folder
    if ( $apps ) {
      $items = Array();
      $xpath = explode("/", $path);
      array_pop($xpath);
      $fpath = implode("/", $xpath);

      $items[".."] = Array(
          "path"       => $fpath,
          "size"       => 0,
          "mime"       => "",
          "icon"       => "status/folder-visiting.png",
          "type"       => "dir",
          "protected"  => 1
      );

      if ( $apps == 1 ) {
        if ( $packages = PackageManager::GetSystemPackages() ) {
          foreach ( $packages as $c => $opts ) {
            $items["{$opts['title']} ($c)"] = Array(
              "path"       => "{$path}/{$c}",
              "size"       => 0,
              "mime"       => "OSjs/{$opts["type"]}",
              "icon"       => $opts['icon'],
              "type"       => "file",
              "protected"  => 1,
            );
          }
        }
      } else if ( $apps == 2 ) {
        if ( $packages = PackageManager::GetUserPackages(Core::get()->getUser()) ) {
          foreach ( $packages as $c => $opts ) {
            $items["{$opts['title']} ($c)"] = Array(
              "path"       => "{$path}/{$c}",
              "size"       => 0,
              "mime"       => "OSjs/{$opts["type"]}",
              "icon"       => $opts['icon'],
              "type"       => "file",
              "protected"  => 1,
            );
          }
        }
      }

      return $items;
    } else if ( $chroot ) {
      $absolute = sprintf("%s/%d", PATH_VFS, $uid);
    } else if ( $uchroot ) {
      $absolute = sprintf("%s/%d%s", PATH_VFS, $uid, preg_replace("/^\/+?User/", "", $path));
    }

    $absolute = preg_replace("/\/+/", "/", $absolute);

    // Read directory
    if ( is_dir($absolute) && $handle = opendir($absolute)) {
      $items = Array("dir" => Array(), "file" => Array());
      while (false !== ($file = readdir($handle))) {
        if ( in_array($file, $ignores) ) {
          continue;
        }

        // Remove relatives
        if ( $path == "/" && in_array($file, Array("..")) ) {
          continue;
        }

        $icon      = "places/folder.png";
        $type      = "dir";
        $fsize     = 0;
        $mime      = "";
        $protected = false;

        if ( $file == ".." ) {
          $xpath = explode("/", $path);
          array_pop($xpath);
          $fpath = implode("/", $xpath);
          if ( !$fpath ) {
            $fpath = "/";
          }
          $icon = "status/folder-visiting.png";
          $protected = true;
        } else {
          $abs_path = "{$absolute}/{$file}";
          $rel_path = "{$path}/{$file}";

          $expl = explode(".", $file);
          $ext  = end($expl);

          if ( is_file($abs_path) || is_link($abs_path) ) {
            // Read MIME info
            $type  = "file";
            $add   = sizeof($mimes) ? false : true;
            $mime  = self::GetMIME($abs_path, true);
            $fmime = strstr($mime, "/", true);

            foreach ( $mimes as $m ) {
              $m = trim($m);

              if ( preg_match("/\/\*$/", $m) ) {
                if ( strstr($m, "/", true) == $fmime ) {
                  $add = true;
                  break;
                }
              } else {
                if ( $mime == $m ) {
                  $add = true;
                  break;
                }
              }
            }

            if ( !$add ) {
              continue;
            }

            $fsize = filesize($abs_path);
            $icon  = self::getFileIcon($mime, $ext);
          } else if ( is_dir($abs_path) ) {
            $tpath = preg_replace("/\/+/", "/", $rel_path);
            if ( isset($virtual[$tpath]) ) {
              $icon = $virtual[$tpath]['icon'];
            }
          } else {
            continue;
          }

          $fpath = $rel_path;
        }

        $fpath = preg_replace("/\/+/", "/", $fpath);
        $tmp_path = dirname($fpath);

        // FIXME: This is some temporary stuff
        if ( $tmp_path == "/" || preg_match("/\/System/", $tmp_path) ) {
          $protected = true;
        } else {
          foreach ( $virtual as $k => $v ) {
            if ( startsWith($fpath, $k) ) {
              if ( !(((int)$v["attr"]) & VFS_ATTR_RW) ) { // FIXME NOTE
                $protected = true;
              }
              break;
            }
          }
        }

        $items[$type][$file] =  Array(
          "path"       => $fpath,
          "size"       => $fsize,
          "mime"       => $mime,
          "icon"       => $icon,
          "type"       => $type,
          "protected"  => $protected ? 1 : 0
        );

      }

      ksort($items["dir"]);
      ksort($items["file"]);

      closedir($handle);

      return array_merge($items["dir"], $items["file"]);
    }

    return Array();
  }

  /**
   * ListArchive() -- Read a archive file
   * @param  String   $arch   Archive filename
   * @param  String   $path   Archive path (default /)
   * @return Mixed
   */
  public static function ListArchive($arch, $path = "/") {
    $src = self::buildPath($arch);
    if ( $src["perm"] && file_exists($src["root"]) ) {
      require_once PATH_LIB . "/Archive.php";

      $result = Array("dir" => Array(), "file" => Array());

      try {
        if ( $a = Archive::open($src["root"]) ) {
          foreach ( $a->read() as $f ) {
            $file  = trim($f['name']);
            $size  = $f['size_real'];
            $type  = substr($file, -1) == "/" ? "dir" : "file";
            $mime  = $type == "file" ? MIME_OCTET : "";
            $icon  = $type == "file" ? "mimetypes/binary.png" : "places/folder.png";
            $fname = "/{$file}";

            $result[$type][$file] = Array(
              "path"       => $fname,
              "size"       => $size,
              "mime"       => $mime,
              "icon"       => $icon,
              "type"       => $type,
              "protected"  => 0
            );

          }
        }
      } catch ( Exception $e ) {
        $result = false;
      }

      if ( $result ) {
        ksort($result["dir"]);
        ksort($result["file"]);

        return array_merge($result["dir"], $result["file"]);
      }
    }

    return false;
  }

  /**
   * ExtractArchive() -- Extract archive file
   * @param  String   $arch   Archive filename
   * @param  String   $path   Archive path (default /)
   * @return Mixed
   */
  public static function ExtractArchive($arch, $dest) {
    $src  = self::buildPath($arch);
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);

    if ( $src["perm"] && $dest["perm"] ) {
      if ( file_exists($src["root"]) && is_dir($dest["root"]) ) {
        require_once PATH_LIB . "/Archive.php";
        if ( $a = Archive::open($src["root"]) ) {
          return $a->extract($dest["root"]);
        }
      }
    }

    return false;
  }

  /**
   * Copy() -- Copy a file
   * @param  String   $src    Source
   * @param  String   $dest   Destination
   * @return bool
   */
  public static function Copy($src, $dest) {
    $src  = self::buildPath($src);
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);

    if ( $src["perm"] && $dest["perm"] ) {
      if ( file_exists($src["root"]) ) {
        $check = false;
        $dest = $dest["root"];
        if ( is_dir($dest) ) {
          if ( is_file($src["root"]) ) {
            $fname = basename($src["root"]);
            if ( !preg_match(sprintf("/%s$/", preg_quote($fname, "/")), $dest) ) {
              $dest = sprintf("%s/%s", $dest, $fname);
            }
          } else {
            $tmp   = explode("/", $src["root"]);
            $fname = end($tmp);
            if ( !preg_match(sprintf("/%s$/", preg_quote($fname, "/")), $dest) ) {
              $dest = sprintf("%s/%s", $dest, $fname);
            }

            @recurse_copy($src["root"], $dest);
            $check = $dest;
          }
        }

        if ( $check ) {
          return file_exists($check);
        }
        return @copy($src["root"], $dest);
      }
    }

    return false;
  }

  /**
   * Move() -- Move a file
   * @param  String   $src    Source
   * @param  String   $name   New name or path
   * @return bool
   */
  public static function Move($src, $name) {
    if ( !preg_match("/^\/(.*)/", $name) ) {
      $tmp   = explode("/", $src);
      $fname = end($tmp);
      $re    = sprintf("/\/%s$/", preg_quote($fname, "/"));
      $rep   = sprintf("/%s", $name);
      $name  = preg_replace($re, $rep, $src);
    } else {
      $name  = preg_replace(sprintf("/%s$/", preg_quote(basename($src))), $name, $src);
    }

    $src   = self::buildPath($src, VFS_ATTR_WRITE);
    $dest  = self::buildPath($name, VFS_ATTR_WRITE);
    if ( $src["perm"] && $dest["perm"] ) {
      if ( file_exists($src["root"]) && !(file_exists($dest["root"]) || is_dir($dest["root"])) ) {
        return @rename($src["root"], $dest["root"]);
      }
    }

    return false;
  }

  /**
   * Delete() -- Delete a file/directory
   * @param  String   $dest   Destination
   * @return bool
   */
  public static function Delete($dest) {
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);
    if ( $dest["perm"] ) {
      if ( file_exists($dest["root"]) ) {
        if ( is_file($dest["root"]) ) {
          return @unlink($dest["root"]);
        } else if ( is_dir($dest["root"]) ) {
          @rrmdir($dest["root"]);
          @rmdir($dest["root"]);
          return file_exists($dest["root"]) ? false : true;
        }
      }
    }

    return false;
  }

  /**
   * ReadFile() -- Read contents of a file
   * @param  String   $dest   Destination
   * @return bool
   */
  public static function ReadFile($dest) {
    $dest = self::buildPath($dest);
    if ( $dest["perm"] ) {
      if ( file_exists($dest["root"]) && is_file($dest["root"]) ) {
        return file_get_contents($dest["root"]);
      }
    }

    return false;
  }

  /**
   * TouchFile() -- Touch a file
   * @param  String   $dest     Destination
   * @return bool
   */
  public static function TouchFile($dest) {
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);
    if ( $dest["perm"] ) {
      return @touch($dest["root"]);
    }

    return false;
  }

  /**
   * WriteFile() -- Write contents to a file
   * @param  String   $dest     Destination
   * @param  Mixed    $content  Contents
   * @param  String   $encoding File encoding
   * @return bool
   */
  public static function WriteFile($dest, $content, $encoding = false) {
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);
    if ( $dest["perm"] ) {
      //if ( $encoding === "data:image/png;base64" ) {
      if ( preg_match("/^data\:((.*)\/(.*));base64$/", $encoding) ) {
        $content = base64_decode(str_replace(Array("{$encoding},", " "), Array("", "+"), $content));
      }

      return @file_put_contents($dest["root"], $content);
    }

    return false;
  }

  /**
   * ReadURL() -- Read contents of an URL
   * @param  String   $url        Destination
   * @param  int      $timeout    Timeout in seconds
   * @return bool
   */
  public static function ReadURL($url, $timeout = 30) {
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
  }

  /**
   * CreateDirectory() -- Create a directory
   * @param  String   $dest   Destination
   * @return bool
   */
  public static function CreateDirectory($dest) {
    $dest = self::buildPath($dest, VFS_ATTR_WRITE);
    if ( $dest["perm"] ) {
      if ( !(file_exists($dest["root"]) || is_dir($dest["root"])) ) {
        if ( $result = @mkdir($dest["root"]) ) {
          self::_permissions($dest["root"], true);
        }
        return $result ? true : false;
      }
    }

    return false;
  }

  /**
   * Exists() -- Check if file/dir exists
   * @param  String   $dest   Destination
   * @return bool
   */
  public static function Exists($dest) {
    $dest = self::buildPath($dest);
    if ( (file_exists($dest["root"])) ) {
      return true;
    }

    return false;
  }

  /**
   * FileInformation() -- Get information about a file
   * @param  String   $dest   Destination
   * @return Mixed
   */
  public static function FileInformation($dest) {
    $dest = self::buildPath($dest);
    if ( $dest["perm"] ) {
      if ( file_exists($dest["root"]) ) {
        // Read MIME info
        $info   = null;
        $mime   = self::GetMIME($dest["root"], true);

        switch ( @trim(strstr($mime, "/", true)) ) {
          case "image" :
          case "audio" :
          case "video" :
            $info = self::MediaInformation($dest["root"], false);
          break;
        }

        return Array(
          "filename" => basename($dest["path"]),
          "path"     => $dest["path"],
          "size"     => filesize($dest["root"]),
          "mime"     => $mime,
          "info"     => $info
        );
      }
    }

    return false;
  }

  /**
   * ReadPDF() -- Read a PDF document
   * @param  String   $argv   The PDF Document path+page
   * @return Mixed
   */
  public static function ReadPDF($argv) {
    $tmp  = explode(":", $argv, 2);
    $pdf  = addslashes($tmp[0]);
    $page = isset($tmp[1]) ? (int) $tmp[1] : -1;

    $dest = self::buildPath($pdf);
    if ( file_exists($dest["root"]) ) {
      require_once PATH_LIB . "/PDF.class.php";
      if ( $ret = PDF::PDFtoSVG($dest["root"], $page) ) {
        return Array(
          "info"      => PDF::PDFInfo($dest["root"]),
          "document"  => $ret
        );
      }
    }

    return false;
  }

  /**
   * Upload() -- Upload a file
   * @param  Array    $src    File Source (<file /> input or similar)
   * @param  String   $destp  Destination Path
   * @return bool
   */
  public static function Upload(Array $src, $destp) {
    $dest  = self::buildPath($destp, VFS_ATTR_WRITE);
    $ndest = self::buildPath(sprintf("%s/%s", $destp, $src["name"]), VFS_ATTR_WRITE);

    if ( ENABLE_LOGGING && ENABLE_DEBUGGING ) {
      Logger::logInfo(sprintf("%s: %s", __METHOD__, JSON::encode(Array($src, $destp, $dest, $ndest))));
    }

    if ( $ndest["perm"]/* && $dest["perm"]*/ ) {
      if ( file_exists($dest["root"]) && is_dir($dest["root"]) ) {
        if ( $result = @move_uploaded_file($src["tmp_name"], $ndest["root"]) ) {
          self::_permissions($ndest["root"]);

          list($mime, $fmime) = self::GetMIME($ndest["root"]);

          return Array("result" => $result, "mime" => $fmime);
        }
      }
    }

    return false;
  }

}

?>
