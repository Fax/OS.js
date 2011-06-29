<?php
/*!
 * @file
 * Contains IMAP Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-04
 */

/**
 * IMAP Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package MyApplication
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

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   */
  protected function __construct($host, $username, $password, $folder) {
    $this->_host = $host;
    $this->_folder = $folder;

    if ( !$this->_socket ) {
      $this->_socket = imap_open(sprintf("{%s}%s", $host, $folder), $username, $password);
    }
  }

  public function __destruct() {
    if ( $this->_socket ) {
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
    return new IMAP($host, $username, $password, $folder);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

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

  public function getMessages($filter = 'ALL', $body = true) {
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

}

?>
