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

    $rows = "";
    foreach ( WindowManager::getSettings() as $k => $v ) {

      if ( isset($v['hidden']) && ($v['hidden'] === true) )
        continue;

      $input = "";
      $value = isset($v['value']) ? $v['value'] : null;
      if ( $v['type'] == "array" ) {
        $opts = "";
        if ( isset($v['options']) ) {
          foreach ( $v['options'] as $ok => $ov ) {
            $ov = htmlspecialchars($ov);
            $opts .= "<option value=\"{$ov}\">{$ov}</option>";
          }
        }
        $input = "<select name=\"{$k}\">{$opts}</select>";
      } else if ( $v['type'] == "filename" ) {
        $input = "<input type=\"text\" name=\"fake_{$k}\" value=\"{$value}\" disabled=\"disabled\" />";
        $input .= "<input type=\"hidden\" name=\"{$k}\" value=\"{$value}\" />";
        $input .= "<button>...</button>";
      } else {
        $input = "<input type=\"text\" name=\"{$k}\" value=\"{$value}\" />";
      }

      $rows .= <<<EOHTML

<div>
  <h1>{$k}</h1>
{$input}
</div>


EOHTML;
    }


    $this->content = <<<EOHTML

<div class="SystemSettings">
  <div class="SystemSettingsForm">
    <form method="post" action="/" onsubmit="return false;">
{$rows}
    </form>
  </div>
  <div class="SystemSettingsButtons">
    <button class="Save">Save</button>
    <button class="Close">Close</button>
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "sys.settings.js",
      "sys.settings.css"
    );
    $this->width = 400;
    $this->height = 250;
    $this->is_maximizable = false;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }

  public static function Event($uuid, $action, Array $args) {
  }
}

DesktopApplication::$Registered[] = "SystemSettings";

?>
