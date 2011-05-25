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
      "File" => Array("Close" => "cmd_Close"),
      "Upload" => "cmd_Upload",
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
    if ( $action == "browse" ) {
      $result = Array();

      $path  = $args['path'];
      $total = 0;
      $bytes = 0;
      if ( ($items = ApplicationAPI::readdir($path)) !== false ) {
        foreach ( $items as $file => $info ) {

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

          $total++;
          $bytes += (int) $info['size'];
        }
      }

      return Array("items" => implode("", $result), "total" => $total, "bytes" => $bytes, "path" => ($path == "/" ? "Home" : $path));
    } else if ( $action == "upload" ) {

    }


    return false;
  }

}

DesktopApplication::$Registered[] = "ApplicationFilemanager";


?>
