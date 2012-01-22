<?php
/*!
 * @file
 * Contains FileManager Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-06-16
 */

/**
 * ApplicationFileManager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Applications
 * @class
 */
class ApplicationFileManager
  extends Application
{

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

  public static function Event($uuid, $action, Array $args) {
    if ( $action == "browse" ) {
      $result = Array();

      $path  = $args['path'];
      $view  = $args['view'];
      $total = 0;
      $bytes = 0;
      $ignores = Array(".", ".gitignore");

      if ( $path == "/" ) {
        $ignores[] = "..";
      }

      if ( $view == "icon" ) {
        $columns = Array(
          Array(
            "className" => "Image",
            "style"     => null,
            "title"     => null
          ),
          Array(
            "className" => "Title",
            "style"     => null,
            "title"     => null
          ),
          Array(
            "className" => "Info",
            "style"     => "display:none;",
            "title"     => null
          )
        );
      } else {
        $columns = Array(
          Array(
            "className" => "Image Space First",
            "style"     => null,
            "title"     => "&nbsp;"
          ),
          Array(
            "className" => "Title Space",
            "style"     => null,
            "title"     => "Filename"
          ),
          Array(
            "className" => "Size Space",
            "style"     => null,
            "title"     => "Size"
          ),
          Array(
            "className" => "Type Space Last",
            "style"     => null,
            "title"     => "Type"
          ),
          Array(
            "className" => "Info",
            "style"     => "display:none;",
            "title"     => "&nbsp;"
          ),
        );
      }

      $files   = Array();
      if ( ($items = ApplicationVFS::ls($path, $ignores)) !== false ) {
        foreach ( $items as $file => $info ) {
          $icon = "/img/icons/32x32/{$info['icon']}";
          if ( preg_match("/^\/img/", $info['icon']) ) {
            $icon = $info['icon'];
          }

          $files[] = Array(
            "icon"      => $icon,
            "type"      => $info["type"],
            "mime"      => htmlspecialchars($info["mime"]),
            "name"      => htmlspecialchars($file),
            "path"      => $info["path"],
            "size"      => $info["size"],
            "protected" => $info["protected"]
          );

          $total++;
          $bytes += (int) $info['size'];
        }
      }

      return Array("items" => $files, "columns" => $columns, "total" => $total, "bytes" => $bytes, "path" => ($path == "/" ? "Home" : $path));
    } else if ( $action == "upload" ) {
      return true;
    }

    return false;
  }

}

?>
