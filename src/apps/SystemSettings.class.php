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

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

}

?>
