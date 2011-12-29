<?php
/*!
 * @file
 * Contains IMAP Classes and Functions
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-04
 */


class IMAPMail
{
  private $_html        = "";
  private $_plain       = "";
  private $_charset     = "";
  private $_attachments = Array();

  public function getArray() {
    return Array(
      "html"        => $this->_html,
      "plain"       => $this->_plain,
      "charset"     => $this->_charset,
      "attachments" => $this->_attachments
    );
  }

  protected function parse($mbox, $mid, $part, $pid) {
    $data         = null;

    // Data
    if ( $pid ) {
      $data = imap_fetchbody($mbox, $mid, $pid);
    } else {
      $data = imap_body($mbox, $mid);
    }

    // Encoding
    if ( $part->encoding == 4 ) {
      $data = quoted_printable_decode($data);
    } else if ( $part->encoding == 3 ) {
      $data = base64_decode($data);
    }

    // Params
    if ( $part->parameters ) {
      foreach ( $part->parameters as $p ) {
        $params[strtolower($p->attribute)] = $p->value;
      }
    }
    if ( isset($part->dparameters) ) {
      foreach ( $part->dparameters as $p ) {
        $params[strtolower($p->attribute)] = $p->value;
      }
    }

    // Main
    if ( isset($params['filename']) || isset($params['name']) ) { // Attachments
      $filename = isset($params['filename']) ? $params['filename'] : $params['name'];

      $this->_attachments[$filename] = $data;
    } else if ( $part->type == 0 && $data ) {
      if ( strtolower($part->subtype) == "plain" ) { // Message
        $this->_plain .= trim($data) . "\n\n";
      } else {
        $this->_html  .= $data . "<br><br>";
      }

      $this->_charset = $params['charset'];
    } else if ( $part->type == 2 && $data ) { // Embedded
      $this->_plain .= trim($data) . "\n\n";
    }

    // Subpart recursion
    if ( isset($part->parts) ) {
      foreach ( $part->parts as $pno => $pval ) {
        $this->parse($mbox, $mid, $pval, ($pid . "." . ($pval + 1)));
      }
    }
  }

  public static function create($mbox, $mid) {
    $mail   = new self();
    $result = false;

    if ( $s = imap_fetchstructure($mbox, $mid) ) {
      $result  = Array();
      if ( $s->parts ) { // Multipart
        foreach ( $s->parts as $pno => $pval ) {
          $mail->parse($mbox, $mid, $pval, ($pno + 1));
        }
      } else {
        $mail->parse($mbox, $mid, $s, 0);
      }

      $result = $mail->getArray();
    }

    return $result;
  }

}

/**
 * IMAP -- The IMAP Mailing Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class IMAP
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_host;
  protected $_socket;
  protected $_folder;
  protected $_errors = Array();

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  protected function __construct($host, $username, $password, $folder) {
    $this->_host    = $host;
    $this->_folder  = $folder;

    $auth = sprintf("{%s/imap/ssl/novalidate-cert/norsh}%s", $host, $folder);
    //$auth = sprintf("{%s/imap/ssl/novalidate-cert}%s", $host, $folder);
    //$auth = sprintf("{%s/imap/ssl}%s", $host, $folder);
    $this->_socket = @imap_open($auth, $username, $password);
    if ( ($errors = imap_errors()) !== false ) {
      $this->_errors = $errors;
    }
  }

  public function __destruct() {
    if ( $this->_socket ) {
      imap_errors(); // To supress WARNINGs
      imap_close($this->_socket);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance of IMAP
   *
   * @return IMAP
   */
  public final static function create($host, $username, $password, $folder = "INBOX") {
    if ( !function_exists("imap_open") ) {
      throw new Exception("IMAP Is not enabled/supported");
    }

    return new IMAP($host, $username, $password, $folder);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  public function read($id) {
    return IMAPMail::create($this->_socket, $id);
  }

  public function send() {
    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

  public function getMailboxes() {
    $result = Array();

    if ( $this->_socket ) {
      $conn = "{{$this->_host}}";
      /*
      if ( $list = imap_listmailbox($this->_socket, $conn, "*") ) {
        $result = $list;
      }
       */

      $list = imap_getmailboxes($this->_socket, $conn, "*");
      if (is_array($list)) {
        foreach ($list as $key => $val) {
          $result[$key] = Array(
            "name"        => str_replace($conn, "", imap_utf7_decode($val->name)),
            "delimiter"   => $val->delimiter,
            "attributes"  => $val->attributes
          );
        }
      } else {
        throw new Exception("imap_getmailboxes failed: " . imap_last_error());
      }
    }

    return $result;
  }

  public function getMessageHeaders() {
    $result = Array();
    if ( $con = $this->_socket ) {
      if ( $headers = imap_headers($con) ) {
        foreach ( $headers as $h ) {

          if ( !preg_match("/^([A-z\s]+)?(\d+)\)\s+(\d+\-\w+\-\d+) (.*)\s+\((\d+) chars\)$/", trim($h), $matches) ) {
            $matches = Array();
          }
          /*
          var_dump($h);
          var_dump($matches);
          break;
           */

          if ( sizeof($matches) >= 5 ) {
            $result[] = Array(
              "header"  => $h,
              "flags"   => explode(" ", $matches[1]),
              "id"      => $matches[2],
              "date"    => $matches[3],
              "sender"  => null,
              "subject" => $matches[4],
              "chars"   => $matches[5]
            );
          }
        }
      }
    }

    return $result;
  }

  public function getMessages($filter = 'ALL', $body = false) {
    $result = Array();
    if ( $inbox = $this->_socket ) {
      if ( $emails = imap_search($inbox, $filter) ) {
        rsort($emails);
        foreach ( $emails as $email_number ) {
          $overview = imap_fetch_overview($inbox,$email_number,0);
          $message  = $body ? imap_fetchbody($inbox,$email_number,2) : null;

          try {
            $timestamp = new DateTime($overview[0]->date);
            $date = $timestamp->format("Y/m/d h:i:s");
          } catch ( Exception $e ) {
            $date = $overview[0]->date;
          }

          $result[] = Array(
            "id"      => $overview[0]->message_id,
            "status"  => $overview[0]->seen ? "read" : "unread",
            "subject" => $overview[0]->subject,
            "from"    => $overview[0]->from,
            "date"    => $date,
            "body"    => $message ? $message : null
          );
        }
      }
    }
    return $result;
  }

  public function getFolder() {
    return $this->_folder;
  }

  public function getErrors() {
    return $this->_errors;
  }

}

?>
