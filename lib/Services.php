<?php
/*!
 * @file
 * Contains Service Classes
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-29
 */

///////////////////////////////////////////////////////////////////////////////
// BASE CLASS
///////////////////////////////////////////////////////////////////////////////

/**
 * Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries
 * @class
 */
abstract class Service
{
  const TYPE_GET   = 0;   // cURL GET
  const TYPE_POST  = 1;   // cURL POST
  const TYPE_JSON  = 2;   // JSON (cURL GET)
  const TYPE_SOAP  = 3;   // SOAP
  const TYPE_XML   = 4;   // XML (cURL GET)

  private $_iType = -1;   //!< Service Type identifier

  /**
   * @param int   $type     Service Type
   * @constructor
   */
  public function __construct($type) {
    $this->_iType = (int) $type;
  }

  /**
   * Call service and return result
   * @param  String   $uri      Call URI (host/url)
   * @param  Mixed    $data     Call data
   * @param  int      $timeout  Call timeout (default = 30)
   * @param  Array    $options  Call options (default = Array())
   * @return Mixed
   */
  public function call($uri, $data, $timeout = 30, Array $options = Array()) {
    return false;
  }

}

///////////////////////////////////////////////////////////////////////////////
// EXTENDED CLASSES
///////////////////////////////////////////////////////////////////////////////

/**
 * GET Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries.Services
 * @class
 */
class     ServiceGET
  extends Service
{
  /**
   * @see Service::__construct
   * @constructor
   */
  public function __construct() {
    parent::__construct(Service::TYPE_GET);
  }

  /**
   * @see Service::call()
   */
  public function call($uri, $data, $timeout = 30, Array $options = Array()) {
    $result = null;

    if ( $ch = curl_init() ) {

      if ( is_array($data) ) {
        $url = $uri . (strpos($uri, '?') === false ? '?' : ''). http_build_query($data);
      } else {
        $url = $uri;
      }

      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, 0);
      curl_setopt($ch, CURLOPT_HEADER, 0);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

      foreach  ( $options as $key => $val ) {
        curl_setopt($key, $val);
      }

      if ( $data = curl_exec($ch) ) {
        if ( ($errno = curl_errno($ch)) ) {
          $result = Array($errno, curl_error($ch));
        } else {
          $result = $data;
        }
      }
      curl_close($ch);
    }

    return $result;
  }
}

/**
 * POST Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries.Services
 * @class
 */
class     ServicePOST
  extends Service
{
  /**
   * @see Service::__construct
   * @constructor
   */
  public function __construct() {
    parent::__construct(Service::TYPE_POST);
  }

  /**
   * @see Service::call()
   */
  public function call($uri, $data, $timeout = 30, Array $options = Array()) {
    $result = null;

    if ( $ch = curl_init() ) {
      curl_setopt($ch, CURLOPT_URL, $uri);
      curl_setopt($ch, CURLOPT_POST, 1);
      if ( is_array($data) ) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
      }
      curl_setopt($ch, CURLOPT_HEADER, 0);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

      foreach  ( $options as $key => $val ) {
        curl_setopt($key, $val);
      }

      if ( $data = curl_exec($ch) ) {
        if ( ($errno = curl_errno($ch)) ) {
          $result = Array($errno, curl_error($ch));
        } else {
          $result = $data;
        }
      }
      curl_close($ch);
    }

    return $result;
  }
}

/**
 * JSON Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries.Services
 * @class
 */
class     ServiceJSON
  extends ServiceGET
{
  /**
   * @see Service::__construct
   * @constructor
   */
  public function __construct() {
    parent::__construct(Service::TYPE_JSON);
  }

  /**
   * @see ServiceGET::call()
   */
  public function call($uri, $data, $timeout = 30, Array $options = Array()) {
    $return = null;
    if ( $result = parent::call($uri, $data, $timeout, $options) ) {
      if ( is_array($result) ) {
        $return = Array("error" => $result[1], "type" => "call");
      } else {
        try {
          $return = json_encode($result);
        } catch ( Exception $e ) {
          $return = Array("error" => $e->getMessage(), "type" => "parse");
        }
      }
    }
    return $return;
  }
}

/**
 * SOAP Service Class
 *
 * @TODO
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries.Services
 * @class
 */
class     ServiceSOAP
  extends Service
{
  /**
   * @see Service::__construct
   * @constructor
   */
  public function __construct() {
    parent::__construct(Service::TYPE_SOAP);
  }
}

/**
 * XML Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core.Libraries.Services
 * @class
 */
class     ServiceXML
  extends ServiceGET
{
  /**
   * @see Service::__construct
   * @constructor
   */
  public function __construct() {
    parent::__construct(Service::TYPE_XML);
  }
}

?>
