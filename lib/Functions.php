<?php
/*!
 * @file
 * Functions.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2011-06-20
 */

function get_inner_html( $node ) { 
    $innerHTML= ''; 
    $children = $node->childNodes; 
    foreach ($children as $child) { 
        $innerHTML .= $child->ownerDocument->saveXML( $child ); 
    } 

    return $innerHTML; 
} 

function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    $start  = $length * -1; //negative
    return (substr($haystack, $start) === $needle);
}

function array_merge_deep($arr) { // an array-merging function to strip one or more arrays down to a single one dimension array
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

?>
