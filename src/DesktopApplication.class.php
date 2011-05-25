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
  const APP_TITLE  = "Window";
  const APP_ICON   = "emblems/emblem-unreadable.png";
  const APP_HIDDEN = false;

  protected $uuid            = null;
  protected $title           = self::APP_TITLE;
  protected $content         = "";
  protected $icon            = self::APP_ICON;
  protected $is_draggable    = true;
  protected $is_resizable    = true;
  protected $is_scrollable   = true;
  protected $is_sessionable  = true;
  protected $width           = 500;
  protected $height          = 300;
  protected $gravity         = "";
  protected $resources       = Array();
  protected $menu            = Array();
  protected $statusbar       = false;
  protected $accept_mime     = Array(); // TODO: Add here, remove from global?!

  public static $Registered = Array();

  public function __construct($title, $icon, $hidden) {
    $this->uuid   = UUID::v4();
    $this->title  = $title;
    $this->icon   = $icon;
    $this->hidden = (bool) $hidden;
  }

  public function __toJSON() {
    return Array(
      "class"           => get_class($this),
      "uuid"            => $this->uuid,
      "icon"            => $this->icon,
      "title"           => $this->title,
      "content"         => $this->content,
      "is_draggable"    => $this->is_draggable,
      "is_resizable"    => $this->is_resizable,
      "is_scrollable"   => $this->is_scrollable,
      "is_sessionable"  => $this->is_sessionable,
      "resources"       => $this->resources,
      "width"           => $this->width,
      "height"          => $this->height,
      "menu"            => $this->menu,
      "statusbar"       => $this->statusbar,
      "gravity"         => $this->gravity
    );
  }

  public static function Event($uuid, $action, Array $args) {
    return Array();
  }
}

?>
