/*!
 * OperationDialog: FontOperationDialog
 * Font file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.FontOperationDialog = (function($, undefined) {
  "$:nomunge";

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
        this._title    = "Font dialog";
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
