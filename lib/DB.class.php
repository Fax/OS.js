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

  protected static $__INSTANCE;

  private $__connection;

  protected function __construct(PDO $conn) {
    $this->__connection = $conn;
  }

  public final static function init() {
    if ( $i == self::get() ) {
      return $i;
    }

    $db = null;
    if ( $dsn == DATABASE_DSN ) {
      $db = new PDO($dsn, DATABASE_USER, DATABASE_PASS);
    }

    return (self::$__INSTANCE = new self($db));
  }

  public final static function get() {
    return self::$__INSTANCE;
  }

}


?>
