/*!
 * OperationDialog: CopyOperationDialog
 * Status dialog for copy/move operations for files
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
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.CopyOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = OSjs.Labels.CopyOperationDialog;

    var _CopyOperationDialog = OperationDialog.extend({
      init : function(src, dest, clb_finish, clb_progress, clb_cancel) {
        this.src          = src          || null;
        this.dest         = dest         || null;
        this.clb_finish   = clb_finish   || function() {};
        this.clb_progress = clb_progress || function() {};
        this.clb_cancel   = clb_cancel   || function() {};

        this._super("Copy");
        this._title    = LABELS.title;
        this._content  = $("#OperationDialogCopy").html();
        this._width    = 400;
        this._height   = 170;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        $(this._content).find(".ProgressBar").progressbar({
          value : 50
        });
      }
    });

    return construct(_CopyOperationDialog, argv);
  };
})($);
