<?php
/*!
 * @file
 * Contains SystemAbout Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-28
 */

/**
 * SystemAbout Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemAbout
  extends Application
{
  const APPLICATION_TITLE  = "About";
  const APPLICATION_ICON   = "actions/gtk-about.png";
  const APPLICATION_SYSTEM = true;

  public function __construct() {
    parent::__construct();
  }
}

$window = Array(
  "title"           => SystemAbout::APPLICATION_TITLE,
  "icon"            => SystemAbout::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => false,
  "is_scrollable"   => false,
  "is_sessionable"  => true,
  "is_minimizable"  => false,
  "is_maximizable"  => false,
  "is_closable"     => true,
  "is_orphan"       => true,
  "width"           => 220,
  "height"          => 120,
  "gravity"         => "center"
);

$html = <<<EOHTML

<div class="SystemAbout">
  <div class="SystemAboutInner">
    <span>Created by Anders Evenrud</span>

    <a href="http://no.linkedin.com/in/andersevenrud" target="_blank">LinkedIn</a>
    <br />

    <a href="https://www.facebook.com/anders.evenrud" target="_blank">Facebook</a>
    <br />

    <a href="mailto:andersevenrud@gmail.com" target="_blank">&lt;andersevenrud@gmail.com&gt;</a>

    <br />
    <br />
    Icons from Gnome<br />
    Theme inspired by GTK
  </div>
</div>

EOHTML;


Application::RegisterStatic("SystemAbout", $window, $html);

?>
