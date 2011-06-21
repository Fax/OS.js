/**
 * PanelItem: Menu
 *
 * @package ajwm.Panel
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var PanelItemMenu = (function($, undefined) {
  return function(_PanelItem, panel, api, argv) {
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
        var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" class=\"TT\" />");
        $(el).append(img);

        var tmp = $("<ul class=\"Menu\"></ul>");
        for ( var i = 0; i < this.menu.length; i++ ) {
          var sub = this.menu[i].items;

          var li = $(sprintf("<li class=\"Default\"><img alt=\"\" src=\"/img/icons/16x16/%s\" /><span>%s</span></li>", this.menu[i].icon, this.menu[i].title));
          tmp.append(li);

          (function(li, sub) {
            li.click(function(ev) {
              return api.application.context_menu(ev, sub, $(this), 1);
            });
          })(li ,sub);
        }
        el.append(tmp);

        $(document).click(function(ev) {
          var t = ev.target || ev.srcElement;
          if ( !$(t).parents(".PanelItemMenu").get(0) ) {
            el.find(".Menu").hide();
          }
        });

        $(el).click(function(ev) {
          ev.preventDefault();
          //ev.stopPropagation();

          tmp.show();

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
