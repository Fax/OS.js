/**
 * PanelItem: Menu
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
 * @TODO Rewrite
 * @class
 */
OSjs.PanelItems.PanelItemMenu = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"       : "Launcher Menu",
      "menu_title"  : "Launch Application"
    },
    "nb_NO" : {
      "title"       : "Launcher Meny",
      "menu_title"  : "Kjør Applikasjon"
    }
  };

  return function(PanelItem, panel, API, argv) {
    "PanelItem:nomunge, panel:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelItemMenu = PanelItem.extend({

      init : function(title, icon, menu) {
        this._super("PanelItemMenu");
        this._named = LABELS.title;

        this.title  = title || LABELS.menu_title;
        this.icon   = '/img/icons/16x16/' + (icon || 'apps/system-software-install.png');
        this.menu   = menu;
      },

      create : function(pos) {
        var self = this;
        var el = this._super(pos);

        var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" class=\"TT\" />");
        $(el).addClass("GtkCustomMenu");
        $(el).append(img);
        $(el).click(function(ev) {
          return API.system.default_application_menu(ev, this);
        });

        return el;
      },

      destroy : function() {
        this._super();
      }

    });

    return construct(_PanelItemMenu, argv);
  };
})($);
