<?php
/*!
 * @file
 * Contains SystemSettings Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * SystemSettings Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemSettings
  extends DesktopApplication
{
  const APP_TITLE = "Settings";
  const APP_ICON = "categories/applications-system.png";
  const APP_HIDDEN = true;

  public function __construct() {

    $this->content = <<<EOHTML

<div class="SystemSettings">
  <div class="SystemSettingsForm">
    <form method="post" action="/" onsubmit="return false;">
    </form>
  </div>
  <div class="ApplicationSettingButtons">
    <button class="Save">Save</button>
    <button class="Close">Close</button>
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.settings.js",
      "app.settings.css"
    );
    $this->width = 400;
    $this->height = 400;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }

  public static function Event($uuid, $action, Array $args) {
    return false;
  }
}

DesktopApplication::$Registered[] = "SystemSettings";

?>
