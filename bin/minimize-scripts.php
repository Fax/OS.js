<?php

require "header.php";

function compress_list($resource, $files) {
  foreach ( $files as $file ) {
    // Build command
    $type = preg_match("/\.js$/", $file) ? "js" : "css";
    $path = ($resource ? PATH_RESOURCES : PATH_JSBASE) . "/{$file}";
    $cmd  = PATH_PROJECT_BIN . "/yui.sh";
    $cmd  = sprintf("%s/yui.sh %s/yuicompressor-2.4.6.jar", PATH_PROJECT_BIN, PATH_PROJECT_VENDOR);

    $args = "--preserve-semi ";
    if ( $type == "js" ) {
      $args .= sprintf("--type js --charset UTF-8 %s", escapeshellarg($path));
    } else {
      $args .= sprintf("--type css --charset UTF-8 %s", escapeshellarg($path));
    }

    // Run command
    $exec = sprintf("%s %s 2>&1", $cmd, $args);
    if ( !($content = shell_exec($exec)) ) {
      $content = "/* FAILED TO GET CONTENTS */";
    }

    print "Minimizing {$file}\n";

    // Write cached file
    $out_path = ($resource ? PATH_RESOURCES_COMPRESSED : PATH_JSBASE_COMPRESSED) . "/{$file}";
    file_put_contents($out_path, $content);
  }
}

compress_list(true, Array(
  "app.archiver.js",
  "app.arkanoid.js",
  "app.clock.js",
  "app.draw.js",
  "app.filemanager.js",
  "app.irc.js",
  "app.musicplayer.js",
  "app.terminal.js",
  "app.textpad.js",
  "app.ticktacktoe.js",
  "app.videoplayer.js",
  "app.viewer.js",
  "dialog.color.js",
  "dialog.copy.js",
  "dialog.file.js",
  "dialog.launch.js",
  "dialog.panel.js",
  "dialog.rename.js",
  "dialog.upload.js",
  "panel.clock.js",
  "panel.dock.js",
  "panel.menu.js",
  "panel.separator.js",
  "panel.weather.js",
  "panel.windowlist.js",
  "sys.about.js",
  "sys.logout.js",
  "sys.processes.js",
  "sys.settings.js",
  "sys.user.js",

  "app.archiver.css",
  "app.arkanoid.css",
  "app.clock.css",
  "app.draw.css",
  "app.filemanager.css",
  "app.irc.css",
  "app.musicplayer.css",
  "app.terminal.css",
  "app.textpad.css",
  "app.ticktacktoe.css",
  "app.videoplayer.css",
  "app.viewer.css",
  "dialog.color.css",
  "dialog.copy.css",
  "dialog.file.css",
  "dialog.launch.css",
  "dialog.panel.css",
  "dialog.rename.css",
  "dialog.upload.css",
  "panel.clock.css",
  "panel.dock.css",
  "panel.menu.css",
  "panel.separator.css",
  "panel.weather.css",
  "panel.windowlist.css",
  "sys.about.css",
  "sys.logout.css",
  "sys.processes.css",
  "sys.settings.css",
  "sys.user.css"
));

compress_list(false, Array(
  "init.js",
  "core.js",
  "main.js"
));

?>
