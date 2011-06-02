<?php
/*!
 * @file
 * Contains ApplicationViewer Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-24
 */

/**
 * ApplicationViewer Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationViewer
  extends DesktopApplication
{
  const APP_TITLE  = "Viewer";
  const APP_ICON   = "categories/gnome-multimedia.png";

  public static $MimeTypes = Array(
    "image/*",
    "video/*",
    "application/ogg"
  );

  public function __construct() {
    $this->menu = Array(
      "File" => Array(
        "Open"       => "cmd_Open",
        "Close"      => "cmd_Close"
      )
    );
    $this->content = <<<EOHTML

<div class="ApplicationViewer">
  <div class="ApplicationViewerLoading"></div>
  <div class="ApplicationViewerImage"></div>
</div>

EOHTML;

    $this->resources = Array(
      "app.viewer.js",
      "app.viewer.css"
    );
    $this->width = 300;
    $this->height = 200;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationViewer";

?>
