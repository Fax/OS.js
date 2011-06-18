<?php
/*!
 * @file
 * Contains ApplicationClock Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * ApplicationClock Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationClock
  extends Application
{
  const APPLICATION_TITLE = "Clock";
  const APPLICATION_ICON  = "status/appointment-soon.png";

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }
}


?>
