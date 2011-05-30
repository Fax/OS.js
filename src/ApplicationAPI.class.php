<?php
/*!
 * @file
 * Contains ApplicationAPI Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-25
 */

function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    $start  = $length * -1; //negative
    return (substr($haystack, $start) === $needle);
}

/**
 * ApplicationAPI Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationAPI
{

  protected static $ProtectedDirs = Array(
    "/System" => Array(
      "icon" => "places/folder-templates.png"
    )
  );

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

  public static function readfile($argv) {
    $path = PATH_PROJECT_HTML . "/media/" . $argv;
    if ( file_exists($path) && is_file($path) ) {
      return file_get_contents($path);
    }
    return false;
  }

  public static function writefile($argv) {
    $path = PATH_PROJECT_HTML . "/media/" . $argv['file'];
    $encoding = isset($argv['encoding']) ? $argv['encoding'] : null;
    $content = $argv['content'];

    foreach ( self::$ProtectedDirs as $k => $v ) {
      if ( startsWith($path, $k) ) {
        return false; // TODO: Exception
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

  public static function delete($path) {
    if ( $path ) {
      foreach ( self::$ProtectedDirs as $k => $v ) {
        if ( startsWith($path, $k) ) {
          return false;
        }
      }
      $dpath = PATH_PROJECT_HTML . "/media/" . $path;
      if ( is_file($dpath) || is_dir($dpath) ) {
        return unlink($dpath);
      }
    }
    return null;
  }

  public static function rename($path, $src, $dest) {
    if ( $dest ) {
      foreach ( self::$ProtectedDirs as $k => $v ) {
        if ( startsWith($path, $k) ) {
          return false;
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

  public static function readdir($path, Array $ignores = null, Array $mimes = Array()) {
    if ( $ignores === null ) {
      $ignores = Array(".", "..");
    }

    $base     = PATH_PROJECT_HTML . "/media";
    $absolute = "{$base}{$path}";

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
            if ( isset(self::$ProtectedDirs[$tpath]) ) {
              $icon = self::$ProtectedDirs[$tpath]['icon'];
            }
          }

          $fpath = str_replace("//", "/", $rel_path);
        }

        foreach ( self::$ProtectedDirs as $k => $v ) {
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

}

?>
