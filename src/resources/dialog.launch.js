/*!
 * OperationDialog: LaunchOperationDialog
 * Used for selecting an application to open from a specific file (MIME)
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.LaunchOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _LaunchOperationDialog = OperationDialog.extend({
      init : function(items, clb_finish, not_found) {
        this.list         = items        || [];
        this.clb_finish   = clb_finish   || function() {};
        this.not_found    = not_found === undefined ? false : not_found;

        this._super("Launch");
        this._title    = "Select an application";
        this._content  = $("#OperationDialogLaunch").html();
        this._width    = 400;
        this._height   = 300;
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var app, current;
        var selected;
        var set_default = false;

        if ( this.not_found ) {
          this.$element.find(".OperationDialogInner").prepend("<p>Found no suiting application for this MIME type. </p>");
        } else {
          this.$element.find(".OperationDialogInner").prepend("<p>Found multiple application supporting this MIME type:</p>");
        }

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
            set_default = (chk.is(':checked')) ? true : false;
            self.clb_finish(selected, set_default);
          }
        }).attr("disabled", "disabled");
        this.$element.find(".DialogButtons .Cancel").show();
      }
    });

    return construct(_LaunchOperationDialog, argv);
  };
})($);
