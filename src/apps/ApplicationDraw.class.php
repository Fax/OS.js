<?php
/*!
 * @file
 * Contains ApplicationDraw Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationDraw Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationDraw
  extends Application
{
  const APPLICATION_TITLE = "Draw";
  const APPLICATION_ICON  = "categories/gnome-graphics.png";

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

}

?>
