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
  extends DesktopApplication
{
  const APP_TITLE = "About";
  const APP_ICON = "actions/gtk-about.png";
  const APP_HIDDEN = true;

  public function __construct() {
    $this->content = <<<EOHTML

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

    /*
    $this->resources = Array(
      "sys.user.js",
      "sys.user.css"
    );
     */

    $this->is_scrollable = false;
    $this->is_resizable = false;
    $this->is_maximizable = false;
    $this->is_minimizable = false;
    $this->width = 220;
    $this->height = 120;
    $this->gravity = "center";

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "SystemAbout";

?>
