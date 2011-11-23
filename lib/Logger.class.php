<?php
/*!
 * @file
 * Logger.class.php -- Logging Facility
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-23
 */

/**
 * Logger -- Logger Class
 *
 * @see     header.php
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class Logger
{
  private $_sPath = "";
  private $_oResource = null;

  protected static $__Instance;

  /**
   * @constructor
   */
  protected function __construct($path) {
    if ( ENABLE_LOGGING ) {
      if ( !file_exists($path) ) {
        touch($path);
      }

      if ( file_exists($path) ) {
        $this->_sPath = $path;

        if ( $res = fopen($path, 'a') ) {
          $this->_oResource = $res;
        }
      }
    }
  }

  /**
   * @destructor
   */
  public function __destruct() {
    if ( $this->_oResource ) {
      fclose($this->_oResource);
    }

    $this->_oResource = null;
  }

  /**
   * Create a new instance
   * @return Logger
   */
  public final static function get() {
    if ( !self::$__Instance ) {
      self::$__Instance = new self(PATH_PROJECT_LOG_FILE);
    }
    return self::$__Instance;
  }

  /**
   * Log a line
   * @param  String   $msg      Message
   * @param  String   $type     Message log
   * @return bool
   */
  protected function log($msg, $type = "info") {
    if ( $res = $this->_oResource ) {

      if ( is_array($msg) ) {
        $msg = json_encode($msg);
      } else if ( is_object($msg) ) {
        ob_start();
        var_dump($msg);
        $msg = ob_get_contents();
        ob_end_clean();
      }

      $date = new DateTime();
      $date = $date->format("Y-m-d H:i:s");
      $line = sprintf("%s [%s] %s\n", $date, strtoupper($type), $msg);
      //$line = sprintf("%s [%s] %s", $date, strtoupper($type), $msg);
      if ( fwrite($res, $line) !== false ) {
        return true;
      }
    }

    return false;
  }

  /**
   * @see Logger::log()
   */
  public function logInfo($msg) {
    return $this->log($msg, "info");
  }

  /**
   * @see Logger::log()
   */
  public function logNotice($msg) {
    return $this->log($msg, "notice");
  }

  /**
   * @see Logger::log()
   */
  public function logWarning($msg) {
    return $this->log($msg, "warning");
  }

  /**
   * @see Logger::log()
   */
  public function logError($msg) {
    return $this->log($msg, "error");
  }
}

?>
