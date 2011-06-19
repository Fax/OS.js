/**
 * PanelItem: WindowList
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemWindowList = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
    var _PanelItemWindowList = _PanelItem.extend({
      init : function() {
        this._super("PanelItemWindowList", "left");
        this.named = "Window List";
        this.expand = true;
      },

      create : function(pos) {
        return this._super(pos);
      },

      redraw : function(desktop, win, remove) {
        var self = this;

        var id = win.$element.attr("id") + "_Shortcut";

        this.$element.find(".PanelItemWindow").removeClass("Current");

        if ( remove ) {
          $("#" + id).empty().remove();
        } else {

          if ( !document.getElementById(id) ) {
            var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
            el.find("img").attr("src", "/img/icons/16x16/" + win.icon);
            el.find("span").html(win.title);
            el.attr("id", id);

            if ( win.current ) {
              el.addClass("Current");
            }

            (function(vel, wwin) {
              vel.click(function() {
                desktop.focusWindow(wwin);
              });
            })(el, win);

            self.$element.append(el);
          } else {
            if ( win.current ) {
              $("#" + id).addClass("Current");
            }
          }

        }
      },


      destroy : function() {
        this._super();
      }
    });

    return construct(_PanelItemWindowList, argv);
  };
})($);
