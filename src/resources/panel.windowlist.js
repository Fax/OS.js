/*!
 * PanelItem: WindowList
 *
 * Copyright (c) 2011, Anders Evenrud
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
 * @package OSjs.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.PanelItems.PanelItemWindowList = (function($, undefined) {
  "$:nomunge";

  return function(_PanelItem, panel, api, argv) {
    "_PanelItem:nomunge, panel:nomunge, api:nomunge, argv:nomunge";

    var LABELS = OSjs.Labels.PanelItemWindowList;

    var _PanelItemWindowList = _PanelItem.extend({
      init : function() {
        this._super("PanelItemWindowList", "left");
        this._named = LABELS.title;
        this._expand = true;
        this._redrawable = true;
      },

      create : function(pos) {
        return this._super(pos);
      },

      redraw : function(ev, eargs) {
        var self = this;

        var win = eargs;
        var id  = win.$element.attr("id") + "_Shortcut";

        if ( !win || win._skip_taskbar ) {
          return;
        }

        var getTitle = function(w) {
          if ( w ) {
            w = w.getTitle();
            if ( w ) {
              if ( w.length > 20 ) {
                w = w.substr(0, 20) + "...";
              }
              return w;
            }
          }
          return "Unknown";
        };

        if ( ev == "window_add" ) {
          if ( !document.getElementById(id) ) {
            var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
            el.find("img").attr("src", win.getIcon());
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
