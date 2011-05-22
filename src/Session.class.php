<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Session.class.php
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
 * @created 2012-02-19
 */

/**
 * Session -- Application User Session Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @class
 */
class Session
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  public $id              = -1;               //!< Session ID
  public $user_id         = -1;               //!< User ID
  public $session_name    = "Undefined";      //!< Session Name
  public $session_data    = Array();          //!< Session JSON Data
  public $created_at      = null;             //!< Session Created Timestamp
  public $modified_at     = null;             //!< Session Modified Timestamp

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  public final function __construct(Array $data) {
    foreach ( $data as $k => $v ) {
      try {
        if ( $k == "session_data" )
          $v = JSON::decode($v);
        elseif ( $k == "created_at" && $v )
          $v = new DateTime($v);
        elseif ( $k == "modified_at" && $v )
          $v = new DateTime($v);
      } catch ( Exception $e ) {}

      $this->$k = $v;
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC SESSION METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Session Data
   * @return Array
   */
  public static final function getSession() {
    return $_SESSION;
  }

  /**
   * Get Session Locale
   * @return Mixed
   */
  public static final function getLocale() {
    if ( isset($_SESSION['locale']) )
      return $_SESSION['locale'];
    return null;
  }

  /**
   * Get Session User
   * @return Mixed
   */
  public static final function getUser() {
    if ( isset($_SESSION['user']) )
      return $_SESSION['user'];
    return null;
  }

  /**
   * Set Session Locale
   * @param  Mixed      $locale       Locale Data
   * @return void
   */
  public static final function setLocale($locale) {
    $_SESSION['locale'] = $locale;
  }

  /**
   * Set Session User
   * @param  Mixed      $user       User Instance (If any)
   * @return void
   */
  public static final function setUser(User $user = null) {
    $_SESSION['user'] = $user;
  }

  /**
   * Initialize a new Session
   * @return void
   */
  public static final function initSession() {
    @session_start();
  }

  /**
   * Destroy the current Session
   * @return void
   */
  public static final function clearSession() {
    //$_SESSION['user']        = null;
    //$_SESSION['locale']      = null;
    unset($_SESSION['compability']);
    unset($_SESSION['navigator']);
  }

  /**
   * Set Session browser compability flags
   * @param  Array    $flags      Compability map
   * @return void
   */
  public static final function setCompabilityFlags(Array $flags) {
    $_SESSION['compability'] = $flags;
  }

  /**
   * Get Session browser compability flags
   * @return Array
   */
  public static final function getCompabilityFlags() {
    return (isset($_SESSION['compability']) ? $_SESSION['compability'] : Array());
  }

  /**
   * Set Session browser navigator flags
   * @param  Array    $flags      Browser map
   * @return void
   */
  public static final function setBrowserFlags(Array $flags) {
    $_SESSION['navigator'] = $flags;
  }

  /**
   * Get Session browser navigator flags
   * @return Array
   */
  public static final function getBrowserFlags() {
    return (isset($_SESSION['navigator']) ? $_SESSION['navigator'] : Array());
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC INSTANCE METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Save the given session
   * @param   Session     $instance     Session Instance
   * @return  Mixed
   */
  public static function save(Session $instance) {
    $values = Array();
    foreach ( $instance as $k => $v ) {
      $values[$k] = $v;
    }

    if ( isset($instance->id) && (($id = $instance->id) > 0) ) {
      if ( DB::Update("session", $values, Array("id" => $id)) ) {
        return $instance;
      }
    } else {
      if ( $id = DB::Insert("session", $values) ) {
        $instance->id = $id;
        return $instance;
      }
    }
    return false;
  }

  /**
   * Get Snapshot by UID and name
   * @param   int         $uid      User ID
   * @param   String      $name     Session Name
   * @return  Mixed
   */
  public static function getBySnapshot($uid, $name) {
    if ( $res = DB::Select("session", "*", Array("user_id" => $uid, "session_name" => $name), 1) ) {
      return new Session($res);
    }
    return null;
  }

  /**
   * Save a new Snapshot instance
   * @param   User      $user     User instance
   * @param   String    $name     Snapshot name
   * @param   Array     $config   Snapshot JSON
   * @return  Mixed
   */
  public static final function snapshotSave(User $user, $name, $config) {
    $sess               = new Session(Array(
      "user_id"         => $user->id,
      "session_name"    => $name,
      "session_data"    => $config,
      "created_at"      => new DateTime()
    ));

    if ( $sess = Session::save($sess) ) {
      return $sess;
    }

    return false;
  }

  /**
   * Load a snapshot by name
   * @see    Snapshot::getBySnapshot()
   * @return Snapshot
   */
  public static final function snapshotLoad(User $user, $name) {
    return Session::getBySnapshot($user->id, $name);
  }

  /**
   * Delete a snapshot by name
   * @see    Snapshot::getBySnapshot()
   * @return Snapshot
   */
  public static final function snapshotDelete(User $user, $name) {
    if ( $s = Session::getBySnapshot($user->id, $name) ) {
      return DB::Delete("session", Array("id" => $s->id, "user_id" => $user->id), 1);
    }
    return false;
  }

  /**
   * Get a list of snapshots
   * @return Snapshot
   */
  public static final function snapshotList(User $user) {
    if ( $res = DB::Select("session", "*", Array("user_id" => $user->id)) ) {
      $result = Array();
      foreach ( $res as $r ) {
        $result[] = new Session($r);
      }
      return $result;
    }
    return null;
  }

}

?>
