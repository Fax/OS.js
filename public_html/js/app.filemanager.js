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
        var lastItem;


        var _selItem = function(self) {
          if ( lastItem ) {
            $(lastItem).parent().removeClass("Current");
          }

          if ( self ) {
            $(self).parent().addClass("Current");
          }

          lastItem = self;
        };

        var _initClick = function() {
          $(el).find("li .Inner").bind('click', function(ev) {
            _selItem(this);
            ev.stopPropagation();
          }).bind('dblclick', function(ev) {
            if ( $(this).parent().hasClass("type_dir") ) {
              chdir($(this).find(".Title").html());
            }
            ev.stopPropagation();
          });
        };

        var _destroyView = function() {
          $(el).find("li .Inner").unbind();
          $(el).find("li").remove();
        };

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

        $(el).click(function() {
          _selItem();
        });


        this._super();

        chdir("/");
      }
    });

    return new _ApplicationFilemanager();
  };
})();
