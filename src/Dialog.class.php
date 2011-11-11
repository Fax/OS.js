<?php
/*!
 * @file
 * Dialog.class.php -- OS.js Dialog Window Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-11-09
 */

/**
 * Panel -- OS.js Dialog Window Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.WindowManager
 * @class
 */
abstract class Dialog
{

  /**
   * @var Registered Dialogs
   */
  public static $Registered = Array(
    "ColorOperationDialog" => Array(
      "resources" => Array("dialog.color.js")
    ),
    "CopyOperationDialog" => Array(
      "resources" => Array("dialog.copy.js")
    ),
    "FileOperationDialog" => Array(
      "resources" => Array("dialog.file.js")
    ),
    "InputOperationDialog" => Array(
      "resources" => Array("dialog.input.js")
    ),
    "LaunchOperationDialog" => Array(
      "resources" => Array("dialog.launch.js")
    ),
    "PanelItemOperationDialog" => Array(
      "resources" => Array("dialog.panel.js")
    ),
    "RenameOperationDialog" => Array(
      "resources" => Array("dialog.rename.js")
    ),
    "UploadOperationDialog" => Array(
      "resources" => Array("dialog.upload.js")
    ),
    "CompabilityDialog" => Array(
      "resources" => Array("dialog.compability.js")
    ),
    "CrashDialog" => Array(
      "resources" => Array("dialog.crash.js")
    )
  );

}

?>
