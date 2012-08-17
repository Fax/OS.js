/*!
 * OperationDialog: RenameOperationDialog
 * Rename file dialog
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
OSjs.Dialogs.RenameOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"     : "Rename file",
      "empty"     : "A filename is required!"
    },
    "nb_NO" : {
      "title"     : "Gi nytt fil-navn",
      "empty"     : "Du må angi et filnavn!"
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _RenameOperationDialog = OperationDialog.extend({
      init : function(args) {
        this.src          = args.path       || null;
        this.clb_finish   = args.on_apply   || function() {};

        this._super("Rename");
        this._title    = LABELS.title;
        this._content  = $("<div class=\"OperationDialog OperationDialogRename\">    <h1>Rename file</h1>    <div class=\"OperationDialogInner\">      <input type=\"text\" />    </div>  </div>");
        this._width    = 200;
        this._height   = 100;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var txt = this.$element.find(".OperationDialog input");
        txt.val(this.src);

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          var val = txt.val();
          if ( !val ) {
            API.ui.alert(LABELS_EMPTY);
            return;
          }
          self.clb_finish(val);
        });

        $(txt).keydown(function(ev) {
          var keyCode = ev.which || ev.keyCode;
          if ( keyCode == 13 ) {

            self.$element.find(".DialogButtons .Ok").click();
            return false;
          }
          return true;
        });


        txt.focus();
        var tmp = txt.val().split(".");
        var len = 0;
        if ( tmp.length > 1 ) {
          tmp.pop();
          len = tmp.join(".").length;
        } else {
          len = tmp[0].length;
        }
        setSelectionRangeX(txt.get(0), 0, len);
      }
    });

    return construct(_RenameOperationDialog, argv);
  };
})($);
