<?php
/*!
 * @file
 * upload.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-13
 */

require "../header.php";

// AJAX File uploading
$return = 'null';
if ( sizeof($_POST) ) {
  if ( isset($_POST['upload']) ) {
    if ( isset($_FILES['upload']) ) {
      $return = json_encode(ApplicationVFS::upload($_FILES['upload'], $_POST['path']));
    }
  }
}

print $return;
?>
