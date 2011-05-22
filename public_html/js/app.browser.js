var ApplicationBrowser = (function() {
  return function(Application, app) {
    var _ApplicationBrowser = Application.extend({
      init : function() {
        this._super("ApplicationBrowser");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        $(el).find("input").keypress(function(ev) {
          var kc = ev.which || ev.keyCode;
          if ( kc == 13 ) {
            el.find("iframe").attr("src", $(this).val());
          }
        });

        this._super();
      }
    });

    return new _ApplicationBrowser();
  };
})();
