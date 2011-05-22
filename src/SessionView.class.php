<?php
/*!
 * @file
 * Contains SessionView Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-02-20
 */

/**
 * SessionView Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package ajwm.Views.Session
 * @class
 */
class SessionView
  extends ApplicationView
{

  private $_sPage = "login";

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  protected function __construct() {
    parent::__construct("Session", "view.session.tpl", null);
  }

  public function setPage($p) {
    $this->_sPage = $p;
  }

  public function getPage() {
    return $this->_sPage;
  }

}

?>
