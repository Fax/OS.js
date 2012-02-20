<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains VFS Class
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
 * @created 2011-06-19
 */

/**
 * VFS -- Application VFS (Virtual Filesystem) Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class VFS
  extends CoreObject
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Virtual Directories
   */
  protected static $VirtualDirs = Array(
    "/System/Packages" => Array(
      "type" => "packages",
      "attr" => "r",
      "icon" => "places/user-bookmarks.png"
    ),
    "/System/Docs" => Array(
      "type" => "core",
      "attr" => "r",
      "icon" => "places/folder-documents.png"
    ),
    "/System/Wallpapers" => Array(
      "type" => "core",
      "attr" => "r",
      "icon" => "places/folder-pictures.png"
    ),
    "/System/Fonts" => Array(
      "type" => "core",
      "attr" => "r",
      "icon" => "places/user-desktop.png"
    ),
    "/System" => Array(
      "type" => "core",
      "attr" => "r",
      "icon" => "places/folder-templates.png"
    ),
    "/User/Temp" => Array(
      "type" => "user",
      "attr" => "rw",
      "icon" => "places/folder-templates.png"
    ),
    "/User/Packages" => Array(
      "type" => "packages",
      "attr" => "rs",
      "icon" => "places/folder-download.png"
    ),
    "/User/Documents" => Array(
      "type" => "user",
      "attr" => "rw",
      "icon" => "places/folder-documents.png"
    ),
    "/User" => Array(
      "type" => "user",
      "attr" => "rw",
      "icon" => "places/folder_home.png"
    )
  );

  /////////////////////////////////////////////////////////////////////////////
  // INTERNAL METHODS
  /////////////////////////////////////////////////////////////////////////////

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
   * Secure a file path
   * @return Array
   */
  protected static function _secure($filename, $path = null, $exists = true, $write = true) {
    $base           = sprintf("%s/media", PATH_HTML);
    $special_charsa = array("?", "[", "]", "/", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");
    $special_charsb = array("?", "[", "]", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");

    // Convert single $filename into $path and $filename
    if ( $filename && !$path ) {
      $spl = preg_split("/\//", $filename, -1, PREG_SPLIT_NO_EMPTY);
      if ( sizeof($spl) == 1 ) {
        $path     = "/";
        $filename = $spl[0];
      } else if ( sizeof($spl) > 1 ) {
        $filename = array_pop($spl);
        $path     = "/" . implode("/", $spl) . "/";
      } else {
        return false;
      }
    }

    // Ouput vars, Clean up strings
    $filename     = $filename !== null ? trim(preg_replace('/\s+/', ' ', str_replace($special_charsa, '', $filename)), '.-_')  : null;
    $path         = $path     !== null ? trim(preg_replace('/\s+/', ' ', str_replace($special_charsb, '', $path)), '.-_')      : null;
    $location     = null;
    $destination  = null;

    // Check if the destination is not secured
    if ( $path !== null ) {
      if ( $write ) {
        if ( $path == "/" ) {
          return false;
        } else {
          foreach ( self::$VirtualDirs as $k => $v ) {
            if ( startsWith($path, $k) ) {
              if ( $v['attr'] != "rw" ) {
                return false;
              }
            }
          }
        }
      }

      // Build real path
      $location = $base . $path;
      if ( $filename !== null ) {
        $location .= "/{$filename}";
      }

      $location = realpath(dirname($location));

      // Make sure we are inside the media folder
      if ( !($location) || !(startsWith($location, $base)) ) {
        return false;
      }

      // Create destination string
      if ( $filename !== null ) {
        $destination = "{$location}/{$filename}";
      } else {
        $destination = "{$location}{$path}";
      }
    }

    // Check for existance (if required)
    if ( $exists && $destination ) {
      if ( !(is_file($destination) || is_link($destination) || is_dir($destination)) ) {
        return false;
      }
    }

    return Array(
      "filename"    => $filename,
      "path"        => $path,
      "location"    => $location,
      "destination" => $destination
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // WRAPPER METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @see VFS::cat()
   * @see Core::_doVFS()
   */
  public static function read($argv) {
    return self::cat($argv);
  }

  /**
   * @see VFS::put()
   * @see Core::_doVFS()
   */
  public static function write($argv) {
    return self::put($argv);
  }

  /**
   * @see VFS::ls()
   * @see Core::_doVFS()
   */
  public static function readdir($argv) {
    $path    = $argv['path'];
    $ignores = isset($argv['ignore']) ? $argv['ignore'] : null;
    $mime    = isset($argv['mime']) ? ($argv['mime'] ? $argv['mime'] : Array()) : Array();
    return self::ls($path, $ignores, $mime);
  }

  /**
   * @see VFS::mv()
   * @see Core::_doVFS()
   */
  public static function rename($argv) {
    list($path, $src, $dst) = $argv;
    return self::mv($path, $src, $dst);
  }

  /**
   * @see VFS::rm()
   * @see Core::_doVFS()
   */
  public static function delete($argv) {
    return self::rm($argv);
  }

  /**
   * @see VFS::readPDFPage()
   * @see Core::_doVFS()
   */
  public static function readpdf($argv) {
    $tmp  = explode(":", $argv);
    $pdf  = $tmp[0];
    $page = isset($tmp[1]) ? $tmp[1] : -1;
    return self::readPDFPage($pdf, $page);
  }

  /**
   * @see VFS::file_info()
   * @see Core::_doVFS()
   */
  public static function fileinfo($argv) {
    return self::file_info($argv);
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Upload a file
   * @param   String   $path     Upload path
   * @retrun  Mixed
   */
  public static function upload($file, $path) {
    if ( ($res = self::_secure($file["name"], $path, false)) !== false ) {
      if ( $result = move_uploaded_file($file["tmp_name"], $res["destination"]) ) {
        self::_permissions($res["destination"]);

        list($mime, $fmime) = self::GetMIME($res["destination"]);

        return Array("result" => $result, "mime" => $fmime);
      }
    }

    return false;
  }

  /**
   * Create a directory
   * @param   String   $path     Directory path name
   * @retrun  bool
   */
  public static function mkdir($argv) {
    if ( $res = self::_secure($argv, null, false) ) {
      if ( !is_dir($res["destination"]) ) {
        if ( mkdir($res["destination"]) ) {
          self::_permissions($res["destination"], true);

          return basename($res["destination"]);
        }
      }
    }

    return false;
  }

  /**
   * Check if file/dir exists
   * @param  String   $argv     Argument
   * @return Mixed
   */
  public static function exists($argv, $ret_name = false) {
    if ( $res = self::_secure($argv, null, true) ) {
      if ( file_exists($res["destination"]) ) {
        return $ret_name ? $res["destination"] : true;
      }
    }

    return false;
  }

  /**
   * File Information
   * @param  String   $argv     Argument
   * @return Mixed
   */
  public static function file_info($argv) {
    if ( $res = self::_secure($argv, null, true) ) {
      if ( file_exists($res["destination"]) ) {
        $base = sprintf("%s/media", PATH_HTML);

        // Read MIME info
        $file = basename($res["destination"]);
        $expl = explode(".", $file);
        $ext = end($expl);
        list($mime, $fmime) = self::GetMIME($res["destination"]);
        $fmmime = trim(strstr($fmime, "/", true));
        $info   = null;

        switch ( $fmmime ) {
          case "image" :
            $info = VFS::mediaInfo($res["destination"], false);
          break;
          case "audio" :
            $info = VFS::mediaInfo($res["destination"], false);
          break;
          case "video" :
            $info = VFS::mediaInfo($res["destination"], false);
          break;
        }

        if ( !($loc = str_replace($base, "", $res["location"])) ) {
          $loc = "/";
        }

        return Array(
          "filename" => $res["filename"],
          "path"     => $loc,
          "size"     => filesize($res["destination"]),
          "mime"     => $fmime,
          "info"     => $info
        );
      }
    }

    return false;
  }

  /**
   * Read a file (cat)
   * @param  String   $argv     Argument
   * @return String
   */
  public static function cat($argv) {
    if ( $res = self::_secure($argv, null, true, false) ) {
      return file_get_contents($res["destination"]);
    }

    return false;
  }

  /**
   * Write a file (put)
   * @param  String   $argv         Argument
   * @param  bool     $overwrite    Overwrite existing file
   * @return bool
   */
  public static function put($argv, $overwrite = true) {
    if ( $res = self::_secure($argv['file'], null, false) ) {
      $encoding = isset($argv['encoding']) ? $argv['encoding'] : null;
      $content  = $argv['content'];

      if ( $encoding === "data:image/png;base64" ) {
        $content = base64_decode(str_replace(Array("{$encoding},", " "), Array("", "+"), $content));
      }

      if ( $overwrite || !file_exists($res["destination"]) ) {
        if ( file_put_contents($res["destination"], $content) ) {
          return true;
        }
      } else {
        throw new ExceptionVFS(ExceptionVFS::ALREADY_EXISTS, Array($argv['file']));
      }
    }

    return false;
  }

  /**
   * Touch a file (touch)
   * @param   String    $argv     Path
   * @return  bool
   */
  public static function touch($argv) {
    if ( $res = self::_secure($argv, null, false) ) {
      if ( !file_exists($res["destination"]) ) {
        if ( touch($res["destination"]) ) {
          return true;
        }
      }

      throw new ExceptionVFS(ExceptionVFS::ALREADY_EXISTS, Array($argv));
    }

    return false;
  }

  /**
   * Delete a file (rm)
   * @param  String   $path     Path
   * @return bool
   */
  public static function rm($path) {
    if ( $res = self::_secure($path, null, true) ) {
      if ( is_file($res["destination"]) || is_link($res["destination"]) ) {
        return unlink($res["destination"]);
      } else if ( is_dir($res["destination"]) ) {
        return rmdir($res["destination"]);
      }
    }

    return false;


  }

  /**
   * Move/Rename a file (mv)
   * @param  String   $path     Path
   * @param  String   $src      Source filename
   * @param  String   $dest     Destination filename
   * @return bool
   */
  public static function mv($path, $src, $dest) {
    $dir = dirname($path);
    if ( $res_src = self::_secure($src, $dir) ) {
      if ( $res_dest = self::_secure($dest, $dir, false) ) {
        if ( !file_exists($res_dest["destination"]) ) {
          return rename($res_src["destination"], $res_dest["destination"]);
        }
      }
    }

    return false;
  }

  /**
   * Extract an archive file
   * @param  String   $arch   Archive filename
   * @param  String   $dest   Extract path
   * @return Mixed
   */
  public static function extract_archive($arch, $dest) {
    if ( $res_a = self::_secure($arch, null, true) ) {
      if ( $res_d = self::_secure("foo", $dest, false) ) {
        require PATH_LIB . "/Archive.php";
        if ( $a = Archive::open($res_a["destination"]) ) {
          return $a->extract(dirname($res_d["destination"]));
        }
      }
    }
    return false;
  }

  /**
   * Read a archive file
   * @param  String   $arch   Archive filename
   * @param  String   $path   Archive path (default /)
   * @return Array
   */
  public static function ls_archive($arch, $path = "/") {
    require PATH_LIB . "/Archive.php";

    $result = Array("dir" => Array(), "file" => Array());

    if ( ($tmp = self::_secure($arch, $path, true)) === false ) {
      return false;
    }

    $apath = $tmp["destination"];
    unset($tmp);

    try {
      if ( $a = Archive::open($apath) ) {
        foreach ( $a->read() as $f ) {
          $file  = trim($f['name']);
          $size  = $f['size_real'];
          $type  = substr($file, -1) == "/" ? "dir" : "file";
          $mime  = $type == "file" ? "application/octet-stream" : "";
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

    return false;
  }


  /**
   * Read a directory (ls)
   * @param  String     $path     Directory path
   * @param  Array      $ignores  Ignore these file(s)
   * @param  Array      $mimes    Only show these MIME(s)
   * @return Array
   */
  public static function ls($path, Array $ignores = null, Array $mimes = Array()) {
    if ( $ignores === null ) {
      $ignores = Array(".", "..", ".gitignore", ".git", ".cvs");
    }

    $base     = PATH_HTML . "/media";
    $absolute = "{$base}{$path}";

    $apps = false;
    foreach ( self::$VirtualDirs as $k => $v ) {
      if ( startsWith($path, $k) ) {
        if ( $v['type'] == "packages" ) {
          $apps = true;
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

      Package::LoadAll(Package::TYPE_APPLICATION | Package::TYPE_PANELITEM);
      foreach ( Package::$PackageRegister[Package::TYPE_APPLICATION] as $c => $opts ) {
        $items["{$opts['title']} ($c)"] = Array(
          "path"       => "{$path}/{$c}",
          "size"       => 0,
          "mime"       => "OSjs/Application",
          "icon"       => $opts['icon'],
          "type"       => "file",
          "protected"  => 1,
        );
      }
      foreach ( Package::$PackageRegister[Package::TYPE_PANELITEM] as $c => $opts ) {
        $items["{$opts['title']} ($c)"] = Array(
          "path"       => "{$path}/{$c}",
          "size"       => 0,
          "mime"       => "OSjs/PanelItem",
          "icon"       => $opts['icon'],
          "type"       => "file",
          "protected"  => 1,
        );
      }

      return $items;
    }

    // Read directory
    if ( is_dir($absolute) && $handle = opendir($absolute)) {
      $items = Array("dir" => Array(), "file" => Array());
      while (false !== ($file = readdir($handle))) {
        if ( in_array($file, $ignores) ) {
          continue;
        }

        $icon      = "places/folder.png";
        $type      = "dir";
        $fsize     = 0;
        $mime      = "";
        $protected = false;

        // Previous dir
        if ( $file == ".." ) {
          $xpath = explode("/", $path);
          array_pop($xpath);
          $fpath = implode("/", $xpath);
          if ( !$fpath ) {
            $fpath = "/";
          }
          $icon = "status/folder-visiting.png";
          $protected = true;
        }

        // New dir
        else {

          $abs_path = "{$absolute}/{$file}";
          $rel_path = "{$path}/{$file}";

          $expl = explode(".", $file);
          $ext = end($expl);

          if ( !is_dir($abs_path) ) {
            $type  = "file";

            // Read MIME info

            //$fi = new finfo(FILEINFO_MIME, MIME_MAGIC);
            $fi = new finfo(FILEINFO_MIME);
            $finfo = $fi->file($abs_path);
            $mime  = explode("; charset=", $finfo);
            $mime  = trim(reset($mime));
            $mmime = trim(strstr($mime, "/", true));
            unset($fi);


            // FIX Unknown mime types
            $fmime  = self::_fixMIME($mime, $ext);
            $fmmime = trim(strstr($fmime, "/", true));

            $add = sizeof($mimes) ? false : true;
            foreach ( $mimes as $m ) {
              $m = trim($m);

              if ( preg_match("/\/\*$/", $m) ) {
                if ( strstr($m, "/", true) == $fmmime ) {
                  $add = true;
                  break;
                }
              } else {
                if ( $fmime == $m ) {
                  $add = true;
                  break;
                }
              }
            }

            if ( !$add ) {
              continue;
            }

            $fsize = filesize($abs_path);
            $icon  = self::getFileIcon($mmime, $mime, $ext);
            $mime  = $fmime;

          } else {
            $tpath = str_replace("//", "/", $rel_path);
            if ( isset(self::$VirtualDirs[$tpath]) ) {
              $icon = self::$VirtualDirs[$tpath]['icon'];
            }
          }

          $fpath = $rel_path;
        }

        $fpath = preg_replace("/\/+/", "/", $fpath);

        if ( dirname($fpath) == "/" ) {
          $protected = true;
        } else {
          foreach ( self::$VirtualDirs as $k => $v ) {
            if ( startsWith($fpath, $k) ) {
              if ( $v["attr"] != "rw" ) {
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

    return false;
  }

  /**
   * Get File Icon from:
   * @param  String   $mmime      Mime base type
   * @param  String   $mime       Full mime type
   * @param  String   $ext        File-extension
   * @return String
   */
  public final static function getFileIcon($mmime, $mime, $ext) {
    $icon  = "mimetypes/binary.png";

    switch ( $mmime ) {
      case "application" :
        switch ( $mime ) {
          case "application/ogg" :
            $icon = "mimetypes/audio-x-generic.png";
            if ( $ext == "ogv" ) {
              $icon = "mimetypes/video-x-generic.png";
            }
          break;

          case "application/pdf" :
            $icon = "mimetypes/gnome-mime-application-pdf.png";
          break;

          case "application/x-dosexec" :
            $icon = "mimetypes/binary.png";
          break;

          case "application/xml" :
            $icon = "mimetypes/text-x-opml+xml.png";
          break;

          case "application/zip" :
          case "application/x-tar" :
          case "application/x-bzip2" :
          case "application/x-bzip" :
          case "application/x-gzip" :
          case "application/x-rar" :
            $icon = "mimetypes/folder_tar.png";
          break;

          case "application/octet-stream" :
            $icon = self::_getFileIcon($ext);
          break;
        }
      break;

      case "image" :
        $icon = "mimetypes/image-x-generic.png";
      break;

      case "video" :
        $icon = "mimetypes/video-x-generic.png";
      break;

      case "audio" :
        $icon = "mimetypes/audio-x-generic.png";
      break;

      case "text" :
        $icon = "mimetypes/text-x-generic.png";
        switch ( $mime ) {
          case "text/html" :
            $icon = "mimetypes/text-html.png";
          break;
        }
      break;

      default :
        $icon = self::_getFileIcon($ext);
      break;
    }

    return $icon;
  }

  /**
   * Get file icon only from extension
   * @see VFS::getFileIcon
   * @return String
   */
  protected final static function _getFileIcon($ext) {
    $icon  = "mimetypes/binary.png";

    switch ( strtolower($ext) ) {
      case "mp3"    :
      case "ogg"    :
      case "flac"   :
      case "aac"    :
      case "vorbis" :
        $icon = "mimetypes/audio-x-generic.png";
      break;

      case "mp4"  :
      case "mpeg" :
      case "avi"  :
      case "3gp"  :
      case "flv"  :
      case "mkv"  :
      case "webm" :
      case "ogv"  :
        $icon = "mimetypes/video-x-generic.png";
      break;

      case "bmp"  :
      case "jpeg" :
      case "jpg"  :
      case "gif"  :
      case "png"  :
        $icon = "mimetypes/image-x-generic.png";
      break;

      case "zip" :
      case "rar" :
      case "gz"  :
      case "bz2" :
      case "bz"  :
      case "tar" :
        $icon = "mimetypes/folder_tar.png";
      break;

      case "xml" :
        $icon = "mimetypes/text-x-opml+xml.png";
      break;
    }

    return $icon;
  }

  /**
   * Fix unknown MIME by using file extension
   * @param  String   $mime   MIME Type
   * @param  String   $ext    File Extenstion
   * @return String
   */
  protected final static function _fixMIME($mime, $ext) {
    if ( $mime == "application/octet-stream"  ) {
      switch ( strtolower($ext) ) {
        case "webm" :
          $mime = "video/webm";
        break;
        case "ogv" :
          $mime = "video/ogg";
        break;
        case "ogg" :
          $mime = "audio/ogg";
        break;
      }
    } else if ( $mime == "application/ogg" ) {
      switch ( strtolower($ext) ) {
        case "ogv" :
          $mime = "video/ogg";
        break;
        case "ogg" :
          $mime = "audio/ogg";
        break;
      }
    }

    return $mime;
  }

  /**
   * Get file MIME
   * @return String
   */
  public static function GetMIME($path) {
    $expl = explode(".", $path);
    $ext = end($expl);

    $fi = new finfo(FILEINFO_MIME);
    $finfo = $fi->file($path);
    //$mime  = explode("; charset=", $finfo);
    $mime  = explode(";", $finfo);
    $mime  = trim(reset($mime));
    $fmime = self::_fixMIME($mime, $ext);
    return Array($mime, $fmime);
  }

  /**
   * Read an URL
   * @param  String   $url        URL to read
   * @param  int      $timeout    Read timeout (default 30s)
   * @return String
   */
  public static function readurl($url, $timeout = 30) {
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
  }

  /**
   * Get Media-file information
   * @param  String   $fname      Audio-file path
   * @return Mixed
   */
  public static function mediaInfo($fname, $exists = true) {
    if ( !$exists || $path = VFS::exists($fname, true) ) {
      if ( !$exists ) {
        $path = $fname;
      }

      $pcmd   = escapeshellarg($path);
      $result = exec("exiftool -j {$pcmd}", $outval, $retval);
      if ( $retval == 0 && $result ) {
        try {
          $json = (array) JSON::decode(implode("", $outval));
          $json = (array) reset($json);
        } catch ( Exception $e ) {
          $json = Array();
        }
      }

      if ( isset($json["SourceFile"]) ) {
        unset($json["SourceFile"]);
      }
      if ( isset($json["ExifToolVersion"]) ) {
        unset($json["ExifToolVersion"]);
      }
      if ( isset($json["Directory"]) ) {
        unset($json["Directory"]);
      }

      if ( $json ) {
        return $json;
      }
    }

    return false;
  }

  /**
   * Read PDF File
   * @param   String      $fname      Relative file name
   * @see     PDF
   * @return  Mixed
   */
  public static function readPDFPage($fname, $page = -1) {
    if ( $path = VFS::exists($fname, true) ) {
      require PATH_LIB . "/PDF.class.php";
      if ( $ret = PDF::PDFtoSVG($path, $page) ) {
        return Array(
          "info" => PDF::PDFInfo($path),
          "document" => $ret
        );
      }
    }

    return false;
  }

}

?>
