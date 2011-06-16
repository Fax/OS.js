/**
 * Application: ApplicationFileManager
 *
 * TODO: Download files
 * TODO: Create new file from template
 * TODO: Create new directories
 * TODO: Edit menu (rename, copy, cut, paste, select all)
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationFileManager = (function($, undefined) {
  return function(Application, app, api, argv) {

    if ( argv.view_type == undefined ) {
      argv.view_type = 'icon';
    }
    if ( argv.path == undefined ) {
      argv.path = "/";
    }

    var _CurrentDir = "/";
    var _History = [];

    var _ApplicationFileManager = Application.extend({
      init : function() {
        this._super("ApplicationFileManager");
        this.argv = argv;
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;
        var el = app.$element;
        var lastItem;

        el.addClass(this.name);

        var _selItem = function(self) {
          if ( lastItem ) {
            if ( self && self.tagName.toLowerCase() == "tr" ) {
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
              $(el).find(".statusbar1").html(sprintf('"%s" %s', name, "folder"));
            } else {
              $(el).find(".statusbar1").html(sprintf('"%s" (%s b) %s', name, size, mime));
            }
          } else {
            $(el).find(".statusbar1").html(_defaultStatusText);
          }

          lastItem = self;
        };

        var _defaultStatusText = "";

        var _initClick = function() { 

          $(el).find(".ApplicationFileManager .Inner").bind('click', function(ev) {
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
            var path = $(this).find("input[name='path']").val();
            var fname = $(this).find("input[name='name']").val();

            if ( pro ) {
              return api.application.context_menu(ev, [
                {"title" : "Protected", "disabled" : true, "method" : function() {
                  return false;
                }}
              ], $(this));
            } else {
              return api.application.context_menu(ev, [
                {"title" : "Delete", "method" : function() {
                  api.system.dialog("confirm", "Are you sure you want to delete '" + fname + "'?", null, function() {
                    api.system.call("delete", path, function(result, error) {
                      if ( error === null ) {
                        chdir(_CurrentDir);
                      }
                    });
                  });
                }},
                {"title" : "Rename", "method" : function() {
                  api.system.dialog_rename(fname, function(nfname) {
                    api.system.call("rename", [path, fname, nfname], function(result, error) {
                      if ( error === null ) {
                        chdir(_CurrentDir);
                      }
                    });
                  });
                }}/*,
                {"title" : "Download", "method" : function() {
                  alert('Not implemented yet'); // TODO
                }}*/
              ], $(this));
            }
          });

          $(el).find(".ApplicationFileManager li").addClass("ContextMenu");
          $(el).find(".ApplicationFileManager td").addClass("ContextMenu");
        };

        var _destroyView = function() {
          $(el).find(".ApplicationFileManager .iconview1 .Inner").unbind();
          $(el).find(".ApplicationFileManager .iconview1 ul").die();
          $(el).find(".ApplicationFileManager .iconview1 ul").unbind();
          $(el).find(".ApplicationFileManager .iconview1 table").die();
          $(el).find(".ApplicationFileManager .iconview1 table").unbind();
          $(el).find(".ApplicationFileManager .iconview1 ul").remove();
          $(el).find(".ApplicationFileManager .iconview1 table").remove();
        };

        function chdir(dir, hist) {
          app.event(self, "browse", {"path" : dir, "view" : self.argv['view_type']}, function(result, error) {
            _destroyView();

            if ( error ) {
              api.system.dialog("error", error);
              $(el).find(".WindowTopInner span").html(app.title);

              _defaultStatusText = "";
            } else {
              $(el).find(".ApplicationFileManager .iconview1").html(result.items);
              $(el).find(".WindowTopInner span").html(app.title + ": " + result.path);

              _defaultStatusText = sprintf("%d items (%d bytes)", result.total, result.bytes);

              _initClick();
            }
            $(el).find(".statusbar1").html(_defaultStatusText);
          });

          _CurrentDir = dir;
          self.argv['path'] = _CurrentDir;

          /*if ( hist !== false ) {
            _History.push(_CurrentDir);
          }*/
        }

        function _updateMenu() {
          if ( self.argv.view_type == 'icon' ) {
            el.find(".menuitem5").removeClass("Checked");
            el.find(".menuitem4").addClass("Checked");
          } else {
            el.find(".menuitem5").addClass("Checked");
            el.find(".menuitem4").removeClass("Checked");
          }
        }

        $(el).click(function() {
          _selItem();
        });

        el.find(".imagemenuitem1").click(function() {
          api.system.dialog_upload(_CurrentDir, function() {
            chdir(_CurrentDir);
            //chdir("/");
          });
        });

        el.find(".imagemenuitem4").click(function() {
          el.find(".ActionClose").click();
        });

        el.find(".imagemenuitem6").click(function() {
          if ( _CurrentDir != "/" ) {
            chdir("/");
            _History = [];
            _CurrentDir = "/";
          }
        });

        el.find(".menuitem5").click(function() {
          self.argv.view_type = 'list';
          chdir(_CurrentDir);
          _updateMenu();
        });

        el.find(".menuitem4").click(function() {
          self.argv.view_type = 'icon';
          chdir(_CurrentDir);
          _updateMenu();
        });

        el.find(".menuitem6").click(function() {
          chdir(_CurrentDir);
        });

        _updateMenu();

        this._super();

        chdir(argv.path);
      }
    });

    return new _ApplicationFileManager();
  };
})($);
