/*!
 * PanelItem: Dock
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
OSjs.PanelItems.PanelItemDock = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title" : "Launcher Dock"
    },
    "nb_NO" : {
      "title" : "Launcher Dock"
    }
  };

  return function(_PanelItem, panel, API, argv) {
    "_PanelItem:nomunge, panel:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelItemDock = _PanelItem.extend({
      init : function(items) {
        this._super("PanelItemDock");
        this._named = LABELS.title;
        this._dynamic = true;

        this.items = items || [];
      },

      create : function(pos) {
        var self = this;
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
            API.system.launch(app);
          }
        });

        setTimeout(function() {
          self.onRedraw();
        }, 0);

        return el;
      },


      destroy : function() {
        this._super();
      },

      getSession : function() {
        var sess = this._super();
        sess.opts = [this.items];
        return sess;
      }
    });

    return construct(_PanelItemDock, argv);
  };
})($);
