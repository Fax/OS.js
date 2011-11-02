/*!
 * Application: ApplicationFileManager
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationFileManager = (function($, undefined) {
  "$:nomunge";

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    if ( argv.view_type == undefined ) {
      argv.view_type = 'icon';
    }
    if ( argv.path == undefined ) {
      argv.path = "/";
    }

    var _CurrentDir = "/";
    var _History = [];
    var lastItem;
    var _defaultStatusText = "";

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationFileManager", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationFileManager window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_close\"> <img alt=\"gtk-close\" src=\"/img/icons/16x16/actions/gtk-close.png\"/> <span>Close</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem2\"> <span><u>G</u>o</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem imagemenuitem_home\"> <img alt=\"gtk-home\" src=\"/img/icons/16x16/actions/gtk-home.png\"/> <span>Home</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem3\"> <span><u>V</u>iew</span> <ul class=\"GtkMenu menu3\"> <li class=\"GtkImageMenuItem menuitem_refresh\"> <img alt=\"gtk-refresh\" src=\"/img/icons/16x16/actions/gtk-refresh.png\"/> <span>Refresh</span> </li> <li class=\"GtkRadioMenuItem menuitem_list\"> <span>List view</span> </li> <li class=\"GtkRadioMenuItem menuitem_icon\"> <span>Icon View</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'File Manager';
        this._icon = 'apps/file-manager.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 500;
        this._height = 500;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;

        this.app.createUploadDialog(_CurrentDir, function() {
          self.chdir(_CurrentDir);
        });
      },


      EventMenuClose : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },


      EventMenuHome : function(el, ev) {
        if ( _CurrentDir != "/" ) {
          this.chdir("/");
          _History = [];
          _CurrentDir = "/";
        }
      },


      EventRefresh : function(el, ev) {
        this.chdir(_CurrentDir);
      },


      EventMenuListToggle : function(el, ev) {
        this.app._argv.view_type = 'list';
        this.chdir(_CurrentDir);
        this._updateMenu();
      },


      EventMenuIconToggle : function(el, ev) {
        this.app._argv.view_type = 'icon';
        this.chdir(_CurrentDir);
        this._updateMenu();
      },


      EventIconviewSelect : function(el, ev) {
      },

      chdir : function(dir, hist) {
        var self = this;

        this.app._event("browse", {"path" : dir, "view" : self.app._argv['view_type']}, function(result, error) {
          self._destroyView();

          if ( error ) {
            self.app.createMessageDialog("error", error);
            self.setTitle(self._origtitle);

            _defaultStatusText = "";
          } else {
            self.$element.find(".ApplicationFileManager .iconview1").html(result.items);
            self.setTitle(self._origtitle + ": " + result.path);

            _defaultStatusText = sprintf("%d items (%d bytes)", result.total, result.bytes);

            self._initClick();
          }

          self._call("resize");

          self.$element.find(".statusbar1").html(_defaultStatusText);
        });

        _CurrentDir = dir;
        self.app._argv['path'] = _CurrentDir;

        /*if ( hist !== false ) {
          _History.push(_CurrentDir);
        }*/
      },

      _updateTable : function() {
        var self = this;
        this.$element.find(".iconview1 table.TableHead td").each(function(ind, el) {
          var pel = self.$element.find(".iconview1 table.TableBody tr:first-child td").get(ind);
          if ( pel ) {
            $(el).css("width", $(pel).width() + "px");
          }
        });
      },

      _initClick : function () {
        var self = this;

        $(this.$element).find(".iconview1").bind("contextmenu",function(e) {
          return false;
        });

        this.$element.find(".ApplicationFileManager .Inner").bind('click', function(ev) {
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
            self.chdir(fpath);
          } else {
            API.system.run(fpath, fmime);
          }
          //ev.stopPropagation();
          ev.preventDefault();
        }).bind('mousedown', function(ev) {
          self._selItem(this);

          //ev.stopPropagation();
          ev.preventDefault();

          var pro = $(this).find("input[name=protected]").val() == "1";
          var path = $(this).find("input[name='path']").val();
          var fname = $(this).find("input[name='name']").val();

          if ( pro ) {
            return API.application.context_menu(ev, [
              {"title" : "Protected", "disabled" : true, "method" : function() {
                return false;
              }}
            ], $(this));
          } else {
            return API.application.context_menu(ev, [
              {"title" : "Delete", "method" : function() {
                self.app.createMessageDialog("confirm", "Are you sure you want to delete '" + fname + "'?", null, function() {
                  API.system.call("delete", path, function(result, error) {
                    if ( error === null ) {
                      self.chdir(_CurrentDir);
                    }
                  });
                });
              }},
              {"title" : "Rename", "method" : function() {
                self.app.createRenameDialog(fname, function(nfname) {
                  API.system.call("rename", [path, fname, nfname], function(result, error) {
                    if ( error === null ) {
                      self.chdir(_CurrentDir);
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

        this.$element.find(".ApplicationFileManager li").addClass("ContextMenu");
        this.$element.find(".ApplicationFileManager td").addClass("ContextMenu");
      },


      _selItem : function(t) {
        var self = this;
        if ( this.app._argv.view_type != 'icon' ) {
          if ( !$(t).parents(".TableBody").get(0) ) {
            return;
          }
        }

        if ( lastItem ) {
          if ( t && t.tagName.toLowerCase() == "tr" ) {
            $(lastItem).removeClass("Current");
          } else {
            $(lastItem).parent().removeClass("Current");
          }
        }

        if ( t ) {
          if ( t.tagName.toLowerCase() == "tr" ) {
            $(t).addClass("Current");
          } else {
            $(t).parent().addClass("Current");
          }

          var name = $(t).find("input[name='name']").val();
          var size = $(t).find("input[name='size']").val();
          var mime = $(t).find("input[name='mime']").val();
          var type = $(t).find("input[name='type']").val();

          if ( type == "dir" ) {
            self.$element.find(".statusbar1").html(sprintf('"%s" %s', name, "folder"));
          } else {
            self.$element.find(".statusbar1").html(sprintf('"%s" (%s b) %s', name, size, mime));
          }
        } else {
          self.$element.find(".statusbar1").html(_defaultStatusText);
        }

        lastItem = t;
      },

      _destroyView : function() {
        this.$element.find(".ApplicationFileManager .iconview1 .Inner").unbind();
        this.$element.find(".ApplicationFileManager .iconview1 ul").die();
        this.$element.find(".ApplicationFileManager .iconview1 ul").unbind();
        this.$element.find(".ApplicationFileManager .iconview1 table").die();
        this.$element.find(".ApplicationFileManager .iconview1 table").unbind();
        this.$element.find(".ApplicationFileManager .iconview1 ul").remove();
        this.$element.find(".ApplicationFileManager .iconview1 table").remove();
      },

      _updateMenu : function() {
        if ( this.app._argv.view_type == 'icon' ) {
          this.$element.find(".menuitem_list").removeClass("Checked");
          this.$element.find(".menuitem_icon").addClass("Checked");
        } else {
          this.$element.find(".menuitem_list").addClass("Checked");
          this.$element.find(".menuitem_icon").removeClass("Checked");
        }
      },


      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_close").click(function(ev) {
            self.EventMenuClose(this, ev);
          });

          el.find(".imagemenuitem_home").click(function(ev) {
            self.EventMenuHome(this, ev);
          });

          el.find(".menuitem_refresh").click(function(ev) {
            self.EventRefresh(this, ev);
          });

          el.find(".menuitem_list").click(function(ev) {
            self.EventMenuListToggle(this, ev);
          });

          el.find(".menuitem_icon").click(function(ev) {
            self.EventMenuIconToggle(this, ev);
          });

          el.find(".iconview1").click(function(ev) {
            self.EventIconviewSelect(this, ev);
          });

          // Do your stuff here

          el.addClass(this.name);


          this._bind("resize", function() {
            if ( self.app._argv.view_type == "list" ) {
              self._updateTable();
            }
          });


          $(el).click(function() {
            self._selItem();
          });


          this._updateMenu();
          this.chdir(argv.path);
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationFileManager = Application.extend({

      init : function() {
        this._super("ApplicationFileManager", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();

        // Do your stuff here
      }
    });

    return new __ApplicationFileManager();
  };
})($);
