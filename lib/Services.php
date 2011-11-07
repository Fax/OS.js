<?php
/*!
 * @file
 * Contains Service Classes
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-29
 */

///////////////////////////////////////////////////////////////////////////////
// BASE CLASSES
///////////////////////////////////////////////////////////////////////////////

/**
 * Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
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

  /**
   * Create a new instance from type
   * @param   int   $type     Type identifier
   * @return  Service
   */
  public final static function createFromType($type) {
    $result;
    switch ( (int)$type ) {
      case self::TYPE_GET :
        $type = new ServiceGET();
      break;
      case self::TYPE_POST :
        $type = new ServicePOST();
      break;
      case self::TYPE_JSON :
        $type = new ServiceJSON();
      break;
      case self::TYPE_SOAP :
        $type = new ServiceSOAP();
      break;
      case self::TYPE_XML :
        $type = new ServiceXML();
      break;
      default :
        $result = null;
      break;
    }
    return $result;
  }

}

// SOAP Extensions
if ( class_exists("SoapClient") ) {
  /**
   * Soap Client Class
   *
   * @author  Anders Evenrud <andersevenrud@gmail.com>
   * @package OSjs.Libraries.Services.Wrapper
   * @class
   */
  class     LocalSoapClient
    extends SoapClient
  {
    public function __call($function_name, $arguments)
    {
      $result       = false;
      $max_retries  = 5;
      $retry_count  = 0;

      while ( !$result && $retry_count < $max_retries ) {
        try {
          $result = parent::__call($function_name, $arguments);
        } catch ( SoapFault $fault ) {
          if ( $fault->faultstring != 'Could not connect to host') {
            throw $fault;
          }
        }
        sleep(1);
        $retry_count ++;
      }

      if ( $retry_count == $max_retries ) {
        throw new SoapFault('Could not connect to host after 5 attempts');
      }

      return $result;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// EXTENDED CLASSES
///////////////////////////////////////////////////////////////////////////////

/**
 * ServiceGET -- GET Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Services
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
 * ServicePOST -- POST Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Services
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
 * ServiceJSON -- JSON Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Services
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
 * ServiceSOAP -- SOAP Service Class
 *
 * This class depends upon the LocalSoapClient Class.
 * Requires SOAP to be supported by PHP.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Services
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

  /**
   * Call a SOAP WSDL Method with given arguments
   *
   * This function returns an Array with either ["error", "type"] upon failure,
   * or ["method", "arguments", "response"] on success.
   *
   * @param   Array   $data         SOAP Data
   *                                Array("call" => "method", "arvg" => Array([arguments, ...]))
   * @param   Array   $options      SOAP Client Options
   * @see LocalSoapClient
   * @see ServiceGET::call()
   */
  public function call($uri, $data, $timeout = 30, Array $options = Array()) {
    $return = null;

    try {
      if ( $sc = $this->createClient($uri, $options) ) {
        $response = $sc->$data['call']($data['argv']);
        $return   = Array(
          "method"    => $data['call'],
          "arguments" => $data['argv'],
          "response"  => $response
        );
      } else {
        throw new Exception("PHP was not compiled with Soap support!");
      }
    } catch ( SoapFault $e ) {
      $return = Array("error" => $e->getMessage(), "type" => "soap");
    } catch ( Exception $e ) {
      $return = Array("error" => $e->getMessage(), "type" => "internal");
    }

    return $return;
  }

  /**
   * Create a new SOAP Client
   * @param  String   $uri            The WSDL URI
   * @param  Array    $options        The SOAP Client options
   * @return LocalSoapClient
   */
  public function createClient($uri, Array $options = Array()) {
    if ( class_exists("LocalSoapClient") ) {
      return new LocalSoapClient($uri, $options);
    }
    return null;
  }
}

/**
 * ServiceXML -- XML Service Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Services
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
