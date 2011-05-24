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
        var el = app.$element;
        var loader = app.$element.find(".SystemUserLoading");
        var inner = app.$element.find(".SystemUserInner");

        $.post("/", {'ajax' : true, 'action' : 'user'}, function(data) {

          if ( data.success ) {
            var table = $("<table></table>");
            $(inner).append(table);
            forEach(data.result, function(key, val) {
              $(table).append($(sprintf("<tr><td class=\"pri\">%s</td><td class=\"sec\">%s</td></tr>", key, val)));
            });
          } else {
            api.system.dialog("error", data.error);
          }

          loader.hide();

        });

        this._super();
      }
    });

    return new _SystemUser();
  };
})();
