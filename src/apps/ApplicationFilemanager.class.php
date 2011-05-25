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
    $this->statusbar = true;
    $this->menu = Array(
      "File" => Array(
        "Upload" => "cmd_Upload",
        "Close"  => "cmd_Close"
      ),
      "Edit" => Array(

      ),
      "View" => Array(
        "Reload"        => "cmd_Reload",
        "View as icons" => "cmd_View_Icons",
        "View as list"  => "cmd_View_List"
      ),
      "Go" => Array(
        "Home" => "cmd_Home"/*,
        "Back" => "cmd_Back"*/
      )
    );

    $this->content = <<<EOHTML

<div class="ApplicationFilemanager">
  <div class="ApplicationFilemanagerMain">
    <ul class="icon">
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
    if ( $action == "browse" ) {
      $result = Array();

      $path  = $args['path'];
      $view  = $args['view'];
      $total = 0;
      $bytes = 0;
      $ignores = Array(".");

      if ( $path == "/" ) {
        $ignores[] = "..";
      }

      if ( ($items = ApplicationAPI::readdir($path, $ignores)) !== false ) {
        $i = 0;
        foreach ( $items as $file => $info ) {

          if ( $view == "icon" ) {
            $result[] = <<<EOHTML
        <li class="type_{$info['type']}">
          <div class="Inner">
            <div class="Image"><img alt="" src="/img/icons/32x32/{$info['icon']}" /></div>
            <div class="Title">{$file}</div>
            <div class="Info" style="display:none;">
              <input type="hidden" name="type" value="{$info['type']}" />
              <input type="hidden" name="mime" value="{$info['mime']}" />
              <input type="hidden" name="name" value="{$file}" />
              <input type="hidden" name="path" value="{$info['path']}" />
              <input type="hidden" name="size" value="{$info['size']}" />
            </div>
          </div>
        </li>
EOHTML;
          } else {
            $class = $i % 2 ? "odd" : "even";
            $size = $info['type'] == "dir" ? "" : $info['size'];
            $mime = $info['type'] == "dir" ? "" : $info['mime'];
            $result[] = <<<EOHTML
        <tr class="type_{$info['type']} {$class} Inner">
          <td class="Image"><img alt="" src="/img/icons/16x16/{$info['icon']}" /></td>
          <td class="Title">{$file}</td>
          <td class="Size">{$size}</td>
          <td class="Type">{$mime}</td>
          <td class="Info" style="display:none;">
            <input type="hidden" name="type" value="{$info['type']}" />
            <input type="hidden" name="mime" value="{$info['mime']}" />
            <input type="hidden" name="name" value="{$file}" />
            <input type="hidden" name="path" value="{$info['path']}" />
            <input type="hidden" name="size" value="{$info['size']}" />
          </td>
        </tr>
EOHTML;

            $i++;
          }

          $total++;
          $bytes += (int) $info['size'];
        }
      }

      if ( $view == "icon" ) {
        $out = "<ul>" . implode("", $result) . "</ul>";
      } else {
        $out = "<table>" . implode("", $result) . "</table>";
      }

      return Array("items" => $out, "total" => $total, "bytes" => $bytes, "path" => ($path == "/" ? "Home" : $path));
    } else if ( $action == "upload" ) {

    }


    return false;
  }

}

DesktopApplication::$Registered[] = "ApplicationFilemanager";


?>
