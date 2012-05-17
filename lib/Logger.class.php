<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Logger.class.php -- Logging Facility
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
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
      self::$__Instance = new self(PATH_LOG_FILE);
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
    if ( !defined("ENABLE_LOGGING") || ENABLE_LOGGING === true ) {
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
    }

    return false;
  }

  /**
   * @see Logger::log()
   */
  public static function logInfo($msg) {
    return self::get()->log($msg, "info");
  }

  /**
   * @see Logger::log()
   */
  public static function logNotice($msg) {
    return self::get()->log($msg, "notice");
  }

  /**
   * @see Logger::log()
   */
  public static function logWarning($msg) {
    return self::get()->log($msg, "warning");
  }

  /**
   * @see Logger::log()
   */
  public static function logError($msg) {
    return self::get()->log($msg, "error");
  }
}

?>
