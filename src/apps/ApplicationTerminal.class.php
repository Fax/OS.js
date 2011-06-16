<?php
/*!
 * @file
 * Contains ApplicationTerminal Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationTerminal Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationTerminal
  extends Application
{
  const APPLICATION_TITLE  = "Terminal";
  const APPLICATION_ICON   = "apps/utilities-terminal.png";
  const APPLICATION_SYSTEM = false;

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }


}

Application::Register("ApplicationTerminal", __FILE__, Array("app.terminal.js", "app.terminal.css"), Array(), Array("is_scrollable" => false));

?>
