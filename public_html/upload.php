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
    require PATH_PROJECT_LIB . "/Upload.class.php";

    if ( isset($_FILES['upload']) ) {
      $return = json_encode(ApplicationVFS::upload($_FILES['upload'], $_POST['path']));
    } else {
      if ( isset($_POST['action']) ) {
        $method = $_POST['action'];
        if ( $method == "upload_progress" ) {
          $return = json_encode(Upload::getStatus());
        } else if ( $method == "upload_cancel" ){
          $return = json_encode(Upload::cancelUpload());
        } else if ( $method == "upload_form" ) {
          $return = json_encode(Array("document" => Upload::createForm()));
        }
      }
    }
  }
}

print $return;
?>
