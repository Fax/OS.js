<?php
/*!
 * @file
 * DB.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2012-01-01
 */

/**
 * DB -- Database Basics
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class DB
{

  /**
   * Running Instances
   * @var
   */
  protected static $__INSTANCES;

  private $__connection;    //!< Current connection (PDO/Mongo)

  /**
   * Create a new instance
   * @constructor
   */
  protected function __construct($conn) {
    $this->__connection = $conn;
  }

  /**
   * Call a connection function
   * @param   String    $func       Function name
   * @param   Mixed     $args       Calling Arguments
   * @return  Mixed
   */
  public function __call($func, $args = null) {
    if ( !is_array($args) ) {
      $args = Array($args);
    }

    return call_user_func_array(Array($this->__connection, $func), $args);
  }

  /**
   * Create a new DB connection
   * @param   String    $dsn        Database connection string (PDO/Mongo syntax)
   * @param   Mixed     $options    Connection options (Currently just for Mongo)
   * @return DB
   */
  public final static function init($dsn = null, $options = null) {
    if ( $i = self::get($dsn) ) {
      return $i;
    }

    // MongoDB
    if ( strstr($dsn, "mongodb://") !== false ) {
      if ( !$options ) {
        $options = Array(
          "connect" => true
        );
      }

      $dbname = "";
      if ( isset($options["database"]) ) {
        $dbname = $options["database"];
        unset($options["database"]);
      }

      $mongo  = new Mongo($dsn, $options);
      $db     = new MongoDB($mongo, $dbname);
    }

    // PDO
    else {
      $db     = new PDO((is_string($dsn) ? $dsn : DATABASE_DSN), DATABASE_USER, DATABASE_PASS);
    }

    return (self::$__INSTANCES[$dsn] = new self($db));
  }

  /**
   * Get a running Instance by DSN (Connection String)
   * @see    DB::init()
   * @return DB
   */
  public final static function get($dsn = null) {
    return $dsn ? self::$__INSTANCES[$dsn] : reset(self::$__INSTANCES);
  }

}


?>
