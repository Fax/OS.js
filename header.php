<?php
/*!
 * @file
 * header.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-19
 */

// Path definitions
define("PATH_PROJECT",      dirname(__FILE__));

// Project properties
define("PROJECT_NAME",      "Another JSWM");
define("PROJECT_CODENAME",  "MyApplication");
define("PROJECT_LICENCE",   "MyApplicationLicence");
define("PROJECT_VERSION",   "MyApplicationVersion");
define("PROJECT_AUTHOR",    "MyApplicationAuthor");
define("PROJECT_COPYRIGHT", "MyApplicationCopyright");

// Includes
require "SCore/header.php";

//require "src/DesktopApplication.class.php";

// URL mapping
WebApplication::map(Array(
));

?>
