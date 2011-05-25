var ApplicationFilemanager = (function() {
  return function(Application, app, api, argv) {

    var _CurrentDir = "/";
    var _History = [];

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
          $(el).find(".ApplicationFilemanagerMain li .Inner").bind('click', function(ev) {
            _selItem(this);
            $(document).click(); // Trigger this! (deselects context-menu)
            ev.stopPropagation();
          }).bind('dblclick', function(ev) {
            var fname = $(this).find("input[name=name]").val();
            var fpath = $(this).find("input[name=path]").val();
            var ftype = $(this).find("input[name=type]").val();
            var fmime = $(this).find("input[name=mime]").val();

            if ( ftype == "dir" ) {
              chdir(fpath);
            } else {
              api.system.run(fpath, fmime);
            }
            ev.stopPropagation();
          }).bind('mousedown', function(ev) {
            return api.application.context_menu(ev, [
              {"title" : "Delete", "method" : "cmd_Delete"},
              {"title" : "Rename", "method" : "cmd_Rename"}
            ], $(this));
          });
        };

        var _destroyView = function() {
          $(el).find(".ApplicationFilemanagerMain li .Inner").unbind();
          $(el).find(".ApplicationFilemanagerMain li").remove();
        };

        function chdir(dir, hist) {
          app.event(this, "browse", {"path" : dir}, function(result, error) {
            _destroyView();

            if ( error ) {
              api.system.dialog("error", error);
              $(el).find(".WindowBottomInner").html();
              $(el).find(".WindowTopInner span").html(app.title);
            } else {
              $(el).find(".ApplicationFilemanagerMain ul").html(result.items);
              $(el).find(".WindowTopInner span").html(app.title + ": " + result.path);

              $(el).find(".WindowBottomInner").html(sprintf("%d items (%d bytes)", result.total, result.bytes));
              _initClick();
            }
          });

          _CurrentDir = dir;

          /*if ( hist !== false ) {
            _History.push(_CurrentDir);
          }*/
        }

        $(el).click(function() {
          _selItem();
        });

        $(el).find(".WindowMenu .cmd_Home").click(function() {
          if ( _CurrentDir != "/" ) {
            chdir("/");
            _History = [];
            _CurrentDir = "/";
          }
        });

        $(el).find(".WindowMenu .cmd_Upload").click(function() {
          api.system.dialog_upload(function() {
            chdir(_CurrentDir);
          });
        });

        /*
        $(el).find(".WindowMenu .cmd_Back").click(function() {
          if ( _History.length ) {
            chdir(_History.shift(), false);
          }
        });
        */


        this._super();

        chdir("/");
      }
    });

    return new _ApplicationFilemanager();
  };
})();
