<?php
/*!
 * @file
 * Contains Glade Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * Glade Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries
 * @class
 */
class Glade
{
  private $_sClassName  = "";           //!< Class Name
  private $_aWindows    = Array();      //!< Window List

  protected static $Counter = 0;        //!< Internal counter

  protected static $ShortTags = Array(  //!< Short HTML tags
    "GtkImage", "GtkEntry"
  );

  public static $ClassMap = Array(      //!< Glade Class mapping
    "GtkScale" => Array(
      "element" => "div"
    ),
    "GtkCellRendererText" => Array(
      "element" => "option"
    ),
    "GtkIconView" => Array(
      "element" => "div",
      "gobject" => true
    ),
    "GtkLabel" => Array(
      "element" => "div"/*,
      "gobject" => true*/
    ),
    "GtkColorButton" => Array(
      "element" => "div",
      "gobject" => true
    ),

    "GtkDrawingArea" => Array(
      "element" => "div",
      "classes" => Array("Canvas")
    ),

    "GtkSeparator" => Array(
      "element" => "div",
      "inner"   => "hr"
    ),

    "GtkBox" => Array(
      "element" => "table"
    ),
    "GtkButtonBox" => Array(
      "element" => "ul"
    ),

    "GtkCheckButton" => Array(
      "element" => "input",
      "type"    => "checkbox",
      "wrapped" => true
      //"gobject" => true
    ),

    "GtkComboBox" => Array(
      "element" => "select"/*,
      "gobject" => true*/
    ),

    "GtkToolItemGroup" => Array(
      "element" => "button"
    ),
    "GtkButton" => Array(
      "element" => "button"/*,
      "gobject" => true*/
    ),
    "GtkTextView" => Array(
      "element" => "textarea",
      "gobject" => true
    ),
    "GtkImage" => Array(
      "element" => "img",
      "src"     => "/img/blank.gif",
      "gobject" => true
    ),
    "GtkEntry" => Array(
      "element" => "input",
      "type"    => "text",
      "gobject" => true
    ),
    "GtkMenuBar" => Array(
      "element" => "ul"
    ),
    "GtkMenuItem" => Array(
      "element" => "li"
    ),
    "GtkMenu" => Array(
      "element" => "ul"
    ),
    "GtkImageMenuItem" => Array(
      "element" => "li"
    ),
    "GtkRadioMenuItem" => Array(
      "element" => "li"
    ),
    "GtkToolbar" => Array(
      "element" => "ul"
    ),
    "GtkToolItem" => Array(
      "element" => "li"
    ),
    "GtkToggleToolButton" => Array(
      "element" => "li",
      "inner"   => "button"
    ),

    "GtkNotebook" => Array(
      "element" => "div",
      "inner"   => "ul"
    ),

    "GtkFileChooserButton" => Array(
      "element" => "div"
    )
  );

