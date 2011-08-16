<?php
/*!
 * @file
 * Contains ApplicationVFSArchive Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-08-16
 */

/**
 * Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
abstract class Archive
{

  const TYPE_ZIP  = 1;
  const TYPE_BZIP = 2;
  const TYPE_RAR  = 3;
  const TYPE_ZLIB = 4;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_iType        = -1;
  protected $_sFilename    = "";
  protected $_sArchiveType = "";

  protected static $_ArchiveTypes = Array(
    self::TYPE_ZIP  => Array("zip"),
    self::TYPE_BZIP => Array("bz2", "bzip", "bz"),
    self::TYPE_RAR  => Array("rar", "r"),
    self::TYPE_ZLIB => Array("gz", "gzip")
  );

  protected static $_ArchiveNames = Array(
    self::TYPE_ZIP  => "ZIP Archive",
    self::TYPE_BZIP => "Bzip2 Archive",
    self::TYPE_RAR  => "RAR Archive",
    self::TYPE_ZLIB => "Gzip Archive"
  );

  protected static $_ArchiveClasses = Array(
    self::TYPE_ZIP  => "Zip",
    self::TYPE_BZIP => "Bzip",
    self::TYPE_RAR  => "Rar",
    self::TYPE_ZLIB => "Gzip"
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  protected function __construct($filename, $type) {
    $this->_iType         = (int) $type;
    $this->_sFilename     = $filename;
    $this->_sArchiveType  = self::$_ArchiveNames[$type];
  }

  public function __destruct() {
  }

  /////////////////////////////////////////////////////////////////////////////
  // VIRTUAL METHODS
  /////////////////////////////////////////////////////////////////////////////

  public function compress($src) {
    throw new Exception(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  public function decompress($dst) {
    throw new Exception(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  public function read() {
    throw new Exception(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  public final static function open($filename) {
    $instance = null;

    if ( !file_exists($filename) || !is_file($filename) ) {
      throw new Exception("Failed to open '$filename'!");
    }

    if ( ($type = self::_checkType($filename) ) ) {
      if ( in_array($type, array_keys(self::$_ArchiveTypes)) ) {
        $cname = "Archive" . self::$_ArchiveClasses[$type];
        if ( class_exists($cname) ) {
          return new $cname($filename, $type);
        }
      }
    }

    throw new Exception("The file '$filename' is not a valid archive!");
  }

  public final static function create($filename) {
    if ( file_exists($filename) || is_file($filename) ) {
      throw new Exception("File '$filename' already exists!");
    }

    if ( ($type = self::_checkType($filename) ) ) {
      if ( in_array($type, array_keys(self::$_ArchiveTypes)) ) {
        $cname = "Archive" . self::$_ArchiveClasses[$type];
        if ( class_exists($cname) ) {
          return new $cname($filename, $type);
        }
      }
    }

    throw new Exception("Failed to create archive '$filename'!");
  }

  protected final static function _checkType($src, $ctype = -1) {

    // Find MIME
    if ( file_exists($src) && is_file($src) ) {
      $finfo = finfo_open(FILEINFO_MIME);
      $mime  = explode("; charset=", finfo_file($finfo, $src));
      $mime  = trim(reset($mime));
      finfo_close($finfo);

      // Check for type
      switch ( $mime ) {
        case "application/x-rar"   :
          $type = self::TYPE_RAR;
        break;
        case "application/x-gzip"  :
          $type = self::TYPE_ZLIB;
        break;
        case "application/x-bzip2" :
          $type = self::TYPE_BZIP;
        break;
        /*
        case "application/octet-stream" :
          $type = self::TYPE_ZIP;
          break;
        */


        // Fall back to file extension
        default :
          $type = -1;
        break;
      }
    }

    if ( $type <= 0 ) {
      $bsrc = basename(strtolower($src));
      $expl = explode(".", $bsrc);
      $ext  = end($expl);

      foreach ( self::$_ArchiveTypes as $tid => $exts ) {
        if ( in_array($ext, $exts) ) {
          $type = $tid;
          break;
        }
      }
    }

    return ($ctype > 0) ? ($ctype == $type) : ($type);
  }

}

///////////////////////////////////////////////////////////////////////////////
//                            ARCHIVE TYPES                                  //
///////////////////////////////////////////////////////////////////////////////

/**
 * ArchiveZip Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
class ArchiveZip
  extends Archive
{

  public function read() {
    $list = Array();

    if ( $res = zip_open($this->_sFilename) ) {
      while ( $f = zip_read($res) ) {
        $name = zip_entry_name($f);
        $size = zip_entry_filesize($f);
        $comp = zip_entry_compressedsize($f);
        $meth = zip_entry_compressionmethod($f);

        $list[] = Array(
          "name"      => $name,
          "size_real" => $size,
          "size_comp" => $comp,
          "method"    => $meth
        );
      }

      zip_close($res);
    }

    return $list;
  }

}


/**
 * ArchiveRar Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
class ArchiveRar
  extends Archive
{

  public function read() {
    $list = Array();

    if ( $res = rar_open($this->_sFilename) ) {
      if ( $entries = rar_list($res) ) {
        foreach ( $entries as $f ) {
          $name = $f->getName();
          $size = $f->getUnpackedSize();
          $comp = $f->getPackedSize();
          $meth = "N/A";

          $list[] = Array(
            "name"      => $name,
            "size_real" => $size,
            "size_comp" => $comp,
            "method"    => $meth
          );
        }
      }

      rar_close($res);
    }

    return $list;
  }
}

/**
 * ArchiveBzip Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
class ArchiveBzip
  extends Archive
{

  public function compress($src) {
    if ( $fp = fopen($src, "r") ) {
      // Read source file
      $data = fread ($fp, filesize($src));
      fclose($fp);

      // Compress to restination
      if ( $zp = bzopen($this->_sFilename, "w") ) {
        bzwrite($zp, $data);
        bzclose($zp);

        return true;
      }
    }

    return false;
  }

  public function decompress($dst) {
    $string = "";
    $buffer = 4096;

    // Read source file
    if ( $zp = bzopen($this->_sFilename, "r") ) {
      while ( !bzeof($zp) ) {
        $string .= bzread($zp, $buffer);
      }
      bzclose($zp);

      // Write to destination
      if ( $fp = fopen($dst, "w") ) {
        fwrite($fp, $string, strlen($string));
        fclose($fp);

        return true;
      }
    }

    return false;
  }
}

/**
 * ArchiveBzip Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OS.js
 * @class
 */
class ArchiveGzip
  extends Archive
{

  public function compress($src) {
    $level = 9;

    if ( $fp = fopen($src, "r") ) {
      // Read source file
      $data = fread ($fp, filesize($src));
      fclose($fp);

      // Compress to restination
      if ( $zp = gzopen($this->_sFilename, "w{$level}") ) {
        gzwrite($zp, $data);
        gzclose($zp);

        return true;
      }
    }

    return false;
  }

  public function decompress($dst) {
    $string = "";
    $buffer = 4096;

    // Read source file
    if ( $zp = gzopen($this->_sFilename, "r") ) {
      while ( !gzeof($zp) ) {
        $string .= gzread($zp, $buffer);
      }
      gzclose($zp);

      // Write to destination
      if ( $fp = fopen($dst, "w") ) {
        fwrite($fp, $string, strlen($string));
        fclose($fp);

        return true;
      }
    }

    return false;
  }
}

?>
