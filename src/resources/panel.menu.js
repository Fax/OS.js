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

  var last_menu = null;
  var menu_obj = null;
  var menu_el = null;

  function clear_menu() {
    if ( menu_obj ) {
      menu_obj = null;
    }
    if ( menu_el ) {
      menu_el.remove();
      menu_el = null;
    }
  }

  return function(_PanelItem, panel, API, argv) {
    "_PanelItem:nomunge, panel:nomunge, API:nomunge, argv:nomunge";

    function CreateMenu(items, level) {
      var ul = $("<ul class=\"GtkMenu\"></ul>");
      ul.click(function(ev) {
        ev.stopPropagation();
      });

      if ( items && items.length ) {
        var it, li;
        for ( var i = 0; i < items.length; i++ ) {
          it = items[i];
          li = $("<li class=\"GtkImageMenuItem\"></li>");
          li.append(sprintf("<img alt=\"\" src=\"%s\" /><span>%s</span>", it.icon, it.title));
          if ( it.items && it.items.length ) {
            li.addClass("Subbed");
            li.append(CreateMenu(it.items));
          }

          if ( it.method ) {
            (function(li, it) {
              li.click(function(ev) {
                it.method();

                if ( last_menu ) {
                  last_menu.hide();
                }

                $(document).click();
              });
            })(li, it);
          }

          ul.append(li);
        }
      }
      return ul;
    }

    var _PanelItemMenu = _PanelItem.extend({

      init : function(title, icon, menu) {
        this._super("PanelItemMenu");
        this._named = "Launcher Menu";

        this.title = title || "Launch Application";
        this.icon = '/img/icons/16x16/' + (icon || 'apps/system-software-install.png');
      },

      create_menu : function(el) {
        var self = this;

        clear_menu();

        var menu_items = menu || null;

        if ( menu_items === null ) {
          var o;
          var apps = API.session.applications();
          var cats = {
            "development" : ["Development", "categories/applications-development.png", []],
            "games"       : ["Games", "categories/applications-games.png", []],
            "graphics"    : ["Graphics", "categories/applications-graphics.png", []],
            "office"      : ["Office", "categories/applications-office.png", []],
            "internet"    : ["Internet", "categories/applications-internet.png", []],
            "multimedia"  : ["Multimedia", "categories/applications-multimedia.png", []],
            "system"      : ["System", "categories/applications-system.png", []],
            "utilities"   : ["Utilities", "categories/applications-utilities.png", []],
            "unknown"     : ["Unknown", "categories/gnome-other.png", []]
          };

          for ( var a in apps ) {
            if ( apps.hasOwnProperty(a) ) {
              o = apps[a];
              (function(apn) {
                var it = {
                  "title" : o.title,
                  "method" : function() {
                    API.system.launch(apn);
                  },
                  "icon" : o.icon.match(/^\/img/) ? o.icon : ("/img/icons/16x16/" + o.icon)
                };

                if ( cats[o.category] !== undefined ) {
                  cats[o.category][2].push(it);
                } else {
                  cats["unknown"][2].push(it);
                }
              })(a);
            }
          }
        }

        menu_items = [];
        for ( var cat in cats ) {
          if ( cats.hasOwnProperty(cat) ) {
            if ( cats[cat][2].length ) {
              menu_items.push({
                "title" : cats[cat][0],
                "items" : cats[cat][2],
                "icon"  : "/img/icons/16x16/" + cats[cat][1]
              });
            }
          }
        }

        menu_obj = menu_items;

        var menu = CreateMenu(menu_obj);
        $(el).append(menu);
        menu_el = menu;

        el.find(".GtkImageMenuItem").each(function() {
          var level = ($(this).parents(".GtkMenu").length);

          $(this).hover(function() {
            $(this).addClass("Hover").find("span:first").addClass("Hover");
          }, function() {
            $(this).removeClass("Hover").find("span:first").removeClass("Hover");
          });

          $(this).addClass("Level_" + level);
          if ( level > 0 ) {
            $(this).addClass("SubItem");
          }

          $(this).hover(function(ev) {
            var c = $(this).find(".GtkMenu").first();
            if ( last_menu !== c ) {
              if ( $(this).hasClass("Level_1") ) {
                $(this).parent().find(".GtkMenu").hide();
              }
            }
            last_menu = c.show().css({
              'top'  : '0px',
              'left' : $(this).parent().width() + 'px'
            });
          }, function() {
            if ( last_menu ) {
              last_menu.hide();
            }
          });
        });
      },

      create : function(pos) {
        var self = this;
        var el = this._super(pos);

        var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" class=\"TT\" />");
        $(el).addClass("GtkCustomMenu");
        $(el).append(img);
        $(el).click(function(ev) {
          self.create_menu(el);

          setTimeout(function() {
            $(el).find(".GtkMenu:first").show();

            // TODO -- REMOVE ME : GLOBAL FIX
            var mit = $(el).find("ul.GtkMenu:first");
            var ppos = self._panel.pos;
            if ( ppos == "bottom" ) {
              mit.css("margin-top", "-" + (mit.height() + 10) + "px");
            } else {
              mit.css("margin-top", "0px");
            }
          }, 0);
        });

        $(document).click(function(ev) {
          var t = $(ev.target || ev.srcElement);
          if ( !$(t).closest(".GtkCustomMenu").get(0) || $(t).closest("li").hasClass("Level_2") ) {
            el.find(".GtkMenu").hide();
          }
        });

        return el;
      },

      destroy : function() {
        clear_menu();

        this._super();
      }

    });

    return construct(_PanelItemMenu, argv);
  };
})($);