  protected static $Stock = Array(          //!< Stock icons
    "gtk-apply" => Array(
      "label" => "Apply",
      "icon" => "actions/gtk-save.png"
    ),
    "gtk-cancel" => Array(
      "label" => "Cancel",
      "icon" => "actions/gtk-cancel.png"
    ),
    "gtk-new" => Array(
      "label" => "New",
      "icon" => "actions/gtk-new.png"
    ),
    "gtk-close" => Array(
      "label" => "Close",
      "icon" => "actions/gtk-close.png"
    ),
    "gtk-home" => Array(
      "label" => "Home",
      "icon" => "actions/gtk-home.png"
    ),
    "gtk-refresh" => Array(
      "label" => "Refresh",
      "icon" => "actions/gtk-refresh.png"
    ),
    "gtk-open" => Array(
      "label" => "Open",
      "icon" => "actions/gtk-open.png"
    ),
    "gtk-save" => Array(
      "label" => "Save",
      "icon" => "actions/gtk-save.png"
    ),
    "gtk-save-as" => Array(
      "label" => "Save as...",
      "icon" => "actions/gtk-save-as.png"
    ),
    "gtk-cut" => Array(
      "label" => "Cut",
      "icon" => "actions/gtk-cut.png"
    ),
    "gtk-copy" => Array(
      "label" => "Copy",
      "icon" => "actions/gtk-copy.png"
    ),
    "gtk-paste" => Array(
      "label" => "Paste",
      "icon" => "actions/gtk-paste.png"
    ),
    "gtk-delete" => Array(
      "label" => "Delete",
      "icon" => "actions/gtk-delete.png"
    ),
    "gtk-about" => Array(
      "label" => "About",
      "icon" => "actions/gtk-about.png"
    ),
    "gtk-quit" => Array(
      "label" => "Quit",
      "icon" => "actions/gtk-quit.png"
    ),
    "gtk-connect" => Array(
      "label" => "Connect",
      "icon" => "actions/stock_media-play.png"
    ),
    "gtk-disconnect" => Array(
      "label" => "Disconnect",
      "icon" => "actions/gtk-stop.png"
    ),
    "gtk-preferences" => Array(
      "label" => "Preferences",
      "icon" => "categories/gtk-preferences.png"
    ),
    "gtk-ok" => Array(
      "label" => "Ok",
      "icon" => "actions/gtk-save.png"
    ),
    "gtk-add" => Array(
      "label" => "Add",
      "icon" => "actions/gtk-add.png"
    ),
    "gtk-remove" => Array(
      "label" => "Remove",
      "icon" => "actions/gtk-remove.png"
    ),
    "gtk-execute" => Array(
      "label" => "Execute",
      "icon" => "actions/gtk-execute.png"
    ),

    "gtk-media-previous" => Array(
      "label" => "Prev",
      "icon" => "actions/media-skip-backward.png"
    ),
    "gtk-media-stop" => Array(
      "label" => "Stop",
      "icon" => "actions/media-playback-stop.png"
    ),
    "gtk-media-play" => Array(
      "label" => "Play",
      "icon" => "actions/media-playback-start.png"
    ),
    "gtk-media-pause" => Array(
      "label" => "Pause",
      "icon" => "actions/media-playback-pause.png"
    ),
    "gtk-media-next" => Array(
      "label" => "Next",
      "icon" => "actions/media-skip-forward.png"
    )
  );

  /**
   * Create a new Glade instance
   * @param String    $filename   Glade XML filename
   * @param String    $xml_data   Glade XML data
   * @constructor
   */
  public function __construct($filename, $xml_data) {
    $cn = str_replace(".glade", "", basename($filename)); // FIXME
    $this->_sClassName = $cn;

    foreach ( $xml_data->object as $root ) {
      $class = (string) $root['class'];
      $id    = (string) $root['id'];

      // Properties
      $properties = Array(
        "type"            => $class == "GtkWindow" ? "window" : "dialog",
        "title"           => "",
        "icon"            => "",
        "is_draggable"    => true,
        "is_resizable"    => true,
        "is_scrollable"   => false,
        "is_sessionable"  => true,
        "is_minimizable"  => true,
        "is_maximizable"  => true,
        "is_closable"     => true,
        "is_orphan"       => false,
        "skip_taskbar"    => false,
        "skip_pager"      => false,
        "width"           => 500,
        "height"          => 300,
        "gravity"         => ""
      );

      $rstyles = array();

      foreach ( $root->property as $p ) {
        $pv = (string) $p;
        switch ( (string) $p['name'] ) {
          case 'resizable' :
            if ( $pv == "False" ) {
              $properties['is_resizable'] = false;
            }
            break;
          case 'title' :
            if ( $pv ) {
              $properties['title'] = $pv;
            }
          break;
          case 'icon' :
            if ( $pv ) {
              $properties['icon'] = $pv;
            }
          break;
          case 'default_width' :
            $properties['width'] = (int) $pv;
          break;
          case 'default_height' :
            $properties['height'] = (int) $pv;
          break;
          case 'window_position' :
            $properties['gravity'] = $pv;
          break;
          case 'skip_taskbar_hint' :
            if ( $pv == "True" ) {
              $properties['skip_taskbar'] = true;
            }
          break;
          case 'skip_pager_hint' :
            if ( $pv == "True" ) {
              $properties['skip_pager'] = true;
            }
          break;

          case "border_width" :
            if ( (int) $pv > 0 ) {
              $rstyles[] = "padding:{$pv}px";
            }
          break;
        }
      }

      $classes = Array($class, $cn, $id);

      // Window HTML document
      $x = new DOMImplementation();
      $doc = $x->createDocument();
      $doc->xmlVersion    = "1.0";
      $doc->formatOutput  = true;
      $doc->encoding      = 'UTF-8';

      $n_window = $doc->createElement("div");
      $n_window->setAttribute("class", $id);

      $n_content = $doc->createElement("div");
      $n_content->setAttribute("class", implode(" ", $classes));

      if ( $rstyles )  {
        $n_content->setAttribute("style", implode(";", $rstyles));
      }

      $n_window->appendChild($n_content);

      // Parse Glade document childs
      $signals = $this->_parseChild($doc, $n_content, $root, $root);

      $doc->appendChild($n_window);

      // Append window to registry
      $html = str_replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", "", $doc->saveXML());
      $this->_aWindows[$id] = Array(
        "properties" => $properties,
        "signals"    => $signals,
        "content"    => $html
      );

    }
  }

