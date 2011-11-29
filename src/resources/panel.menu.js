/**
 * PanelItem: Menu
 *
 * @package OSjs.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.PanelItems.PanelItemMenu = (function($, undefined) {
  "$:nomunge";

  return function(_PanelItem, panel, api, argv) {
    "_PanelItem:nomunge, panel:nomunge, api:nomunge, argv:nomunge";

    function CreateMenu(items, level) {
      var ul = $("<ul class=\"GtkMenu\"></ul>");
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
              li.click(function() {
                it.method();
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

        var menu_items = menu || null;
        if ( menu_items === null ) {
          var o;
          var apps = api.session.applications();
          var cats = {
            "development" : ["Development", "categories/applications-development.png", []],
            "games"       : ["Games", "categories/applications-games.png", []],
            "graphics"    : ["Graphics", "categories/applications-graphics.png", []],
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
                cats[o.category][2].push({
                  "title" : o.title,
                  "method" : function() {
                    api.system.launch(apn);
                  },
                  "icon" : o.icon.match(/^\/img/) ? o.icon : ("/img/icons/16x16/" + o.icon)
                });
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

        this.menu = menu_items;
      },

      create : function(pos) {
        var self = this;
        var el = this._super(pos);

        var menu = CreateMenu(this.menu);

        var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" class=\"TT\" />");
        $(el).addClass("GtkCustomMenu");
        $(el).append(img);
        $(el).append(menu);
        $(el).click(function() {
          $(el).find(".GtkMenu:first").show();

          var mit = $(el).find("ul.GtkMenu:first");
          var ppos = self._panel.pos;
          if ( ppos == "bottom" ) {
            console.log("BOTTOM", mit);
            mit.css("margin-top", "-" + (mit.height() + 10) + "px");
          } else {
            console.log("TOP", mit);
            mit.css("margin-top", "0px");
          }
        });

        var last_menu = null;
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

        $(document).click(function(ev) {
          var t = $(ev.target || ev.srcElement);
          if ( !$(t).closest(".GtkCustomMenu").get(0) || $(t).closest("li").hasClass("Level_2") ) {
            el.find(".GtkMenu").hide();
          }
        });


        return el;
      },

      destroy : function() {
        if ( this.menu ) {
          this.menu = null;
        }
        this._super();
      }

    });

    return construct(_PanelItemMenu, argv);
  };
})($);
