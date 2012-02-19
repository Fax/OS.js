<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - DB.class.php
 *
 * Copyright (c) 2011, Anders Evenrud
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
  protected static $__INSTANCES = Array();

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

  public final static function Insert($table, Array $args, $dsn = null) {
    if ( $inst = self::get($dsn) ) {
      if ( $db = $inst->getConnection() ) {
        $query_columns = Array();
        $query_values  = Array();
        $values = Array();

        foreach ( $args as $k => $v ) {
          $query_columns[] = "`$k`";
          $query_values[]  = ":$k";
          if ( is_object($v) && ($v instanceof DateTime) ) {
            $v = $v->format("c");
          } else if ( is_object($v) || is_array($v) ) {
            $v = JSON::encode($v);
          }
          $values[$k] = $v;
        }

        $query  = sprintf("INSERT INTO `%s` (%s) VALUES(%s);", $table, implode(", ", $query_columns), implode(", ", $query_values));
        if ( $sth = $db->prepare($query) ) {
          if ( $res = $sth->execute($values) ) {
            if ( $id = $db->lastInsertId() ) {
              return $id;
            }

            return true;
          }
        }
      }
    }

    return false;
  }

  public final static function Update($table, Array $args, Array $where, $dsn = null) {
    if ( $inst = self::get($dsn) ) {
      if ( $db = $inst->getConnection() ) {
        $query_set    = Array();
        $query_where  = Array();
        $values = Array();

        foreach ( $args as $k => $v ) {
          $query_set[] = "`$k` = :$k";
          if ( is_object($v) && ($v instanceof DateTime) ) {
            $v = $v->format("c");
          } else if ( is_object($v) || is_array($v) ) {
            $v = JSON::encode($v);
          }
          $values[$k] = $v;
        }
        foreach ( $where as $k => $v ) {
          $query_where[] = "`$k` = :$k";
          if ( is_object($v) && ($v instanceof DateTime) ) {
            $v = $v->format("c");
          } else if ( is_object($v) || is_array($v) ) {
            $v = JSON::encode($v);
          }
          $values[$k] = $v;
        }

        $query  = sprintf("UPDATE `%s` SET %s WHERE %s;", $table, implode(", ", $query_set), implode(" AND ", $query_where));
        if ( $sth = $db->prepare($query) ) {
          if ( $res = $sth->execute($values) ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public final static function Select($table, $what, Array $where, $limit = null, $dsn = null) {
    $results = Array();

    if ( $inst = self::get($dsn) ) {
      if ( $db = $inst->getConnection() ) {
        $query_select = Array();
        $query_where  = Array();
        $query_limit  = ($limit === null) ? "" : "LIMIT {$limit}";
        $values = Array();

        if ( $what === "*" ) {
          $query_select[] = "*";
        } else if ( is_array($what) ) {
          foreach ( $what as $k ) {
            $query_select[] = "`$k`";
          }
        }

        foreach ( $where as $k => $v ) {
          $query_where[] = "`$k` = :$k";
          if ( is_object($v) && ($v instanceof DateTime) ) {
            $v = $v->format("c");
          } else if ( is_object($v) || is_array($v) ) {
            $v = JSON::encode($v);
          }
          $values[$k] = $v;
        }

        $query  = sprintf("SELECT %s FROM `%s` WHERE %s %s;", implode(", ", $query_select), $table, implode(" AND ", $query_where), $query_limit);
        if ( $sth = $db->prepare($query) ) {
          if ( $res = $sth->execute($values) ) {
            if ( $sqlr = $sth->fetchAll(PDO::FETCH_ASSOC) ) {
              $results = (Array) $sqlr;
            }
          }
        }
      }
    }

    return $results ? ($limit === 1 ? reset($results) : $results) : false;
  }

  public final static function Delete($table, Array $where, $limit = null, $dsn = null) {
    if ( $inst = self::get($dsn) ) {
      if ( $db = $inst->getConnection() ) {
        $query_where  = Array();
        $query_limit  = ($limit === null) ? "" : "LIMIT {$limit}";
        $values = Array();

        foreach ( $where as $k => $v ) {
          $query_where[] = "`$k` = :$k";
          if ( is_object($v) && ($v instanceof DateTime) ) {
            $v = $v->format("c");
          } else if ( is_object($v) || is_array($v) ) {
            $v = JSON::encode($v);
          }
          $values[$k] = $v;
        }

        $query  = sprintf("DELETE FROM `%s` WHERE %s %s;", $table, implode(" AND ", $query_where), $query_limit);
        if ( $sth = $db->prepare($query) ) {
          if ( $res = $sth->execute($values) ) {
            return true;
          }
        }
      }
    }

    return false;
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

  /**
   * Get the connection
   * @return Mixed
   */
  public final function getConnection() {
    return $this->__connection;
  }

  /**
   * Check if connection is a MongoDB connection
   * @return bool
   */
  public final function getIsMongo() {
    return (!($this->__connection instanceof PDO));
  }

}


?>
