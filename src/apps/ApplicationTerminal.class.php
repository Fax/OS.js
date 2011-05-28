<?php
/*!
 * @file
 * Contains ApplicationTerminal Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-28
 */

/**
 * ApplicationTerminal Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationTerminal
  extends DesktopApplication
{
  const APP_TITLE = "Terminal";
  const APP_ICON = "apps/utilities-terminal.png";

  public function __construct() {
    $this->content = <<<EOHTML

<div class="ApplicationTerminal">
  <div class="ApplicationTerminalInner">
    <textarea></textarea>
  </div>
</div>

EOHTML;

    $this->width = 800;
    $this->height = 500;
    $this->is_scrollable = false;
    $this->is_resizable = false;
    $this->is_maximizable = false;
    $this->resources = Array(
      "sys.terminal.js",
      "sys.terminal.css"
    );

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationTerminal";



?>
