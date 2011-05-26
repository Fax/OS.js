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

        function _resize(img, el, force) {
          var w = parseInt($(img).width(), 10);
          var h = parseInt($(img).height(), 10);

          w = (force ? w : (w > 800 ? 800 : w)) + 4;
          h = (force ? h : (h > 600 ? 600 : h)) + 34;

          el.width(w + "px").height(h + "px");
        }

        if ( argv.path ) {
          var source = "/media/" + argv.path;
          var mime = argv.mime;
          var type = "image";
          if ( mime )
            type = mime.split("/")[0];

          if ( type == "image" ) {
            var img = $("<img alt=\"\" />").attr("src", source);
            img.load(function() {
              var img = this;
              loader.hide();
              this._loaded = true;

              setTimeout(function() {
                _resize(img, el);
              }, 0);
            }).error(function() {
              api.system.dialog("error", "Failed to load " + type + "!");
              $(this).hide();
              this._loaded = true;
            }).each(function() {
              if ( !this._loaded && this.complete && this.naturalWidth !== 0 ) {
                $(this).trigger('load');
              }
            });

            el.find(".ApplicationViewerImage").append(img);
          } else {
            // FIXME: removeEventListener, jquery ?!
            var video = $("<video>");
            video.attr("controls", "controls");
            video.attr("src", source);

            _video = video[0];
            _video.addEventListener("loadeddata", function() {
              loader.hide();

              _video.play();

              setTimeout(function() {
                _resize(video, el, true);
              }, 1);
            });
            _video.addEventListener("error", function() {
              loader.hide();

              setTimeout(function() {
                _resize(video, el, true);
              }, 1);
            });

            el.find(".ApplicationViewerImage").append(video);
            el.find(".WindowContent").css("overflow", "hidden");

            setTimeout(function() {
              _resize(video, el, true);
            }, 1);
          }
        }

        this._super();
      }
    });

    return new _ApplicationViewer();
  };
})();