  /**
   * Fill node with empty text
   * @param   DOMDocument   $doc        Document Object
   * @param   DOMNode       $node       Node to fill
   * @param   bool          $short      Short tag ?
   * @return  void
   */
  protected function _fill($doc, $node, $short = false) {
    if ( !$node->hasChildNodes() && !$short ) {
      $node->appendChild($doc->createTextNode(''));
    }
  }

  /**
   * Parse a child node in Glade XML document
   * @param   DOMDocument   $doc          Document Object
   * @param   DOMNode       $doc_node     Node to use
   * @param   DOMNode       $gl_root      -- Unused --
   * @param   DOMNode       $gl_node      Parent Node
   * @param   Array         $signals      Signals
   * @return  Array
   */
  protected final function _parseChild($doc, $doc_node, $gl_root, $gl_node, Array &$signals = Array()) {
    if  ( isset($gl_node->child) ) {
      if ( $children = $gl_node->child ) {
        foreach  ( $children as $c ) {
          $class    = (string) $c->object['class'];
          $id       = (string) $c->object['id'];

          $elid     = "";
          $classes  = Array($class);
          $styles   = Array();
          $attribs  = Array();

          $oclasses = Array();
          $istyles  = Array();

          $inner = null;
          $outer = null;
          $node_type = "div";

          $append_root = $doc_node;

          // Apply built-in attributes
          $advanced_ui = false;
          $tabbed_ui = false;

          if ( isset(self::$ClassMap[$class]) ) {
            $node_type = self::$ClassMap[$class]["element"];

            if ( isset(self::$ClassMap[$class]["gobject"]) ) {
              if ( self::$ClassMap[$class]["gobject"] ) {
                $classes[] = "GtkObject";
              }
            }
            if ( isset(self::$ClassMap[$class]["classes"]) ) {
              $classes = array_merge($classes, self::$ClassMap[$class]["classes"]);
            }

            if ( isset(self::$ClassMap[$class]["type"]) ) {
              $attribs["type"] = self::$ClassMap[$class]["type"];
            }

            if ( isset(self::$ClassMap[$class]["value"]) ) {
              $attribs["value"] = self::$ClassMap[$class]["value"];
            }

            if ( isset(self::$ClassMap[$class]["inner"]) ) {
              $inner = $doc->createElement(self::$ClassMap[$class]["inner"]);
            }

            if ( isset(self::$ClassMap[$class]["wrapped"]) ) {
              $outer = $doc->createElement("div");
            }
          }

          // Create HTML node
          $node = $doc->createElement($node_type);
          $tab = null;

          if ( $class == "GtkCheckButton" ) {
            //$chk = $doc->createElement("input");
            //$chk->setAttribute("type", "checkbox");
            $label = $doc->createElement("label");

            //$node->appendChild($chk);
            $node->appendChild($label);
            $inner = $label;
          } else if ( $class == "GtkCellRendererText" ) {
            $ex = explode("_", $id, 2);
            $node->setAttribute("value", end($ex));
            $node->appendChild(new DomText(end($ex)));
          } else if ( $class == "GtkNotebook" ) {
            // FIXME
          } else if ( $class == "GtkFileChooserButton" ) {
            $text = $doc->createElement("input");
            $text->setAttribute("type", "text");
            $btn = $doc->createElement("button");
            $btn->setAttribute("class", "GtkFileChooserButton");
            $btn->appendChild(new DomText("..."));
            $fake = $doc->createElement("input");
            $fake->setAttribute("type", "hidden");
            $fake->setAttribute("style", "display:none;");

            $table1 = $doc->createElement("table");
            $row1   = $doc->createElement("tr");
            $cell1  = $doc->createElement("td");
            $cell1->setAttribute("class", "Input");
            $cell2  = $doc->createElement("td");
            $cell2->setAttribute("class", "Button");
            $cell1->appendChild($text);
            $cell1->appendChild($fake);
            $cell2->appendChild($btn);
            $row1->appendChild($cell1);
            $row1->appendChild($cell2);
            $table1->appendChild($row1);
            $node->appendChild($table1);
          } else {
            if ( isset($c['type']) && ((string)$c['type'] == "tab") ) {
              $append_root = $doc_node->getElementsByTagName("ul")->item(0); //->appendChild($li);
              $outer = $doc->createElement("li");
              $advanced_ui = true;
              $tabbed_ui = "tab-" . (self::$Counter++);

              if ( ($int = array_search("GtkObject", $classes)) !== false ) {
                unset($classes[$int]);
              }
            } else {
              if ( $gl_node['class'] == "GtkNotebook" ) {
                $advanced_ui = true;
                $elid = "tab-" . (self::$Counter);
                $tab = $doc->createElement("div");
                $tab->setAttribute("class", "GtkTab");
              }
            }
          }

          // Parse Glade element signals
          if ( isset($c->object->signal) ) {
            foreach ( $c->object->signal as $p ) {
              $pk = (string) $p['name'];
              $pv = (string) $p['handler'];

              switch ( $pk ) {
                case "item-activated" :
                case "group-changed" :
                case "select" :
                case "clicked" :
                  $pk = "click";
                  break;
                case "activate" :
                  if ( $class == "GtkEntry" ) {
                    $pk = "input-activate";
                  } else {
                    $pk = "click";
                  }
                  break;
              }

              if ( !isset($signals[$id]) ) {
                $signals[$id] = Array();
              }
              $signals[$id][$pk] = $pv;
            }
          }

          // Parse Glade element packing
          $packed = false;
          if ( !$advanced_ui ) {
            if ( isset($c->packing) ) {
              foreach ( $c->packing->property as $p ) {
                $pk = (string) $p['name'];
                $pv = (string) $p;

                switch ( $pk ) {
                  case "expand" :
                    if ( $pv == "True" ) {
                      $oclasses[] = "Expand";
                    }
                    break;

                  case "fill" :
                    if ( $pv == "True" ) {
                      $oclasses[] = "Fill";
                    }
                    break;

                  case "position" :
                    $packed = true;
                    $oclasses[] = "GtkBoxPosition";
                    $oclasses[] = "Position_{$pv}";
                    break;

                  case "x" :
                    $styles[] = "left:{$pv}px";
                    break;

                  case "y" :
                    $styles[] = "top:{$pv}px";
                    break;
                }
              }
            }
          }

          // Parse Glade element attributes
          $orient = "";
          if ( isset($c->object->property) ) {
            foreach ( $c->object->property as $p ) {
              $pk = (string) $p['name'];
              $pv = (string) $p;

              switch ( $pk ) {
                case "visible" :
                  if ( $pv == "False" ) {
                    $classes[] = "Hidden";
                  }
                  break;

                case "width_request" :
                  $styles[] = "width:{$pv}px";
                  break;

                case "height_request" :
                  $styles[] = "height:{$pv}px";
                  break;

                case "active" :
                  if ( $pv == "True" ) {
                    if ( $node_type == "input" ) {
                      $node->setAttribute("checked", "checked");
                    } else {
                      $classes[] = "Checked";
                    }
                  }
                  break;

                case "orientation" :
                  $orient = ucfirst($pv);
                  break;

                case "label" :
                  $icon    = null;
                  $tooltip = null;
                  $orig    = $pv;

                  if ( ($stock = $this->_getStockImage($orig)) !== null ) {
                    list($pv, $icon, $tooltop) = $stock;
                  }

                  if ( $icon ) {
                    $img = $doc->createElement("img");
                    $img->setAttribute("alt", $orig);
                    $img->setAttribute("src", $icon);
                    $node->appendChild($img);
                  }

                  if ( $tooltip ) {
                    $node->setAttribute("title", $tooltip);
                  }

                  if ( $class == "GtkButton" || $class == "GtkLabel" ) {
                    if ( $class == "GtkLabel" && $tabbed_ui ) {
                      $link = $doc->createElement("a");
                      $link->appendChild(new DomText($pv));
                      $link->setAttribute("href", "#{$tabbed_ui}");
                      $node->appendChild($link);
                    } else {
                      $node->appendChild(new DomText($pv));
                    }
                  } else if ( $class == "GtkToggleToolButton" || $class == "GtkCheckButton" ) {
                    $inner->appendChild(new DomText($pv));
                  } else if ( $class == "GtkMenuItem" || $class == "GtkImageMenuItem" || $class == "GtkRadioMenuItem" ) {
                    $node->appendChild(self::_getHotkeyed($doc, $pv));
                  }
                  break;

                case "border_width" :
                  if ( (int) $pv > 0 ) {
                    $styles[] = "padding:{$pv}px";
                  }
                break;

                case "layout_style" :
                  if ( $pv ) {
                    $pv = strtolower($pv);
                    $istyles[] = "text-align:{$pv}";
                  }
                  break;
              }
            }
          }

          if ( $orient )  {
            $classes[] = $orient;
          } else {
            if ( $class == "GtkBox" || $class == "GtkButtonBox" ) {
              $classes[] = "Horizontal";
            }
          }

          $classes[] = $id; // Append element ID lastly

          // Apply information gathered
          if ( $classes ) {
            if ( $outer ) {
              $outer->setAttribute("class", implode(" ", $classes));
            } else {
              $node->setAttribute("class", implode(" ", $classes));
            }
          }

          if ( $inner !== null ) {
            $node->appendChild($inner);
          }

          foreach ( $attribs as $ak => $av ) {
            $node->setAttribute($ak, $av);
          }

          if ( $packed ) {

            if ( !$orient ) {
              $orient = "Horizontal";
              if ( $gl_node['class'] == "GtkBox" ) {
                foreach ( $gl_node->property as $p ) {
                  if ( (string) $p['name'] == "orientation" ) {
                    if ( $d = (string) $p ) {
                      $orient = ucfirst($d);
                    }
                    break;
                  }
                }
              }
            }

            if ( $append_root->tagName == "ul" ) {
              $li = $doc->createElement("li");

              if ( $styles ) {
                $node->setAttribute("style", implode(";", $styles));
              }

              $append_node = $node;
              if ( $tab ) {
                $tab->appendChild($node);
                $tab->setAttribute("id", $elid);
                $append_node = $tab;
              } else {
                if ( $elid ) {
                  $node->setAttribute("id", $elid);
                }
              }

              if ( $outer ) {
                $outer->appendChild($append_node);
                $li->appendChild($outer);
              } else {
                $li->appendChild($append_node);
              }

              $append_root->appendChild($li);
            } else {

              if ( $orient != "Vertical" ) {
                if ( !($temp = $doc_node->getElementsByTagName("tr")->item(0)) ) {
                  $temp = $doc->createElement("tr");
                  $append_root->appendChild($temp);
                }
              } else {
                $temp = $doc->createElement("tr");
                $append_root->appendChild($temp);
              }


              $temp2 = $doc->createElement("td");
              $temp2->setAttribute("class", implode(" ", $oclasses));
              $temp3 = $doc->createElement("div");
              $temp3->setAttribute("class", "TableCellWrap");

              if ( $styles ) {
                $temp2->setAttribute("style", implode(";", $styles));
              }
              if ( $elid ) {
                $temp2->setAttribute("id", $elid);
              }
              if ( $istyles ) {
                $node->setAttribute("style", implode(";", $istyles));
              }

              if ( $outer ) {
                $outer->appendChild($node);
                $temp3->appendChild($outer);
              } else {
                $temp3->appendChild($node);
              }
              $temp2->appendChild($temp3);
              $temp->appendChild($temp2);
            }
          } else {
            if ( $styles ) {
              $node->setAttribute("style", implode(";", $styles));
            }

            $append_node = $node;
            if ( $tab ) {
              $tab->appendChild($node);
              $tab->setAttribute("id", $elid);
              $append_node = $tab;
            } else {
              if ( $elid ) {
                $node->setAttribute("id", $elid);
              }
            }

            if ( $outer ) {
              $outer->appendChild($append_node);
              $append_root->appendChild($outer);
            } else {
              $append_root->appendChild($append_node);
            }
          }

          $this->_parseChild($doc, $node, $gl_node, $c->object, $signals);

          if ( !in_array($class, self::$ShortTags) ) {
            $this->_fill($doc, $node);
          }
        }
      }
    }

    return $signals;
  }

