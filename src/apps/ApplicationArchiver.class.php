<?php
/*!
 * @file
 * Contains Archiver Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-16
 */

/**
 * ApplicationArchiver Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js.Server.Applications
 * @class
 */
class ApplicationArchiver
  extends Application
{

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

  public static function Event($uuid, $action, Array $args) {
    $path = "/tmp/ccthemepack.zip";

    if ( $action == "browse" ) {
      $result = Array();
      $total = 0;
      $bytes = 0;

      if ( ($a = ApplicationVFS::ls_archive($path)) ) {

        $i = 0;
        foreach ( $a as $file => $info ) {
          $icon = "/img/icons/32x32/{$info['icon']}";
          if ( preg_match("/^\/img/", $info['icon']) ) {
            $icon = $info['icon'];
          }

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
        $total++;
        $bytes += (int) $info['size'];
      }

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

        return Array("items" => $out, "total" => $total, "bytes" => $bytes, "path" => ($path == "/" ? "Home" : $path));
      }
    }

    return false;
  }

}

?>
