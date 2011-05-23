<?php
/*!
 * @file
 * Contains DesktopApplication Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * DesktopApplication Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
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

?>
