<?php
/*!
 * @file
 * Contains Server Class
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
    }
  }

  public function disconnect() {
    if ( $this->tcp ) {
      print "User: Disconnecting TCP\n";
      socket_close($this->tcp);

      $this->tcp = null;
    }
  }
}

/**
 * Server Class
 *
 * WebSocket server class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Core
 * @class
 */
class Server
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_master = null;
  protected $_sockets = Array();
  protected $_users = Array();

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  protected function __construct($host, $port) {
    if ( $this->_master = self::createSocket($host, $port) ) {
      $this->_sockets[] = $this->_master;

      print "Server running on: {$host}:{$port}\n";
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance of Server
   *
   * @return Server
   */
  public final static function run($host, $port) {
    $server = new self($host, $port);

    if ( !$server->_master || !$server->_sockets ) {
      throw new Exception("Master socket was not created!");
    }

    $buffer = null;
    while ( true ) {
      $changed = $server->_sockets;
      socket_select($changed, $write = null, $except = null, null);
      foreach ( $changed as $socket ) {
        if ( $socket == $server->_master ) {
          $client = socket_accept($server->_master);
          if ( $client < 0 ) {
            continue;
          } else {
            $server->_connect($client);
          }
        } else {
          $bytes = socket_recv($socket, $buffer, 2048, 0);
          if ( $bytes == 0 ) {
            $server->_disconnect($socket);
          } else {
            $user = $server->_getUserBySocket($socket);
            if ( !$user->handshake ) {
              $server->_handshake($user, $buffer);
            } else {
              $server->_process($user, $buffer, $socket == $user->tcp);
            }
          }
        }
      }
    }
  }

  public final function createSocket($address, $port) {
    if ( $master = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) ) {
      if ( socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1) ) {
        if ( socket_bind($master, $address, $port) ) {
          if ( socket_listen($master,20) ) {
            return $master;
          }
        }
      }
    }
    return null;
  }

  public final function createHeaders($req) {
    $r=$h=$o=$data=null;
    if(preg_match("/GET (.*) HTTP/"   ,$req,$match)){ $r=$match[1]; }
    if(preg_match("/Host: (.*)\r\n/"  ,$req,$match)){ $h=$match[1]; }
    if(preg_match("/Origin: (.*)\r\n/",$req,$match)){ $o=$match[1]; }
    if(preg_match("/Sec-WebSocket-Key2: (.*)\r\n/",$req,$match)){ $key2=$match[1]; }
    if(preg_match("/Sec-WebSocket-Key1: (.*)\r\n/",$req,$match)){ $key1=$match[1]; }
    if(preg_match("/\r\n(.*?)\$/",$req,$match)){ $data=$match[1]; }
    return array($r,$h,$o,$key1,$key2,$data);
  }

  public final function wrap($msg = "" ) {
    return chr(0).$msg.chr(255);
  }

  public final function unwrap($msg = "") {
    return substr($msg,1,strlen($msg)-2);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  protected function _connect($socket) {
    print "Connection requested...\n";
    $this->_sockets[] = $socket;
    $this->_users[] = new SocketUser($socket);
  }

  protected function _disconnect($socket) {
    $found = null;
    $i = 0;
    foreach ( $this->_users as $u ) {
      if ( $u->socket == $socket ) {
        $found = $i;
        break;
      }
      $i++;
    }

    if ( $found !== null ) {
      $u = $this->_users[$found];
      if ( $ind = $u->tcp_index ) {
        $u->disconnect();

        array_splice($this->_sockets, $ind, 1);
      }
      print "Disconnecting user '{$u->id}'\n";
      array_splice($this->_users, $found, 1);
    }

    $index = array_search($socket, $this->_sockets);
    socket_close($socket);
    if ( $index >= 0 ) {
      array_splice($this->_sockets, $index, 1);
    }
  }

  protected function _handshake($user, $buffer) {
    print "Handshaking with '{$user->id}'\n";
    list($resource,$host,$origin,$strkey1,$strkey2,$data) = self::createHeaders($buffer);

    $numkey1 = preg_replace('/[^\d]*/', '', $strkey1);
    $numkey2 = preg_replace('/[^\d]*/', '', $strkey2);
    $spaces1 = strlen(preg_replace('/[^ ]*/', '', $strkey1));
    $spaces2 = strlen(preg_replace('/[^ ]*/', '', $strkey2));

    if ($spaces1 == 0 || $spaces2 == 0 || $numkey1 % $spaces1 != 0 || $numkey2 % $spaces2 != 0) {
      socket_close($user->socket);
      return false;
    }

    $ctx = hash_init('md5');
    hash_update($ctx, pack("N", $numkey1/$spaces1));
    hash_update($ctx, pack("N", $numkey2/$spaces2));
    hash_update($ctx, $data);
    $hash_data = hash_final($ctx,true);

    $upgrade  = "HTTP/1.1 101 WebSocket Protocol Handshake\r\n" .
                "Upgrade: WebSocket\r\n" .
                "Connection: Upgrade\r\n" .
                "Sec-WebSocket-Origin: " . $origin . "\r\n" .
                "Sec-WebSocket-Location: ws://" . $host . $resource . "\r\n" .
                "\r\n" .
                $hash_data;

    socket_write($user->socket,$upgrade.chr(0),strlen($upgrade.chr(0)));
    $user->handshake=true;

    print "Handshaked with '{$user->id}'\n";
    return true;
  }

  protected function _process($user, $message, $external = false) {
    $response = null;
    if ( $external ) {
      print "< EXT: ---\n";
      $response = Array("response" => "$message");
    } else {
      $msg = self::unwrap($message);
      $json = null;
      try {
        $json = (array) json_decode($msg);
      } catch ( Exception $e ) {
      }

      if ( $json !== null && sizeof($json) ) {
        $args = $json['arguments'];
        switch ( $json['method'] ) {
          case "tcp_open":
            if ( $s = $user->connect($args[0], $args[1]) ) {
              $this->_sockets[] = $s;
              $user->tcp_index = sizeof($this->_sockets) - 1;
              $response = Array("result" => true);
            } else {
              $response = Array("result" => false, "error" => true);
            }
            break;
          case "tcp_send":
            if ( $user->send($args[0]) ) {
              $response = Array("result" => true);
            } else {
              $response = Array("result" => false, "error" => true);
            }
            break;
          case "tcp_close":
            if ( $ind = $user->tcp_index ) {
              $user->disconnect();
              array_splice($this->_sockets, $ind, 1);

              $response = Array("result" => true);
            } else {
              $response = Array("result" => false, "error" => true);
            }
            break;
        }

        print "< JSON: $msg\n";
      } else {
        print "< '$msg'\n";
      }
    }
    $this->_send($user->socket, json_encode($response));
  }

  protected function _send($client, $message) {
    print "> '$message'\n";
    $msg = self::wrap($message);
    socket_write($client, $msg, strlen($msg));
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

  protected function _getUserBySocket($socket) {
    foreach ( $this->_users as $u ) {
      if ( $u->socket == $socket || $u->tcp == $socket ) {
        return $u;
      }
    }
    return null;
  }

}

?>
