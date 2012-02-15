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

  var _LINGUAS = {
    "en_US" : {
      "title" : "Window List"
    },
    "nb_NO" : {
      "title" : "Vindu-liste"
    }
  };

  return function(PanelItem, panel, API, argv) {
    "PanelItem:nomunge, panel:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelItemWindowList = PanelItem.extend({
      init : function() {
        this._super("PanelItemWindowList", "left");
        this._named = LABELS.title;
        this._expand = true;
        this._redrawable = true;
      },

      create : function(pos) {
        return this._super(pos);
      },

      run : function() {
        var self = this;
        this._super();

        var stack = API.session.stack();
        for ( var i = 0; i < stack.length; i++ ) {
          this._insert(self.__insert(stack[i]));
        }
      },

      __insert : function(iter) {
        return {
          getWindowId : function() {
            return iter.id;
          },
          getTitle    : function() {
            return iter.title;
          },
          getIcon     : function() {
            return iter.icon;
          },
          focus       : function() {
            return iter.focus();
          }
        };
      },

      _insert : function(win) {
        var id      = win.getWindowId();
        var title   = win.getTitle();
        var icon    = win.getIcon();

        if ( title.length > 20 ) {
          title = title.substr(0, 20) + "...";
        }

        this._createRef(id, title, icon, function() {
          win.focus();
        });
      },

      _createRef : function(id, title, icon, callback) {
        if ( this.$element.find(".Ref_" + id).get(0) )
          return;

        var el = $("<div class=\"PanelItem Padded PanelItemWindow\"><img alt=\"\" src=\"/img/blank.gif\" /><span></span></div>");
        el.find("img").attr("src", icon);
        el.find("span").html(title);
        el.addClass("Ref_" + id);
        el.click(function() {
          callback();
        });

        this.$element.append(el);
      },

      _removeRef : function(id) {
        this.$element.find(".Ref_" + id).remove();
      },

      _focusRef : function(id) {
        this.$element.find(".PanelItemWindow").removeClass("Current");
        this.$element.find(".Ref_" + id).addClass("Current");
      },

      _blurRef : function(id) {
        this.$element.find(".Ref_" + id).removeClass("Current");
      },

      _updateRef : function(id, title) {
        if ( title.length > 20 ) {
          title = title.substr(0, 20) + "...";
        }

        this.$element.find(".Ref_" + id + " span").html(title);
      },

      redraw : function(ev, win) {
        var self = this;

        if ( win ) {
          if ( ev == "window_add" ) {
            this._insert(win);
          } else if ( ev == "window_remove" ) {
            this._removeRef(win.getWindowId());
          } else if ( ev == "window_focus" ) {
            this._focusRef(win.getWindowId());
          } else if ( ev == "window_blur" ) {
            this._blurRef(win.getWindowId());
          } else if ( ev == "window_updated" ) {
            this._updateRef(win.getWindowId(), win.getTitle());
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
