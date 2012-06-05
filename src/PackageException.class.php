<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - PackageException.class.php
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
 * @created 2012-04-30
 */

/**
 * PackageException -- Package Exception
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Misc
 * @class
 */
class PackageException
  extends Exception
{
  const PACKAGE_NOT_EXISTS    = 0;
  const PACKAGE_EXISTS        = 1;
  const MISSING_METADATA      = 2;
  const INVALID_METADATA      = 3;
  const MISSING_FILE          = 4;
  const FAILED_CREATE         = 5;
  const FAILED_OPEN           = 6;
  const INVALID_DESTINATION   = 7;
  const FAILED_CREATE_DEST    = 8;

  const INVALID               = 255;

  public function __construct($type, Array $args = Array()) {
    $message = _("Unknown Package Error occured");

    switch ( $type ) {
      case self::PACKAGE_NOT_EXISTS :
        $message = vsprintf(_("The package archive '%s' does not exist!"), $args);
      break;
      case self::PACKAGE_EXISTS :
        $message = vsprintf(_("The package already exists in '%s'!"), $args);
      break;
      case self::MISSING_METADATA :
        $message = vsprintf(_("'%s' is missing metadata.xml!"), $args);
      break;
      case self::INVALID_METADATA :
        $message = vsprintf(_("'%s' has invalid metadata.xml!"), $args);
      break;
      case self::MISSING_FILE :
        $message = vsprintf(_("'%s' is missing the file '%s'!"), $args);
      break;
      case self::FAILED_CREATE :
        $message = vsprintf(_("Failed to create archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::FAILED_OPEN :
        $message = vsprintf(_("Failed to open archive for project '%s' in '%s' (%d)!"), $args);
      break;
      case self::INVALID_DESTINATION :
        $message = vsprintf(_("The destination '%s' is invalid!"), $args);
      break;
      case self::FAILED_CREATE_DEST :
        $message = vsprintf(_("The destination '%s' cannot be created!"), $args);
      break;
      case self::INVALID :
        $message = vsprintf(_("The package archive '%s' is invalid!"), $args);
      break;
    }

    parent::__construct($message);
  }
}

?>
