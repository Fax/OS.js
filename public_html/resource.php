<?php
/*!
 * @file
 * resource.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2012-02-10
 */

require "_header.php";

///////////////////////////////////////////////////////////////////////////////
// STYLESHEET LOADING
///////////////////////////////////////////////////////////////////////////////

if ( isset($_GET['font']) && !empty($_GET['font']) ) {
  header("Content-Type: text/css; charset=utf-8");
  print ResourceManager::getFont($_GET['font'], ENV_PRODUCTION);
  exit;
}

if ( isset($_GET['theme']) && !empty($_GET['theme']) ) {
  if ( ($content = ResourceManager::getTheme($_GET['theme'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header("Content-Type: text/css; charset=utf-8");
  print $content;
  exit;
}

if ( isset($_GET['cursor']) && !empty($_GET['cursor']) ) {
  if ( ($content = ResourceManager::getCursor($_GET['cursor'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header("Content-Type: text/css; charset=utf-8");
  print $content;
  exit;
}

///////////////////////////////////////////////////////////////////////////////
// RESOURCE LOADING
///////////////////////////////////////////////////////////////////////////////

if ( isset($_GET['resource']) && !empty($_GET['resource']) ) {
  $type = preg_match("/\.js$/", $_GET['resource']) ? "js" : "css";
  $app  = isset($_GET['application']) ? $_GET['application'] : null;
  if ( ($content = ResourceManager::getFile(true, $_GET['resource'], $app, ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header(sprintf("Content-Type: %s; charset=utf-8", $type == "js" ? "application/x-javascript" : "text/css"));
  print $content;
  exit;

} else if ( isset($_GET['library']) ) {
  $type = preg_match("/\.js$/", $_GET['library']) ? "js" : "css";
  if ( ($content = ResourceManager::getFile(false, $_GET['library'], null, ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }

  header(sprintf("Content-Type: %s; charset=utf-8", $type == "js" ? "application/x-javascript" : "text/css"));
  print $content;
  exit;
} else if ( isset($_GET['language']) ) {
  if ( ($content = ResourceManager::getTranslation($_GET['language'], ENV_PRODUCTION)) === false ) {
    header("HTTP/1.0 404 Not Found");
    exit;
  }


  header("Content-Type: application/x-javascript; charset=utf-8");
  print $content;
  exit;
}

?>
