<?php
/*!
 * @file
 * User.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-01-04
 */

class Session extends DBObject {
  public static $Table = "session";
  public static $Columns = Array(
    "id"            => "int",
    "user_id"       => "int",
    "session_name"  => "str",
    "session_data"  => "str",
    "created_at"    => "date",
    "modified_at"   => "date"
  );

  public static function getBySnapshot($uid, $name) {
    return self::getByColumn(null, null, null, Array("user_id" => $uid, "session_name" => $name), 1);
  }
}

/**
 * User -- Application User Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     DBObject
 * @class
 */
class User extends DBObject {

  public static $Table = "user";
  public static $Columns = Array(
    "id"          => "int",
    "username"    => "str",
    "password"    => "str",
    "privilege"   => "int",
    "real_name"   => "str",
    "created_at"  => "date"
  );

  public final function snapshotSave($name, $data) {
    $sess               = new Session();
    $sess->user_id      = $this->id;
    $sess->session_name = $name;
    $sess->session_data = JSON::encode($data);
    $sess->created_at   = time();

    if ( $sess = Session::save($sess) ) {
      return $sess;
    }

    return false;
  }

  public final function snapshotLoad($name) {
    return Session::getBySnapshot($this->id, $name);
  }

  public final function getUserInfo() {
    return Array(
      "Username"   => $this->username,
      "Privilege"  => $this->privilege,
      "Name"       => $this->real_name
    );
  }

  public static function createDefault() {
    $u = new self();
    $u->username    = "Guest";
    $u->password    = "";
    $u->privilege   = 1;
    $u->real_name   = "Guest User";

    return $u;
  }

  public static function getByUsername($username, DB $db = null) {
    return self::getByColumn($db, null, null, Array("username" => $username), 1);
  }
}

?>
