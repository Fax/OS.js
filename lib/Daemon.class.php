<?php
/*!
 * @file
 * Daemon.class.php -- System Daemon Implementation
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-08
 */

/**
 * iDaemon -- System Daemon Interface
 * @interface
 */
interface iDaemon
{
  /**
   * Main loop
   * @see Daemon::loop()
   */
  public function loop(/* ... */);
}

/**
 * Daemon -- System Daemon Implementation
 * @class
 */
abstract class Daemon
  implements   iDaemon
{
  const SLEEP_INTERVAL = 100;

  protected $__iPID     = -1;               //!< Process ID
  protected $__iUID     = -1;               //!< Process User ID
  protected $__iGID     = -1;               //!< Process Group ID
  protected $__iUmask   = 0;                //!< Process umask
  protected $__sWDir    = "/";              //!< Process working directory

  private static $__Running = false;
  private static $__Implemented = false;

  /**
   * @constructor
   */
  public function __construct($uid = -1, $gid = -1, $umask = 0, $wdir = "/") {

    if ( self::$__Implemented ) {
      throw new Exception("Cannot create more than one instance of Daemon.");
    }

    if ( !function_exists("pcntl_fork") ) {
      throw new Exception("Cannot create daemon, 'pcntl_fork' does not exist!");
    }
    if ( !function_exists("pcntl_signal") ) {
      throw new Exception("Cannot create daemon, 'pcntl_signal' does not exist!");
    }
    if ( !function_exists("pcntl_signal") ) {
      throw new Exception("Cannot create daemon, 'pcntl_waitpid' does not exist!");
    }
    if ( !function_exists("posix_setgid") ) {
      throw new Exception("Cannot create daemon, 'posix_setgid' does not exist!");
    }
    if ( !function_exists("posix_setgid") ) {
      throw new Exception("Cannot create daemon, 'posix_setgid' does not exist!");
    }

    // Do some internals
    set_time_limit(0);
    ob_implicit_flush();
    declare(ticks = 1);

    // Apply signal handler
    pcntl_signal(SIGTERM, Array(&$this, '_signalHandler'));
    pcntl_signal(SIGINT,  Array(&$this, '_signalHandler'));
    pcntl_signal(SIGCHLD, Array(&$this, '_signalHandler'));

    // Set internals
    $this->_setUid($uid);
    $this->_setGid($gid);
    $this->_setUmask($umask);
    $this->_setWDir($wdir);

    // Run
    $this->_becomeDaemon();

    self::$__Implemented = true;
  }

  /**
   * This is just an example
   * @see iDaemon::loop
   */
  public function loop(/* ... */) {
    $tmp = false;
    $i   = 0;
    while ( self::$__Running ) {
      if ( $i > 100 ) {
        $tmp = true;
      }

      if ( $tmp ) {
        $this->_fork(function() {}, function() {}, function() {});
      } else {
        usleep(self::SLEEP_INTERVAL);
      }
      $i++;
    }
  }

  /**
   * Fork process
   * @param   Function    $fail         PID == -1
   * @param   Function    $child        PID == 0
   * @param   Function    $parent       PID > 0
   * @return  void
   */
  protected function _fork($fail, $child, $parent) {
    $pid = pcntl_fork();
    if ( $pid == -1 ) {
      // Failure
      $fail();
    } else if ( $pid == 0 ) {
      // Child process
      self::$_Running = false;
      $child();
    } else {
      // Parent process
      $parent();
    }
  }

  /**
   * Process signal
   * @param   int     $sig        Signal type
   * @return  void
   */
  protected function _signalHandler($sig) {
    switch($sig) {
      // Forced termination
      case SIGTERM:
      case SIGINT:
        exit();
      break;

      // Child finished
      case SIGCHLD:
        pcntl_waitpid(-1, $status);
      break;
    }
  }

  /**
   * Become a daemon
   * @return void
   */
  protected function _becomeDaemon() {
    $pid = pcntl_fork();
    if ( $pid == -1  ) {
      throw new Exception("Failed to fork process!");
    } else if ( $pid ) {
      exit(); // Kill parent
    } else {
      // Become daemon
      posix_setsid();
      chdir($this->__sWDir);
      umask($this->__iUmask);
      $this->__iPID = posix_getpid();
    }
  }

  /**
   * Set the process 'uid'
   * @param   int   $uid        Value
   * @return  bool
   */
  protected function _setUid($uid) {
    $uid = (int) $uid;
    if ( $uid > 0 ) {
      if ( posix_setuid($uid) ) {
        $this->__iUID = $uid;
        return true;
      }
    }

    return false;
  }

  /**
   * Set the process 'gid'
   * @param   int   $gid        Value
   * @return  bool
   */
  protected function _setGid($gid) {
    $gid = (int) $gid;
    if ( $gid > 0 ) {
      if ( posix_setgid($gid) ) {
        $this->__iGID = $gid;
        return true;
      }
    }

    return false;
  }

  /**
   * Set the process 'umask'
   * @param   int   $umask      Value
   * @return  bool
   */
  protected final function _setUmask($umask) {
    $umask = (int) $umask;
    if ( $umask >= 0 ) {
      $this->__iUmask = $umask;
      return true;
    }
    return false;
  }

  /**
   * Set Working Directory
   *
   * @param   String    $dir      Directory
   * @return  void
   */
  protected final function _setWDir($dir) {
    $this->_sWDir = $dir;
  }
}

?>
