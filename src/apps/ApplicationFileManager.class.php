<?php
/*!
 * @file
 * Contains FileManager Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationFileManager Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js.Server.Applications
 * @class
 */
class ApplicationFileManager
  extends Application
{

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

  public static function Event($uuid, $action, Array $args) {
    if ( $action == "browse" ) {
      $result = Array();

      $path  = $args['path'];
      $view  = $args['view'];
      $total = 0;
      $bytes = 0;
      $ignores = Array(".", ".gitignore");

      if ( $path == "/" ) {
        $ignores[] = "..";
      }

      if ( ($items = ApplicationVFS::ls($path, $ignores)) !== false ) {
        $i = 0;
        foreach ( $items as $file => $info ) {
          $icon = "/img/icons/32x32/{$info['icon']}";
          if ( preg_match("/^\/img/", $info['icon']) ) {
            $icon = $info['icon'];
          }

          if ( $view == "icon" ) {
            $result[] = <<<EOHTML
        <li class="type_{$info['type']}">
          <div class="Inner">
            <div class="Image"><img alt="" src="{$icon}" width="32" height="32" /></div>
            <div class="Title">{$file}</div>
            <div class="Info" style="display:none;">
              <input type="hidden" name="type" value="{$info['type']}" />
              <input type="hidden" name="mime" value="{$info['mime']}" />
              <input type="hidden" name="name" value="{$file}" />
              <input type="hidden" name="path" value="{$info['path']}" />
              <input type="hidden" name="size" value="{$info['size']}" />
              <input type="hidden" name="protected" value="{$info['protected']}" />
            </div>
          </div>
        </li>
EOHTML;
          } else {
            $class = $i % 2 ? "odd" : "even";
            $size = $info['type'] == "dir" ? "" : $info['size'];
            $mime = $info['type'] == "dir" ? "" : $info['mime'];
            $result[] = <<<EOHTML
        <tr class="type_{$info['type']} {$class} Inner">
          <td class="Image Space First"><img alt="" src="{$icon}" width="16" height="16" /></td>
          <td class="Title Space">{$file}</td>
          <td class="Size Space">{$size}</td>
          <td class="Type Space Last">{$mime}</td>
          <td class="Info" style="display:none;">
            <input type="hidden" name="type" value="{$info['type']}" />
            <input type="hidden" name="mime" value="{$info['mime']}" />
            <input type="hidden" name="name" value="{$file}" />
            <input type="hidden" name="path" value="{$info['path']}" />
            <input type="hidden" name="size" value="{$info['size']}" />
            <input type="hidden" name="protected" value="{$info['protected']}" />
          </td>
        </tr>
EOHTML;

            $i++;
          }

          $total++;
          $bytes += (int) $info['size'];
        }
      }

      if ( $view == "icon" ) {
        $out = "<ul class=\"ListWrap\">" . implode("", $result) . "</ul>";
      } else {
        $rows = implode("", $result);
        $out = <<<EOHTML
<div class="TableWrap">
  <table class="TableHead GtkIconViewHeader">
    <tbody>
      <tr class="">
        <td class="Image Space First">&nbsp;</td>
        <td class="Title Space">Filename</td>
        <td class="Size Space">Size</td>
        <td class="Type Space Last">Type</td>
        <td class="Info" style="display:none;">&nbsp;</td>
      </tr>
    </tbody>
  </table>
  <div class="TableBodyWrap">
    <table class="TableBody">
      <tbody>
    {$rows}
      </tbody>
    </table>
  </div>
</div>
EOHTML;
      }

      return Array("items" => $out, "total" => $total, "bytes" => $bytes, "path" => ($path == "/" ? "Home" : $path));
    } else if ( $action == "upload" ) {

    }


    return false;
  }

}

?>
