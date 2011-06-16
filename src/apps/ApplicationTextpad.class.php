<?php
/*!
 * @file
 * Contains ApplicationTextpad Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationTextpad Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationTextpad
  extends Application
{
  const APPLICATION_TITLE  = "Textpad";
  const APPLICATION_ICON   = "apps/text-editor.png";
  const APPLICATION_SYSTEM = false;

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }


}

Application::Register("ApplicationTextpad", __FILE__, Array("app.textpad.js", "app.textpad.css"), Array("text/*"));

?>
