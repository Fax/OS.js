<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains ServerUser Class
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
 * @created 2011-06-03
 */

/**
 * SocketUser -- The Socket User Class
 *
 * Also handles TCP Connections (Wrapper).
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class SocketUser
{
  public $id        = null;         //!< User unique ID
  public $socket    = null;         //!< WebSocket Socket
  public $handshake = null;         //!< Handshaked ?
  public $type      = "hybi-00";    //!< WebSocket type

  public $tcp;                      //!< TCP Socket
  public $tcp_index;                //!< TCP Socket index

  /**
   * @constructor
   */
  public function __construct($socket) {
    $this->id = uniqid();
    $this->socket = $socket;

    print "User created '{$this->id}'...\n";
  }

  /**
   * Create a TCP connection
   * @param   String    $conn     Destination Host
   * @param   int       $port     Destination Port
   * @return  Socket
   */
  public function connect($conn, $port) {
    if ( !$this->tcp ) {
      if ( $this->tcp = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) ) {
        print "User: Creating TCP Connection ($conn:$port)\n";
        socket_connect($this->tcp, $conn, $port);
        return $this->tcp;
      }
    }
    return null;
  }

  /**
   * Send a message over TCP connection
   * @param   String    $st       Message
   * @return  Socket
   */
  public function send($st) {
    if ( $socket = $this->tcp ) {
      $length = strlen($st);
      print "User: Sending TCP message ($length)\n";
      while ( true ) {
        $sent = socket_write($socket, $st, $length);
        if ($sent === false) {
          break;
        }
        // Check if the entire message has been sented
        if ($sent < $length) {

          // If not sent the entire message.
          // Get the part of the message that has not yet been sented as message
          $st = substr($st, $sent);

          // Get the length of the not sented part
          $length -= $sent;
        } else {
          break;
        }

      }

      return $socket;
    }
    return null;
  }

  /**
   * Disconnect the TCP Socket
   * @return bool
   */
  public function disconnect() {
    if ( $this->tcp ) {
      print "User: Disconnecting TCP\n";
      socket_close($this->tcp);

      $this->tcp = null;

      return true;
    }

    return false;
  }
}

?>
