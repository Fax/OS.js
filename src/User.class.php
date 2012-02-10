<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - User.class.php
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
