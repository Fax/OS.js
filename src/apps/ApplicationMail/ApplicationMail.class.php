<?php
/*!
 * @file
 * Contains ApplicationMail Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-05-23
 */

/**
 * ApplicationMail Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Applications
 * @class
 */
class ApplicationMail
  extends Application
{

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

  public static function Event($uuid, $action, Array $args) {
    $result = false;

    if ( !class_exists("IMAP") ) {
      require PATH_PROJECT_LIB . "/IMAP.php";
    }

    $host     = "";
    $username = "";
    $password = "";
    if ( isset($args['account']) ) {
      $host       = $args['account']['host'];
      $username   = $args['account']['username'];
      $password   = $args['account']['password'];
    }

    $folder   = isset($args['folder']) ? $args['folder'] : "INBOX";

    try {
      if ( $imap = IMAP::create($host, $username, $password, $folder) ) {
        if ( $action == "account" ) {
          if ( $boxes = $imap->getMailboxes() ) {
            $result = Array();
            foreach ( $boxes as $box ) {
              $result[] = Array(
                "name"        => htmlspecialchars($box['name']),
                "delimiter"   => htmlspecialchars($box['delimiter']),
                "attributes"  => htmlspecialchars($box['attributes'])
              );
            }
          }
        } else if ( $action == "folder" ) {
          if ( $messages = $imap->getMessageHeaders() ) {
            $result = Array();
            foreach ( $messages as $msg ) {
              $result[] = Array(
                "id"      => $msg['id'],
                "date"    => $msg['date'],
                "header"  => htmlspecialchars($msg['header']),
                "sender"  => htmlspecialchars($msg['sender']),
                "subject" => htmlspecialchars($msg['subject']),
              );
            }
          }
        } else if ( ($action == "read") && isset($args['id']) ) {
          $result = $imap->read($args['id']);
        } else if ( $action == "send" ) {
          $result = $imap->send();
        }
      }


      /*
      print "Trying to '$action'\n\n";
      print "Errors: ";
      var_dump($imap->getErrors());
      print "Result: ";
      var_dump($result);
      print "\n";
       */
    } catch ( Exception $e ) {
      $result = $e->getMessage();
    }

    return $result;
  }

}

?>
