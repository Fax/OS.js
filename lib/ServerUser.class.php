<?php
/*!
 * @file
 * Contains ServerUser Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-03
 */

/**
 * SocketUser Class
 *
 * WebSocket user connection class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core
 * @class
 */
class SocketUser{
  public $id;
  public $socket;
  public $handshake;

  public $tcp;
  public $tcp_index;

  public function __construct($socket) {
    $this->id = uniqid();
    $this->socket = $socket;

    print "User created '{$this->id}'...\n";
  }

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
      print "....Sendt!\n";

      return $socket;
    }
    return null;
  }

  public function disconnect() {
    if ( $this->tcp ) {
      print "User: Disconnecting TCP\n";
      socket_close($this->tcp);

      $this->tcp = null;
    }
  }
}

?>
