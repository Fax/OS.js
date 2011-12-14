<?php
/*!
 * @file
 * Contains ApplicationVFS Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-19
 */

/**
 * ApplicationVFS -- Application VFS (Virtual Filesystem) Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
class ApplicationVFS
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Virtual Directories
   */
  protected static $VirtualDirs = Array(
    "/System/Applications" => Array(
      "type" => "applications",
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
    "/Cloud" => Array(
      "type" => "remote",
      "attr" => "rw",
      "icon" => "places/folder-publicshare.png"
    )
  );

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
  protected static function _secure($filename, $path = null, $exists = true) {
    $base           = sprintf("%s/media", PATH_PROJECT_HTML);
    $special_charsa = array("?", "[", "]", "/", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");
    $special_charsb = array("?", "[", "]", "\\", "=", "<", ">", ":", ";", ",", "'", "\"", "&", "$", "#", "*", "(", ")", "|", "~", "`", "!", "{", "}", "../", "./");

    // Convert single $filename into $path and $filename
    if ( $filename && !$path ) {
      $spl = preg_split("/\//", $filename, 2, PREG_SPLIT_NO_EMPTY);
      if ( sizeof($spl) == 1 ) {
        $path     = "/";
        $filename = $spl[0];
      } else if ( sizeof($spl) == 2 ) {
        $path     = $spl[0] ? "/{$spl[0]}/" : "/";
        $filename = $spl[1];
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
      foreach ( self::$VirtualDirs as $k => $v ) {
        if ( startsWith($path, $k) ) {
          if ( $v['attr'] != "rw" ) {
            return false;
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

  /**
   * Upload a file
   * @param   String   $path     Upload path
   * @retrun  Mixed
   */
  public static function upload($file, $path) {
    if ( ($res = self::_secure($file["name"], $path, false)) !== false ) {
      if ( $result = move_uploaded_file($file["tmp_name"], $res["destination"]) ) {
        self::_permissions($res["destination"]);

        return $result;
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
        $base = sprintf("%s/media", PATH_PROJECT_HTML);

        // Read MIME info
        $fi = new finfo(FILEINFO_MIME);
        $finfo = $fi->file($res["destination"]);
        //$mime  = explode("; charset=", $finfo);
        $mime  = explode(";", $finfo);
        $mime  = trim(reset($mime));
        $fmime = self::_fixMIME($mime, $ext);
        unset($fi);

        $fmmime = trim(strstr($fmime, "/", true));
        $info   = null;
        switch ( $fmmime ) {
          case "image" :
            $info = ApplicationAPI::mediaInfo($res["destination"], false);
          break;
          case "audio" :
            $info = ApplicationAPI::mediaInfo($res["destination"], false);
          break;
          case "video" :
            $info = ApplicationAPI::mediaInfo($res["destination"], false);
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
    if ( $res = self::_secure($argv) ) {
      if ( file_exists($res["destination"]) ) {
        return file_get_contents($res["destination"]);
      }
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
      }
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
    if ( $res_src = self::_secure($src, $path) ) {
      if ( $res_dest = self::_secure($dest, null, false) ) {
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
        require PATH_PROJECT_LIB . "/Archive.php";
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
    require PATH_PROJECT_LIB . "/Archive.php";

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

    $base     = PATH_PROJECT_HTML . "/media";
    $absolute = "{$base}{$path}";

    $apps = false;
    foreach ( self::$VirtualDirs as $k => $v ) {
      if ( startsWith($path, $k) ) {
        if ( $v['type'] == "applications" ) {
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
          "protected"  => 1,
      );

      Application::init(APPLICATION_BUILD);
      foreach ( Application::$Registered as $c => $opts ) {
        $items["{$opts['title']} ($c)"] = Array(
          "path"       => "{$path}/{$c}",
          "size"       => 0,
          "mime"       => "ajwm/application",
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

          $fpath = str_replace("//", "/", $rel_path);
        }

        foreach ( self::$VirtualDirs as $k => $v ) {
          if ( startsWith($fpath, $k) ) {
            $protected = true;
            break;
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
   * @see ApplicationVFS::getFileIcon
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

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

}

?>
