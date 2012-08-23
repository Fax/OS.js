<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - CoreSettings.class.php
 *
 * Main OS.js Core Settings Managment
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
 * CoreSettings -- Core Environment Settings Manager
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
abstract class CoreSettings
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
            )/*,
            Array(
              "index"=>7,
              "name"=>"PanelItemNotificationArea",
              "opts"=>Array(

              ),
              "align"=>"right",
              "position"=>340
            )*/
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
   * @var Icons from MIME (Primary method for getting icons)
   */
  protected static $_MimeIcons = Array(
    "application" => Array(
      "application/ogg" => Array(
        "ogv" => "mimetypes/video-x-generic.png",
        "_"   => "mimetypes/audio-x-generic.png"
      ),
      "application/pdf"       => "mimetypes/gnome-mime-application-pdf.png",
      "application/x-dosexec" => "mimetypes/binary.png",
      "application/xml"       => "mimetypes/text-x-opml+xml.png",
      "application/zip"       => "mimetypes/folder_tar.png",
      "application/x-tar"     => "mimetypes/folder_tar.png",
      "application/x-bzip2"   => "mimetypes/folder_tar.png",
      "application/x-bzip"    => "mimetypes/folder_tar.png",
      "application/x-gzip"    => "mimetypes/folder_tar.png",
      "application/x-rar"     => "mimetypes/folder_tar.png"
    ),

    "image" => "mimetypes/image-x-generic.png",
    "video" => "mimetypes/video-x-generic.png",
    "text"  => Array(
      "text/html"   => "mimetypes/text-html.png",
      "text/plain"  => "mimetypes/gnome-mime-text.png",
      "_"           => "mimetypes/text-x-generic.png"
    )
  );

  /**
   * @var Icons from Extension (Overrides _MimeIcons)
   * Overrides all other icons
   */
  protected static $_IconsExt = Array(
    "pdf"    => "mimetypes/gnome-mime-application-pdf.png",
    "mp3"    => "mimetypes/audio-x-generic.png",
    "ogg"    => "mimetypes/audio-x-generic.png",
    "flac"   => "mimetypes/audio-x-generic.png",
    "aac"    => "mimetypes/audio-x-generic.png",
    "vorbis" => "mimetypes/audio-x-generic.png",
    "mp4"    => "mimetypes/video-x-generic.png",
    "mpeg"   => "mimetypes/video-x-generic.png",
    "avi"    => "mimetypes/video-x-generic.png",
    "3gp"    => "mimetypes/video-x-generic.png",
    "flv"    => "mimetypes/video-x-generic.png",
    "mkv"    => "mimetypes/video-x-generic.png",
    "webm"   => "mimetypes/video-x-generic.png",
    "ogv"    => "mimetypes/video-x-generic.png",
    "bmp"    => "mimetypes/image-x-generic.png",
    "jpeg"   => "mimetypes/image-x-generic.png",
    "jpg"    => "mimetypes/image-x-generic.png",
    "gif"    => "mimetypes/image-x-generic.png",
    "png"    => "mimetypes/image-x-generic.png",
    "zip"    => "mimetypes/folder_tar.png",
    "rar"    => "mimetypes/folder_tar.png",
    "gz"     => "mimetypes/folder_tar.png",
    "bz2"    => "mimetypes/folder_tar.png",
    "bz"     => "mimetypes/folder_tar.png",
    "tar"    => "mimetypes/folder_tar.png",
    "xml"    => "mimetypes/text-x-opml+xml.png"
  );

  /**
   * @var MIME Fixes for specific extensions
   * @desc Used during MIME identification of a specific file
   */
  protected static $_MimeFixes = Array(
    "application/octet-stream" => Array(
      "webm"  => "video/webm",
      "ogv"   => "video/ogg",
      "ogg"   => "video/ogg"
    ),
    "application/ogg" => Array(
      "ogv"   => "video/ogg",
      "ogg"   => "video/ogg"
    ),
    "text/plain" => Array(
      "m3u"   => "application/x-winamp-playlist"
    )
  );

  /**
   * @var Default files to ignore
   */
  protected static $_IgnoreFiles = Array(
    ".gitignore", ".git", ".cvs"
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
      "/img/theme.default/close.png",
      "/img/theme.default/close_unfocused.png",
      "/img/theme.default/maximize.png",
      "/img/theme.default/maximize_unfocused.png",
      "/img/theme.default/menu_expand.png",
      "/img/theme.default/menu_expand_hover.png",
      "/img/theme.default/minimize.png",
      "/img/theme.default/minimize_unfocused.png",
      "/img/theme.default/prelight.png",
      "/img/theme.default/prelight_unfocused.png",
      "/img/theme.default/pressed.png"
      /*
      "categories/applications-development.png", "categories/applications-games.png", "categories/applications-graphics.png", "categories/applications-office.png", "categories/applications-internet.png", "categories/applications-multimedia.png", "categories/applications-system.png", "categories/applications-utilities.png", "categories/gnome-other.png",
      "actions/window_fullscreen.png", "actions/zoom-original.png", "actions/window_nofullscreen.png", "actions/window-close.png",
      "actions/gtk-execute.png", "mimetypes/exec.png", "devices/network-wireless.png", "status/computer-fail.png","apps/system-software-install.png", "apps/system-software-update.png", "apps/xfwm4.png", "places/desktop.png",
      "status/gtk-dialog-error.png", "status/gtk-dialog-info.png", "status/gtk-dialog-question.png", "status/gtk-dialog-warning.png",
      "status/error.png", "emblems/emblem-unreadable.png"*/
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
    "theme.none.css",
    "cursor.default.css",
    "main.css",
    "dialogs.css",
    "pimp.css",
    "glade.css",
    "iframe.css",
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

  /**
   * getMimeIcons() -- Get icons mapping array for MIME
   * @return Array
   */
  public static function getMimeIcons() {
    return self::$_MimeIcons;
  }

  /**
   * getExtIcons() -- Get icon mapping array for extensions
   * @return Array
   */
  public static function getExtIcons() {
    return self::$_IconsExt;
  }

  /**
   * getMimeFixes() -- Get MIME fixes map array
   * @return Array
   */
  public static function getMimeFixes() {
    return self::$_MimeFixes;
  }

  /**
   * getIgnoreFiles() -- Get file ignore list
   * @return Array
   */
  public static function getIgnoreFiles() {
    return self::$_IgnoreFiles;
  }

}

?>
