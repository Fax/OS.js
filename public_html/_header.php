<?php
/*!
 * @file
 * _header.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2012-02-10
 */

require "../header.php";

if ( !($core = Core::initialize()) ) {
  die("Failed to initialize OS.js Core");
}

if ( !ENABLE_CACHE ) {
  header("Expires: Fri, 01 Jan 2010 05:00:00 GMT");
  header("Cache-Control: maxage=1");
  header("Cache-Control: no-cache");
  header("Pragma: no-cache");
}

// NOTE: http://www.p3pwriter.com/LRN_111.asp
//header("P3P: CP=\"IDC DSP COR CURa ADMa OUR IND PHY ONL COM STA\"");
header("P3P: CP=\"NOI DSP COR CURa ADMa OUR NOR COM STA\"");

header("X-OSjs-Version: " . PROJECT_VERSION);

?>
