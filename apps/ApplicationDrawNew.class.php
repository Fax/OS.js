<?php
/*!
 * @file
 * Contains ApplicationDrawNew Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationDrawNew Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationDrawNew
  extends Application
{
  const APPLICATION_TITLE = "Draw (Glade)";
  const APPLICATION_ICON  = "categories/gnome-graphics.png";

  public function __construct() {
    parent::__construct();
  }
}

Application::Register("ApplicationDrawNew", str_replace("DrawNew", "Draw", __FILE__), Array("app.draw.js", "app.draw.css"), Array("image/*"));

?>
