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

    $usettings = UserSetting::getUserSettings(WebApplication::get()->getUser());
    $asettings = UserSetting::$AvailableSettings;
    $lsettings = UserSetting::$LabelSettings;

    $inner = "";
    foreach ( $asettings as $key => $value ) {
      $options = "";
      $label   = htmlspecialchars($lsettings[$key]);
      $current = $usettings[$key];

      foreach ( $value as $avail ) {
        $lvalue  = htmlspecialchars($avail);
        $options .= sprintf("<option value=\"%s\" %s>%s</option>", $lvalue, ($avail == $current ? 'selected="selected"' : ""), $lvalue);
      }


      $inner .= <<<EOHTML

<h1>{$label}</h1>
<div>
  <select name="{$key}">
{$options}
  </select>
</div>

EOHTML;
    }

    $this->content = <<<EOHTML

<div class="SystemSettings">
  <div class="SystemSettingsForm">
    <form method="post" action="/" onsubmit="return false;">
      <table>
        <tbody>
{$inner}
        </tbody>
      </table>
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

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }

  public static function Event($uuid, $action, Array $args) {
    if ( $action == "save" ) {
      $user = WebApplication::get()->getUser();
      UserSetting::saveUserSettings($user, $args);
      return UserSetting::getUserSettings($user);;
    }

    return false;
  }
}

DesktopApplication::$Registered[] = "SystemSettings";

?>
