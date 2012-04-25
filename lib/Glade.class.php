<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Glade Class
 *
 * This Class parses Glade (GTK3+) XML Documents and create
 * HTML compatible markup and signal handling. Uses SimpleXML
 * to perform traversing and parsing.
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
 * @created 2012-04-22
 */

/**
 * Glade -- The Glade Interface Parsing Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class Glade
{
  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $windows = Array();    //!< Parsed Windows

  /////////////////////////////////////////////////////////////////////////////
  // GTK SPESIFIC
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Short-Closed HTML Tags
   */
  protected static $ShortTags = Array(
    "GtkImage", "GtkEntry", "GtkSeparator", "GtkSeparatorToolItem"
  );

  /**
   * @var Stock Icons
   */
  protected static $StockIcons = Array(
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
    ),

    "gtk-bold" => Array(
      "label" => "Bold",
      "icon" => "actions/gtk-bold.png"
    ),
    "gtk-underline" => Array(
      "label" => "Underline",
      "icon" => "actions/gtk-underline.png"
    ),
    "gtk-italic" => Array(
      "label" => "Italic",
      "icon" => "actions/gtk-italic.png"
    ),
    "gtk-strikethrough" => Array(
      "label" => "Strikethrough",
      "icon" => "actions/gtk-strikethrough.png"
    ),
    "gtk-select-color" => Array(
      "label" => "Color Selection",
      "icon" => "apps/preferences-desktop-theme.png"
    ),
    "gtk-select-font" => Array(
      "label" => "Font Selection",
      "icon" => "apps/fonts.png"
    ),
    "format-justify-left" => Array(
      "label" => "Align Left",
      "icon" => "actions/format-justify-left.png"
    ),
    "format-justify-center" => Array(
      "label" => "Align Center",
      "icon" => "actions/format-justify-center.png"
    ),
    "format-justify-right" => Array(
      "label" => "Align Right",
      "icon" => "actions/format-justify-right.png"
    ),
    "gtk-justify-left" => Array(
      "label" => "Align Left",
      "icon" => "actions/format-justify-left.png"
    ),
    "gtk-justify-center" => Array(
      "label" => "Align Center",
      "icon" => "actions/format-justify-center.png"
    ),
    "gtk-justify-right" => Array(
      "label" => "Align Right",
      "icon" => "actions/format-justify-right.png"
    )
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Construct and parse
   * @constructor
   */
  protected function __construct($xml) {
    if ( isset($xml->object) ) {
      foreach ( $xml->object as $window ) {
        $this->_traverseWindow($window);
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // PARSING
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Check if we have a stock label or image and apply
   * @param   DOMDocument   $dom          The DOM Document
   * @param   DOMElement    $node         The outer DOM Node Element
   * @param   DOMElement    $inner        The inner DOM Element
   * @param   Array         $props        Object Glade properties
   * @param   bool          $simple       If this is an element without inner wrapper
   * @return void
   */
  protected function _stock(DOMDocument $dom, $node, $inner, $props, $simple = false) {
    if ( isset($props['label']) ) {
      $t_hinted = preg_match("/^\_/", $props['label']);
      $t_label  = htmlspecialchars($t_hinted ? substr($props['label'], 1) : $props['label']);
      $t_src    = null;

      // Parse stock icon(s)
      if ( isset($props['stock_id']) || (isset($props['use_stock']) && ($props['use_stock'] == "True")) ) {
        $stock_id = isset($props['stock_id']) ? $props['stock_id'] : $t_label;
        if ( isset(self::$StockIcons[$stock_id]) && ($iter = self::$StockIcons[$stock_id]) ) {
          $t_hinted = preg_match("/^\_/", $iter['label']);
          $t_label  = htmlspecialchars($t_hinted ? _(substr($iter['label'], 1)) : _($iter['label']));
          $t_src    = sprintf("/img/icons/16x16/%s", $iter['icon']);
        }
      }

      // Create and insert inner elements
      if ( $t_src ) {
        $image = $dom->createElement("img");
        $image->setAttribute("alt", $t_label);
        $image->setAttribute("src", $t_src);
      }

      // Create and insert inner elements
      $label = $dom->createElement("span");
      if ( $t_hinted ) {
        $u = $dom->createElement("u");
        $u->appendChild(new DomText(substr($t_label, 0, 1)));
        $label->appendChild($u);
        $label->appendChild(new DomText(substr($t_label, 1)));
      } else {
        $label->appendChild(new DomText($t_label));
      }

      if ( $simple ) {
        if ( $t_src ) {
          $node->appendChild($image);
        }
        $node->appendChild($label);
      } else {
        if ( $t_src ) {
          $inner->appendChild($image);
        }
        $inner->appendChild($label);
        $node->appendChild($inner);
      }
    } else {
      $node->appendChild(new DomText("&nbsp;"));
    }
  }

  /**
   * Perform packing of an element (GtkBox)
   * @param   DOMDocument       $dom        The DOM Document
   * @param   SimpleXMLElement  $a          The Array iterator
   * @param   DOMElement        $node       The DOM Node
   * @return  DOMNode
   */
  protected function _pack(DomDocument $dom, $a, $node) {
    $classes = Array("GtkBoxPackage");
    $props   = Array();

    // Search for properties
    if ( isset($a->packing) ) {
      foreach ( $a->packing->property as $p ) {
        $props[((string) $p['name'])] = ((string) $p);
      }
    }

    // Parse packing properties
    if ( isset($props['position']) && (($pos = (int)$props['position']) >= 0) ) {
      $classes[] = "Position_{$pos}";
    }
    if ( isset($props['expand']) && ($props['expand'] == "True") ) {
      $classes[] = "Expand";
    }
    if ( isset($props['expand']) && ($props['expand'] == "True") ) {
      $classes[] = "Fill";
    }

    // Create the outer container for our node(s)
    $pack_node = $dom->createElement("div");
    $pack_node->setAttribute("class", implode(" ", $classes));
    $pack_node->appendChild($node);
    return $pack_node;
  }

  /**
   * Create DOM Element
   * @param   DOMDocumen        $dom        The DOM Document
   * @param   String            $window_id  The root Window ID
   * @param   SimpleXMLElement  $o          The Array iterator
   * @param   bool              $is_packed  If this current element is inside a packed container
   * @return DOMElement
   */
  protected function _scan(DomDocument $dom, $window_id, $o, $is_packed = false) {
    $node     = null;
    $class    = (string) $o['class'];
    $id       = (string) $o['id'];
    $styles   = Array();
    $classes  = Array($class, $id);
    $props    = Array();
    $packed   = false;

    // Properties
    if ( isset($o->property) ) {
      foreach ( $o->property as $p ) {
        $props[((string) $p['name'])] = ((string)$p);
      }
    }

    // Signals
    if ( isset($o->signal) ) {
      if ( isset($this->windows[$window_id]) ) {

        foreach ( $o->signal as $p ) {
          $ev_name    = ((string) $p['name']);
          $ev_handler = ((string) $p['handler']);

          // Generalize event names
          switch ( $ev_name ) {
            case "item-activated" :
            case "group-changed" :
            case "select" :
            case "clicked" :
              $ev_name = "click";
            break;

            case "activate" :
              if ( $class == "GtkEntry" ) {
                $ev_name = "input-activate";
              } else {
                $ev_name = "click";
              }
            break;
          }

          // Append signals directly to this instance variable
          if ( !isset($this->windows[$window_id]["signals"][$id]) ) {
            $this->windows[$window_id]["signals"][$id] = Array();
          }
          $this->windows[$window_id]["signals"][$id][$ev_name] = $ev_handler;
        }
      }
    }

    // Styles
    if ( !in_array($class, Array("GtkWindow", "GtkDialog")) ) {
      // Dimensions
      if ( isset($props['width']) ) {
        $styles[] = "width:{$props['width']}px";
      }
      if ( isset($props['height']) ) {
        $styles[] = "height:{$props['height']}px";
      }

      // Positioning
      // FIXME: Move to packing ?!
      if ( isset($props['x']) ) {
        $styles[] = "left:{$props['x']}px";
      }
      if ( isset($props['y']) ) {
        $styles[] = "top:{$props['y']}px";
      }

      // Borders
      if ( isset($props['border_width']) ) {
        $styles[] = "padding:{$props['border_width']}px";
      }

      // Display
      if ( isset($props['layout_style']) ) {
        $styles[] = "text-align:{$props['layout_style']}";
      }

      if ( isset($props['visible']) && ($props['visible'] == "False") ) {
        $styles[] = "display:none";
      }
    }

    // Element type
    switch ( $class )
    {
      //
      // Inputs
      //
      case "GtkTextView" :
        $node = $dom->createElement("textarea");
      break;
      case "GtkEntry" :
        $node = $dom->createElement("input");
        $node->setAttribute("type", "text");
      break;
      case "GtkComboBox" :
        $node = $dom->createElement("select");
      break;
      case "GtkCellRendererText" :
        $node = $dom->createElement("option");
      break;
      case "GtkCheckButton" :
      case "GtkToggleButton" :
        $node = $dom->createElement("input");
        $node->setAttribute("type", "button");

        if ( isset($props['active']) && ($props['active'] == "True") ) {
          $node->setAttribute("checked", "checked");
        }
      break;
      case "GtkDrawingArea"   :
        $node = $dom->createElement("div");
        $classes[] = "Canvas";
      break;
      case "GtkFileChooserButton"   :
        // TODO
        $node = $dom->createElement("div");
      break;


      //
      // Misc
      //
      case "GtkLabel"   :
        $node = $dom->createElement("div");
        $label = $dom->createElement("span");
        // FIXME: Stock icons and translations
        if ( isset($props['label']) ) {
          $label->appendChild(new DomText(htmlspecialchars($props['label'])));
        } else {
          $label->appendChild(new DomText("&nbsp;"));
        }
        $this->_stock($dom, $node, null, $props, true);
      break;
      case "GtkImage" :
        $node = $dom->createElement("img");
      break;
      case "GtkSeparator" :
        $node = $dom->createElement("hr");
      break;
      case "GtkColorButton"   :
        $node = $dom->createElement("div");
      break;
      case "GtkIconView"   :
        $node = $dom->createElement("div");
      break;
      case "GtkScale"   :
        $node = $dom->createElement("div");
      break;
      case "GtkButton"   :
        $node = $dom->createElement("button");
        $this->_stock($dom, $node, null, $props, true);
      break;

      //
      // Toolbars
      //
      case "GtkToolbar"     :
        $node = $dom->createElement("ul");
      break;

      case "GtkButtonBox"   :
        $node = $dom->createElement("div");
      break;

      case "GtkToolItem" :
        $node = $dom->createElement("li");
      break;

      case "GtkToolButton" :
      case "GtkToggleToolButton" :
        $node = $dom->createElement("button");
        $this->_stock($dom, $node, null, $props, true);
      break;

      case "GtkSeparatorToolItem" :
        $node = $dom->createElement("hr");
      break;

      //
      // Menus
      //

      case "GtkMenu"        :
      case "GtkMenuBar"     :
      case "GtkNodebook"    :
        $node = $dom->createElement("ul");
      break;

      case "GtkImageMenuItem" :
      case "GtkRadioMenuItem" :
      case "GtkMenuItem" :
        $node = $dom->createElement("li");

        // We need some children here
        $inner = $dom->createElement("div");
        $inner->setAttribute("class", "GtkMenuItemInner");

        $this->_stock($dom, $node, $inner, $props);
      break;

      //
      // Containers
      //
      case "GtkBox" :
      case "GtkHBox" :
      case "GtkVBox" :
        $node = $dom->createElement("div");
        $packed = true;

        $orientation = "horizontal";
        if ( $class == "GtkBox" ) {
          if ( isset($props['orientation']) ) {
            $orientation = $props['orientation'];
          }
        } else if ( $class == "GtkVBox" ) {
          $orientation = "vertical";
        }

        $classes[] = sprintf("GtkBox%s", ucfirst($orientation));
      break;

      default :
        $node = $dom->createElement("div");
      break;
    }

    // Append Classes
    $node->setAttribute("class", implode(" ", $classes));

    // Append Styles
    if ( $styles ) {
      $node->setAttribute("style", implode(";", $styles));
    }

    return Array($node, $packed, $class);
  }


  /**
   * Traverse parsed SimpleXML Root Array
   * @param   SimpleXMLElement    $window     The root element
   * @see     Glade::_traverse()
   * @return  void
   */
  protected function _traverseWindow($window) {
    $dom = new DomDocument();
    $dom->xmlVersion          = "1.0";
    $dom->formatOutput        = true;
    $dom->encoding            = 'UTF-8';
    $dom->preserveWhitespace  = false;

    $id     = (string) $window['id'];
    $class  = (string) $window['class'];
    $props  = Array();
    $styles = Array();

    // Register window
    $this->windows[$id] = Array(
      "signals"     => Array(),
      "properties"  => Array(),
      "content"     => ""
    );

    // Grab window properties
    if ( isset($o->property) ) {
      foreach ( $o->property as $p ) {
        $props[((string) $p['name'])] = ((string)$p);
      }
    }

    // This will be used in JavaScript for constructing windows
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

    // Set window defaults
    foreach ( $props as $p => $pv ) {
      switch ( $p ) {
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
            $styles[] = "padding:{$pv}px";
          }
        break;
      }
    }

    // Create root DOM Element(s)
    $node = $dom->createElement("div");
    $node->setAttribute("class", implode(" ", Array($class, $id)));
    if ( $styles ) {
      $node->setAttribute("style", implode(" ", $styles));
    }

    // Generate content
    if ( isset($window->child) ) {
      $this->_traverse($id, $window->child, $dom, $node);
    }
    $dom->appendChild($node);

    $html = str_replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", "", $dom->saveXML());

    // Set internals
    $this->windows[$id]["properties"] = $properties;
    $this->windows[$id]["content"]    = $html;
  }

  /**
   * Traverse parsed SimpleXML Array
   * @param   String            $window_id  The root Window ID
   * @param   SimpleXMLElement  $a          The Array iterator
   * @param   DOMDocument       $dom        The DOM Document
   * @param   DOMElement        $root_node  The DOM Node
   * @param   bool              $is_packed  If this current element is inside a packed container
   * @return void
   */
  protected function _traverse($window_id, $a, DomDocument $dom, $root_node = null, $is_packed = false) {
    if ( !$root_node ) {
      $root_node = $dom;
    }

    if ( isset($a->object) && ($os = $a->object) ) {
      foreach ( $os as $o ) {
        // Create DOM node, apply styles
        list($node, $packed, $class) = $this->_scan($dom, $window_id, $o, $is_packed);

        // Check children
        if ( isset($o->child) && ($children = $o->child) ) {
          foreach ( $children as $c ) {
            $this->_traverse($window_id, $c, $dom, $node, $packed);
          }
        }

        // Make sure we have valid HTML
        if ( !in_array($class, self::$ShortTags) && !$node->hasChildNodes() ) {
          $node->appendChild(new DomText(""));
        }

        // Check if we need a <li> element here
        if ( $node->nodeName != "li" && $root_node->nodeName == "ul" ) {
          $outer = $dom->createElement("li");
          $outer->appendChild($node);
          $node = $outer;
        }

        // Perform packing if needed, insert into parent
        if ( $is_packed ) {
          $root_node->appendChild($this->_pack($dom, $a, $node));
        } else {
          $root_node->appendChild($node);
        }
      }
    }
  }

  /**
   * Get the parsed windows
   * @return Array
   */
  public function getWindows() {
    return $this->windows;
  }

  /////////////////////////////////////////////////////////////////////////////
  // METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Parse a Glade document
   * @return Mixed
   */
  public final static function Parse($file) {
    if ( is_file($file) ) {
      // Try to get contents from file
      try {
        $xml = @(new simplexmlelement(file_get_contents($file)));
        if ( !$xml ) {
          $xml = null;
        }
      } catch ( Exception $e ) {
        $xml = null;
      }

      if ( $xml ) {
        $glade = new self($xml);
        return $glade->getWindows();
      }
    }

    return false;
  }

}

?>
