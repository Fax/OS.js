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
  extends Application
{
  const APPLICATION_TITLE  = "Settings";
  const APPLICATION_ICON   = "categories/applications-system.png";
  const APPLICATION_SYSTEM = true;

  public function __construct() {
    parent::__construct();
  }

  public static function createHTML() {

    $rows = "";
    $ignore = Array("desktop.panel.position", "desktop.panel.items");

    foreach ( WindowManager::getSettings() as $k => $v ) {
      if ( in_array($k, $ignore) )
        continue;

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


    return <<<EOHTML

<div class="SystemSettings">
  <div class="SystemSettingsLoading"></div>
  <div class="SystemSettingsInner">
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
</div>

EOHTML;

  }

  public static function Event($uuid, $action, Array $args) {
  }
}


$window = Array(
  "title"           => SystemSettings::APPLICATION_TITLE,
  "icon"            => SystemSettings::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => true,
  "is_scrollable"   => false,
  "is_sessionable"  => true,
  "is_minimizable"  => false,
  "is_maximizable"  => false,
  "is_closable"     => true,
  "is_orphan"       => true,
  "width"           => 400,
  "height"          => 200,
  "gravity"         => "center"
);

$html = SystemSettings::createHTML();

Application::RegisterStatic("SystemSettings", $window, $html);


?>
