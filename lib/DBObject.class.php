<?php
/*!
 * @file
 * DBObject.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2012-01-04
 */

/**
 * DBObject -- Database Object Mapping
 *
 * @TODO    MongoDB support
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
abstract class DBObject
{
  protected $__table;
  protected $__columns;

  /**
   * Get Object/Class by column(s)
   * @return Mixed
   */
  public static function getByColumn(DB $db = null, $table = null, $columns = null, $mixed = null, $limit = 0, $order = null) {
    $class    = get_called_class();

    // Parse parameters
    $db       = $db       ? $db       : DB::get();
    $table    = $table    ? $table    : $class::$Table;
    $columns  = $columns  ? $columns  : array_keys($class::$Columns);
    $mixed    = $mixed    ? $mixed    : Array();
    $limit    = (int) $limit;

    // Build SQL
    $result   = null;

    $keys     = array_keys($mixed);
    $values   = array_values($mixed);
    $limited  = ($limit ? "LIMIT {$limit}" : "");
    $ordered  = "";

    if ( is_array($order) && sizeof($order) ) {
      $tmp = $order;
      array_walk($tmp, function(&$item, $key) {
        $item = "{$key} " . strtoupper($item);
      });

      $ordered = "ORDER BY " . implode(", ", $tmp);
      unset($tmp);
    } else if ( is_string($order) && strlen($order) ) {
      $ordered = "ORDER BY `{$order}`";
    }

    if ( $columns == "*" ) {
      $what     = "*";
    } else {
      $what     = implode(", ", array_map(function($n) {
        return "`$n`";
      }, $columns));
    }

    if ( sizeof($mixed) ) {
      $where    = " WHERE " . implode(" AND ", array_map(function($n) {
        return "`$n` = ?";
      }, $keys));
    }


    $q = sprintf("SELECT %s FROM `%s`%s%s%s;", $what, $table, $where, $limited, $ordered);

    // Execute SQL
    if ( $sth = $db->prepare($q) ) {
      if ( $res = $sth->execute($values) ) {
        if ( $result = $sth->fetchAll(PDO::FETCH_CLASS, $class) ) {
          return ($limit === 1 ? reset($result) : $result);
        }
      }
    }

    return false;
  }

  /**
   * Get Object/Class by "id"
   * @see     DBObject::getById()
   * @return  Mixed
   */
  public static function getById($id, DB $db = null) {
    return self::getByColumn($db, null, null, Array("id" => $id), 1);
  }

  /**
   * Get All Object/Class-es
   * @see     DBObject::getById()
   * @return  Mixed
   */
  public static function getAll(DB $db = null) {
    return self::getByColumn($db);
  }

}

?>
