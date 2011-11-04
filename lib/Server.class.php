<?php
/*!
 * @file
 * Contains Server Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-03
 */

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

  protected $_master  = null;     //!< Master Socket
  protected $_sockets = Array();  //!< Connected Sockets
  protected $_users   = Array();  //!< Connected ServerUser(s)

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

      // Select all sockets for handling
      socket_select($changed, $write = null, $except = null, null);

      foreach ( $changed as $socket ) {
        // Handle Master socket
        if ( $socket == $server->_master ) {
          $client = socket_accept($server->_master);
          if ( $client < 0 ) {
            usleep(100);
            continue;
          } else if ($client !== false) {
            $server->_connect($client);
          }
        }
        // Handle data recieved
        else {
          $bytes = socket_recv($socket, $buffer, 2048, 0);

          // If no more data was recieved, disconnect the socket
          if ( $bytes == 0 ) {
            $server->_disconnect($socket);
          } else {
            // Seems like we got a handshake or data recieved
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

  /**
   * Create a new Socket
   * @return Mixed
   */
  public final function createSocket($address, $port) {
    // Create a internet streaming TCP socket
    if ( $master = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) ) {
      // Set socket options
      if ( socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1) ) {
        // Bins the socket to the configured address in 'header.php'
        if ( socket_bind($master, $address, $port) ) {
          // Listen for connections
          if ( socket_listen($master, SERVER_BACKLOG) ) {
            if ( SERVER_NONBLOCK ) {
              socket_set_nonblock($master);
            }

            return $master;
          }
        }
      }
    }
    return null;
  }

  /**
   * Wrap a string to WebSocket message
   * @see    WebSocket W3C Specifications
   * @return String
   */
  public final function wrap($msg = "" ) {
    return chr(0).$msg.chr(255);
  }

  /**
   * Unwrap the WebSocket message
   * @see    WebSocket W3C Specifications
   * @return String
   */
  public final function unwrap($msg = "") {
    return substr($msg,1,strlen($msg)-2);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Connect a Socket and ServerUser
   * @return void
   */
  protected function _connect($socket) {
    print "Connection requested...\n";

    // Add socket and user our Server instance
    $this->_sockets[] = $socket;
    $this->_users[] = new SocketUser($socket);
  }

  /**
   * Disconnect Socket (Also ServerUser)
   * @return void
   */
  protected function _disconnect($socket) {
    // Check if we find a user for this socket
    $found = null;
    $i = 0;
    foreach ( $this->_users as $u ) {
      if ( $u->socket == $socket ) {
        $found = $i;
        break;
      }
      $i++;
    }

    // If we found a user, disconnect
    if ( $found !== null ) {
      $u = $this->_users[$found];
      if ( $ind = $u->tcp_index ) {
        $u->disconnect();

        array_splice($this->_sockets, $ind, 1);
      }
      print "Disconnecting user '{$u->id}'\n";
      array_splice($this->_users, $found, 1);
    }

    // Close and remove socket reference
    $index = array_search($socket, $this->_sockets);
    socket_close($socket);
    if ( $index >= 0 ) {
      array_splice($this->_sockets, $index, 1);
    }
  }

  /**
   * Do a ServerUser handshake over Socket
   *
   * TODO:
   *   http://code.google.com/p/phpwebsocket/issues/detail?id=33
   *   http://code.google.com/p/phpwebsocket/issues/detail?id=35#c4
   *   http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17#section-5
   *   http://no2.php.net/socket_accept
   *   http://stackoverflow.com/questions/7363095/javascript-and-websockets-using-specific-protocol
   *
   * @see    WebSocket W3C Specifications
   * @return bool
   */
  protected function _handshake($user, $buffer) {
    print "Handshaking with '{$user->id}'\n";

    // Parse the HTML header
    $r=$h=$o=$data=null;
    $key1=$key2=null;
    if(preg_match("/GET (.*) HTTP/"   ,$buffer,$match)){ $r=$match[1]; }
    if(preg_match("/Host: (.*)\r\n/"  ,$buffer,$match)){ $h=$match[1]; }
    if(preg_match("/Origin: (.*)\r\n/",$buffer,$match)){ $o=$match[1]; }
    if(preg_match("/Sec-WebSocket-Key2: (.*)\r\n/",$buffer,$match)){ $key2=$match[1]; }
    if(preg_match("/Sec-WebSocket-Key1: (.*)\r\n/",$buffer,$match)){ $key1=$match[1]; }
    if(preg_match("/\r\n(.*?)\$/",$buffer,$match)){ $data=$match[1]; }

    list($resource,$host,$origin,$strkey1,$strkey2,$data) = array($r,$h,$o,$key1,$key2,$data);

    // Now match up
    $numkey1 = preg_replace('/[^\d]*/', '', $strkey1);
    $numkey2 = preg_replace('/[^\d]*/', '', $strkey2);
    $spaces1 = strlen(preg_replace('/[^ ]*/', '', $strkey1));
    $spaces2 = strlen(preg_replace('/[^ ]*/', '', $strkey2));

    //if ($spaces1 == 0 || $spaces2 == 0 || $numkey1 % $spaces1 != 0 || $numkey2 % $spaces2 != 0) {
    if ($spaces1 == 0 || $spaces2 == 0 || fmod($numkey1, $spaces1) != 0 || fmod($numkey2, $spaces2) != 0) {
      socket_close($user->socket);
      return false;
    }

    // Create a handshake response
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

    // Write to socket and return
    socket_write($user->socket,$upgrade.chr(0),strlen($upgrade.chr(0)));
    $user->handshake=true;

    print "Handshaked with '{$user->id}'\n";
    return true;
  }

  /**
   * Process a ServerUser message
   * @return void
   */
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
              $response = Array("method" => $json['method'], "result" => true);
            } else {
              $response = Array("method" => $json['method'], "result" => false, "error" => true);
            }
            break;
          case "tcp_send":
            $err = "no socket";
            $t   = $user->send($args[0]);
            if ( !$t || $err = socket_last_error($t)  ) {
              $response = Array("method" => $json['method'], "result" => false, "error" => $err);
            } else {
              $response = Array("method" => $json['method'], "result" => true);
            }
            break;
          case "tcp_close":
            if ( $ind = $user->tcp_index ) {
              $user->disconnect();
              array_splice($this->_sockets, $ind, 1);

              $response = Array("method" => $json['method'], "result" => true);
            } else {
              $response = Array("method" => $json['method'], "result" => false, "error" => true);
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

  /**
   * Send a message to a Client Socket
   * @return void
   */
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

  /**
   * Get the SocketUser by Socket
   * @return Mixed
   */
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
