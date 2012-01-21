<?php
/*!
 * @file
 * Functions.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
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
