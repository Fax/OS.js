<?php
/*!
 * @file
 * Contains IndexView Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-18
 */

/**
 * IndexView Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package ajwm.Views.Index
 * @class
 */
class IndexView
  extends View
{

  /**
   * @see View::$_aViewStyles
   */
  protected $_aViewStyles     = Array(
    "/css/main.css"          => Array("all"),
    "/css/theme.default.css" => Array("all")
  );

  /**
   * @see View::$_aViewScripts
   */
  protected $_aViewScripts    = Array(
    "/js/json2.js"                       => Array(),
    "/js/jquery.js"                      => Array(),
    "/js/fileuploader.js"                => Array(),
    "/js/jquery-ui-1.8.11.custom.min.js" => Array(),
    "/js/sprintf-0.7-beta1.js"           => Array(),
    "/js/main.js"                        => Array(),
    "/js/view.index.js"                  => Array(),

  );

  /**
   * @see View::__construct()
   */
  protected function __construct() {
    parent::__construct(PROJECT_NAME, "view.index.tpl", null);

    $this->addViewStyle("/css/ui-lightness/jquery-ui-1.8.11.custom.css");
  }

}

?>
