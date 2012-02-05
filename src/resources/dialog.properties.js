/*!
 * OperationDialog: FilePropertyOperationDialog
 * Used for Open and Save operations.
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
OSjs.Dialogs.FilePropertyOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"     : "File properties",
      "empty"     : "No information could be gathered."
    },
    "nb_NO" : {
      "title"     : "Fil-egenskaper",
      "empty"     : "Ingen informasjon ble samlet."
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _FilePropertyOperationDialog = OperationDialog.extend({
      init : function(filename, clb_finish) {
        this.filename      = filename;
        this.clb_finish    = clb_finish   || function() {};

        this._super("FileProperties");
        this._title        = LABELS.title;
        this._icon         = "actions/document-properties.png";
        this._content      = $("#OperationDialogFileProperties").html();
        this._is_resizable = true;
        this._width        = 400;
        this._height       = 400;
        this._gravity      = "center";
      },

      create : function(id, mcallback) {
        var self = this;

        this._super(id, mcallback);

        API.system.call("fileinfo", this.filename, function(result, error) {
          if ( !error && result ) {
            self.$element.find(".TDName").html(result.filename);
            self.$element.find(".TDPath").html(result.path);
            self.$element.find(".TDSize").html(result.size);
            self.$element.find(".TDMIME").html(result.mime);

            var infoel = self.$element.find(".TDInfo pre");
            if ( result.info instanceof Object ) {
              var html = "";
              for ( var x in result.info ) {
                if ( result.info.hasOwnProperty(x) ) {
                  if ( x && result.info[x] ) {
                    html += (x + ": " + result.info[x] + "\n");
                  }
                }
              }
              infoel.html(html);
            } else {
              infoel.html(LABELS.empty);
            }
          }
        });

        this.$element.find(".DialogButtons .Ok").hide();
        //this.$element.find(".DialogButtons .Close").hide();
        //this.$element.find(".DialogButtons .Cancel").show();

        this.$element.find(".DialogButtons .Close").show().click(function() {
          self.clb_finish();
        });

      }
    });

    return construct(_FilePropertyOperationDialog, argv);
  };
})($);
