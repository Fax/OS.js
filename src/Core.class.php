<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Core Class
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
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-05-22
 */

/**
 * Core -- Main OS.js interfacing Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
class Core
{
  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_oUser = null;       //!< Current session User
  protected $_aLocale = Array();  //!< Current session Locale

  /**
   * @var Current instance
   */
  protected static $__Instance;

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct() {
    // Start session
    Session::initSession();

    // Set user from session
    if ( $u = Session::getUser() ) {
      $this->setUser($u);
    }

    // Set timezone from session
    if ( $l = Session::getLocale() ) {
      $this->setLocale($l);
    } else {
      Session::setLocale($this->setLocale(null));
    }

    self::$__Instance = $this;
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize Core (Create Instance)
   * @return Core
   */
  public static function initialize() {
    return self::$__Instance ? self::$__Instance : (new Core());
  }

  /**
   * Get current Instance
   * @return Core
   */
  public static function get() {
    return self::$__Instance;
  }

  /////////////////////////////////////////////////////////////////////////////
  // MEMBER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a POST request
   * @param  String    $args    Argument list (raw data)
   * @param  bool      $is_raw  Format if raw data
   * @return Mixed
   */
  public function doPOST($data, $is_raw = false) {
    $args = Array();

    if ( $data && $is_raw ) {
      try {
        $args = (Array)JSON::decode($data, true);
      } catch ( Exception $e ) {
        error_log("doPOST() Exception: {$raw}");
      }
    } else if ( is_array($data) ) {
      $args = $data;
    }

    if ( sizeof($args) ) {

      // Require a specific parameter to trigger this function
      if ( isset($args['ajax']) ) {

        // Default output
        $json = Array(
          "success" => false,
          "error"   => _("Unknown error"),
          "result"  => null
        );

        if ( ENABLE_DEBUGGING ) {
          $json["debug"] = Array(
            "input" => $args,
          );
        }

        // Set heartbeat timestamp
        $uid        = 0;
        $user       = null;
        $logged_in  = 0;
        if ( (($user = Core::get()->getUser()) && ($uid = $user->id) ) ) {
          $user->heartbeat_at = new DateTime();
          User::save($user, Array("heartbeat_at"));

          $logged_in = 1;
        }

        if ( ENABLE_DEBUGGING ) {
          $json["debug"]["uid"] = $uid;
        }

        // Map actions to methods
        if ( isset($args['action']) ) {
          if ( (API::MethodExists($args['action'])) ) {
            // Check if a user session is required!
            if ( API::MethodRequresUser($args['action']) ) {
              if ( !$logged_in ) {
                $json["error"] = _("You are not logged in!");

                $json["exception"] = Array(
                  "type"  => "session",
                  "value" => "user"
                );
                return JSON::encode($json);
              }
            }

            if ( $result = call_user_func_array(Array("API", $args['action']), Array($args)) ) {
              $json = array_merge($json, $result);
            }
          } else {
            $json['error'] = _("Invalid or no action given!");
            if ( ENABLE_LOGGING )
              Logger::logError(sprintf("%s: %s", __METHOD__, JSON::encode(Array($args, $json))));
          }
        } else {
          $json['error'] = _("No action given!");
          if ( ENABLE_LOGGING )
            Logger::logError(sprintf("%s: %s", __METHOD__, JSON::encode(Array($args, $json))));
        }

        // Remove error if successfull
        if ( $json['success'] !== false && $json['result'] !== null ) {
          $json['error'] = null;
        }

        return JSON::encode($json);
      }
    }

    return false;
  }

  /**
   * Get browser language by looking at headers
   * @return String
   */
  public static final function getBrowserLanguage() {
    $browser_language = DEFAULT_LANGUAGE;

    if ( function_exists('apache_request_headers') ) {
      if ( $headers = apache_request_headers() ) {
        if ( isset($headers["Accept-Language"]) ) {
          if ( $langs = explode(",", $headers["Accept-Language"]) ) {
            $browser_language = reset($langs);
            $browser_language = explode(";", $browser_language);
            $browser_language = str_replace("-", "_", end($browser_language));
          }
        }
      }
    }

    return $browser_language;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Set the User of current session
   * @param   User    $u      User Object (or NULL)
   * @return  void
   */
  public function setUser(User $u = null) {
    $this->_oUser = $u;
  }

  /**
   * Set the current session locale
   * @param   Array     $locale       Locale
   * @return  Array
   */
  public function setLocale(Array $locale = null) {
    if ( is_array($locale) ) {
      $this->_aLocale = $locale;
    } else {
      $this->_aLocale = Array(
        "locale_location" => SettingsManager::$Settings['system.locale.location']['value'],
        "locale_date"     => SettingsManager::$Settings['system.locale.date-format']['value'],
        "locale_time"     => SettingsManager::$Settings['system.locale.time-format']['value'],
        "locale_stamp"    => SettingsManager::$Settings['system.locale.timestamp-format']['value'],
        "locale_language" => SettingsManager::$Settings['system.locale.language']['value']
      );
    }

    date_default_timezone_set($this->_aLocale["locale_location"]);

    //
    // i18n
    //

    if ( ENABLE_GETTEXT ) {
      // Figure out language
      $lang = $this->_aLocale["locale_language"];
      if ( $lang == "default" ) {
        $lang = self::getBrowserLanguage();
      }

      $ulang = "{$lang}.utf8";
      if ( !defined("LC_MESSAGES") ) {
        define("LC_MESSAGES", $lang);
      }

      // Env locale
      putenv("LANG={$ulang}");
      putenv("LANGUAGE={$ulang}");
      putenv("LC_ALL={$ulang}");

      // System locale
      setlocale(LC_ALL,       $ulang);
      setlocale(LC_MESSAGES,  $ulang);
      setlocale(LC_CTYPE,     $ulang);

      // Gettext locale
      bind_textdomain_codeset(GETTEXT_DOMAIN, "UTF-8");
      bindtextdomain(GETTEXT_DOMAIN, PATH_LOCALE);
      textdomain(GETTEXT_DOMAIN);
    }

    return $this->_aLocale;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the current session user
   * @return User
   */
  public final function getUser() {
    return $this->_oUser;
  }

  /**
   * Get the current session locale
   * @return Array
   */
  public final function getLocale() {
    $loc  = $this->_aLocale;
    $lang = $loc["locale_language"];
    if ( $lang == "default" ) {
      $lang = self::getBrowserLanguage();
    } else {
      $lang = "{$lang}";
    }

    $loc['locale_language'] = $lang;

    return $loc;
  }

}

?>
