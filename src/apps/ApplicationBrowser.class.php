<?php
/*!
 * @file
 * Contains ApplicationBrowser Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * ApplicationBrowser Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationBrowser
  extends DesktopApplication
{
  const APP_TITLE = "Web Browser";
  const APP_ICON  = "categories/gnome-globe.png";

  public function __construct() {

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

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationBrowser";

?>
