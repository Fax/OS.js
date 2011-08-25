<?php
/*!
 * @file
 * Contains ApplicationVFS Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-19
 */

/**
 * ApplicationVFS Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
class ApplicationVFS
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected static $VirtualDirs = Array(
    "/System/Applications" => Array(
      "type" => "applications",
      "attr" => "r",
      "icon" => "places/user-bookmarks.png"
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
   * Upload a file
   * @retrun Mixed
   */
  public static function upload($path) {
    // list of valid extensions, ex. array("jpeg", "xml", "bmp")
    $allowedExtensions = array();
    // max file size in bytes
    $sizeLimit = 10 * 1024 * 1024;

    $base     = PATH_PROJECT_HTML . "/media/" . ($path ? "{$path}/" : "");
    $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
    if ( $result = $uploader->handleUpload($base) ) {
      // to pass data through iframe you will need to encode all html tags
      //echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);
      return $result;
    }

    return $result;
  }

  /**
   * Check if file/dir exists
   * @return Mixed
   */
  public static function exists($argv) {
    $path = PATH_PROJECT_HTML . "/media/" . $argv;
    return file_exists($path) ? $path : false;
  }

  /**
   * Read a file (cat)
   * @return String
   */
  public static function cat($argv) {
    $path = PATH_PROJECT_HTML . "/media/" . $argv;
    if ( file_exists($path) && is_file($path) ) {
      return file_get_contents($path);
    }
    return false;
  }

  /**
   * Write a file (put)
   * @return bool
   */
  public static function put($argv) {
    $path = PATH_PROJECT_HTML . "/media/" . $argv['file'];
    $encoding = isset($argv['encoding']) ? $argv['encoding'] : null;
    $content = $argv['content'];

    foreach ( self::$VirtualDirs as $k => $v ) {
      if ( startsWith($argv['file'], $k) ) {
        if ( $v['attr'] != "rw" ) {
          return false; // TODO: Exception
        }
      }
    }


    if ( $encoding === "data:image/png;base64" ) {
      $content = base64_decode(str_replace(Array("{$encoding},", " "), Array("", "+"), $content));
    }

    // TODO : OVERWRITE
    //if ( file_exists($path) && is_file($path) ) {
    if ( file_put_contents($path, $content) ) {
      return true;
    }

    return false;
  }

  /**
   * Delete a file (rm)
   * @return bool
   */
  public static function rm($path) {
    if ( $path ) {
      foreach ( self::$VirtualDirs as $k => $v ) {
        if ( startsWith($path, $k) ) {
          if ( $v['attr'] != "rwa" ) {
            return false;
          }
        }
      }
      $dpath = PATH_PROJECT_HTML . "/media/" . $path;
      if ( is_file($dpath) || is_dir($dpath) ) {
        return unlink($dpath);
      }
    }
    return null;
  }

  /**
   * Move/Rename a file (mv)
   * @return bool
   */
  public static function mv($path, $src, $dest) {
    if ( $dest ) {
      foreach ( self::$VirtualDirs as $k => $v ) {
        if ( startsWith($path, $k) ) {
          if ( $v['attr'] != "rw" ) {
            return false;
          }
        }
      }

      $old_path = PATH_PROJECT_HTML . "/media/" . $path;
      $new_path = PATH_PROJECT_HTML . "/media/" . str_replace($src, $dest, $path);

      if ( file_exists($new_path) ) {
        return false;
      }

      return rename($old_path, $new_path);
    }

    return null;
  }

  /**
   * Read a archive file
   * @return Array
   */
  public static function ls_archive($arch, $path = "/") {
    $result = Array("dir" => Array(), "file" => Array());

    try {
      if ( $a = Archive::open($arch) ) {
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

        if ( $file == ".." ) {
          $xpath = explode("/", $path);
          array_pop($xpath);
          $fpath = implode("/", $xpath);
          if ( !$fpath ) {
            $fpath = "/";
          }
          $icon = "status/folder-visiting.png";
        } else {

          $abs_path = "{$absolute}/{$file}";
          $rel_path = "{$path}/{$file}";

          if ( !is_dir($abs_path) ) {
            $icon  = "mimetypes/binary.png";
            $type  = "file";

            $finfo = finfo_open(FILEINFO_MIME);
            $mime  = explode("; charset=", finfo_file($finfo, $abs_path));
            $mime  = trim(reset($mime));
            $mmime = trim(strstr($mime, "/", true));
            finfo_close($finfo);

            $add = sizeof($mimes) ? false : true;
            foreach ( $mimes as $m ) {
              $m = trim($m);

              if ( preg_match("/\/\*$/", $m) ) {
                if ( strstr($m, "/", true) == $mmime ) {
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

            switch ( $mmime ) {
              case "application" :
                switch ( $mime ) {
                  case "application/ogg" :
                    $icon = "mimetypes/video-x-generic.png"; // TODO EXTENSION CHECK
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
            }
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
