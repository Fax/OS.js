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
  extends Application
{
  const APPLICATION_TITLE = "Clock";
  const APPLICATION_ICON  = "status/appointment-soon.png";

  public function __construct() {
    parent::__construct();
  }
}

$window = Array(
  "title"           => ApplicationClock::APPLICATION_TITLE,
  "icon"            => ApplicationClock::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => false,
  "is_scrollable"   => false,
  "is_sessionable"  => true,
  "is_minimizable"  => false,
  "is_maximizable"  => false,
  "is_closable"     => true,
  "is_orphan"       => false,
  "width"           => 200,
  "height"          => 200,
  "gravity"         => ""
);

$html = <<<EOHTML

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


Application::RegisterStatic("ApplicationClock", $window, $html, Array("app.clock.js", "app.clock.css"));

?>
