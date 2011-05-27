<?php
/*!
 * @file
 * Contains _ApplicationBase Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-27
 */


/**
 * ApplicationCLASSNAME Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
 * @class
 */
class ApplicationCLASSNAME
  extends DesktopApplication
{
  const APP_TITLE = "CLASSNAME";
  const APP_ICON = "ICON";

  public function __construct() {
    $this->content = <<<EOHTML

<div class="ApplicationCLASSNAME">
  <div class="ApplicationCLASSNAMEInner">
  </div>
</div>

EOHTML;

    $this->resources = Array(
      "app.CLASSNAME.js",
      "app.CLASSNAME.css"
    );

    parent::__construct(self::APP_TITLE, self::APP_ICON, self::APP_HIDDEN);
  }
}

DesktopApplication::$Registered[] = "ApplicationCLASSNAME";


?>
