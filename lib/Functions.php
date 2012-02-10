<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Functions.php
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
 * @created 2011-06-20
 */

/**
 * get_inner_html() -- Get innerHTML of a DOMDocument Node
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Functions
 * @return  String
 */
function get_inner_html( $node ) {
    $innerHTML = '';
    $children  = $node->childNodes;
    foreach ( $children as $child ) {
      $innerHTML .= $child->ownerDocument->saveXML( $child );
    }
    return $innerHTML;
}

/**
 * startsWith() -- Check if string starts with X
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Functions
 * @return  String
 */
function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

/**
 * endsWith() -- Check if string ends with X
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Functions
 * @return  String
 */
function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    $start  = $length * -1; //negative
    return (substr($haystack, $start) === $needle);
}

/**
 * array_merge_deep() -- An array-merging function to strip one or more
 * arrays down to a single one dimension array
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Functions
 * @return  String
 */
function array_merge_deep($arr) {
  $arr = (array)$arr;
  $argc = func_num_args();
  if ($argc != 1) {
    $argv = func_get_args();
    for ($i = 1; $i < $argc; $i++) $arr = array_merge($arr, (array)$argv[$i]);
  }
  $temparr = array();
  foreach($arr as $key => $value) {
    if (is_array($value)) $temparr = array_merge($temparr, array_merge_deep($value));
    else $temparr = array_merge($temparr, array($key => $value));
  }
  return $temparr;
}

/**
 * Helps with timezones.
 * @link http://us.php.net/manual/en/class.datetimezone.php
 *
 * @package  Date
 */
class Helper_DateTimeZone extends DateTimeZone
{
  /**
   * Converts a timezone hourly offset to its timezone's name.
   * @example $offset = -5, $isDst = 0 <=> return value = 'America/New_York'
   * 
   * @param float $offset The timezone's offset in hours.
   *                      Lowest value: -12 (Pacific/Kwajalein)
   *                      Highest value: 14 (Pacific/Kiritimati)
   * @param bool  $isDst  Is the offset for the timezone when it's in daylight
   *                      savings time?
   * 
   * @return string The name of the timezone: 'Asia/Tokyo', 'Europe/Paris', ...
   */
  final public static function tzOffsetToName($name = "", $offset, $isDst = null)
  {
    if ($isDst === null)
    {
      $isDst = date('I');
    }

    //$offset *= 3600;
    $offset  = -$offset * 60;
    $zone    = timezone_name_from_abbr($name, $offset, $isDst);

    if ($zone === false)
    {
      foreach (timezone_abbreviations_list() as $abbr)
      {
        foreach ($abbr as $city)
        {
          if ((bool)$city['dst'] === (bool)$isDst &&
            strlen($city['timezone_id']) > 0    &&
            $city['offset'] == $offset)
          {
            $zone = $city['timezone_id'];
            break;
          }
        }

        if ($zone !== false)
        {
          break;
        }
      }
    }

    return $zone;
  }

  final public static function timezone_abbr_from_name($timezone_name){
    $dateTime = new DateTime();
    $dateTime->setTimeZone(new DateTimeZone($timezone_name));
    return $dateTime->format('T');
  }
}

?>
