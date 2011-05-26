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

$inifile = parse_ini_file(PATH_PROJECT . "/build.properties");
define("PROPEL_PROJECT", $inifile["propel.project"]);

defined("PATH_PROJECT_BUILD")      or
  define("PATH_PROJECT_BUILD",     PATH_PROJECT . "/build");

defined("PROPEL_CONFIG")        or
  define("PROPEL_CONFIG",       sprintf("%s/conf/%s-conf.php", PATH_PROJECT_BUILD, PROPEL_PROJECT));

set_include_path(sprintf("%s/classes", PATH_PROJECT_BUILD) . PATH_SEPARATOR . get_include_path());
set_include_path(sprintf("%s/classes/%s", PATH_PROJECT_BUILD, PROPEL_PROJECT) . PATH_SEPARATOR . get_include_path());

require 'Propel/runtime/lib/Propel.php';

Propel::init(PROPEL_CONFIG);

require 'src/WindowManager.class.php';
?>
