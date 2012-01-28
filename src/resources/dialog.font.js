/*!
 * OperationDialog: FontOperationDialog
 * Font file dialog
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
OSjs.Dialogs.FontOperationDialog = (function($, undefined) {
  "$:nomunge";

  var LABELS = OSjs.Labels.FontOperationDialog;

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    function UpdatePreview(el, size, font) {
      $(el).html("The quick brown fox jumps over the lazy dog");
      if ( font !== undefined ) {
        $(el).css("fontFamily", font);
      }
      if ( size !== undefined ) {
        $(el).css("fontSize", size + "px");
      }
    }

    var _FontOperationDialog = OperationDialog.extend({
      init : function(font, size, clb_finish) {
        this.font         = font || "Arial";
        this.size         = size || 12;
        this.clb_finish   = clb_finish   || function() {};

        this._super("Font");
        this._title    = LABELS.title;
        this._content  = $("#OperationDialogFont").html();
        this._width    = 350;
        this._height   = 250;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var font = this.$element.find(".OperationDialogFontList");
        var size = this.$element.find(".OperationDialogFontSize");
        var prev = this.$element.find(".OperationDialogFontPreview");

        var list = [
          "Arial",
          "Arial Black",
          "Comic Sans MS",
          "Courier New",
          "Georgia",
          "Impact",
          "Times New Roman",
          "Trebuchet MS",
          "Verdana",
          "Symbol",
          "Webdings"
        ];

        // Change font select
        font.change(function() {
          var s = $(this).val();

          self.font = s;

          UpdatePreview(prev, self.size, s);
        });

        // Change size select
        size.change(function() {
          var s = parseInt($(this).val(), 10);

          self.size = s;

          console.log(s);

          UpdatePreview(prev, s, self.font);
        });

        // Init
        var i, el;
        for ( i in list ) {
          if ( list.hasOwnProperty(i) ) {
            el = $(sprintf('<option>%s</option>', list[i]));
            font.append(el);
            if ( this.font == list[i] ) {
              font.val(list[i]);
            }
          }
        }
        for ( i = 8; i < 20; i++ ) {
          el = $(sprintf('<option>%s</option>', i));
          size.append(el);
          if ( this.size == i ) {
            size.val(i);
          }
        }

        UpdatePreview(prev, this.size, this.font);

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          self.clb_finish(self.font, self.size);
        });
      }
    });

    return construct(_FontOperationDialog, argv);
  };
})($);
