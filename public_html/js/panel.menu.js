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
          menu_items = [];
          for ( var a in apps ) {
            if ( apps.hasOwnProperty(a) ) {
              o = apps[a];
              (function(apn) {
                menu_items.push({
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

        this.menu = menu_items;
      },

      create : function(pos) {
        var self = this;
        var el = this._super(pos);
        var img = $("<img src=\"" + this.icon + "\" title=\"" + this.title + "\" class=\"TT\" />");
        $(el).append(img);

        $(el).click(function(ev) {
          ev.preventDefault();
          ev.stopPropagation();

          return api.application.context_menu(ev, self.menu, $(this), 1);
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
