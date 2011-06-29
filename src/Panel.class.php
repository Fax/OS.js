<?php
/*!
 * @file
 * Contains Panel Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-29
 */

/**
 * Panel Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class Panel
{

  public static $Registered = Array(
    "PanelItemSeparator" => Array(
      "title"       => "Separator",
      "description" => "Separator",
      "icon"        => "/img/icons/32x32/actions/gtk-remove.png",
      "resources"   => Array("panel.separator.js")
    ),
    "PanelItemClock" => Array(
      "title"       => "Clock",
      "description" => "Clock with date",
      "icon"        => "/img/icons/32x32/status/appointment-soon.png",
      "resources"   => Array("panel.clock.js")
    ),
    "PanelItemMenu" => Array(
      "title"       => "Menu",
      "description" => "Display a menu",
      "icon"        => "/img/icons/32x32/actions/window_new.png",
      "resources"   => Array("panel.menu.js")
    ),
    "PanelItemWindowList" => Array(
      "title"       => "Window List",
      "description" => "Display desktop windows",
      "icon"        => "/img/icons/32x32/apps/xfwm4.png",
      "resources"   => Array("panel.windowlist.js")
    ),
    "PanelItemDock" => Array(
      "title"       => "Launcher Dock",
      "description" => "Application launcher dock",
      "icon"        => "/img/icons/32x32/actions/system-run.png",
      "resources"   => Array("panel.dock.js")
    ),
    "PanelItemWeather" => Array(
      "title"       => "Weather",
      "description" => "Weather (geolocation) forecast",
      "icon"        => "/img/icons/32x32/status/weather-few-clouds.png",
      "resources"   => Array("panel.weather.js")
    )
  );

}

?>
