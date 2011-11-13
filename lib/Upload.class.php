<?php
/*!
 * @file
 * Upload.class.php
 *
 * This class requires PHP 5.4+
 *
 * @link    http://no2.php.net/manual/en/session.upload-progress.php
 * @link    http://no2.php.net/manual/en/features.file-upload.post-method.php
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-13
 */

/**
 * Upload -- XHR File Upload Library
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
abstract class Upload
{

  /**
   * Upload a file
   * @param   Array     $file       $_FILES[item] array
   * @param   String    $dest       Destination path
   * @return  bool
   */
  public final static function uploadFile($file, $dest) {
    return move_uploaded_file($file["tmp_name"], $dest);
  }

  /**
   * Get the XHR session key
   * @return String
   */
  protected final static function getKey() {
    return ini_get("session.upload_progress.prefix") . "OSjs"; //ini_get("session.upload-progress.name");
  }

  /**
   * Get XHR upload status
   * @return Array
   */
  public final static function getStatus() {
    $key = self::getKey();
    return isset($_SESSION[$key]) ? $_SESSION[$key] : false;
  }

  /**
   * Cancel Upload
   * @param   String    $key      Custom key (defaults to internal ('OSjs'))
   * @return  bool
   */
  public final static function cancelUpload($key = null) {
    if ( !$key ) {
      $key = self::getKey();
    }

    if ( isset($_SESSION[$key]) ) {
      $_SESSION[$key]["cancel_upload"] = true;
      return true;
    }

    return false;
  }

  /**
   * Crate upload Form
   * @param   String    $value      The custom key (defaults to 'OSjs')
   * @return  String
   */
  public final static function createForm($value = null) {
    $session = ini_get("session.upload_progress.name");
    $value   = $value ? $value : "OSjs";

    return <<<EOHTML
<div style="position:relative;margin-top:10px;">
  <iframe name="Upload" src="about:blank" width="100" height="20" frameborder="0" style="margin:0;padding:0;border:0 none;background:#000;display:none;"></iframe>
  <form action="/upload.php" method="post" enctype="multipart/form-data" target="Upload" class="FileForm">
    <input type="hidden" name="{$session}" value="{$value}" />
    <div class="file">
      <input type="file" name="upload" />
    </div>
    <div class="button" style="display:block;position:absolute;bottom:-40px;left:0px;">
      <input type="submit" name="upload" value="Upload"/>
    </div>
  </form>
  <form action="/upload.php" method="post" enctype="multipart/form-data" target="Upload" class="CancelForm">
    <input type="hidden" name="action" value="upload_cancel" />
    <div class="button" style="display:block;position:absolute;bottom:-40px;left:65px;">
      <input type="submit" name="upload" value="Cancel" />
    </div>
  </form>
</div>
EOHTML;
  }
}

?>
