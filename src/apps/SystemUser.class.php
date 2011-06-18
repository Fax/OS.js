<?php
/*!
 * @file
 * Contains SystemUser Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-24
 */

/**
 * SystemUser Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemUser
  extends Application
{
  const APPLICATION_TITLE  = "User Information";
  const APPLICATION_ICON   = "apps/user-info.png";
  const APPLICATION_SYSTEM = true;

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

}

?>
