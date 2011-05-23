<?php
/*!
 * @file
 * Contains IndexViewContoller Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-22
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

class DesktopApplication
{
  const APP_TITLE = "Window";
  const APP_ICON  = "emblems/emblem-unreadable.png";
  const APP_HIDDEN = false;

  public $uuid = null;
  public $title = self::APP_TITLE;
  public $content = "";
  public $icon = self::APP_ICON;
  public $is_draggable = true;
  public $is_resizable = true;
  public $is_scrollable = true;
  public $width = 500;
  public $height = 300;
  public $resources = Array();
  public $menu = Array();

  public static $Registered = Array();

  public function __construct() {
    $this->uuid = UUID::v4();
  }

  public function __toJSON() {
    return Array(
      "class" => get_class($this),
      "uuid" => $this->uuid,
      "icon" => $this->icon,
      "title" => $this->title,
      "content" => $this->content,
      "is_draggable" => $this->is_draggable,
      "is_resizable" => $this->is_resizable,
      "is_scrollable" => $this->is_scrollable,
      "resources" => $this->resources,
      "width" => $this->width,
      "height" => $this->height,
      "menu" => $this->menu
    );
  }

  public static function Event($uuid, $action, Array $args) {
    return Array();
  }
}

class ApplicationFilemanager
  extends DesktopApplication
{
  const APP_TITLE = "File Manager";
  const APP_ICON  = "apps/file-manager.png";
  const APP_HIDDEN = true;

  public function __construct() {
    $this->title = self::APP_TITLE;
    $this->icon = self::APP_ICON;
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

    parent::__construct();
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

class ApplicationBrowser
  extends DesktopApplication
{
  const APP_TITLE = "Web Browser";
  const APP_ICON  = "categories/gnome-globe.png";

  public function __construct() {
    $this->title = self::APP_TITLE;
    $this->icon = self::APP_ICON;

    $this->content = <<<EOHTML

<div class="ApplicationBrowser">
  <div class="ApplicationBrowserBar">
    <input type="text" />
  </div>
  <div class="ApplicationBrowserMain">
    <iframe src="about:blank"></iframe>
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.browser.js",
      "app.browser.css"
    );
    $this->is_scrollable = false;

    parent::__construct();
  }
}

DesktopApplication::$Registered[] = "ApplicationBrowser";

class ApplicationClock
  extends DesktopApplication
{
  const APP_TITLE = "Clock";
  const APP_ICON = "status/appointment-soon.png";

  public function __construct() {
    $this->title = self::APP_TITLE;
    $this->icon = self::APP_ICON;
    $this->content = <<<EOHTML

<div class="ApplicationClock">
  <div class="ApplicationClockInner clock">
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.clock.js",
      "app.clock.css"
    );
    $this->is_scrollable = false;
    $this->is_resizable = false;
    $this->width = 200;
    $this->height = 230;

    parent::__construct();
  }
}

DesktopApplication::$Registered[] = "ApplicationClock";

class ApplicationRSSReader
  extends DesktopApplication
{
  const APP_TITLE = "RSS Reader";

  public function __construct() {
    $this->title = self::APP_TITLE;
    $this->content = <<<EOHTML

<div class="ApplicationRSSReader">
  <div class="ApplicationRSSReaderInner">
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.clock.js",
      "app.clock.css"
    );
    $this->is_scrollable = false;
    $this->width = 300;
    $this->height = 400;

    parent::__construct();
  }
}

DesktopApplication::$Registered[] = "ApplicationRSSReader";

class ApplicationTextpad
  extends DesktopApplication
{
  const APP_TITLE = "TextPad";
  const APP_ICON = "apps/text-editor.png";

  public function __construct() {
    $this->title = self::APP_TITLE;
    $this->icon = self::APP_ICON;
    $this->menu = Array(
      "File" => Array(
        "Open" => "cmd_Open",
        "Save" => "cmd_Save",
        "Save As..." => "cmd_SaveAs",
        "Close" => "cmd_Close"
      )
    );

    $this->content = <<<EOHTML

<div class="ApplicationTextpad">
  <textarea></textarea>
</div>

EOHTML;

    $this->resources = Array(
      "app.textpad.js",
      "app.textpad.css"
    );
    $this->width = 400;
    $this->height = 400;

    parent::__construct();
  }
}

DesktopApplication::$Registered[] = "ApplicationTextpad";


/**
 * IndexViewContoller Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class IndexViewController
  extends ViewController
{
  /**
   * @see ViewController::doGET()
   */
  public function doGET(Array $args, WebApplication $wa, $cached = false) {
    //return parent::doGET($args, $wa, $cached);
    return false;
  }

  /**
   * @see ViewController::doPOST()
   */
  public function doPOST(Array $args, WebApplication $wa) {
    if ( sizeof($args) ) {
      if ( isset($args['ajax']) ) {
        $json = Array("success" => false, "error" => "Unknown error", "result" => null);

        if ( $args['action'] == "load" ) {
          $class = $args['app'];
          if ( class_exists($class) ) {
            $res = new $class();
            $json = Array("success" => true, "error" => null, "result" => $res->__toJSON());
          } else {
            $json['error'] = "Application '$class' does not exist";
          }
        } else if ( $args['action'] == "init" ) {
          $apps = Array();

          foreach ( DesktopApplication::$Registered as $c ) {
            if ( !constant("{$c}::APP_HIDDEN") ) {
              $apps[$c] = Array(
                "title" => constant("{$c}::APP_TITLE"),
                "icon" => constant("{$c}::APP_ICON")
              );
            }
          }

          $json = Array("success" => true, "error" => null, "result" => Array(
            "applications" => $apps
          ));
        } else if ( $args['action'] == "register" ) {
          if ( $uuid = $args['uuid'] ) {
            $_SESSION[$uuid] = $args['instance'];
          }
        } else if ( $args['action'] == "flush" ) {
          if ( $uuid = $args['uuid'] ) {
            unset($_SESSION[$uuid]);
          }
        } else if ( $args['action'] == "event" ) {
          if ( ($uuid = $args['uuid']) && ($action = $args['action']) ) {
            $instance = $args['instance'];
            $cname = $instance['name'];
            $aargs = $instance['args'];

            $result = $cname::Event($uuid, $action, $aargs ? $aargs : Array());
            $json = Array("success" => true, "error" => null, "result" => $result);
          }
        }

        return Response::createJSON($json);
      }
    }

    return false;
    //return parent::doPOST($args, $wa);
  }

}

?>
