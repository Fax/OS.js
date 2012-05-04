<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Functions.php
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
 * getHumanSize() - Get size in human readable size
 * @author http://php.net/manual/en/function.disk-total-space.php
 * @package OSjs.Functions
 * @return String
 */
function getHumanSize($bytes) {
  if ( $bytes ) {
    $symbols = array('B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB');
    $exp = floor(log($bytes)/log(1024));
    return sprintf('%.2f '.$symbols[$exp], ($bytes/pow(1024, floor($exp))));
  }
  return "0 B";
}

/**
 * Remove directory recursivly
 * @param  String   $dir      Directory
 * @return void
 */
function rrmdir($dir) {
  foreach(glob($dir . '/*') as $file) {
    if(is_dir($file))
      rrmdir($file);
    else
      unlink($file);
  }
  rmdir($dir);
}

?>
