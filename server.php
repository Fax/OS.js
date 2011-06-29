<?php
/*!
 * @file
 * server.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-03
 */

require "header.php";
require "lib/Server.class.php";

error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

Server::run(SERVER_HOST, SERVER_PORT);
?>
