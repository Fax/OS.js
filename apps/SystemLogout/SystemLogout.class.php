<?php
/*!
 * @file
 * Contains SystemLogout Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * SystemLogout Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemLogout
  extends Application
{
  const APPLICATION_TITLE  = "Logout";
  const APPLICATION_ICON   = "actions/gnome-logout.png";
  const APPLICATION_SYSTEM = true;

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

}

Application::Register("SystemLogout", __FILE__, Array(), Array());

?>
