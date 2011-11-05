<?php

require "header.php";


$total_before = 0;
$total_after = 0;

function compress_list($resource, $files) {
  global $total_before;
  global $total_after;

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
    $size = 0;
    $comp = 0;
    $perc = 0;
    if ( !($content = shell_exec($exec)) ) {
      $content = "/* FAILED TO GET CONTENTS */";
    } else {
      $size    = filesize($path);
      $comp    = strlen($content);

      if ( $size && $comp ) {
        $perc = round(($comp / $size) * 100);
      }

      $total_before += $size;
      $total_after  += $comp;
    }

    $label = "Minimized {$file}";
    $spaces = str_pad("", (40 - strlen($label)));
    print sprintf("%s%s ($size => $comp, $perc%%)\n", $label, $spaces);

    // Write cached file
    $out_path = ($resource ? PATH_RESOURCES_COMPRESSED : PATH_JSBASE_COMPRESSED) . "/{$file}";
    file_put_contents($out_path, $content);
  }
}

compress_list(true, Array(
  "app.archiver.js",
  "app.archiver.css",
  "app.arkanoid.js",
  "app.arkanoid.css",
  "app.clock.js",
  "app.clock.css",
  "app.draw.js",
  "app.draw.css",
  "app.filemanager.js",
  "app.filemanager.css",
  "app.irc.js",
  "app.irc.css",
  "app.musicplayer.js",
  "app.musicplayer.css",
  "app.terminal.js",
  "app.terminal.css",
  "app.textpad.js",
  "app.textpad.css",
  "app.ticktacktoe.js",
  "app.ticktacktoe.css",
  "app.videoplayer.js",
  "app.videoplayer.css",
  "app.viewer.js",
  "app.viewer.css",
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
  "sys.about.css",
  "sys.logout.js",
  "sys.logout.css",
  "sys.processes.js",
  "sys.processes.css",
  "sys.settings.js",
  "sys.settings.css",
  "sys.user.js",
  "sys.user.css"
));

compress_list(false, Array(
  "init.js",
  "core.js",
  "main.js"
));

$perc = 0;
if ( $total_before && $total_after ) {
  $perc = round(($total_after / $total_before) * 100);
}

print "\nCompressed {$total_before} into {$total_after} ({$perc}% compression)\n";

?>
