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
    $this->content = <<<EOHTML

<div class="ApplicationClock">
  <div class="ApplicationClockInner">
    <div class="Clock">
      <div class="HourShadow"></div>
      <div class="Hour"></div>
      <div class="MinuteShadow"></div>
      <div class="Minute"></div>
      <div class="SecondShadow"></div>
      <div class="Second"></div>
    </div>
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
    $this->height = 200;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationClock";


?>
