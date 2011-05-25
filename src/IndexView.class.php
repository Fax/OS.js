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
    "/css/main.css" => Array("all")
    // TODO : theme.null.css
  );

  /**
   * @see View::$_aViewScripts
   */
  protected $_aViewScripts    = Array(
    "/js/jquery.js" => Array(),
    "/js/fileuploader.js" => Array()
  );

  /**
   * @see View::__construct()
   */
  protected function __construct() {
    parent::__construct(PROJECT_NAME, "view.index.tpl", null);

    $this->addViewStyle("/css/ui-lightness/jquery-ui-1.8.11.custom.css");
    $this->addViewScript("/js/jquery-ui-1.8.11.custom.min.js");
    $this->addViewScript("/js/sprintf-0.7-beta1.js");
    $this->addViewScript("/js/main.js");
    $this->addViewScript("/js/view.index.js");
  }

}

?>
