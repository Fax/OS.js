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
        this.redrawable = true;
      },

      create : function(pos) {
        return this._super(pos);
      },

      redraw : function(ev, eargs) {
        var self = this;

        var win = eargs;
        var id  = win.$element.attr("id") + "_Shortcut";

        var getTitle = function(w) {
          w = w.getTitle();
          if ( w.length > 20 ) {
            w = w.substr(0, 20) + "...";
          }
          return w;
        };

        if ( ev == "window_add" ) {
          if ( !document.getElementById(id) ) {
            var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
            el.find("img").attr("src", "/img/icons/16x16/" + win._icon);
            el.find("span").html(getTitle(win));
            el.attr("id", id);
            el.click(function() {
              win.focus();
            });

            this.$element.append(el);
          }
        } else if ( ev == "window_remove" ) {
          if ( document.getElementById(id) ) {
            $("#" + id).empty().remove();
          }
        } else if ( ev == "window_focus" ) {
          this.$element.find("PanelItemWindow").removeClass("Current");
          if ( document.getElementById(id) ) {
            $("#" + id).addClass("Current");
          }
        } else if ( ev == "window_blur" ) {
          if ( document.getElementById(id) ) {
            $("#" + id).removeClass("Current");
          }
        } else if ( ev == "window_updated" ) {
          if ( document.getElementById(id) ) {
            $("#" + id).find("span").html(getTitle(win));
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
