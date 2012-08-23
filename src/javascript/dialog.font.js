/*!
 * OperationDialog: FontOperationDialog
 * Font file dialog
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
OSjs.Dialogs.FontOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"   : "Font dialog",
      "text"    : "The quick brown fox jumps over the lazy dog"
    },
    "nb_NO" : {
      "title"   : "Skriftype dialog",
      "text"    : "The quick brown fox jumps over the lazy dog"
    }
  };

  var DEFAULT_FONTS = [
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

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    function UpdatePreview(el, size, font, unit) {

      var doc     = el.get(0).contentWindow.document;
      var content = sprintf('<font size="%s">%s</font>', (size + unit), LABELS.text);
      var css     = "font-family : " + font + " !important;";

      /*
      if ( size !== undefined ) {
        css += "font-size : " + size + unit + ";";
      }
      */

      el.attr("src", "about:blank");
      doc.open();
      doc.write('<head><link rel="stylesheet" type="text/css" href="/VFS/resource/iframe.css" /><style type="text/css">body {' + css + '}</style></head><body>' + content + '</body>');
      doc.close();
    }

    /**
     * Arguments:
     * font_name  Current font name
     * font_list  Font names list
     * font_size  Current font size
     * size_unit  Size measure unit
     * size_min   Minimum font size
     * size_max   Maximum font size
     * on_apply   Callback function
     */
    var _FontOperationDialog = OperationDialog.extend({
      init : function(args) {
        this.clb_finish   = args.on_apply  || function() {};
        this.font         = args.font_name || "Arial";
        this.list         = args.font_list || DEFAULT_FONTS;
        this.size         = args.font_size || 12;
        this.unit         = args.size_unit || "px";
        this.sizeRangeX   = args.size_min  || 8;
        this.sizeRangeY   = args.size_max  || 20;

        this._super("Font");
        this._title    = LABELS.title;
        this._content  = $("<div class=\"OperationDialog OperationDialogFont\">    <div class=\"OperationDialogInner\">      <select class=\"OperationDialogFontList\" multiple=\"false\" height=\"10\"></select>      <select class=\"OperationDialogFontSize\" multiple=\"false\" height=\"10\"></select>      <div class=\"OperationDialogFontPreview\"><iframe src=\"about:blank;\"></iframe></div>    </div>  </div>");
        this._width    = 350;
        this._height   = 250;
      },

      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var font   = this.$element.find(".OperationDialogFontList");
        var size   = this.$element.find(".OperationDialogFontSize");
        var prev   = this.$element.find(".OperationDialogFontPreview");
        var iframe = prev.find("iframe");

        iframe.css({
          "border" : "0 none",
          "margin" : "0",
          "padding" : "0",
          "width" : "100%",
          "height" : "100%"
        });
        iframe.attr({
          "frameborder" : "0",
          "border" : "0",
          "cellspacing" : "0"
        });

        // Fill lists
        var i, el;
        for ( i in self.list ) {
          if ( self.list.hasOwnProperty(i) ) {
            el = $(sprintf('<option>%s</option>', self.list[i]));
            font.append(el);
          }
        }

        for ( i = self.sizeRangeX; i <= self.sizeRangeY; i++ ) {
          size.append($(sprintf('<option>%s</option>', i)));
        }

        console.log("FontOperationDialog::init()", this.font, this.size, [font, size, iframe]);


        // Set and run
        size.val(this.size);
        font.val(this.font);

        UpdatePreview(iframe, this.size, this.font, this.unit);

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          self.clb_finish(self.font, self.size);
        });

        font.change(function() {
          self.font = $(this).val();
          UpdatePreview(iframe, self.size, self.font, self.unit);
        });

        size.change(function() {
          self.size = parseInt($(this).val(), 10);
          UpdatePreview(iframe, self.size, self.font, self.unit);
        });
      }
    });

    return construct(_FontOperationDialog, argv);
  };
})($);
