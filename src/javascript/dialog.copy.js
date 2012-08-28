/*!
 * OperationDialog: CopyOperationDialog
 * Status dialog for copy/move operations for files
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
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.CopyOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title" : "File operation",
      "copy"  : "Copying <b>%s</b> to <i>%s</i>",
      "move"  : "Moving <b>%s</b> to <i>%s</i>"
    },
    "nb_NO" : {
      "title" : "Fil-operasjon",
      "copy"  : "Kopierer <b>%s</b> til <i>%s</i>",
      "move"  : "Flytter <b>%s</b> til <i>%s</i>"
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _CopyOperationDialog = OperationDialog.extend({
      init : function(args) {
        this._super("CopyMove");
        this._title        = LABELS.title;
        this._content      = $("<div class=\"OperationDialog OperationDialogCopy\"></div>");
        this._width        = 350;
        this._height       = 120;
        this._is_closable  = false;

        this.error_on   = args.error_on   === true;
        this.callback   = args.callback   || function() {};
        this.source     = args.source     || null;
        this.dest       = args.dest       || null;
        this.type       = args.type       || "copy";
        this.title      = "";

        if ( this.type == "copy" ) {
          this.title = sprintf(LABELS.copy, basename(this.source), this.dest);
        } else {
          this.title = sprintf(LABELS.move, basename(this.source), this.dest);
        }
      },

      create : function(id, mcallback) {
        var self = this;
        var el = this._super(id, mcallback).find(".OperationDialogCopy");

        var title    = $(sprintf("<div class=\"CopyTitle\">%s</div>", this.title));
        var progress = $("<div class=\"CopyProgress\"></div>");

        el.append(title);
        el.append(progress);
        this.$element.find(".DialogButtons").hide();
        this.updateProgress(0);

        if ( (this.source == this.dest) || !(this.source && this.dest) ) {
          this.updateProgress(100);
          return;
        }

        API.system.call("cp", {'source' : self.source, 'destination' : self.dest}, function(result, error) {
          self.callback(result, error);

          setTimeout(function() {
            self.updateProgress(100);
          }, 0);
        }, this.error_on);
      },

      updateProgress : function(p) {
        p = (parseInt(p, 10) || 0);
        OSjs.Classes.ProgressBar(this.$element.find(".CopyProgress"), p);
        if ( p >= 100 ) {
          this.close();
        }
      }
    });

    return construct(_CopyOperationDialog, argv);
  };
})($);
