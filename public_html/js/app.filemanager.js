var ApplicationFilemanager = (function() {
  return function(Application, app) {

    var _CurrentDir = "/";

    var _ApplicationFilemanager = Application.extend({
      init : function() {
        this._super("ApplicationFilemanager");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;
        var el = app.$element;


        var _initClick = (function() {
          var last;

          return function() {
            $(el).find("li .Inner").bind('click', function() {
              if ( last ) {
                $(last).parent().removeClass("Current");
              }

              $(this).parent().addClass("Current");

              last = this;
            }).bind('dblclick', function() {
              if ( $(this).parent().hasClass("type_dir") ) {
                chdir($(this).find(".Title").html());
              }
            });
          };

        })();

        var _destroyView = (function() {

          return function() {
            $(el).find("li .Inner").unbind();
            $(el).find("li").remove();
          };

        });

        function chdir(dir) {
          if ( dir != "/" ) {
            dir = _CurrentDir + dir;
          }
          app.event(this, "browse", {"path" : dir}, function(result, error) {
            _destroyView();

            if ( error ) {
              alert(error);
            } else {
              $(el).find("ul").html(result.items);
              _initClick();
            }
          });

          _CurrentDir = dir;
        }


        this._super();

        chdir("/");
      }
    });

    return new _ApplicationFilemanager();
  };
})();
