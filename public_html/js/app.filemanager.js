/**
 * Application: ApplicationFilemanager
 *
 * TODO: Upload to relative path
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationFilemanager = (function($, undefined) {
  return function(Application, app, api, argv) {

    if ( argv.view_type == undefined ) {
      argv.view_type = 'icon';
    }
    if ( argv.path == undefined ) {
      argv.path = "/";
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
            console.log(self, self.tagName);
            if ( self.tagName.toLowerCase() == "tr" ) {
              $(lastItem).removeClass("Current");
            } else {
              $(lastItem).parent().removeClass("Current");
            }
          }

          if ( self ) {
            if ( self.tagName.toLowerCase() == "tr" ) {
              $(self).addClass("Current");
            } else {
              $(self).parent().addClass("Current");
            }

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

          $(el).find(".ApplicationFilemanagerMain .Inner").bind('click', function(ev) {
            //_selItem(this);
            $(document).click(); // Trigger this! (deselects context-menu)
            ev.stopPropagation();
          }).bind('dblclick', function(ev) {


            var fname = fpath =  ftype = fmime = null;

            if ( this.tagName == "td" ) {
              fname = $(this).parent().find("input[name=name]").val();
              fpath = $(this).parent().find("input[name=path]").val();
              ftype = $(this).parent().find("input[name=type]").val();
              fmime = $(this).parent().find("input[name=mime]").val();
            } else {
              fname = $(this).find("input[name=name]").val();
              fpath = $(this).find("input[name=path]").val();
              ftype = $(this).find("input[name=type]").val();
              fmime = $(this).find("input[name=mime]").val();
            }

            if ( ftype == "dir" ) {
              chdir(fpath);
            } else {
              api.system.run(fpath, fmime);
            }
            ev.stopPropagation();
            ev.preventDefault();
          }).bind('mousedown', function(ev) {
            _selItem(this);

            ev.stopPropagation();
            ev.preventDefault();

            var pro = $(this).find("input[name=protected]").val() == "1";

            if ( pro ) {
              return api.application.context_menu(ev, [
                {"title" : "Protected", "disabled" : true, "method" : function() {
                  return false;
                }}
              ], $(this));
            } else {
              return api.application.context_menu(ev, [
                {"title" : "Delete", "method" : function() {
                  api.system.dialog("confirm", "Are you sure you want to delete this file?", null, function() {
                    alert('Not implemented yet'); // TODO
                  });
                }},
                {"title" : "Rename", "method" : function() {
                  alert('Not implemented yet'); // TODO
                }},
                {"title" : "Download", "method" : function() {
                  alert('Not implemented yet'); // TODO
                }}
              ], $(this));
            }
          });

          $(el).find(".ApplicationFilemanagerMain li").addClass("ContextMenu");
          $(el).find(".ApplicationFilemanagerMain td").addClass("ContextMenu");
        };

        var _destroyView = function() {
          $(el).find(".ApplicationFilemanagerMain .Inner").unbind();
          $(el).find(".ApplicationFilemanagerMain ul").die();
          $(el).find(".ApplicationFilemanagerMain ul").unbind();
          $(el).find(".ApplicationFilemanagerMain table").die();
          $(el).find(".ApplicationFilemanagerMain table").unbind();
          $(el).find(".ApplicationFilemanagerMain ul").remove();
          $(el).find(".ApplicationFilemanagerMain table").remove();
        };

        function chdir(dir, hist) {
          app.event(self, "browse", {"path" : dir, "view" : self.argv['view_type']}, function(result, error) {
            _destroyView();

            if ( error ) {
              api.system.dialog("error", error);
              $(el).find(".WindowTopInner span").html(app.title);

              _defaultStatusText = "";
            } else {
              $(el).find(".ApplicationFilemanagerMain").html(result.items);
              $(el).find(".WindowTopInner span").html(app.title + ": " + result.path);

              _defaultStatusText = sprintf("%d items (%d bytes)", result.total, result.bytes);

              _initClick();
            }
            $(el).find(".WindowBottomInner").html(_defaultStatusText);
          });

          _CurrentDir = dir;
          self.argv['path'] = _CurrentDir;

          /*if ( hist !== false ) {
            _History.push(_CurrentDir);
          }*/
        }

        function _updateMenu() {
          if ( self.argv.view_type == 'icon' ) {
            app.setMenuItemAttribute("View", "cmd_View_List", "");
            app.setMenuItemAttribute("View", "cmd_View_Icons", "checked");
          } else {
            app.setMenuItemAttribute("View", "cmd_View_List", "checked");
            app.setMenuItemAttribute("View", "cmd_View_Icons", "");
          }
        }

        $(el).click(function() {
          _selItem();
        });

        app.setMenuItemAction("Go", "cmd_Home", function() {
          if ( _CurrentDir != "/" ) {
            chdir("/");
            _History = [];
            _CurrentDir = "/";
          }
        });

        app.setMenuItemAction("File", "cmd_Upload", function() {
          api.system.dialog_upload(_CurrentDir, function() {
            chdir(_CurrentDir);
            //chdir("/");
          });
        });

        app.setMenuItemAction("View", "cmd_Reload", function() {
          chdir(_CurrentDir);
        });

        app.setMenuItemAction("View", "cmd_View_List", function() {
          self.argv.view_type = 'list';
          chdir(_CurrentDir);
          _updateMenu();
        });
        app.setMenuItemAction("View", "cmd_View_Icons", function() {
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

        chdir(argv.path);
      }
    });

    return new _ApplicationFilemanager();
  };
})($);
