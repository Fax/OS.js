/*!
 * OperationDialog: ColorOperationDialog
 * Color swatch, color picking etc.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.ColorOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _ColorOperationDialog = OperationDialog.extend({
      init : function(start_color, clb_finish) {
        this.clb_finish = clb_finish   || function() {};

        if ( start_color.match(/^rgba?/) ) {
          this.colorObj   = IntFromRGBstr(start_color  || "rgb(255,255,255)");
        } else {
          this.colorObj   = RGBFromHex(start_color  || "#ffffff");
        }

        this._super("Color");
        this._title    = "Choose color...";
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
