/**
 * PanelItem: Dock
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemDock = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
    var _PanelItemDock = _PanelItem.extend({
      init : function(items) {
        this._super("PanelItemDock");
        this.items = items || [];
        this.named = "Launcher Dock";
        this.dynamic = true;
      },

      create : function(pos) {
        var el = this._super(pos);

        var e, o;
        for ( var i = 0; i < this.items.length; i++ ) {
          e = this.items[i];
          o = $("<div class=\"PanelItem PanelItemLauncher\"><span class=\"\"><img alt=\"\" src=\"/img/blank.gif\" title=\"\" ></span></div>");
          o.find("span").addClass("launch_" + e.launch);
          o.find("img").attr("src", '/img/icons/16x16/' + e.icon);
          o.find("img").attr("title", e.title).addClass("TT");
          el.append(o);
        }

        $(el).find(".PanelItemLauncher").click(function(ev) {
          var app = $(this).find("span").attr("class").replace("launch_", ""); //.replace("TT", "").replace(" ", "");
          if ( app == "About" ) {
            $("#DialogAbout").show();
            $("#DialogAbout").css({
              "top" : (($(document).height() / 2) - ($("#DialogAbout").height() / 2)) + "px",
              "left" : (($(document).width() / 2) - ($("#DialogAbout").width() / 2)) + "px"
            });
          } else {
            api.system.launch(app);
          }
        });

        return el;
      },


      destroy : function() {
        this._super();
      }
    });

    return construct(_PanelItemDock, argv);
  };
})($);
