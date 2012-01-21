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
    var _defaultStatusText = "";

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("ApplicationFileManager", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationFileManager window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_mkdir\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_close\"> <img alt=\"gtk-close\" src=\"/img/icons/16x16/actions/gtk-close.png\"/> <span>Close</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem2\"> <span><u>G</u>o</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem imagemenuitem_home\"> <img alt=\"gtk-home\" src=\"/img/icons/16x16/actions/gtk-home.png\"/> <span>Home</span> </li> </ul> </li> <li class=\"GtkMenuItem menuitem3\"> <span><u>V</u>iew</span> <ul class=\"GtkMenu menu3\"> <li class=\"GtkImageMenuItem menuitem_refresh\"> <img alt=\"gtk-refresh\" src=\"/img/icons/16x16/actions/gtk-refresh.png\"/> <span>Refresh</span> </li> <li class=\"GtkRadioMenuItem menuitem_list\"> <span>List view</span> </li> <li class=\"GtkRadioMenuItem menuitem_icon\"> <span>Icon View</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview1\"></div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
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

        this.iconview = null;
        this.loading = $("<div class=\"Loading\"><img alt=\"\" src=\"/img/ajaxload_surround_invert_64.gif\" /></div>");
      },

      destroy : function() {
        if ( this.iconview ) {
          this.iconview.destroy();
          this.iconview = null;
        }

        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;

        this.app.createUploadDialog(_CurrentDir, function(path, fname) {
          self.chdir(_CurrentDir, undefined, function() {
            self.iconview.selectItem("name", fname);
          });
        });
      },

      EventMenuMkdir : function(el, ev) {
        var self = this;

        this.app.createInputDialog("New Directory", "Directory name:", function(dir) {
          if ( dir ) {
            API.system.call("mkdir", (_CurrentDir + "/" + dir), function(result, error) {
              if ( error === null ) {
                self.chdir(_CurrentDir, undefined, function() {
                  self.iconview.selectItem("name", result);
                });
              }
            });
          } else {
            self.app.createMessageDialog("error", "Cannot create this directory");
          }
        });

      },


      EventMenuClose : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },


      EventMenuHome : function(el, ev) {
        if ( _CurrentDir != "/" ) {
          this.chdir("/");
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

      chdir : function(dir, hist, callback) {
        var self = this;

        callback = callback || function() {};

        this.iconview.setListType(this.app._argv.view_type);
        this.iconview.clear();
        this.loading.show();

        this.app._event("browse", {"path" : dir, "view" : self.app._argv['view_type']}, function(result, error) {
          self._destroyView();

          if ( error ) {
            self.app.createMessageDialog("error", error);
            self.setTitle(self._origtitle);

            _defaultStatusText = "";
          } else {
            self.iconview.setList(result.items, result.columns, true);
            self.setTitle(self._origtitle + ": " + result.path);

            _defaultStatusText = sprintf("%d items (%d bytes)", result.total, result.bytes);
          }

          self.$element.find(".statusbar1").html(_defaultStatusText);

          self.loading.hide();

          setTimeout(function() {
            callback();

            self._call("resize");
          }, 0);
        });

        _CurrentDir = dir;
        self.app._argv['path'] = _CurrentDir;
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
          }).find("span").html("Upload");

          el.find(".imagemenuitem_mkdir").click(function(ev) {
            self.EventMenuMkdir(this, ev);
          }).find("span").html("Create Directory");

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

          var t = self.app._argv.view_type;
          var iv = this.$element.find(".iconview1");

          this.iconview = new OSjs.Classes.IconView(iv, t, [], [], function(el, item, type, index) {
            self.onIconViewUpdate(el, item, type, index);
          }, function(el, item) {
            self.onIconViewActivate(el, item);
          }, function(ev, el, item) {
            self.onIconViewToggle(ev, el, item);
          });

          this._bind("resize", function() {
            self.iconview.resize();
          });

          iv.parent().append(this.loading);

          this._updateMenu();
          this.chdir(argv.path);
        }
      },

      onIconViewUpdate : function(el, item, type, index) {
        el.find(".Title").html(item.name);
        if ( type === 0 ) {
          el.find(".Image").html(sprintf("<img alt=\"\" src=\"%s\" width=\"32\" height=\"32\" />", item.icon));
        } else {
          el.find(".Image").html(sprintf("<img alt=\"\" src=\"%s\" width=\"16\" height=\"16\" />", item.icon));
          el.find(".Size").html(item.size);
          el.find(".Type").html(item.mime);
        }

        var tmp = el.find(".Info");
        for ( var x in item ) {
          if ( item.hasOwnProperty(x) ) {
            tmp.append(sprintf("<input type=\"hidden\" name=\"%s\" value=\"%s\" />", x, item[x]));
          }
        }
      },

      onIconViewActivate : function(el, item) {
        if ( el && item ) {
          if ( item.type == "dir" ) {
            this.chdir(item.path);
          } else {
            API.system.run(item.path, item.mime);
          }
        }
      },

      onIconViewToggle : function(ev, el, item) {
        var self = this;

        var result = true;
        if ( el && item ) {
          result = false;

          if ( item['protected'] ) {
            result = API.application.context_menu(ev, [
              {"title" : "Protected", "disabled" : true, "method" : function() {
                return false;
              }}
            ], $(el));
          } else {
            result = API.application.context_menu(ev, [
              {"title" : "Open", "method" : function() {
                if ( item.type == "dir" ) {
                  self.chdir(item.path);
                } else {
                  API.system.run(item.path, item.mime);
                }
              }},
              {"title" : "Open With...", "method" : function() {
                if ( item.type == "dir" ) {
                  self.chdir(item.path);
                } else {
                  API.system.run(item.path, item.mime, true);
                }
              }},
              {"title" : "Delete", "method" : function() {
                self.app.createMessageDialog("confirm", "Are you sure you want to delete '" + item.name + "'?", null, function() {
                  API.system.call("delete", item.path, function(result, error) {
                    if ( error === null ) {
                      self.chdir(_CurrentDir);
                    }
                  });
                });
              }},
              {"title" : "Rename", "method" : function() {
                self.app.createRenameDialog(item.name, function(nfname) {
                  API.system.call("rename", [item.path, item.name, nfname], function(result, error) {
                    if ( error === null ) {
                      self.chdir(_CurrentDir);
                    }
                  });
                });
              }},
              {"title" : "Properties", "method" : function() {
                self.app.createFilePropertyDialog(item.path, function(result) {
                  return;
                });
              }}
            ], $(el));
          }
        }

        if ( result ) {
          if ( el && item ) {
            if ( item.type == "dir" ) {
              this.$element.find(".statusbar1").html(sprintf('"%s" %s', item.name, "folder"));
            } else {
              this.$element.find(".statusbar1").html(sprintf('"%s" (%s b) %s', item.name, item.size, item.mime));
            }
          } else {
            this.$element.find(".statusbar1").html(_defaultStatusText);
          }
        }

        return result;
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
