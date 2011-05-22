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
        this._content  = $("<div class=\"OperationDialog OperationDialogColor\">          <div class=\"OperationDialogInner\">            <div class=\"Sliders\">              <div class=\"Label\">Red</div>              <div><div class=\"Slider SliderR\"></div></div>              <div class=\"Label\">Green</div>              <div><div class=\"Slider SliderG\"></div></div>              <div class=\"Label\">Blue</div>              <div><div class=\"Slider SliderB\"></div></div>            </div>            <div class=\"CurrentColor\"></div>            <div class=\"ColorPalette\"><canvas width=\"200\" height=\"200\" class=\"ColorPaletteCanvas\"></canvas></div>            <div class=\"CurrentColorDesc\"></div>          </div>        </div>");
        this._width    = 500;
        this._height   = 280;
      },

      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        // Sliders
        $(this.$element).find(".Slider").slider({
          'min'    : 0,
          'max'    : 255,
          'step'   : 1,
          'slide'  : function() {
            self.colorObj.red   = parseInt($(self.$element).find(".SliderR").slider("value"), 10);
            self.colorObj.green = parseInt($(self.$element).find(".SliderG").slider("value"), 10);
            self.colorObj.blue  = parseInt($(self.$element).find(".SliderB").slider("value"), 10);
            self.update_color();
          }
        });

        // Init items
        this.draw_palette();
        this.update_color();
        this.update_sliders();

        // Dialog buttons
        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Cancel").show();
        this.$element.find(".DialogButtons .Ok").show().click(function() {
          self.clb_finish(self.colorObj, "#" + hexFromRGB(self.colorObj.red, self.colorObj.green, self.colorObj.blue));
        });
      },

      update_sliders : function() {
        this.$element.find(".SliderR").slider("value", this.colorObj.red);
        this.$element.find(".SliderG").slider("value", this.colorObj.green);
        this.$element.find(".SliderB").slider("value", this.colorObj.blue);
      },

      update_color : function() {
        var hex = hexFromRGB(this.colorObj.red, this.colorObj.green, this.colorObj.blue);
        var rgb = sprintf("R: %03d, G: %03d, B: %03d (#%s)", this.colorObj.red, this.colorObj.green, this.colorObj.blue, hex);

        $(this.$element).find(".CurrentColor").css("background-color", "#" + hex);
        $(this.$element).find(".CurrentColorDesc").html(rgb);
      },

      draw_palette : function() {
        var cv        = this.$element.find(".ColorPaletteCanvas");
        var ctx       = cv.get(0).getContext('2d');
        var gradient  = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);

        // Create color gradient
        gradient.addColorStop(0,    "rgb(255,   0,   0)");
        gradient.addColorStop(0.15, "rgb(255,   0, 255)");
        gradient.addColorStop(0.33, "rgb(0,     0, 255)");
        gradient.addColorStop(0.49, "rgb(0,   255, 255)");
        gradient.addColorStop(0.67, "rgb(0,   255,   0)");
        gradient.addColorStop(0.84, "rgb(255, 255,   0)");
        gradient.addColorStop(1,    "rgb(255,   0,   0)");

        // Apply gradient to canvas
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
        gradient.addColorStop(1,   "rgba(0,     0,   0, 1)");

        // Apply gradient to canvas
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var self = this;
        cv.click(function(e) {
          var data = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
          self.colorObj = {
            'red'   : data[0],
            'green' : data[1],
            'blue'  : data[2]
          };
          console.log(data, self.colorObj);
          self.update_sliders();
          self.update_color();
        });
      }
    });

    return construct(_ColorOperationDialog, argv);
  };
})($);
