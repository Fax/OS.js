<?php
/*!
 * @file
 * Contains ApplicationFilemanager Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

function unix_path() {
  $args = func_get_args();
  $paths = array();
  foreach( $args as $arg ) {
    $paths = array_merge( $paths, (array)$arg );
  }
  foreach( $paths as &$path ) {
    $path = trim( $path, '/' );
  }
  if( substr( $args[0], 0, 1 ) == '/' ) {
    $paths[0] = '/' . $paths[0];
  }
  return join('/', $paths);
}

/**
 * ApplicationFilemanager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationFilemanager
  extends DesktopApplication
{
  const APP_TITLE = "File Manager";
  const APP_ICON  = "apps/file-manager.png";

  public function __construct() {
    $this->menu = Array(
      "File" => Array("Close" => "cmd_Close"),
      "Home" => "cmd_Home"/*,
      "Back" => "cmd_Back"*/
    );

    $this->content = <<<EOHTML

<div class="ApplicationFilemanager">
  <div class="ApplicationFilemanagerMain">
    <ul>
    </ul>
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.filemanager.js",
      "app.filemanager.css"
     );

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }

  public static function Event($uuid, $action, Array $args) {
    $items = Array("dir" => Array(), "text" => Array());

    $root = PATH_PROJECT_HTML . "/media/";
    if ( ($add = !empty($args['path']) ? str_replace(Array("..", ".", "//"), Array("", "", "/"), $args['path']) . "/" : "") ) {
      $root = unix_path($root, $add);
    }

    if ($handle = opendir($root)) {
      while (false !== ($file = readdir($handle))) {
        if ( $file != "." && $file != ".." ) {
          //$fpath = $root . $file;
          $fpath = unix_path($root, $file);
          $frpath = str_replace(PATH_PROJECT_HTML . "/media/", "", $fpath);
          $fsize = 0;

          if ( is_dir($fpath) ) {
            $icon = "places/folder.png";
            $type = "dir";
            $mime = "";
          } else {
            $icon = "mimetypes/binary.png";
            $type = "file";

            $finfo = finfo_open(FILEINFO_MIME);
            $mime = explode("; charset=", finfo_file($finfo, $fpath));
            $mime = reset($mime);
            finfo_close($finfo);

            $fsize = filesize($fpath);
          }

          $items[$type][] = <<<EOHTML
      <li class="type_{$type}">
        <div class="Inner">
          <div class="Image"><img alt="" src="/img/icons/32x32/{$icon}" /></div>
          <div class="Title">{$file}</div>
          <div class="Info" style="display:none;">
            <input type="hidden" name="type" value="{$type}" />
            <input type="hidden" name="mime" value="{$mime}" />
            <input type="hidden" name="name" value="{$file}" />
            <input type="hidden" name="path" value="{$frpath}" />
            <input type="hidden" name="size" value="{$fsize}" />
          </div>
        </div>
      </li>
EOHTML;

        }
      }

      closedir($handle);
    }

    sort($items["dir"]);
    sort($items["text"]);

    $items = array_merge($items["dir"], $items["file"]);

    return Array("items" => implode("", $items));
  }
}

DesktopApplication::$Registered[] = "ApplicationFilemanager";


?>
