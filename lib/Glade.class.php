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

  private $dom      = null;       //!< DOM Document
  private $root     = null;       //!< DOM Root Element
  private $signals  = Array();    //!< DOM Event Signals

  /**
   * @var Short-Closed HTML Tags
   */
  protected static $ShortTags = Array(
    "GtkImage", "GtkEntry", "GtkSeparator"
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
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct($xml = null) {
    // DOM Document
    $this->dom = new DomDocument();
    $this->dom->xmlVersion          = "1.0";
    $this->dom->formatOutput        = true;
    $this->dom->encoding            = 'UTF-8';
    $this->dom->preserveWhitespace  = false;

    if ( $xml ) {
      $this->_traverse($xml);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // PARSING
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Perform packing of an element (GtkBox)
   * @param   SimpleXMLElement  $a          The Array iterator
   * @param   DOMElement        $node       The DOM Node
   * @return  DOMNode
   */
  protected function _pack($a, $node) {
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
    $pack_node = $this->dom->createElement("div");
    $pack_node->setAttribute("class", implode(" ", $classes));
    $pack_node->appendChild($node);
    return $pack_node;
  }

  /**
   * Create DOM Element
   * @param   String            $window_id  The root Window ID
   * @param   SimpleXMLElement  $o          The Array iterator
   * @param   bool              $is_packed  If this current element is inside a packed container
   * @return DOMElement
   */
  protected function _scan($window_id, $o, $is_packed = false) {
    $node     = null;
    $class    = (string)$o['class'];
    $styles   = Array();
    $classes  = Array($class, (string) $o['id']);
    $props    = Array();
    $packed   = false;

    // Properties
    if ( isset($o->property) ) {
      foreach ( $o->property as $p ) {
        $props[((string) $p['name'])] = ((string)$p);
      }
    }

    // Signals (Append directly to class)
    if ( isset($o->signal) ) {
      foreach ( $o->signal as $p ) {
        if ( !isset($this->signals[$window_id]) ) {
          $this->signals[$window_id] = Array();
        }
        $this->signals[$window_id][] = Array(
          "name"    => ((string) $p['name']),
          "handler" => ((string) $p['handler']),
          "swapped" => ((string) $p['swapped'])
        );
      }
    }

    // Styles
    if ( !in_array($class, Array("GtkWindow", "GtkDialog")) ) {
      if ( isset($props['default_width']) ) {
        $styles[] = "width:{$props['default_width']}px";
      }
      if ( isset($props['default_height']) ) {
        $styles[] = "height:{$props['default_height']}px";
      }
    }
    if ( !in_array($class, Array("GtkWindow", "GtkDialog")) ) {
      if ( isset($props['width']) ) {
        $styles[] = "width:{$props['width']}px";
      }
      if ( isset($props['height']) ) {
        $styles[] = "height:{$props['height']}px";
      }
    }

    // Element type
    switch ( $class ) {
      //
      // Inputs
      //
      case "GtkTextView" :
        $node = $this->dom->createElement("textarea");
      break;
      case "GtkEntry" :
        $node = $this->dom->createElement("input");
        $node->setAttribute("type", "text");
      break;
      case "GtkComboBox" :
        $node = $this->dom->createElement("select");
      break;
      case "GtkCellRendererText" :
        $node = $this->dom->createElement("option");
      break;
      case "GtkCheckButton" :
      case "GtkToggleButton" :
        $node = $this->dom->createElement("input");
        $node->setAttribute("type", "button");
      break;
      case "GtkDrawingArea"   :
        $node = $this->dom->createElement("div");
        $classes[] = "Canvas";
      break;


      //
      // Misc
      //
      case "GtkLabel"   :
        $node = $this->dom->createElement("div");
        $label = $this->dom->createElement("span");
        $label->appendChild(new DomText(htmlspecialchars($props['label'])));
      break;
      case "GtkImage" :
        $node = $this->dom->createElement("img");
      break;
      case "GtkSeparator" :
        $node = $this->dom->createElement("hr");
      break;
      case "GtkColorButton"   :
        $node = $this->dom->createElement("div");
      break;
      case "GtkIconView"   :
        $node = $this->dom->createElement("div");
      break;
      case "GtkScale"   :
        $node = $this->dom->createElement("div");
      break;

      //
      // Toolbars
      //
      case "GtkToolbar"     :
        $node = $this->dom->createElement("ul");
      break;

      case "GtkButtonBox"   :
        $node = $this->dom->createElement("div");
      break;

      case "GtkToolItem" :
        $node = $this->dom->createElement("li");
      break;

      case "GtkToolButton" :
      case "GtkToggleToolButton" :
        $node = $this->dom->createElement("button");
      break;

      //
      // Menus
      //

      case "GtkMenu"        :
      case "GtkMenuBar"     :
      case "GtkNodebook"    :
        $node = $this->dom->createElement("ul");
      break;

      case "GtkRadioMenuItem" :
      case "GtkMenuItem" :
        $node = $this->dom->createElement("li");

        // We need some children here
        $inner = $this->dom->createElement("div");
        $inner->setAttribute("class", "GtkMenuItemInner");

        $t_hinted = preg_match("/^_/", $props['label']);
        $t_label  = htmlspecialchars($t_hinted ? substr($props['label'], 1) : $props['label']);

        // Parse stock label(s)
        if ( isset($props['use_stock']) && ($props['use_stock'] == "True") ) {
          if ( isset(self::$StockIcons[$t_label]) && ($iter = self::$StockIcons[$t_label]) ) {
            $t_hinted = preg_match("/^_/", $iter['label']);
            $t_label  = htmlspecialchars($t_hinted ? _(substr($iter['label'], 1)) : _($iter['label']));
          }
        }

        // Create and insert inner elements
        $label = $this->dom->createElement("span");
        if ( $t_hinted ) {
          $u = $this->dom->createElement("u");
          $u->appendChild(new DomText(substr($t_label, 0, 1)));
          $label->appendChild($u);
          $label->appendChild(new DomText(substr($t_label, 1)));
        } else {
          $label->appendChild(new DomText($t_label));
        }

        $inner->appendChild($label);
        $node->appendChild($inner);
      break;

      case "GtkImageMenuItem" :
        $node = $this->dom->createElement("li");

        // We need some children here
        $inner = $this->dom->createElement("div");
        $inner->setAttribute("class", "GtkMenuItemInner");

        $t_hinted = preg_match("/^\_/", $props['label']);
        $t_label  = htmlspecialchars($t_hinted ? substr($props['label'], 1) : $props['label']);
        $t_src    = sprintf("/img/icons/16x16/actions/%s.png", $props['label']);

        // Parse stock icon(s)
        if ( isset($props['use_stock']) && ($props['use_stock'] == "True") ) {
          if ( isset(self::$StockIcons[$t_label]) && ($iter = self::$StockIcons[$t_label]) ) {
            $t_hinted = preg_match("/^\_/", $iter['label']);
            $t_label  = htmlspecialchars($t_hinted ? _(substr($iter['label'], 1)) : _($iter['label']));
            $t_src    = sprintf("/img/icons/16x16/%s", $iter['icon']);
          }
        }

        // Create and insert inner elements
        $image = $this->dom->createElement("img");
        $image->setAttribute("alt", $t_label);
        $image->setAttribute("src", $t_src);

        // Create and insert inner elements
        $label = $this->dom->createElement("span");
        if ( $t_hinted ) {
          $u = $this->dom->createElement("u");
          $u->appendChild(new DomText(substr($t_label, 0, 1)));
          $label->appendChild($u);
          $label->appendChild(new DomText(substr($t_label, 1)));
        } else {
          $label->appendChild(new DomText($t_label));
        }

        $inner->appendChild($image);
        $inner->appendChild($label);
        $node->appendChild($inner);
      break;

      //
      // Containers
      //
      case "GtkBox" :
      case "GtkHBox" :
      case "GtkVBox" :
        $node = $this->dom->createElement("div");
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
        $node = $this->dom->createElement("div");
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
   * Traverse parsed SimpleXML Array
   * @param   SimpleXMLElement  $a          The Array iterator
   * @param   DOMElement        $root_node  The DOM Node
   * @param   bool              $is_packed  If this current element is inside a packed container
   * @param   String            $window_id  The root Window ID
   * @return void
   */
  protected function _traverse($a, $root_node = null, $is_packed = false, $window_id = "unknown") {
    if ( !$root_node ) {
      $root_node = $this->dom;
    }

    if ( isset($a->object) && ($os = $a->object) ) {
      foreach ( $os as $o ) {
        // Grab Window/Dialog ID
        if ( $window_id === "unknown" && in_array(((string)$o['class']), Array("GtkWindow", "GtkDialog")) ) {
          $window_id = ((string) $o['id']);
        }

        // Create DOM node, apply styles
        list($node, $packed, $class) = $this->_scan($window_id, $o, $is_packed);

        // Check children
        if ( isset($o->child) && ($children = $o->child) ) {
          foreach ( $children as $c ) {
            $this->_traverse($c, $node, $packed, $window_id);
          }
        }

        // Make sure we have valid HTML
        if ( !in_array($class, self::$ShortTags) && !$node->hasChildNodes() ) {
          $node->appendChild(new DomText(""));
        }

        // Check if we need a <li> element here
        if ( $node->nodeName != "li" && $root_node->nodeName == "ul" ) {
          $outer = $this->dom->createElement("li");
          $outer->appendChild($node);
          $node = $outer;
        }

        // Perform packing if needed, insert into parent
        if ( $is_packed ) {
          $root_node->appendChild($this->_pack($a, $node));
        } else {
          $root_node->appendChild($node);
        }
      }
    }
  }

  /**
   * Get the parsed content
   * @return String
   */
  public function getContent() {
    $content = Array();

    // Find all root windows
    foreach ( $this->dom->childNodes as $c ) {
      if ( $class = explode(" ", $c->getAttribute("class")) ) {
        $mc = reset($class);
        $ec = end($class);

        // Check if this is a valid window
        if ( in_array($mc, Array("GtkWindow", "GtkDialog")) && ($ec != $mc) ) {

          // Export the HTML
          $dom = new DomDocument();
          $dom->xmlVersion          = "1.0";
          $dom->formatOutput        = true;
          $dom->encoding            = 'UTF-8';
          $dom->preserveWhitespace  = false;
          $dom->appendChild($dom->importNode($c, true));

          // Push data
          $content[$ec] = Array(
            "signals" => Array(),
            "data"    => str_replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", "", $dom->saveXML())
          );
        }
      }
    }

    // Find all root window signals
    foreach ( $this->signals as $wid => $sigs ) {
      if ( isset($content[$wid]) ) {
        $content[$wid]["signals"] = $sigs;
      }
    }

    return $content;
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
        return $glade->getContent();
      }
    }

    return false;
  }

}

var_dump(Glade::Parse($argv[1]));

?>
