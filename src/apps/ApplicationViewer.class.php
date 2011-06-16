<?php
/*!
 * @file
 * Contains ApplicationViewer Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-24
 */

/**
 * ApplicationViewer Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationViewer
  extends Application
{
  const APPLICATION_TITLE  = "Viewer";
  const APPLICATION_ICON   = "categories/gnome-multimedia.png";


  public function __construct() {
    parent::__construct();
  }
}

$window = Array(
  "title"           => ApplicationViewer::APPLICATION_TITLE,
  "icon"            => ApplicationViewer::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => true,
  "is_scrollable"   => true,
  "is_sessionable"  => true,
  "is_minimizable"  => true,
  "is_maximizable"  => true,
  "is_closable"     => true,
  "is_orphan"       => false,
  "width"           => 300,
  "height"          => 200,
  "gravity"         => ""
);

$html = <<<EOHTML

<div class="ApplicationViewer GtkWindow">

  <ul class="GtkMenuBar menubar1">
    <li class="GtkMenuItem menuitem1">
      <span class="TopLevel"><u>F</u>ile</span>
      <ul class="GtkMenu menu1" style="display: none; ">
        <li class="GtkImageMenuItem imagemenuitem2">
          <img alt="gtk-open" src="/img/icons/16x16/actions/gtk-open.png">
          <span>Open</span>
        </li>
        <li class="GtkImageMenuItem imagemenuitem5">
          <img alt="gtk-quit" src="/img/icons/16x16/actions/gtk-quit.png">
          <span>Quit</span>
        </li>
      </ul>
    </li>
  </ul>

  <div class="ApplicationViewerWrapper">
    <div class="ApplicationViewerLoading"></div>
    <div class="ApplicationViewerImage"></div>
  </div>
</div>

EOHTML;


Application::RegisterStatic("ApplicationViewer", $window, $html, Array("app.viewer.js", "app.viewer.css"), Array("image/*","audio/*","video/*","application/ogg"));
?>
