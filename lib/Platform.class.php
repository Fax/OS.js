<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Platform API Class
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
 * @created 2011-06-03
 */

/**
 * Platform -- The Platform API Class
 *
 * TODO
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @see     bin/session-server
 * @see     bin/session-launch
 * @class
 */
abstract class Platform
{

  /**
   * Authenticate User via LDAP
   *
   * @param   String    $host       Connection Hostname
   * @param   int       $port       Connection Port
   * @param   String    $dsn        Connection Base DN
   * @param   Mixed     $uid        User Identification
   * @param   Mixed     $pwd        User Password
   * @return  bool
   */
  public static function AuthenticateLDAP($host, $port, $dsn, $uid, $pwd) {
    $uid = addslashes(trim($uid));
    $pwd = addslashes(trim($pwd));

    if ( $ds = ldap_connect($host, $port) ) {
      if ( $r = ldap_search($ds, $dsn, "uid=$uid") ) {
        if ( $result = ldap_get_entries( $ds, $r) ) {
          if ( isset($result[0]) && !empty($result[0]) ) {
            if ( ldap_bind( $ds, $result[0]['dn'], $pwd) ) {
              return ($result[0] ? true : false);
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get Battery Status from OS
   * @return Mixed
   */
  public static function GetBatteryStatus() {
    // Only avail. on Linux clients
    if ( ($nav = Session::getBrowserFlags()) && (isset($nav["platform"])) ) {
      if ( !preg_match("/^linux/", strtolower($nav["platform"])) ) {
        return false;
      }
    }

    $response = Array();
    $sys      = "/sys/class/power_supply/BAT*/energy_*";
    $cmd      = "/sys/class/power_supply/BAT%d/%s";
    $match    = "/^\/sys\/class\/power_supply\/BAT(\d+)\/(.*)$/";

    foreach ( glob($sys) as $filename ) {
      if ( preg_match($match, $filename, $matches) && sizeof($matches) ) {
        $id = (int) $matches[1];
        $i  = $matches[2];

        if ( !isset($response[$id]) ) {
          $response[$id] = Array();
        }
        $response[$id][$i] = trim(file_get_contents(sprintf($cmd, $id, $i)));

        ksort($response[$id]);
      }
    }

    return $response;
  }

}

?>
