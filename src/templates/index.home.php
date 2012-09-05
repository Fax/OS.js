<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - index.home.php
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
 * @package OSjs.Frontend
 * template.php: Main HTML Template
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2012-08-29
 */

?>

<div id="HomePage" style="<?php print (isset($_SERVER['HTTP_USER_AGENT']) && preg_match("/googlebot|msnbot|w3c|yahoo|yandex|bing|baiduspider/i", $_SERVER['HTTP_USER_AGENT'])) ? "" : "display:none;"; ?>">
  <h1>OS.js - JavaScript Web Desktop Environment</h1>
  <h2>About</h2>
  <p>
    OS.js is a simple, yet powerful Cloud/Web Desktop Platform.<br />

    Only WebKit and Gecko based browsers fully support Glade/Gtk+ due to incomplete implementation of various CSS features.<br />

    <br />
    OS.js can also be deployed standalone, either running in a browser or on top of X11 as a complete Graphical Environment.

    <br />
    Comes with a complete desktop environment, window manager and multi-user environment with user-installable packages (Panel items, applications, services, etc.).<br />

    <br />
    Applications can be developed using the Glade Interface designer (GTK+) and using OS.js' compiler and generator to create compatible packages.
  </p>

  <h2>Links</h2>
  <p>
    OS.js is created <a href="https://plus.google.com/101576798387217383063?rel=author">by Anders Evenrud</a>
  </p>
  <p>
    Homepage on is located <a href="http://andersevenrud.github.com/OS.js/">GitHub</a>
  </p>
</div>
