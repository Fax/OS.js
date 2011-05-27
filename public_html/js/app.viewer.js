/**
 * Application: ApplicationViewer
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
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
          h = ((force ? h : (h > 600 ? 600 : h)) + 34) + 27;

          el.width(w + "px").height(h + "px");
        }

        function _open(callback) {
          api.system.dialog_file(function(fname, mtype) {
            callback(fname, mtype);
          }, ["image/*", "video/*", "application/ogg"]);
        }

        var img;
        var video;

        function _play(path, mime) {
          if ( img ) 
            $(img).remove();
          if ( video )
            $(video).remove();

          var source = "/media/" + path;
          var type = "image";
          if ( mime )
            type = mime.split("/")[0];

          if ( type == "image" ) {
            img = $("<img alt=\"\" />").attr("src", source);
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
            el.find(".WindowContent").css("overflow", "auto");
          } else {
            // FIXME: removeEventListener, jquery ?!
            video = $("<video>");
            video.attr("controls", "controls");
            video.attr("src", source);

            _video = video[0];
            _video.addEventListener("loadeddata", function() {
              loader.hide();

              _video.play();

              setTimeout(function() {
                _resize(video, el, true);
              }, 1);
            }, true);
            _video.addEventListener("error", function() {
              loader.hide();

              setTimeout(function() {
                _resize(video, el, true);
              }, 1);
            }, true);

            el.find(".ApplicationViewerImage").append(video);
            el.find(".WindowContent").css("overflow", "hidden");

            setTimeout(function() {
              _resize(video, el, true);
            }, 1);
          }
        }

        if ( argv.path ) {
          _play(argv.path, argv.mime);
        }

        $(el).find(".WindowMenu .cmd_Open").parent().click(function() {
          _open(function(fname, mtype) {
            _play(fname, mtype);
          });
        });

        this._super();
      }
    });

    return new _ApplicationViewer();
  };
})();
