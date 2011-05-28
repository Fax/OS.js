<?php
/*!
 * @file
 * Contains ApplicationAPI Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-25
 */

/**
 * ApplicationAPI Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationAPI
{

  public static function upload() {
    // list of valid extensions, ex. array("jpeg", "xml", "bmp")
    $allowedExtensions = array();
    // max file size in bytes
    $sizeLimit = 10 * 1024 * 1024;

    $base     = PATH_PROJECT_HTML . "/media/";
    $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
    if ( $result = $uploader->handleUpload($base) ) {
      // to pass data through iframe you will need to encode all html tags
      //echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);
      return $result;
    }

    return $result;
  }

  public static function readdir($path, Array $ignores = null, Array $mimes = Array()) {
    if ( $ignores === null ) {
      $ignores = Array(".", "..");
    }

    $base     = PATH_PROJECT_HTML . "/media";
    $absolute = "{$base}{$path}";

    if ($handle = opendir($absolute)) {
      $items = Array("dir" => Array(), "file" => Array());
      while (false !== ($file = readdir($handle))) {
        if ( in_array($file, $ignores) ) {
          continue;
        }

        $icon  = "places/folder.png";
        $type  = "dir";
        $fsize = 0;
        $mime  = "";

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
          }

          $fpath = str_replace("//", "/", $rel_path);
        }

        $items[$type][$file] =  Array(
          "path"     => $fpath,
          "size"     => $fsize,
          "mime"     => $mime,
          "icon"     => $icon,
          "type"     => $type
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
