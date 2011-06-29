/**
 * OperationDialog: LaunchOperationDialog
 * Used for Open and Save operations.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var LaunchOperationDialog = (function($, undefined) {
  return function(OperationDialog, API, argv) {

    var _LaunchOperationDialog = OperationDialog.extend({
      init : function(items, clb_finish) {
        this.list         = items        || [];
        this.clb_finish   = clb_finish   || function() {};

        this._super("Launch");
        this._title    = "Select an application";
        this._content  = $("#OperationDialogLaunch").html();
        this._width    = 400;
        this._height   = 170;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var app, current;
        var selected;
        var set_default = false;

        for ( var x = 0; x < this.list.length; x++ ) {
          app = this.list[x];
          var li = $("<li><img alt=\"\" src=\"/img/icons/16x16/" + app.icon + "\" /><span>" + app.title + "</span></li>");
          li.addClass(x % 2 ? "odd" : "even");
          (function(litem, mapp) {
            li.click(function() {
              if ( current && current !== this ) {
                $(current).removeClass("current");
              }
              current = this;
              selected = mapp.name; // must be appended

              $(current).addClass("current");
              self.$element.find(".Ok").removeAttr("disabled");
            }).dblclick(function() {
              if ( !self.$element.find(".Ok").attr("disabled") ) {
                self.$element.find(".Ok").click();
              }
            });
          })(li, app);
          this.$element.find("ul").append(li);
        }

        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Ok").show().click(function() {
          var chk = self.$element.find("input[type=checkbox]");
          if ( selected ) {
            set_default = (chk.attr("checked") || chk.val()) ? true : false;
            self.clb_finish(selected, set_default);
          }
        }).attr("disabled", "disabled");
        this.$element.find(".DialogButtons .Cancel").show();
      }
    });

    return construct(_LaunchOperationDialog, argv);
  };
})($);
