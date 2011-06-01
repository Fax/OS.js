/**
 * Application: SystemUser
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemUser = (function() {
  return function(Application, app, api, argv) {
    var _SystemUser = Application.extend({
      init : function() {
        this._super("SystemUser");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;
        var el = app.$element;
        var loader = app.$element.find(".SystemUserLoading");
        var inner = app.$element.find(".SystemUserInner");

        $.post("/", {'ajax' : true, 'action' : 'user'}, function(data) {

          if ( data.success ) {
            var table = $("<table></table>");
            $("#tabs-1").append(table);
            forEach(data.result, function(key, val) {
              $(table).append($(sprintf("<tr><td class=\"pri\">%s</td><td class=\"sec\">%s</td></tr>", key, val)));
            });
          } else {
            api.system.dialog("error", data.error);
          }

          $(inner).tabs();

          loader.hide();

        });

        var items = "";
        for ( var i = 0; i < localStorage.length; i++ ) {
          var key = localStorage.key(i);
          var item = $("<li><span></span><div></div></li>");
          item.find("span").html(key);
          item.find("div").html(localStorage.getItem(key));
          item.click(function() {
            $(this).find("div").toggle();
            if ( $(this).find("div").is(":visible") ) {
              $(this).addClass("toggled");
            } else {
              $(this).removeClass("toggled");
            }
          });
          $("#tabs-2").find("ul").append(item);
        }

        this._super();
      }
    });

    return new _SystemUser();
  };
})();
