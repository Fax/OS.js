var ApplicationViewer = (function() {
  return function(Application, app, api, argv) {
    var _ApplicationViewer = Application.extend({
      init : function() {
        this._super("ApplicationViewer");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        var loader = app.$element.find(".ApplicationViewerLoading");

        if ( argv.path ) {
          var img = $("<img alt=\"\" />").attr("src", "/media/" + argv.path);
          img.load(function() {
            var img = this;
            loader.hide();
            this._loaded = true;

            setTimeout(function() {
              var w = $(img).width();
              var h = $(img).height();

              w = w > 800 ? 800 : w;
              h = h > 600 ? 600 : h;

              el.width(w + "px").height(h + "px");

            });
          }).error(function() {
            api.system.dialog("error", "Failed to load image!");
            $(this).hide();
            this._loaded = true;
          }).each(function() {
            if ( !this._loaded && this.complete && this.naturalWidth !== 0 ) {
              $(this).trigger('load');
            }
          });

          el.find(".ApplicationViewerImage").append(img);
        }

        this._super();
      }
    });

    return new _ApplicationViewer();
  };
})();
