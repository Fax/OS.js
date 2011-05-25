var ApplicationFilemanager = (function($, undefined) {
  return function(Application, app, api, argv) {

    if ( argv.view_type == undefined ) {
      argv.view_type = 'icon';
    }

    var _CurrentDir = "/";
    var _History = [];

    var _ApplicationFilemanager = Application.extend({
      init : function() {
        this._super("ApplicationFilemanager");
        this.argv = argv;
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

            var name = $(self).find("input[name='name']").val();
            var size = $(self).find("input[name='size']").val();
            var mime = $(self).find("input[name='mime']").val();
            var type = $(self).find("input[name='type']").val();

            if ( type == "dir" ) {
              $(el).find(".WindowBottomInner").html(sprintf('"%s" %s', name, "folder"));
            } else {
              $(el).find(".WindowBottomInner").html(sprintf('"%s" (%s b) %s', name, size, mime));
            }
          } else {
            $(el).find(".WindowBottomInner").html(_defaultStatusText);
          }

          lastItem = self;
        };

        var _defaultStatusText = "";

        var _initClick = function() {
          $(el).find(".ApplicationFilemanagerMain li .Inner").bind('click', function(ev) {
            //_selItem(this);
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
            _selItem(this);
            return api.application.context_menu(ev, [
              {"title" : "Delete", "method" : function() {
                api.system.dialog("confirm", "Are you sure you want to delete this file?", null, function() {
                });
              }},
              {"title" : "Rename", "method" : "cmd_Rename"}
            ], $(this));
          });

          $(el).find(".ApplicationFilemanagerMain li").addClass("ContextMenu");
        };

        var _destroyView = function() {
          $(el).find(".ApplicationFilemanagerMain li .Inner").unbind();
          $(el).find(".ApplicationFilemanagerMain li").remove();
        };

        function chdir(dir, hist) {
          app.event(this, "browse", {"path" : dir, "view" : self.argv['view_type']}, function(result, error) {
            _destroyView();

            if ( error ) {
              api.system.dialog("error", error);
              $(el).find(".WindowTopInner span").html(app.title);

              _defaultStatusText = "";
            } else {
              $(el).find(".ApplicationFilemanagerMain ul").html(result.items);
              $(el).find(".WindowTopInner span").html(app.title + ": " + result.path);

              _defaultStatusText = sprintf("%d items (%d bytes)", result.total, result.bytes);

              _initClick();
            }
            $(el).find(".WindowBottomInner").html(_defaultStatusText);
          });

          _CurrentDir = dir;

          /*if ( hist !== false ) {
            _History.push(_CurrentDir);
          }*/
        }

        function _updateMenu() {
          if ( self.argv.view_type == 'icon' ) {
            $(el).find(".WindowMenu .cmd_View_List").parent().removeClass("checked");
            $(el).find(".WindowMenu .cmd_View_Icons").parent().addClass("checked");
            $(el).find(".ApplicationFilemanagerMain ul").attr("class", "icon");
          } else {
            $(el).find(".WindowMenu .cmd_View_List").parent().addClass("checked");
            $(el).find(".WindowMenu .cmd_View_Icons").parent().removeClass("checked");
            $(el).find(".ApplicationFilemanagerMain ul").attr("class", "list");
          }
        }

        $(el).click(function() {
          _selItem();
        });

        $(el).find(".WindowMenu .cmd_Home").parent().click(function() {
          if ( _CurrentDir != "/" ) {
            chdir("/");
            _History = [];
            _CurrentDir = "/";
          }
        });

        $(el).find(".WindowMenu .cmd_Upload").parent().click(function() {
          api.system.dialog_upload(function() {
            chdir(_CurrentDir);
          });
        });

        $(el).find(".WindowMenu .cmd_Reload").parent().click(function() {
          chdir(_CurrentDir);
        });

        $(el).find(".WindowMenu .cmd_View_List").parent().click(function() {
          self.argv.view_type = 'list';
          chdir(_CurrentDir);
          _updateMenu();
        });
        $(el).find(".WindowMenu .cmd_View_Icons").parent().click(function() {
          self.argv.view_type = 'icon';
          chdir(_CurrentDir);
          _updateMenu();
        });

        _updateMenu();

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
})($);
