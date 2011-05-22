<?php
/*!
 * @file
 * Contains IndexViewContoller Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-22
 */

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
  public $width = -1;
  public $height = -1;
  public $resources = Array();

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
      "height" => $this->height
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
    $items = Array();
    $html = <<<EOHTML
      <li class="type_%s">
        <div class="Inner">
          <div class="Image"><img alt="" src="/img/icons/32x32/%s" /></div>
          <div class="Title">%s</div>
        </div>
      </li>
EOHTML;

    $add = !empty($args['path']) ? $args['path'] : "";
    $root = PATH_PROJECT_HTML . "/media" . $add;
    if ($handle = opendir($root)) {
      while (false !== ($file = readdir($handle))) {
        if ( $file != "." && $file != ".." ) {
          $fpath = $root . $file;
          $icon = "mimetypes/binary.png";
          $type = "text";

          if ( is_dir($fpath) ) {
            $icon = "places/folder.png";
            $type = "dir";
          }
          $items[] = sprintf($html, $type, $icon, $file);
        }
      }
      closedir($handle);
    }

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

  public function __construct() {
    $this->title = self::APP_TITLE;
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
