<?php
/*!
 * @file
 * Contains ApplicationDraw Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-27
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

  public function __construct() {
    parent::__construct();
  }
}

$window = Array(
  "title"           => ApplicationDraw::APPLICATION_TITLE,
  "icon"            => ApplicationDraw::APPLICATION_ICON,
  "is_draggable"    => true,
  "is_resizable"    => true,
  "is_scrollable"   => true,
  "is_sessionable"  => true,
  "is_minimizable"  => true,
  "is_maximizable"  => true,
  "is_closable"     => true,
  "is_orphan"       => false,
  "width"           => 901,
  "height"          => 433,
  "gravity"         => ""
);

$html = <<<EOHTML

<div class="ApplicationDraw GtkWindow">

  <ul class="GtkMenuBar menubar1">
    <li class="GtkMenuItem menuitem1">
      <span class="TopLevel"><u>F</u>ile</span>
      <ul class="GtkMenu menu1" style="display: none; ">
        <li class="GtkImageMenuItem imagemenuitem1">
          <img alt="gtk-new" src="/img/icons/16x16/actions/gtk-new.png">
          <span>New</span>
        </li>
        <li class="GtkImageMenuItem imagemenuitem2">
          <img alt="gtk-open" src="/img/icons/16x16/actions/gtk-open.png">
          <span>Open</span>
        </li>
        <li class="GtkImageMenuItem imagemenuitem3">
          <img alt="gtk-save" src="/img/icons/16x16/actions/gtk-save.png">
          <span>Save</span>
        </li>
        <li class="GtkImageMenuItem imagemenuitem4">
          <img alt="gtk-save-as" src="/img/icons/16x16/actions/gtk-save-as.png">
          <span>Save as...</span>
        </li>
        <li class="GtkSeparatorMenuItem separatormenuitem1">
          <hr>
        </li>
        <li class="GtkImageMenuItem imagemenuitem5">
          <img alt="gtk-quit" src="/img/icons/16x16/actions/gtk-quit.png">
          <span>Quit</span>
        </li>
      </ul>
    </li>
  </ul>

  <div class="ApplicationDrawWrapper">

    <div class="ApplicationDrawPanel">
      <div class="DrawToolButtons">
        <button class="draw_Selection"><img alt="Selection" title="Selection" src="/img/app.draw/icons/stock-selection-16.png" /></button>
        <button class="draw_Pencil"><img alt="Pencil" title="Pencil" src="/img/app.draw/icons/stock-tool-pencil-16.png" /></button>
        <button class="draw_Line"><img alt="Line" title="Line" src="/img/app.draw/icons/stock-tool-path-16.png" /></button>
        <button class="draw_Square"><img alt="Square" title="Square" src="/img/app.draw/icons/stock-shape-square-16.png" /></button>
        <button class="draw_Rectangle"><img alt="Rectangle" title="Rectangle" src="/img/app.draw/icons/stock-shape-rectangle-16.png" /></button>
        <button class="draw_Circle"><img alt="Circle" title="Circle" src="/img/app.draw/icons/stock-shape-circle-16.png" /></button>
        <button class="draw_Ellipse"><img alt="Ellipse" title="Ellipse" src="/img/app.draw/icons/stock-shape-ellipse-16.png" /></button>
        <button class="draw_Fill"><img alt="Fill" title="Fill" src="/img/app.draw/icons/stock-tool-bucket-fill-16.png" /></button>
        <button class="draw_Pick"><img alt="Pick" title="Pick color" src="/img/app.draw/icons/stock-color-pick-from-screen-16.png" /></button>
        <div class="Clear">&nbsp;</div>
      </div>

      <hr />

      <div class="DrawToolColors">
        <div class="color_Foreground">&nbsp;</div>
        <div class="color_Background">&nbsp;</div>
      </div>
    </div>

    <div class="ApplicationDrawToolPanel">
      <div class="Box">
        <label><input type="checkbox" class="enable_Stroke" checked="checked" />Use Stroke</label>
        <label><input type="checkbox" class="enable_Fill" checked="checked" />Use Fill</label>
      </div>

      <div class="Box">
        <label>Thickness</label>
        <div class="Slider">
          <div class="slide_Thickness"></div>
        </div>
      </div>

      <div class="Box Alt">
        <label>Line Cap</label>
        <div class="Select">
          <select class="select_LineCap">
            <option selected="selected" value="butt">butt</option>
            <option value="round">round</option>
            <option value="square">square</option>
          </select>
        </div>
      </div>

      <div class="Box Alt">
        <label>Line Join</label>
        <div class="Select">
          <select class="select_LineJoin">
            <option selected="selected" value="milter">milter</option>
            <option value="bevel">bevel</option>
            <option value="round">round</option>
          </select>
        </div>
      </div>

    </div>
    <div class="ApplicationDrawLoading"></div>
    <div class="ApplicationDrawInner">
      <canvas class="Canvas"></canvas>
    </div>
  </div>
</div>

EOHTML;

Application::RegisterStatic("ApplicationDraw", $window, $html, Array("app.draw.js", "app.draw.css"), Array("image/*"));

?>
