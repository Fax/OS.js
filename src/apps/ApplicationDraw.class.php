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
  extends DesktopApplication
{
  const APP_TITLE = "Draw";
  const APP_ICON = "categories/gnome-graphics.png";

  public function __construct() {
    $this->content = <<<EOHTML

<div class="ApplicationDraw">
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
  <div class="ApplicationDrawInner">
    <canvas class="Canvas"></canvas>
  </div>
</div>

EOHTML;

    $this->menu = Array(
      "File" => Array(
        "New"        => "cmd_New",
        "Open"       => "cmd_Open",
        "Save"       => "cmd_Save",
        "Save As..." => "cmd_SaveAs",
        "Close"      => "cmd_Close"
      )
    );

    $this->width = 901; // 800
    $this->height = 433; // 400
    $this->statusbar = true;
    $this->is_scrollable = false;
    $this->resources = Array(
      "app.draw.js",
      "app.draw.css"
    );

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationDraw";

?>
