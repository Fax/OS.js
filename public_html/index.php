<?php
/*!
 * @file
 * index.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-05-26
 */

require "_header.php";

///////////////////////////////////////////////////////////////////////////////
// AJAX
///////////////////////////////////////////////////////////////////////////////

// GET operations
if ( !($json = $core->doGET($_GET)) === false ) {
  header("Content-Type: application/json");
  die($json);
}

// POST operations
//if ( !($json = $core->doPOST(file_get_contents('php://input'), true)) === false ) {
if ( !($json = $core->doPOST($_POST)) === false ) {
  header("Content-Type: application/json");
  die($json);
}

///////////////////////////////////////////////////////////////////////////////
// HTML
///////////////////////////////////////////////////////////////////////////////

header("Content-Type: text/html; charset=utf-8");
require PATH_JSBASE . "/template.php";

?>
