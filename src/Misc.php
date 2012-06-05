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
 * @define VFS Operation Attributes
 */
define("VFS_ATTR_READ",     1);
define("VFS_ATTR_WRITE",    2);
define("VFS_ATTR_SPECIAL",  4);
define("VFS_ATTR_RW",       3);
define("VFS_ATTR_RS",       5);
define("VFS_ATTR_RWS",      7);

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

  /////////////////////////////////////////////////////////////////////////////
  // SETTINGS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Default Registry
   */
  protected static $_Registry = Array(
    "desktop.font" => Array(
      "options" => Array("Sansation", "FreeMono", "FreeSans", "FreeSerif"),
      "value"   => "Sansation"
    ),

    "desktop.icon.theme" => Array(
      "options" => Array("Default"),
      "value"   => "Default"
    ),

    "desktop.cursor.theme" => Array(
      "options" => Array("Default", "Experimental"),
      "value"   => "Default"
    ),

    "desktop.theme" => Array(
      "options" => Array("dark", "light"),
      "value"   => "dark"
    ),

    "desktop.wallpaper.path" => Array(
      "value" => "/System/Wallpapers/go2cxpb.png"
    ),

    "desktop.wallpaper.type" => Array(
      "options" => Array("Tiled Wallpaper", "Centered Wallpaper", "Stretched Wallpaper", "Color only"),
      "value"   => "Tiled Wallpaper"
    ),

    "desktop.background.color" =>  Array(
      "value" => "#005A77"
    ),

    "system.sounds.theme" => Array(
      "options" => Array("Default"/*, "User-Defined"*/),
      "value"   => "Default"
    ),

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
   * @var VFS Directory Meta
   */
  protected static $_VFSMeta = Array(
    "/System/Packages" => Array(
      "type" => "system_packages",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/user-bookmarks.png"
    ),
    "/System/Docs" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-documents.png"
    ),
    "/System/Wallpapers" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-pictures.png"
    ),
    "/System/Fonts" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/user-desktop.png"
    ),
    "/System/Sounds" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-music.png"
    ),
    "/System/Templates" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-templates.png"
    ),
    "/System/Themes" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/user-bookmarks.png"
    ),
    "/System" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-templates.png"
    ),
    "/User/Temp" => Array(
      "type" => "user",
      "attr" => VFS_ATTR_RW,
      "icon" => "places/folder-templates.png"
    ),
    "/User/Packages" => Array(
      "type" => "user_packages",
      "attr" => VFS_ATTR_RS,
      "icon" => "places/folder-download.png"
    ),
    "/User/Documents" => Array(
      "type" => "user",
      "attr" => VFS_ATTR_RW,
      "icon" => "places/folder-documents.png"
    ),
    "/User/Desktop" => Array(
      "type" => "user",
      "attr" => VFS_ATTR_RW,
      "icon" => "places/user-desktop.png"
    ),
    "/User" => Array(
      "type" => "chroot",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder_home.png"
    ),
    "/Public" => Array(
      "type" => "public",
      "attr" => VFS_ATTR_RW,
      "icon" => "places/folder-publicshare.png"
    ),
    "/Shared" => Array(
      "type" => "core",
      "attr" => VFS_ATTR_READ,
      "icon" => "places/folder-templates.png"
    )
  );

  /**
   * @var Frontend Module Resources
   * @desc Used for preloading and file compression lists
   */
  protected static $_ModuleResources = Array(
    "ColorOperationDialog" => Array(
      "resources" => Array("dialog.color.js")
    ),
    "FontOperationDialog" => Array(
      "resources" => Array("dialog.font.js")
    ),
    "CopyOperationDialog" => Array(
      "resources" => Array("dialog.copy.js")
    ),
    "FileOperationDialog" => Array(
      "resources" => Array("dialog.file.js")
    ),
    "InputOperationDialog" => Array(
      "resources" => Array("dialog.input.js")
    ),
    "LaunchOperationDialog" => Array(
      "resources" => Array("dialog.launch.js")
    ),
    "PanelItemOperationDialog" => Array(
      "resources" => Array("dialog.panelitem.js")
    ),
    "PanelPreferencesOperationDialog" => Array(
      "resources" => Array("dialog.panel.js")
    ),
    "PanelAddItemOperationDialog" => Array(
      "resources" => Array("dialog.panel.additem.js")
    ),
    "RenameOperationDialog" => Array(
      "resources" => Array("dialog.rename.js")
    ),
    "UploadOperationDialog" => Array(
      "resources" => Array("dialog.upload.js")
    ),
    "FilePropertyOperationDialog" => Array(
      "resources" => Array("dialog.properties.js")
    ),
    "CompabilityDialog" => Array(
      "resources" => Array("dialog.compability.js")
    ),
    "CrashDialog" => Array(
      "resources" => Array("dialog.crash.js")
    )
  );

  /**
   * @var Core Static Preloads
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
   * @var Core ASync Preload
   */
  protected static $_CorePreloads = Array(
    "sounds" => Array(
      // Extension applied in frontend
      "bell", "complete", "message", "service-login", "service-logout", "dialog-information", "dialog-warning"
    ),
    "images" => Array(
      "categories/applications-development.png", "categories/applications-games.png", "categories/applications-graphics.png", "categories/applications-office.png", "categories/applications-internet.png", "categories/applications-multimedia.png", "categories/applications-system.png", "categories/applications-utilities.png", "categories/gnome-other.png",
      "actions/window_fullscreen.png", "actions/zoom-original.png", "actions/window_nofullscreen.png", "actions/window-close.png",
      "actions/gtk-execute.png", "mimetypes/exec.png", "devices/network-wireless.png", "status/computer-fail.png","apps/system-software-install.png", "apps/system-software-update.png", "apps/xfwm4.png", "places/desktop.png",
      "status/gtk-dialog-error.png", "status/gtk-dialog-info.png", "status/gtk-dialog-question.png", "status/gtk-dialog-warning.png",
      "status/error.png", "emblems/emblem-unreadable.png"
    ),
    "resources" => Array(
      // Other core resources
    )
  );

  /**
   * @var Frontend Main Resources
   * @desc Used mainly for file compression lists
   */
  protected static $_CoreResources = Array(
    "theme.default.css",
    "theme.dark.css",
    "theme.light.css",
    "cursor.default.css",
    "main.css",
    "dialogs.css",
    "pimp.css",
    "glade.css",
    "init.js",
    "classes.js",
    "core.js",
    "utils.js"
  );

  /**
   * @var Frontend Locales
   * @desc Used mainly for file compression lists
   */
  protected static $_LocaleResources = Array(
    "en_US.js", "nb_NO.js"
  );

  /////////////////////////////////////////////////////////////////////////////
  // SETTERS
  /////////////////////////////////////////////////////////////////////////////

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
   * setVFSMeta() -- Set the default VFS directory Metadata
   * @return void
   */
  public static function setVFSMeta(Array $meta) {
    self::$_VFSMeta = $meta;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTERS
  /////////////////////////////////////////////////////////////////////////////

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

  /**
   * getVFSMeta() -- Get VFS Directory meta
   * @return Array
   */
  public static function getVFSMeta() {
    return self::$_VFSMeta;
  }

  /**
   * getModuleResources() -- Get all module resources
   * @return Array
   */
  public static function getModuleResources() {
    return self::$_ModuleResources;
  }

  /**
   * getCorePreloads() -- Get all module preload resources
   * @return Array
   */
  public static function getCorePreloads() {
    return self::$_CorePreloads;
  }

  /**
   * getCoreResources() -- Get all core resources
   * @return Array
   */
  public static function getCoreResources() {
    return self::$_CoreResources;
  }

  /**
   * getLocaleResources() -- Get all locale resources
   * @return Array
   */
  public static function getLocaleResources() {
    return self::$_LocaleResources;
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
