<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains IMAP Classes and Functions
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
 * @created 2011-06-04
 */

/*
Outgoing Mail (SMTP) Server (requires TLS)
 - smtp.gmail.com
 - Use Authentication: Yes
 - Use STARTTLS: Yes (some clients call this SSL)
 - Port: 465 or 587
Account Name:   your full email address (including @gmail.com)
Email Address:  your email address (username@gmail.com)
Password:     your Gmail password
*/

/**
 * IMAPMail -- An IMAP/SMTP Mail Message
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class IMAPMail
{

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  private $_sFrom         = "";         //!< FROM user
  private $_sTo           = "";         //!< TO user
  private $_sSubject      = "";         //!< Message subject
  private $_sBodyPlain    = "";         //!< text/plain data
  private $_sBodyHTML     = "";         //!< text/html data
  private $_aAttachments  = Array();    //!< Attachments if any
  private $_sCharset      = "";         //!< Charset of message

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   * @param   String    $from     From X
   * @param   String    $to       To Y
   * @param   String    $subject  Message subject
   * @constructor
   */
  public function __construct($from, $to, $subject) {
    $this->_sFrom         = $from;
    $this->_sTo           = $to;
    $this->_sSubject      = $subject;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Set the message contents
   * @param   String      $plain      The text/plain body
   * @param   String      $html       The text/html body
   * @return  void
   */
  public function setBody($plain = null, $html = null) {
    if ( $plain )
      $this->_sBodyPlain = $plain;
    if ( $html )
      $this->_sBodyHTML  = $html;
  }

  /**
   * Set the message attachments
   * @param   Array       $a        Attachments array
   * @return  void
   */
  public function setAttachments(Array $a = Array()) {
    $this->_aAttachments = $a;
  }

  /**
   * Get Mail properties as an Array
   * @return Array
   */
  public function getArray() {
    return Array(
      "from"        => $this->_sFrom,
      "to"          => $this->_sTo,
      "subject"     => $this->_sSubject,
      "plain"       => $this->_sBodyPlain,
      "html"        => $this->_sBodyHTML,
      "charset"     => $this->_sCharset,
      "attachments" => $this->_aAttachments
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Parse mail contents (recursively) according to standards
   * @return void
   */
  protected function parse($mbox, $mid, $part, $pid) {
    $data = null;

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

      $this->_aAttachments[$filename] = $data;
    } else if ( $part->type == 0 && $data ) {
      if ( strtolower($part->subtype) == "plain" ) { // Message
        $this->_sBodyPlain .= trim($data) . "\n\n";
      } else {
        $this->_sBodyHTML  .= $data . "<br><br>";
      }

      $this->_sCharset = $params['charset'];
    } else if ( $part->type == 2 && $data ) { // Embedded
      $this->_sBodyPlain .= trim($data) . "\n\n";
    }

    // Subpart recursion
    if ( isset($part->parts) ) {
      foreach ( $part->parts as $pno => $pval ) {
        $this->parse($mbox, $mid, $pval, ($pid . "." . ($pval + 1)));
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Load a mail from given inbox and return contents
   * @return Array
   */
  public static function load($mbox, $mid) {
    $mail   = new self(null, null, null);
    $result = false;

    if ( $s = imap_fetchstructure($mbox, $mid) ) {
      $result  = Array();
      if ( isset($s->parts) && $s->parts ) { // Multipart
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

  /**
   * Helper function for constructing a new message from a Tuple
   * @param   Array     $args         Message elements tuple
   * @return  Mixed
   */
  public static function compose(Array $args) {
    $from     = isset($args['from'])    ? $args['from']     : "";
    $to       = isset($args['to'])      ? $args['to']       : "";
    $subject  = isset($args['subject']) ? $args['subject']  : "";
    $plain    = isset($args['plain'])   ? $args['plain']    : "";
    $html     = isset($args['html'])    ? $args['html']     : "";

    if ( $from && $to ) {
      $i = new self($from, $to, $subject);
      $i->setBody($plain, $html);
      if ( isset($args['attachments']) && (is_array($args['attachments'])) ) {
        $i->setAttachments($args['attachments']);
      }
      return $i;
    }

    return false;
  }

}

/**
 * SMTP -- An SMTP Sending Library
 *
 * Depends on PEAR mailing packages
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
class SMTP
{

  /**
   * Send a message
   *
   * Required PEAR mail functions
   *
   * @param   IMAPMail    $m        Message to send
   * @param   Array       $config   Connection information tuple
   * @param   Array       $headers  Extra headers to send
   *
   * @throws  Exception
   * @throws  Error       When PEAR libs are not found
   * @return  Mixed
   */
  public static function send(IMAPMail $m, $config, Array $headers = Array()) {
    require_once "Mail.php"; // PEAR Package
    require_once "Mail/mime.php"; // PEAR Package

    if ( preg_match("/^(.*)\:\/\//", $config['host']) ) {
      $tmp = explode(":", $config['host']);
      $host = "{$tmp[0]}:{$tmp[1]}";
      $port = $tmp[2];
    } else {
      list($host, $port) = explode(":", $config['host']);
    }

    $a    = $m->getArray();
    $mime = @new Mail_mime("\n");
    $mime->setTXTBody($a['plain']);
    $mime->setHTMLBody($a['html']);
    if ( isset($a['attachments']) ) {
      foreach ( $a['attachments'] as $att ) {
        $mime->addAttachment($att['file'], $att['mime']);
      }
    }

    $smtp_headers = array(
      "From"      => $a['from'],
      "Reply-To"  => $a['from'],
      "To"        => $a['to'],
      "Subject"   => $a['subject']
    );

    foreach ( $mime->headers($headers) as $k => $v ) {
      $smtp_headers[$k] = $v;
    }

    foreach ( $headers as $k => $v ) {
      $smtp_headers[$k] = $v;
    }

    $smtp = @Mail::factory('smtp', Array(
      'host'     => $host,
      'port'     => $port,
      'username' => $config['username'],
      'password' => $config['password'],
      'auth'     => true
    ));

    if ( $smtp ) {
      if ( $mail = @$smtp->send($a['to'], $smtp_headers, $mime->get()) ) {
        return true;
      }
    }

    return true;
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

  protected $_host;       //!< Host string
  protected $_socket;     //!< Connection resource
  protected $_folder;     //!< Current folder
  protected $_config;     //!< Current configuration parameters

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance
   *
   * If no foder is given, no connection is established
   *
   * @param   String      $host         Hostname connection string
   * @param   String      $username     Auth username
   * @param   String      $password     Auth password
   * @param   String      $folder       Folder lookup
   *
   * @param   Resource    $socket       Connection (If any)
   *
   * @throws  Exception
   * @constructor
   */
  protected function __construct($host, $username, $password, $folder) {
    $socket = null;
    $hostname = null;

    if ( $folder ) {
      $socket = @imap_open("{$host}{$folder}", $username, $password);
      if ( ($errors = imap_errors()) !== false ) {
        foreach ( $errors as $err ) {
          throw new Exception($err);
        }
      }

      $this->_socket  = $socket;
    }

    if ( preg_match("/\{(.*)\:(\d+)(.*)\}/", $host, $m) ) {
      $hostname = $m[1];
    }

    $this->_host    = $hostname;
    $this->_folder  = $folder;
    $this->_config  = Array(
      "host"      => $host,
      "username"  => $username,
      "password"  => $password,
      "folder"    => $folder
    );
  }

  /**
   * @destructor
   */
  public function __destruct() {
    if ( $this->_socket ) {
      @imap_expunge($this->_socket);
      @imap_errors(); // To supress WARNINGs
      imap_close($this->_socket);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Create a new instance of IMAP
   *
   * @throws  Exception
   * @return  IMAP
   */
  public final static function create($host, $username, $password, $folder = "") {
    if ( !function_exists("imap_open") ) {
      throw new Exception("IMAP Is not enabled/supported");
    }

    return new IMAP($host, $username, $password, $folder);
  }

  /////////////////////////////////////////////////////////////////////////////
  // CLASS METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Read a message by ID
   * @param   Mixed       $id       Unique ID
   * @return  IMAPMail
   */
  public function read($id) {
    return IMAPMail::load($this->_socket, $id);
  }

  /**
   * Delete a message by ID
   * @return  bool
   */
  public function deleteMessage($id) {
    if ( $inbox = $this->_socket ) {
      if ( imap_delete($inbox, $id, ST_UID) ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set message "Seen" status by ID
   * @return  bool
   */
  public function toggleMessageRead($id, $state) {
    if ( $inbox = $this->_socket ) {
      $flag = $state ? '\\Seen' : '\\Unseen';
      if ( imap_setflag_full($inbox, "$id:$id", $flag, ST_UID) ) {
        return true;
      }
    }
    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GET
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Enumerate and return message boxes (folders)
   *
   * @throws  Exception
   * @return  Array
   */
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

  /**
   * Enumerate and return a list of messages in a folder
   *
   * @param   String    $filter       Listing filtering string
   * @param   bool      $body         Also fetch the bodies (SLOW)
   * @return  Array
   */
  public function getMessages($filter = 'ALL', $body = false) {
    $result = Array();
    if ( $inbox = $this->_socket ) {
      $mc = imap_check($inbox);

      if ( $filter !== 'ALL' ) {
        $max = (int) $filter;
        $filter = null;

        if ( $max > 0 ) {
          if ( $max < ((int)$mc->Nmsgs) ) {
            $filter = "{$max}:{$mc->Nmsgs}";
          } else {
            return Array();
          }
        }
      }

      if ( $filter == null ) {
        $filter = "1:{$mc->Nmsgs}";
      }

      if ( $emails = imap_fetch_overview($inbox, $filter, 0) ) {
        foreach ( $emails as $overview ) {
          try {
            $timestamp = new DateTime($overview->date);
            $date = $timestamp->format("Y/m/d h:i:s");
          } catch ( Exception $e ) {
            $date = $overview->date;
          }

          $message  = $body ? imap_fetchbody($inbox, $overview->message_id, 2) : null;
          $result[] = Array(
            "id"      => $overview->message_id,
            "uid"     => $overview->uid,
            "msgno"   => $overview->msgno,
            "status"  => $overview->seen ? "read" : "unread",
            "subject" => isset($overview->subject) ? $overview->subject : "",
            "sender"  => $overview->from,
            "size"    => $overview->size,
            "date"    => $date,
            "body"    => $message ? $message : null,
            "flags"   => Array(
              "recent"    => $overview->recent,
              "flagged"   => $overview->flagged,
              "answered"  => $overview->answered,
              "deleted"   => $overview->deleted,
              "seen"      => $overview->seen,
              "draft"     => $overview->draft
            )
          );
        }
      }
    }

    return $result;
  }

  /**
   * Get the current folder
   * @return  String
   */
  public function getFolder() {
    return $this->_folder;
  }

}

?>
