<?php
/*!
 * @file
 * Contains ApplicationTextpad Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * ApplicationTextpad Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationTextpad
  extends DesktopApplication
{
  const APP_TITLE = "TextPad";
  const APP_ICON = "apps/text-editor.png";

  public function __construct() {
    $this->menu = Array(
      "File" => Array(
        "New"        => "cmd_New",
        "Open"       => "cmd_Open",
        "Save"       => "cmd_Save",
        "Save As..." => "cmd_SaveAs",
        "Close"      => "cmd_Close"
      )
    );

    $this->content = <<<EOHTML

<div class="ApplicationTextpad">
  <textarea></textarea>
</div>

EOHTML;

    $this->resources = Array(
      "app.textpad.js",
      "app.textpad.css"
    );
    $this->width = 400;
    $this->height = 400;

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationTextpad";

?>
