/*!
 * OperationDialog: InputOperationDialog
 * Input file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Dialogs.InputOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _InputOperationDialog = OperationDialog.extend({
      init : function(value, desc, clb_finish) {
        this.value        = value        || null;
        this.desc         = desc         || "Input";
        this.clb_finish   = clb_finish   || function() {};

        this._super("Input");
        this._title    = "Input dialog";
        this._content  = $("#OperationDialogInput").html();
        this._width    = 200;
        this._height   = 100;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        if ( this.desc ) {
          this.$element.find("h1").html(this.desc + ":");
        }

        var txt = this.$element.find(".OperationDialog input");
        txt.val(this.value);

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          var val = txt.val();
          if ( !val ) {
            alert("A value is required!");
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
      }
    });

    return construct(_InputOperationDialog, argv);
  };
})($);
