<?php
/*!
 * @file
 * Contains ApplicationClock Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * ApplicationClock Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
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


?>
