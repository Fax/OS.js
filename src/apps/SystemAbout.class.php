<?php
/*!
 * @file
 * Contains SystemAbout Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-28
 */

/**
 * SystemAbout Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class SystemAbout
  extends Application
{
  const APPLICATION_TITLE  = "About";
  const APPLICATION_ICON   = "actions/gtk-about.png";
  const APPLICATION_SYSTEM = true;

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

}

?>
