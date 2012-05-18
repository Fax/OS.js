<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Misc.php
 *
 * Misc OS.js library stuff
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
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
 * @created 2012-04-30
 */

/**
 * CoreObject -- Namespace
 * @class
 */
abstract class CoreObject {}

/**
 * CoreSettings -- Core Settings
 * @class
 */
abstract class CoreSettings
  extends CoreObject
{
  /**
   * @var Preload items
   */
  protected static $_Preloads = Array(
    "vendor" => Array(
      "json.js",
      "sprintf.js",
      "jquery.js",
      "jquery-ui.js"
    ),
    "code" => Array(
    )
  );

  /**
   * @var Default Registry
   */
  protected static $_Registry = Array(
    "desktop.panels"=>Array(
      "items"=>Array(
        Array(
          "name"=>"Default",
          "index"=>0,
          "items"=>Array(
            Array(
              "index"=>0,
              "name"=>"PanelItemMenu",
              "opts"=>Array(

              ),
              "align"=>"left",
              "position"=>0
            ),
            Array(
              "index"=>1,
              "name"=>"PanelItemSeparator",
              "opts"=>Array(

              ),
              "align"=>"left",
              "position"=>38
            ),
            Array(
              "index"=>2,
              "name"=>"PanelItemWindowList",
              "opts"=>Array(

              ),
              "align"=>"left",
              "position"=>48
            ),
            Array(
              "index"=>3,
              "name"=>"PanelItemClock",
              "opts"=>Array(

              ),
              "align"=>"right",
              "position"=>0
            ),
            Array(
              "index"=>4,
              "name"=>"PanelItemSeparator",
              "opts"=>Array(

              ),
              "align"=>"right",
              "position"=>115
            ),
            Array(
              "index"=>5,
              "name"=>"PanelItemDock",
              "opts"=>Array(
                Array(
                  Array(
                    "title"=>"About",
                    "icon"=>"actions/gtk-about.png",
                    "launch"=>"SystemAbout"
                  ),
                  Array(
                    "title"=>"Control Panel",
                    "icon"=>"categories/preferences-system.png",
                    "launch"=>"SystemControlPanel"
                  ),
                  Array(
                    "title"=>"Save and Quit",
                    "icon"=>"actions/gnome-logout.png",
                    "launch"=>"SystemLogout"
                  )
                )
              ),
              "align"=>"right",
              "position"=>120
            ),
            Array(
              "index"=>6,
              "name"=>"PanelItemSeparator",
              "opts"=>Array(

              ),
              "align"=>"right",
              "position"=>205
            ),
            Array(
              "index"=>7,
              "name"=>"PanelItemWeather",
              "opts"=>Array(

              ),
              "align"=>"right",
              "position"=>215
            )
          ),
          "position"=>"top",
          "style"=>Array(
            "type"=>"default",
            "background"=>null,
            "opacity"=>"default"
          )
        )
      )
    ),
    "desktop.grid"=>Array(
      "items"=>Array(
        Array(
          "title"=>"Home",
          "icon"=>"places/user-home.png",
          "launch"=>"ApplicationFileManager",
          "arguments"=>Array(
            "path"=>"/User/Documents"
          ),
          "protected"=>true
        ),
        Array(
          "title"=>"Browser Compability",
          "icon"=>"status/software-update-urgent.png",
          "launch"=>"API::CompabilityDialog",
          "arguments"=>null,
          "protected"=>true
        ),
        Array(
          "title"=>"README",
          "icon"=>"mimetypes/empty.png",
          "launch"=>"ApplicationTextpad",
          "arguments"=>Array(
            "path"=>"/System/Docs/README"
          ),
          "protected"=>false
        ),
        Array(
          "title"=>"AUTHORS",
          "icon"=>"mimetypes/empty.png",
          "launch"=>"ApplicationTextpad",
          "arguments"=>Array(
            "path"=>"/System/Docs/AUTHORS"
          ),
          "protected"=>false
        )

      )
    ),
    "user.autorun"=>Array(
      "items"=>Array(
        "ServiceNoop"
      )
    )
  );

  /**
   * addPreload() -- Add a preload item
   * @return void
   */
  public static function addPreload($key, $value, $content = null) {
    if ( isset(self::$_Preloads[$key]) ) {
      if ( $content !== null ) {
        self::$_Preloads[$key][] = $content;
      } else {
        if ( !in_array($value, self::$_Preloads[$key]) ) {
          self::$_Preloads[$key][] = $value;
        }
      }
    }
  }

  /**
   * setRegistry() -- Set the default registry
   * @return void
   */
  public static function setRegistry(Array $reg) {
    self::$_Registry = $reg;
  }

  /**
   * getPreload() -- Get preload items
   * @return Array
   */
  public static function getPreload() {
    return self::$_Preloads;
  }

  /**
   * getRegistry() -- Get registry
   * @return Array
   */
  public static function getRegistry() {
    return self::$_Registry;
  }
}

/**
 * ExceptionPackage -- Package Exception
 * @class
 */
class ExceptionPackage
  extends Exception
{
  const PACKAGE_NOT_EXISTS    = 0;
  const PACKAGE_EXISTS        = 1;
  const MISSING_METADATA      = 2;
  const INVALID_METADATA      = 3;
  const MISSING_FILE          = 4;
  const FAILED_CREATE         = 5;
  const FAILED_OPEN           = 6;
  const INVALID_DESTINATION   = 7;
  const FAILED_CREATE_DEST    = 8;

  const INVALID               = 255;

  public function __construct($type, Array $args = Array()) {
    $message = _("Unknown Package Error occured");

    switch ( $type ) {
      case self::PACKAGE_NOT_EXISTS :
        $message = vsprintf(_("The package archive '%s' does not exist!"), $args);
      break;
      case self::PACKAGE_EXISTS :
        $message = vsprintf(_("The package already exists in '%s'!"), $args);
      break;
      case self::MISSING_METADATA :
        $message = vsprintf(_("'%s' is missing metadata.xml!"), $args);
      break;
      case self::INVALID_METADATA :
        $message = vsprintf(_("'%s' has invalid metadata.xml!"), $args);
      break;
      case self::MISSING_FILE :
        $message = vsprintf(_("'%s' is missing the file '%s'!"), $args);
      break;
      case self::FAILED_CREATE :
        $message = vsprintf(_("Failed to create archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::FAILED_OPEN :
        $message = vsprintf(_("Failed to open archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::INVALID_DESTINATION :
        $message = vsprintf(_("The destination '%s' is invalid!"), $args);
      break;
      case self::FAILED_CREATE_DEST :
        $message = vsprintf(_("The destination '%s' cannot be created!"), $args);
      break;
      case self::INVALID :
        $message = vsprintf(_("The package archive '%s' is invalid!"), $args);
      break;
    }

    parent::__construct($message);
  }
}

?>
