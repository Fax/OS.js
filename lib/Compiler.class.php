<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Compiler.class.php
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
 * @created 2012-01-26
 */

require_once "Glade.class.php";

/**
 * Compiler -- Package Compiler main Class
 *
 * This is the Package compiler for OS.js.
 * It creates script files for use in a Project from a
 * Metadata file and alternatively linked content for HTML
 * in applications (Glade/Gtk, HTML, etc.).
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class Compiler
{
  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  public static $TemplatePHP;             //!< text/plain PHP Template
  public static $TemplateCSS;             //!< text/plain CSS Template
  public static $TemplateJSAPP;           //!< text/plain Application JS Template
  public static $TemplateJSPI;            //!< text/plain PanelItem JS Template
  public static $TemplateJSBS;            //!< text/plain BackgroundService JS Template
  public static $TemplateJSWindow;        //!< text/plain Glade Template

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Compile Package given by name
   *
   * @param   String    $project_name   Project Name
   * @param   bool      $dry_run        Don't write any files (Default = false)
   * @param   String    $root           Search folder (Default = called script)
   * @return  bool
   */
  public static function compile($project_name, $dry_run = false, $root = null) {
    $root = ($root ? $root : PATH_PACKAGES);
    $path = "{$root}/{$project_name}/metadata.xml";

    if ( file_exists($path) ) {
      $type = "Application";
      if ( preg_match("/^PanelItem(.*)$/", $project_name) ) {
        $type = "PanelItem";
      } else if ( preg_match("/^Service(.*)$/", $project_name) ) {
        $type = "Service";
      }

      return Compiler::_CompilePackage($type, $project_name, $path, $dry_run);
    }

    return false;
  }

  /**
   * Compile all Packages found in folder
   *
   * @param   bool      $dry_run  Don't write any files (Default = false)
   * @param   String    $root     Search folder (Default = called script)
   * @return  bool
   */
  public static function compileAll($dry_run = false, $root = null) {
    $root = ($root ? $root : PATH_PACKAGES);
    if ( $dh  = opendir($root) ) {
      $files = Array();
      while (false !== ($filename = readdir($dh))) {
        $files[] = $filename;
      }
      sort($files);

      foreach ( $files as $filename ) {
        Compiler::compile($filename, $dry_run, $root);
      }

      return true;
    }

    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PROTECTED METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Parse a Glade file
   *
   * @param   String  $schema             Glade Schema
   * @param   Array   $mimes              Project MIMEs
   * @param   String  $project_title      Project Title
   * @param   String  $project_icon       Project Icon
   * @return  Array
   */
  protected static function _ParseGlade($schema, Array $project_mimes, $project_title, $project_icon) {
    $mimes              = json_encode($project_mimes);
    $js_prepend         = "";
    $js_append          = "";
    $js_root_window     = "";
    $code_init          = "";
    $code_class         = "";
    $code_create        = "";
    $window_properties  = Array();
    $window_id          = "";
    $glade_html         = Array();
    $glade_windows      = Array();
    $found_root         = false;

    if ( $windows = Glade::Parse($schema) ) {
      foreach ( $windows as $id => $window ) {
        // Property overrides
        if ( !$window['properties']['title'] ) {
          $window['properties']['title'] = $project_title;
        }
        if ( !$window['properties']['icon'] ) {
          $window['properties']['icon'] = $project_icon;
        }

        $window_properties = $window['properties'];
        $window_id         = $id;

        foreach ( $window['properties'] as $pk => $pv ) {
          if ( in_array($pk, Array("type")) ) {
            continue;
          }

          if ( $pk == "title" ) {
            $pv = "LABELS.title";
          } else {
            if ( is_bool($pv) ) {
              $pv = $pv ? 'true' : 'false';
            } else {
              if ( !$pv ) {
                $pv = "null";
              } else {
                if ( !is_numeric($pv) ) {
                  $pv = "'{$pv}'";
                }
              }
            }
          }

          $code_init .= "        this._{$pk} = $pv;\n";
        }

        foreach ( $window['signals'] as $obj => $evs ) {
          foreach ( $evs as $ev_type => $ev_handler ) {
            $ev_code = "";

            if ( !preg_match("/^Event/", $ev_handler) ) {
              $ev_handler = "Event{$ev_handler}";
            }

if ( $ev_handler == "EventMenuOpen" ) {
  $ev_code = <<<EOJAVASCRIPT

        var my_mimes    = {$mimes};
        var my_callback = function(fname) {}; // FIXME
        var cur         = (argv && argv['path'] ? argv['path'] : null);

        this.app.defaultFileOpen(function(fname) {
          my_callback(fname);
        }, mu_mimes, null, cur);
EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuSave" ) {
              $ev_code = <<<EOJAVASCRIPT

        var my_filename = (argv && argv['path'] ? argv['path'] : null);
        var my_content  = ""; // FIXME
        var my_mimes    = {$mimes};
        var my_callback = function(fname) {}; // FIXME

        if ( my_filename ) {
          this.app.defaultFileSave(my_filename, my_content, function(fname) {
            my_callback(fname);
          }, my_mimes, undefined, false);
        }

EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuSaveAs" ) {
              $ev_code = <<<EOJAVASCRIPT

        var my_filename = (argv && argv['path'] ? argv['path'] : null);
        var my_content  = ""; // FIXME
        var my_mimes    = {$mimes};
        var my_callback = function(fname, fmime) {}; // FIXME

        this.app.defaultFileSave(my_filename, my_content, function(fname) {
          my_callback(fname);
        }, my_mimes, undefined, true);

EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuClose" || $ev_handler == "EventMenuQuit" || $ev_handler == "EventClose" || $ev_handler == "EventQuit" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.\$element.find(".ActionClose").click();

EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuTextCopy" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.app._clipboard("copy");
EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuTextPaste" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.app._clipboard("paste");
EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuTextCut" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.app._clipboard("cut");
EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuTextSelectAll" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.app._clipboard("select");
EOJAVASCRIPT;
            } else if ( $ev_handler == "EventMenuTextDelete" ) {
              $ev_code = <<<EOJAVASCRIPT

        this.app._clipboard("delete");
EOJAVASCRIPT;
            } else {
              if ( $ev_type == "file-set" ) {
                $ev_code = <<<EOJAVASCRIPT

        var my_mimes    = {$mimes};
        var my_path     = self.\$element.find(".{$obj} input[type=text]").val();

        this.app.createFileDialog(function(fname) {
          self.\$element.find(".{$obj} input[type=text]").val(fname);
          self.\$element.find(".{$obj} input[type=hidden]").val(fname);
        }, my_mimes, "open", dirname(my_path));

EOJAVASCRIPT;
              }
            }

            $code_class .= <<<EOJAVASCRIPT

      {$ev_handler} : function(el, ev) {
        var self = this;

      {$ev_code}
      },


EOJAVASCRIPT;

            if ( $ev_type == "file-set" ) {
                  $code_create .= <<<EOJAVASCRIPT

          el.find(".{$obj} button").click(function(ev) {
            self.{$ev_handler}(this, ev);
          });

EOJAVASCRIPT;

            } else if ( $ev_type == "input-activate" ) {
                  $code_create .= <<<EOJAVASCRIPT

          el.find(".{$obj}").keypress(function(ev) {
            var k = ev.keyCode || ev.which;
            if ( k == 13 ) {
              self.{$ev_handler}(this, ev);
            }
          });

EOJAVASCRIPT;
            } else {

                  $code_create .= <<<EOJAVASCRIPT

          el.find(".{$obj}").{$ev_type}(function(ev) {
            self.{$ev_handler}(this, ev);
          });

EOJAVASCRIPT;
            }

          } // foreach
        } // foreach


        $replace = Array(
          "%WINDOW_NAME%" => $id,
          "%IS_DIALOG%"   => "false",
          "%CONTENT%"     => addslashes(str_replace("\n", "", preg_replace("/\s+/", " ", $window['content']))),
          "%CODE_INIT%"   => $code_init,
          "%CODE_CLASS%"  => $code_class,
          "%CODE_CREATE%" => $code_create
        );

        $glade_windows[$id] = str_replace(array_keys($replace), array_values($replace), self::$TemplateJSWindow);

        // First window is always root window
        if ( !$found_root ) {
          $js_root_window = "root_window";
          $js_prepend = <<<EOJAVASCRIPT
        var root_window = new Window_{$id}(self);
EOJAVASCRIPT;

          $js_append = <<<EOJAVASCRIPT
        root_window.show();
EOJAVASCRIPT;
          $found_root = true;
        }

        $glade_html[] = $window['content'];

      } // foreach
    }

    return Array(
      "js_prepend"        => $js_prepend,
      "js_append"         => $js_append,
      "js_root_window"    => $js_root_window,
      "glade_html"        => $glade_html,
      "glade_windows"     => $glade_windows,
      "window_properties" => $window_properties,
      "window_id"         => $window_id
    );

  }

  /**
   * Compile a package, for internal usage
   *
   * @param   String      $classType      The class base name
   * @param   String      $className      The class instance name (package name)
   * @param   String      $metadataFile   Metadata file path
   * @param   bool        $dryRun         Don't write any data
   * @return  bool
   */
  protected static function _CompilePackage($classType, $className, $metadataFile, $dryRun = false) {
    if ( !($xml = new SimpleXmlElement(file_get_contents($metadataFile))) ) {
      return false;
    }

    print "--- $classType: $className\n";

    $contentFile  = "";
    $contentType  = "";
    $templateJS   = "";
    $timestamp    = strftime("%F");
    $data         = Array(
      "name"        => ((string) $xml['name']),
      "enabled"     => true,
      "title"       => "",
      "titles"      => Array(),
      "icon"        => "",
      "desc"        => "",
      "descs"       => Array(),
      "compability" => Array(),
      "mimes"       => Array()
    );

    // Set defaults
    if ( $classType == "BackgroundService" || $classType == "Service" ) {
      $templateJS = self::$TemplateJSBS;
      $data["title"] = BackgroundService::SERVICE_TITLE;
      $data["icon"]  = BackgroundService::SERVICE_ICON;
      $data["desc"]  = BackgroundService::SERVICE_DESC;
    } else if ( $classType == "PanelItem" ) {
      $templateJS = self::$TemplateJSPI;
      $data["title"] = PanelItem::PANELITEM_TITLE;
      $data["icon"]  = PanelItem::PANELITEM_ICON;
      $data["desc"]  = PanelItem::PANELITEM_DESC;
    } else if ( $classType == "Application" ) {
      $templateJS = self::$TemplateJSAPP;
      $data["title"] = Application::APPLICATION_TITLE;
      $data["icon"]  = Application::APPLICATION_ICON;
    } else {
      return false;
    }

    // Check for linked content
    if ( ($schema = ((string) $xml['schema'])) ) {
      $contentFile = str_replace("metadata.xml", $schema, $metadataFile);
      if ( !file_exists($contentFile) ) {
        $contentFile = null;
      }
    }

    // Parse general attributes
    foreach ( $xml->property as $p ) {
      $val = ((string) $p);
      switch ( $p['name'] ) {
        case "enabled" :
          if ( $val == "false" ) {
            $data["enabled"] = false;
            break;
          }
          break;
        case "title" :
          if ( $val ) {
            if ( isset($p['language']) && !empty($p['language']) ) {
              $lang = ((string)$p['language']);
              $data["titles"][$lang] = $val;
              if ( $lang == DEFAULT_LANGUAGE ) {
                $data["title"] = $val;
              }
            } else {
              $data["titles"][DEFAULT_LANGUAGE] = $val;
              $data["title"] = $val;
            }
          }
          break;
        case "icon" :
          if ( $val ) {
            $data["icon"] = $val;
          }
          break;
      }
    }


    if ( ENV_PRODUCTION ) {
      if ( !$data["enabled"] ) {
        print "!!! Not enabled...skipping...!\n\n";
        return true;
      }
    }

    // Parse other nodes
    if ( isset($xml->compability) ) {
      foreach ( $xml->compability as $c ) {
        $data["compability"][] = (string) $c;
      }
    }

    if ( isset($xml->mime) ) {
      foreach ( $xml->mime as $m ) {
        $data["mimes"][] = (string) $m;
      }
    }

    // Create JS stuff
    $temp_windows   = Array();
    $glade_windows  = Array();
    $glade_html     = Array();
    $js_prepend     = "";
    $js_append      = "";
    $js_glade       = "";
    $js_root_window = "";
    $js_linguas     = Array(DEFAULT_LANGUAGE => Array());

    if ( !isset($data["titles"][DEFAULT_LANGUAGE]) ) {
      $data["titles"][DEFAULT_LANGUAGE] = $data["title"];
    }
    foreach ( $data["titles"] as $tk => $tv ) {
      $js_linguas[$tk]["title"] = $tv;
    }
    $js_linguas[DEFAULT_LANGUAGE]["title"] = $data["title"];

    // Generate code from linked file(s)
    if ( $contentFile ) {
      print "* Parsing linked content\n";
      print "    <<< $contentFile\n";

      if ( preg_match("/\.xml|glade$/", $contentFile) ) {
        $contentType = "glade";
        if ( $result = self::_ParseGlade($contentFile, $data["mimes"], $data["title"], $data["icon"]) ) {
          extract($result, EXTR_OVERWRITE);

          $temp_windows[$window_id] = $window_properties;
          unset($window_id);
          unset($window_properties);

          $js_glade = implode("\n", $glade_windows);
        }
      } else {
        $contentType = "other";
        $js_glade = file_get_contents($contentFile);
      }
    }

    // Now create metadata for file generation
    $files = Array(
      "js" => Array(
        "path"      => PATH_BUILD_COMPILER . "/{$className}.js",
        "template"  => $templateJS,
        "content"   => "",
        "replace"   => Array(
          "%PACKAGETYPE%"       => $classType,
          "%CLASSNAME%"         => $className,
          "%LINGUAS%"           => json_encode($js_linguas),
          "%DEFAULT_LANGUAGE%"  => DEFAULT_LANGUAGE,
        )
      ),

      "css" => Array(
        "path"      => PATH_BUILD_COMPILER . "/{$className}.css",
        "template"  => self::$TemplateCSS,
        "content"   => "",
        "replace"   => Array(
          "%PACKAGETYPE%"   => $classType,
          "%CLASSNAME%"     => $className
        )
      ),

      "html" => Array(
        "path"      => PATH_BUILD_COMPILER . "/{$className}.html",
        "template"  => false,
        "content"   => "",
        "replace"   => false
      ),

      "php" => Array(
        "path"      => PATH_BUILD_COMPILER . "/{$className}.class.php",
        "template"  => self::$TemplatePHP,
        "content"   => "",
        "replace"   => Array(
          "%PACKAGETYPE%"   => $classType,
          "%CLASSNAME%"     => $className,
          "%TIMESTAMP%"     => $timestamp
        )
      )
    );

    // Override on specific types
    if ( $classType == "Application" ) {
      $files["js"]["replace"] = Array(
        "%PACKAGETYPE%"       => $classType,
        "%CLASSNAME%"         => $className,
        "%COMPABILITY%"       => json_encode($data["compability"]),
        "%CODE_GLADE%"        => $js_glade,
        "%CODE_PREPEND%"      => $js_prepend,
        "%CODE_APPEND%"       => $js_append,
        "%ROOT_WINDOW%"       => $js_root_window,
        "%LINGUAS%"           => json_encode($js_linguas),
        "%DEFAULT_LANGUAGE%"  => DEFAULT_LANGUAGE
      );

      $files["html"]["content"] = implode("\n", $glade_html);
    } else {
      if ( preg_match("/Service$/", $classType) ) {
        unset($files["css"]);
      }
      unset($files["html"]);
    }

    // Create content
    foreach ( $files as $t => &$d ) {
      print "* Generating $t\n";

      if ( $d["replace"] ) {
        $d["content"] = str_replace(
          array_keys($d["replace"]),
          array_values($d["replace"]),
          $d["template"]
        );
      }

      if ( !$dryRun ) {
        print "    >>> {$d["path"]}\n";
        file_put_contents($d["path"], $d["content"]);
      }
    }

    print "\n";

    return true;
  }

}

///////////////////////////////////////////////////////////////////////////////
// TEMPLATES
///////////////////////////////////////////////////////////////////////////////

Compiler::$TemplatePHP      = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.php"));
Compiler::$TemplateCSS      = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.css"));
Compiler::$TemplateJSAPP    = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.application.js"));
Compiler::$TemplateJSPI     = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.panelitem.js"));
Compiler::$TemplateJSBS     = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.service.js"));
Compiler::$TemplateJSWindow = file_get_contents(sprintf("%s/%s", PATH_TEMPLATES, "compiler.window.js"));

?>
