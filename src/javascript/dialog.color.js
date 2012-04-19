/*!
 * OperationDialog: ColorOperationDialog
 * Color swatch, color picking etc.
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
OSjs.Dialogs.ColorOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title" : "Choose color..."
    },
    "nb_NO" : {
      "title" : "Velg farge..."
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _ColorOperationDialog = OperationDialog.extend({
      init : function(start_color, clb_finish) {
        this.clb_finish = clb_finish   || function() {};

        if ( start_color.match(/^rgba?/) ) {
          this.colorObj   = IntFromRGBstr(start_color  || "rgb(255,255,255)");
        } else {
          this.colorObj   = RGBFromHex(start_color  || "#ffffff");
        }

        this._super("Color");
        this._title    = LABELS.title;
        this._icon     = "apps/style.png";
        this._content  = $("#OperationDialogColor").html();
        this._width    = 400;
        this._height   = 170;
      },

      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var desc      = $(self.$element).find(".CurrentColorDesc");
        var cube      = $(self.$element).find(".CurrentColor");
        var running   = false;

        var _update   = function() {
          if ( running ) {
            self.colorObj.red   = parseInt($(self.$element).find(".SliderR").slider("value"), 10);
            self.colorObj.green = parseInt($(self.$element).find(".SliderG").slider("value"), 10);
            self.colorObj.blue  = parseInt($(self.$element).find(".SliderB").slider("value"), 10);
          }

          var hex = hexFromRGB(self.colorObj.red, self.colorObj.green, self.colorObj.blue);
          $(cube).css("background-color", "#" + hex);
          $(desc).html(sprintf("R: %03d, G: %03d, B: %03d (#%s)", self.colorObj.red, self.colorObj.green, self.colorObj.blue, hex));
        };

        this.$element.find(".DialogButtons .Close").hide().find(".DialogButtons .Cancel").show();
        this.$element.find(".DialogButtons .Ok").show().click(function() {
          self.clb_finish(self.colorObj, "#" + hexFromRGB(self.colorObj.red, self.colorObj.green, self.colorObj.blue));
        });

        $(this.$element).find(".Slider").slider({
          'min'    : 0,
          'max'    : 255,
          'step'   : 1,
          'slide'  : _update,
          'change' : _update
        });

        this.$element.find(".SliderR").slider("value", this.colorObj.red);
        this.$element.find(".SliderG").slider("value", this.colorObj.green);
        this.$element.find(".SliderB").slider("value", this.colorObj.blue);

        running = true;
      }
    });

    return construct(_ColorOperationDialog, argv);
  };
})($);
