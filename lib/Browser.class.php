<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Browser.class.php
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
 * @created 2012-02-22
 */


abstract class Browser
{

  const ENGINE_UNKNOWN     = 0;
  const ENGINE_TRIDENT     = 1;
  const ENGINE_GECKO       = 2;
  const ENGINE_PRESTO      = 2;
  const ENGINE_WEBKIT      = 3;
  const ENGINE_VALIDATOR   = 4;
  const ENGINE_ROBOTS      = 5;

  const PLATFORM_UNKNOWN   = 0;
  const PLATFORM_LINUX     = 1;
  const PLATFORM_MAC       = 2;
  const PLATFORM_WINDOWS   = 3;

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @var Engine identifiers
   */
  protected static $__Engines = Array(
    self::ENGINE_UNKNOWN     => "Unknown",
    self::ENGINE_TRIDENT     => "Trident (Internet Explorer)",
    self::ENGINE_GECKO       => "Gecko (Firefox, Netscape)",
    self::ENGINE_PRESTO      => "Opera",
    self::ENGINE_WEBKIT      => "WebKit (Chrome, Safari)",
    self::ENGINE_VALIDATOR   => "W3C",
    self::ENGINE_ROBOTS      => "Robot"
  );

  /**
   * @var Platform identifiers
   */
  protected static $__Platforms = Array(
    self::PLATFORM_UNKNOWN   => "Unknown",
    self::PLATFORM_LINUX     => "Linux/UNIX",
    self::PLATFORM_MAC       => "MacOS",
    self::PLATFORM_WINDOWS   => "Windows"
  );

  /**
   * @var Last result (cache)
   */
  protected static $__LastResult = null;

  /////////////////////////////////////////////////////////////////////////////
  // METHODS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get Browser and Agent information
   * @return Array
   */
  public final static function getInfo() {
    if ( $ret = self::$__LastResult ) {
      return $ret;
    }

    $engine   = self::ENGINE_UNKNOWN;
    $version  = "unknown";
    $platform = self::PLATFORM_UNKNOWN;

    $navigator_user_agent = ' ' . strtolower($_SERVER['HTTP_USER_AGENT']);

    // Figure out platform
    if (strpos($navigator_user_agent, 'linux')) {
      $platform = self::PLATFORM_LINUX;
    } else if ( strpos($navigator_user_agent, 'mac') ) {
      $platform = self::PLATFORM_MAC;
    } else if ( strpos($navigator_user_agent, 'win') ) {
      $platform = self::PLATFORM_WINDOWS;
    }

    // Now figure out engine and version
    if (strpos($navigator_user_agent, "trident")) {
      $engine   = self::ENGINE_TRIDENT;
      $version  = floatval(substr($navigator_user_agent, strpos($navigator_user_agent, "trident/") + 8, 3));
    } elseif (strpos($navigator_user_agent, "webkit")) {
      $engine   = self::ENGINE_WEBKIT;
      $version  = floatval(substr($navigator_user_agent, strpos($navigator_user_agent, "webkit/") + 7, 8));
    } elseif (strpos($navigator_user_agent, "presto")) {
      $engine   = self::ENGINE_PRESTO;
      $version  = floatval(substr($navigator_user_agent, strpos($navigator_user_agent, "presto/") + 6, 7));
    } elseif (strpos($navigator_user_agent, "gecko")) {
      $engine   = self::ENGINE_GECKO;
      $version  = floatval(substr($navigator_user_agent, strpos($navigator_user_agent, "gecko/") + 6, 9));
    } elseif (strpos($navigator_user_agent, "robot")) {
      $engine   = self::ENGINE_ROBOTS;
    } elseif (strpos($navigator_user_agent, "spider")) {
      $engine   = self::ENGINE_ROBOTS;
    } elseif (strpos($navigator_user_agent, "bot")) {
      $engine   = self::ENGINE_ROBOTS;
    } elseif (strpos($navigator_user_agent, "crawl")) {
      $engine   = self::ENGINE_ROBOTS;
    } elseif (strpos($navigator_user_agent, "search")) {
      $engine   = self::ENGINE_ROBOTS;
    } elseif (strpos($navigator_user_agent, "w3c_validator")) {
      $engine   = self::ENGINE_VALIDATOR;
    } elseif (strpos($navigator_user_agent, "jigsaw")) {
      $engine   = self::ENGINE_VALIDATOR;
    }

    $result = Array(
      "platform" => self::$__Platforms[$platform],
      "engine"   => self::$__Engines[$engine],
      "version"  => $version
    );

    return (self::$__LastResult = $result);
  }
}

?>
