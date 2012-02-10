<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Panel Class
 *
 * Copyright (c) 2011, Anders Evenrud
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-06-29
 */

/**
 * Panel -- OS.js Window Manager Panel Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.WindowManager
 * @class
 */
abstract class Panel
{

  /**
   * @var Registered Panel Items
   */
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
