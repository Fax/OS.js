<?php
/*!
 * @file
 * help.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-19
 */

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!--
  JavaScript Window Manager

  @package ajwm.Help
  @author  Anders Evenrud <andersevenrud@gmail.com>
  -->
  <title>Help | Another JSWM</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

</head>
<body>

  <div style="font-family:Monospace;white-space:pre;">
<?php print htmlspecialchars(file_get_contents("../README")); ?>
  </div>

  <hr />

  <p>
    Created by Anders Evenrud &lt;<a href="mailto:andersevenrud@gmail.com">andersevenrud@gmail.com</a>&gt;
  </p>
</body>
</html>
