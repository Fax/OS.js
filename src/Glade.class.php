<?php
/*!
 * @file
 * Contains Glade Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

function get_inner_html( $node ) { 
    $innerHTML= ''; 
    $children = $node->childNodes; 
    foreach ($children as $child) { 
        $innerHTML .= $child->ownerDocument->saveXML( $child ); 
    } 

    return $innerHTML; 
} 

/**
 * Glade Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class Glade
{

  private $name;
  private $doc;
  private $app;
  private $xml;

  private $app_properties = Array(
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
    "width"           => 500,
    "height"          => 300,
    "gravity"         => ""
  );

  private $app_signals = Array();

  protected static $ShortTags = Array(
    "GtkImage", "GtkEntry"
  );

  protected static $Stock = Array(
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
    )
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICK
  /////////////////////////////////////////////////////////////////////////////

  protected function __construct($name, $file, $full) {
    $this->name = $name;

    $x = new DOMImplementation();
    $this->doc = $x->createDocument();
    $this->doc->xmlVersion    = "1.0";
    $this->doc->formatOutput  = true;
    $this->doc->encoding      = 'UTF-8';

    $this->app = new DomDocument();
    $this->app->xmlVersion    = "1.0";
    $this->app->formatOutput  = true;
    $this->app->encoding      = 'UTF-8';

    $this->xml = new SimpleXMLElement($file);

    $this->_parse($full);
  }

  public function __toDocumentString() {
    $out = $this->doc->saveXML();
    return str_replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", "", $out);
  }

  public function __toApplicationString() {
    return $this->app->saveXML();
  }

  public final static function convert($file, $full = false) {
    if ( file_exists($file) ) {
      return new self(str_replace(".glade", "", basename($file)), file_get_contents($file), $full);
    }

    throw new Exception("'$file' is not a valid Glade document");
  }

  /////////////////////////////////////////////////////////////////////////////
  // HELPERS
  /////////////////////////////////////////////////////////////////////////////

  protected function _fill($node, $short = false) {
    if ( !$node->hasChildNodes() && !$short ) {
      $node->appendChild($this->doc->createTextNode(''));
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // PARSER
  /////////////////////////////////////////////////////////////////////////////

  protected function _parseElement($class, &$classes) {
    switch ( $class ) {
      default :
        $n = $this->doc->createElement("div");
      break;

      case "GtkIconView" :
      case "GtkLabel" :
        $n = $this->doc->createElement("div");
        $classes[] = "GtkObject";
      break;

      case "GtkBox" :
      case "GtkButtonBox" :
        $n = $this->doc->createElement("table");
        break;
      case "GtkCheckButton" :
        $n = $this->doc->createElement("div");
        $chk = $this->doc->createElement("input");
        $chk->setAttribute("type", "checkbox");
        $label = $this->doc->createElement("label");
        $n->appendChild($chk);
        $n->appendChild($label);
        $classes[] = "GtkObject";
        break;
      case "GtkComboBox" :
        $n = $this->doc->createElement("select");
        $classes[] = "GtkObject";
        break;
      case "GtkButton" :
        $n = $this->doc->createElement("button");
        $classes[] = "GtkObject";
        break;
      case "GtkTextView" :
        $n = $this->doc->createElement("textarea");
        $classes[] = "GtkObject";
        break;
      case "GtkImage" :
        $n = $this->doc->createElement("img");
        $n->setAttribute("alt", "");
        $n->setAttribute("src", "/img/blank.gif");
        $classes[] = "GtkObject";
        break;
      case "GtkEntry" :
        $n = $this->doc->createElement("input");
        $n->setAttribute("type", "text");
        $n->setAttribute("value", "");
        $classes[] = "GtkObject";
        break;

      case "GtkMenuBar" :
        $n = $this->doc->createElement("ul");
      break;
      case "GtkMenuItem" :
        $n = $this->doc->createElement("li");
      break;

      case "GtkMenu" :
        $n = $this->doc->createElement("ul");
      break;
      case "GtkImageMenuItem" :
      case "GtkRadioMenuItem" :
        $n = $this->doc->createElement("li");
      break;
      case "GtkSeparatorMenuItem" :
        $n = $this->doc->createElement("li");
        $n->appendChild($this->doc->createElement("hr"));
      break;
    }

    return $n;
  }

  protected function _parsePacking($c, $n, $class, &$classes) {
    $outer = false;
    if ( isset($c->packing) ) {
      foreach ( $c->packing->property as $p ) {
        $pk = (string) $p['name'];
        $pv = (string) $p;

        switch ( $pk ) {
          case 'expand' :
            if ( $pv == "True" ) {
              $classes[] = "Expand";
            }
          break;

          case 'fill' :
            if ( $pv == "True" ) {
              $classes[] = "Fill";
            }
            break;

          case 'position' :
            $outer = true;
            $classes[] = "GtkBoxPosition";
            $classes[] = "Position_{$pv}";
            break;
        }
      }
    }

    return $outer;
  }

  protected function _parseProperties($c, $n, $class, &$classes) {

    $orient = null;

    foreach ( $c->object->property as $p ) {
      $pk = (string) $p['name'];
      $pv = (string) $p;

      switch ( $pk ) {
        case 'visible' :
          if ( $pv == "False" ) {
            $classes[] = "Hidden";
          }
          break;

        case 'label' :
          $icon = null;
          $size = "16x16";
          $stock = $pv;
          $tooltip = "";

          if ( isset(self::$Stock[$stock]) ) {
            $pv   = self::$Stock[$stock]['label'];
            $icon = self::$Stock[$stock]['icon'];
            if ( isset(self::$Stock[$stock]['tooltip']) ) {
              $tooltip = self::$Stock[$stock]['tooltip'];
            }
          }

          if ( $icon ) {
            $path = sprintf("/img/icons/%s/%s", $size, $icon);
            $img = $this->doc->createElement("img");
            $img->setAttribute("alt", $stock);
            $img->setAttribute("src", $path);
            $n->appendChild($img);
          }

          if ( $tooltip ) {
            $n->setAttribute("title", $tooltip);
          }


          if ( $class == "GtkButton" || $class == "GtkLabel" ) {
            $n->appendChild(new DomText($pv));
          } else if ( $class == "GtkMenuItem" || $class == "GtkImageMenuItem" || $class == "GtkRadioMenuItem" ) {
            $span = $this->doc->createElement("span");
            if ( in_array("GtkMenuItem", $classes) ) {
              $span->setAttribute("class", "TopLevel");
            }
            if ( ($sub = strstr($pv, "_")) !== false ) {
              $pre = str_replace($sub, "", $pv);
              $letter = substr($sub, 1, 1);
              $after = substr($sub, 2, strlen($sub));

              $inner = $this->doc->createElement("u");
              $inner->appendChild(new DomText($letter));

              $span->appendChild(new DomText($pre));
              $span->appendChild($inner);
              $span->appendChild(new DomText($after));
            } else {
              $span->appendChild(new DomText($pv));
            }
            $n->appendChild($span);
          } else if ( $class == "GtkCheckButton" ) {
            $n->getElementsByTagName("label")->item(0)->appendChild(new DomText($pv));
          }
        break;

        case "active" :
          if ( $pv == "True" ) {
            $n->getElementsByTagName("input")->item(0)->setAttribute("checked", "checked");
          }
        break;

        case 'orientation' :
          $orient = ucfirst($pv);
        break;
      }
    }

    if ( $orient !== null ) {
      $classes[] = $orient;
    } else {
      if ( $class == "GtkBox" || $class == "GtkButtonBox" ) {
        $classes[] = "Horizontal";
      }
    }

    return in_array($class, self::$ShortTags);
  }

  protected function _parseSignals($c, $n, $class) {

    $id = (string) $c->object['id'];
    foreach ( $c->object->signal as $p ) {
      $pk = (string) $p['name'];
      $pv = (string) $p['handler'];

      if ( !isset($this->app_signals[$id]) ) {
        $this->app_signals[$id] = Array();
      }
      $this->app_signals[$id][$pk] = $pv;
    }

  }

  protected function _parseChild($node, $root, $oroot) {
    if  ( isset($root->child) ) {
      if ( $children = $root->child ) {
        foreach  ( $children as $c ) {
          $class    = (string) $c->object['class'];
          $id       = (string) $c->object['id'];

          $classes  = Array($class, $id);
          $oclasses = Array();

          $n       = $this->_parseElement($class, $classes);
          $packed  = $this->_parsePacking($c, $n, $class, $oclasses);
          $short   = $this->_parseProperties($c, $n, $class ,$classes);

          $this->_parseSignals($c, $n, $class);

          $n->setAttribute("class", implode(" ", $classes));

          if ( $packed ) {
            $dir = "horizontal";
            if ( $oroot['class'] == "GtkBox" ) {
              foreach ( $oroot->property as $p ) {
                if ( (string)$p['name'] == "orientation" ) {
                  if ( !($dir = (string) $p) ) {
                    $dir = "horizontal";
                  }
                }
              }
            } else {
              foreach ( $root->property as $p ) {
                if ( (string)$p['name'] == "orientation" ) {
                  if ( !($dir = (string) $p) ) {
                    $dir = "horizontal";
                  }
                }
              }
            }

            if ( $dir != "vertical" ) {
              if ( !($temp = $node->getElementsByTagName("tr")->item(0)) ) {
                $temp = $this->doc->createElement("tr");
                $node->appendChild($temp);
              }
            } else {
              $temp = $this->doc->createElement("tr");
              $node->appendChild($temp);
            }

            $temp2 = $this->doc->createElement("td");
            $temp2->setAttribute("class", implode(" ", $oclasses));
            $temp2->appendChild($n);

            $temp->appendChild($temp2);
          } else {
            $node->appendChild($n);
          }

          $this->_parseChild($n, $c->object, $oroot);
          $this->_fill($n, $short);
        }
      }
    }
  }

  protected function _parseRoot($root) {
    $type     = $root['class'] == "GtkWindow" ? "Window" : "Dialog";

    $inner = $this->doc->createElement("div");
    $inner->setAttribute("class", implode(" ", Array($this->name, "GtkWindow")));

    // Properties
    foreach ( $root->property as $p ) {
      $pv = (string) $p;
      switch ( (string) $p['name'] ) {
        case 'resizable' :
          if ( $pv == "False" ) {
            $this->app_properties['is_resizable'] = false;
          }
          break;
        case 'title' :
          $this->app_properties['title'] = $pv;
        break;
        case 'icon' :
          $this->app_properties['icon'] = $pv;
        break;
        case 'default_width' :
          $this->app_properties['width'] = (int) $pv;
        break;
        case 'default_height' :
          $this->app_properties['height'] = (int) $pv;
        break;
        case 'window_position' :
          $this->app_properties['gravity'] = $pv;
        break;
      }
    }

    $this->doc->appendChild($inner);

    $this->_parseChild($inner, $root, $root);

    return $inner;
  }

  protected function _parse($full) {
    $app_node = $this->app->createElement("application");
    $app_node->setAttribute("name", $this->name);

    if ( sizeof($this->xml->object) > 1 ) {
      throw new Exception("Cannot create more than one window!");
    }

    foreach ( $this->xml->object as $root ) {
      $this->doc->appendChild($this->_parseRoot($root));
      break;
    }

    if ( $full ) {
      foreach ( $this->app_properties as $pk => $pv) {
        $n = $this->app->createElement("property");
        $n->setAttribute("name", $pk);
        if ( is_bool($pv) ) {
          $pv = $pv ? "true" : "false";
        } else if ( is_array($pv) ) {
          $pv = json_encode($pv);
        }
        $n->appendChild(new DomText($pv));
        $app_node->appendChild($n);
      }

      foreach ( $this->app_signals as $object => $events ) {
        foreach ( $events as $trigger => $handler ) {
          $n = $this->app->createElement("event");
          $n->setAttribute("object", $object);
          $n->setAttribute("event", $trigger);
          $n->setAttribute("handler", $handler);
          $app_node->appendChild($n);
        }
      }
    }

    $this->app->appendChild($app_node);

  }

  public function getApplicationProperties() {
    return $this->app_properties;
  }

  public function getApplicationSignals() {
    return $this->app_signals;
  }
}

?>
