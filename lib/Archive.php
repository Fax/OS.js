<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains ApplicationVFSArchive Class
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
 * @created 2011-08-16
 */

/**
 * Archive -- Compressed Archive Base Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries
 * @class
 */
abstract class Archive
{

  /**
   * Archive types
   */
  const TYPE_ZIP  = 1;
  const TYPE_BZIP = 2;
  const TYPE_RAR  = 3;
  const TYPE_ZLIB = 4;
  const TYPE_TAR  = 5;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_iType        = -1;    //!< Archive type
  protected $_sFilename    = "";    //!< Archive filename
  protected $_sArchiveType = "";    //!< Archive type description

  protected static $_ArchiveExtensions = Array(     //!< Archive filename ext.
    self::TYPE_ZIP  => Array("zip"),
    self::TYPE_BZIP => Array("bz2", "bzip", "bz"),
    self::TYPE_RAR  => Array("rar"),
    self::TYPE_ZLIB => Array("gz", "gzip"),
    self::TYPE_TAR  => Array("tar")
  );

  protected static $_ArchiveNames = Array(          //!< Archive descriptions
    self::TYPE_ZIP  => "ZIP Archive",
    self::TYPE_BZIP => "Bzip2 Archive",
    self::TYPE_RAR  => "RAR Archive",
    self::TYPE_ZLIB => "Gzip Archive",
    self::TYPE_TAR  => "TAR Archive"
  );

  protected static $_ArchiveClasses = Array(        //!< Archive class mapping
    self::TYPE_ZIP  => "Zip",
    self::TYPE_BZIP => "Bzip",
    self::TYPE_RAR  => "Rar",
    self::TYPE_ZLIB => "Gzip",
    self::TYPE_TAR  => "TAR"
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @param String    $filename     Archive filename
   * @param int       $type         Archive type
   * @constructor
   */
  protected function __construct($filename, $type) {
    $this->_iType         = (int) $type;
    $this->_sFilename     = $filename;
    $this->_sArchiveType  = self::$_ArchiveNames[$type];
  }

  /**
   * @destructor
   */
  public function __destruct() {
  }

  /////////////////////////////////////////////////////////////////////////////
  // VIRTUAL METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Compress archive
   * @throws Exception
   * @return void
   */
  public function compress($src) {
    throw new ArchiveException(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  /**
   * Decompress archive
   * @throws Exception
   * @return void
   */
  public function decompress($dst) {
    throw new ArchiveException(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  /**
   * Read/List archive
   * @throws Exception
   * @return void
   */
  public function read() {
    throw new ArchiveException(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  /**
   * Extract archive
   * @throws Exception
   * @return void
   */
  public function extract($dest) {
    throw new ArchiveException(sprintf("%s does not support '%s()'", get_class($this), __METHOD__));
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Open Archive
   * @param  String     $filename     Archive filename
   * @return [Archive]
   */
  public final static function open($filename) {
    $instance = null;

    if ( !file_exists($filename) || !is_file($filename) ) {
      throw new ArchiveException("Failed to open '$filename'!");
    }

    if ( ($type = self::_checkType($filename) ) ) {
      if ( in_array($type, array_keys(self::$_ArchiveExtensions)) ) {
        $cname = "Archive" . self::$_ArchiveClasses[$type];
        if ( class_exists($cname) ) {
          return new $cname($filename, $type);
        }
      }
    }

    throw new ArchiveException("The file '$filename' is not a valid archive!");
  }

  /**
   * Create Archive
   * @param  String     $filename     Archive filename
   * @return [Archive]
   */
  public final static function create($filename) {
    if ( file_exists($filename) || is_file($filename) ) {
      throw new ArchiveException("File '$filename' already exists!");
    }

    if ( ($type = self::_checkType($filename) ) ) {
      if ( in_array($type, array_keys(self::$_ArchiveExtensions)) ) {
        $cname = "Archive" . self::$_ArchiveClasses[$type];
        if ( class_exists($cname) ) {
          return new $cname($filename, $type);
        }
      }
    }

    throw new ArchiveException("Failed to create archive '$filename'!");
  }

  /**
   * Check type by mime (fallback to extension)
   * @param   String    $src        Source file
   * @param   int       $ctype      Set type (static, default -1)
   * @return  int
   */
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
        case "application/x-tar" :
          $type = self::TYPE_TAR;
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

      foreach ( self::$_ArchiveExtensions as $tid => $exts ) {
        if ( in_array($ext, $exts) ) {
          $type = $tid;
          break;
        }
      }
    }

    return ($ctype > 0) ? ($ctype == $type) : ($type);
  }

}

/**
 * ArchiveException -- Archive Exception Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @see     Exception
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveException
  extends Exception {}

///////////////////////////////////////////////////////////////////////////////
//                            ARCHIVE TYPES                                  //
///////////////////////////////////////////////////////////////////////////////

/**
 * ArchiveZip -- ZIP Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveZip
  extends Archive
{

  /**
   * @see Archive::extract()
   */
  public final function extract($dest) {
    return false;
  }

  /**
   * @see Archive::read()
   */
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
 * ArchiveRar -- RAR Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveRar
  extends Archive
{

  /**
   * @see Archive::extract()
   */
  public final function extract($dest) {
    return false;
  }

  /**
   * @see Archive::read()
   */
  public final function read() {
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
 * ArchiveTar -- tar Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveTar
  extends Archive
{

  /**
   * @see Archive::extract()
   */
  public final function extract($dest) {
    return false;
  }

  /**
   * @see Archive::read()
   */
  public final function read() {
    $list = Array();

    return $list;
  }
}

/**
 * ArchiveBzip -- bzip/bzip2 Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveBzip
  extends Archive
{

  /**
   * @see Archive::compress()
   */
  public final function compress($src) {
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

  /**
   * @see Archive::decompress()
   */
  public final function decompress($dst) {
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
 * ArchiveBzip -- gzip Archive Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Libraries.Archive
 * @class
 */
class ArchiveGzip
  extends Archive
{

  /**
   * @see Archive::compress()
   */
  public final function compress($src) {
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

  /**
   * @see Archive::decompress()
   */
  public final function decompress($dst) {
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
