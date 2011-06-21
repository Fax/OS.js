/**
 * PanelItem: Menu
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemMenu = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {

    function CreateMenu(items, level) {
      var ul = $("<ul class=\"GtkMenu\"></ul>");
      if ( items && items.length ) {
        var it, li;
        for ( var i = 0; i < items.length; i++ ) {
          it = items[i];

          li = $("<li class=\"GtkImageMenuItem\"></li>");
          li.append(sprintf("<img alt=\"\" src=\"/img/icons/16x16/%s\" /><span>%s</span>", it.icon, it.title));
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
        this.named = "Launcher Menu";
        this.title = title || "Launch Application";
        this.icon = '/img/icons/16x16/' + (icon || 'categories/gnome-applications.png');

        var menu_items = menu || null;
        if ( menu_items === null ) {
          var o;
          var apps = api.session.applications();
          var cats = {
            "utilities" : [],
            "graphics"  : [],
            "system"    : [],
            "unknown"   : []
          };
          var icons = {
            "utilities" : "categories/applications-utilities.png",
            "graphics"  : "categories/applications-graphics.png",
            "system"    : "categories/applications-system.png",
            "unknown"   : "categories/applications-development.png"
          };
          var labels = {
            "utilities" : "Utilities",
            "graphics"  : "Graphics",
            "system"    : "System",
            "unknown"   : "Unknown"
          };

          for ( var a in apps ) {
            if ( apps.hasOwnProperty(a) ) {
              o = apps[a];
              (function(apn) {
                cats[o.cat].push({
                  "title" : o.title,
                  "method" : function() {
                    api.system.launch(apn);
                  },
                  "icon" : o.icon
                });
              })(a);
            }
          }
        }

        menu_items = [];
        for ( var cat in cats ) {
          if ( cats.hasOwnProperty(cat) ) {
            if ( cats[cat].length ) {
              menu_items.push({
                "title" : labels[cat],
                "items" : cats[cat],
                "icon"  : icons[cat]
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

          $(this).click(function(ev) {
            var t = $(ev.target || ev.srcElement);
            var c = $(this).find(".GtkMenu").first();

            if ( last_menu !== c ) {
              if ( $(this).hasClass("Level_1") ) {
                $(this).parent().find(".GtkMenu").hide();
              }
            }
            c.show();

            last_menu = c;

            ev.stopPropagation();
            if ( !$(this).find(".GtkMenu").length ) {
              el.find(".GtkMenu").hide();
            }
          });
        });

        $(document).click(function(ev) {
          var t = $(ev.target || ev.srcElement);
          if ( !$(t).closest(".GtkCustomMenu").get(0) || $(t).closest("li").hasClass("Level_1") ) {
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