  /**
   * Get stock image from String
   * @param   String    $stock    Stock-image string
   * @param   String    $size     Image Size (deafault: 16x16)
   * @return  Array
   */
  protected final static function _getStockImage($stock, $size = "16x16") {
    if ( isset(self::$Stock[$stock]) ) {
      $label   = self::$Stock[$stock]['label'];
      $icon    = self::$Stock[$stock]['icon'];
      $tooltip = null;
      if ( isset(self::$Stock[$stock]['tooltip']) ) {
        $tooltip = self::$Stock[$stock]['tooltip'];
      }

      $path = sprintf("/img/icons/%s/%s", $size, $icon);
      return Array($label, $path, $tooltip);
    }

    return null;
  }

  /**
   * Check if node is hotkeyed and apply an underscore
   * @param   DOMDocument   $doc    Document Object
   * @param   String        $pv     Label
   * @return  DOMNode
   */
  protected final static function _getHotkeyed($doc, $pv) {
    $span = $doc->createElement("span");
    if ( ($sub = strstr($pv, "_")) !== false ) {
      $pre = str_replace($sub, "", $pv);
      $letter = substr($sub, 1, 1);
      $after = substr($sub, 2, strlen($sub));

      $inner = $doc->createElement("u");
      $inner->appendChild(new DomText($letter));

      $span->appendChild(new DomText($pre));
      $span->appendChild($inner);
      $span->appendChild(new DomText($after));
    } else {
      $span->appendChild(new DomText($pv));
    }

    return $span;
  }

  /**
   * Parse a Glade XML document
   * @param   String    $file     XML Path
   * @return  Glade
   */
  public final static function parse($file) {
    if ( file_exists($file) && ($content = file_get_contents($file)) ) {
      if ( $xml = new SimpleXMLElement($content) ) {
        return new self($file, $xml);
      }
    }

    throw new Exception("Failed to read glade file.");
  }

  /**
   * Get Document Windows
   * @return Array
   */
  public final function getWindows() {
    return $this->_aWindows;
  }

}

?>
