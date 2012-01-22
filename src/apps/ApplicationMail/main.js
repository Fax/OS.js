/*!
 * Application: ApplicationMail
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.ApplicationMail = (function($, undefined) {
  "$:nomunge";

  var iframeCount = 0;
  var defaultConfig = {
    "accounts" : {
      "default" : {
        "host"      : null,
        "username"  : null,
        "password"  : null,
        "timestamps": {},
        "cache"     : {
          "folders"   : [],
          "messages"  : {}
        }
      }
    }
  };

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window_mail = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window_mail", false, app, windows);
        this._content = $("<div class=\"window_mail\"> <div class=\"GtkWindow ApplicationMail window_mail\"> <table class=\"GtkBox Vertical box3\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar_mail\"> <li class=\"GtkMenuItem menuitem_mail\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem imagemenuitem_mail_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem2\"></div> <li class=\"GtkImageMenuItem imagemenuitem_mail_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <textarea class=\"GtkTextView GtkObject textview_mail\"></textarea> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar Vertical statusbar_mail\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Mail Reader/Composer';
        this._icon = 'status/mail-unread.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 440;
        this._height = 300;
        this._gravity = null;

        this.iframeIndex = iframeCount;
        this.loading = $("<div class=\"Loading\"><img alt=\"\" src=\"/img/ajaxload_surround_invert_64.gif\" /></div>");

        iframeCount++;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;


      },


      EventMenuQuit : function(el, ev) {
        var self = this;


      },


      ReadMail : function(item, message, account) {
        var self = this;

        console.log(item, message, account);

        var txt = window.frames["ApplicationMailIframe_" + this.iframeIndex];
        if ( item ) {
          if ( txt ) {
            txt.document.body.style.whiteSpace = "normal";

            if ( message.html ) {
              txt.document.body.innerHTML = message.html;
            } else if ( message.plain ) {
              txt.document.body.style.whiteSpace = "pre";
              txt.document.body.innerHTML = message.plain;
            } else {
              txt.document.body.innerHTML = "No message data!";
            }
          }

          this.$element.find(".statusbar_mail").html(sprintf("From: %s, %s", item.sender || "Unknown", item.date));
        } else {
          this.$element.find(".statusbar_mail").html("Failed to read message");
        }

        this.loading.hide();
      },


      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_mail_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_mail_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here
          var par = this.$element.find(".textview_mail").parent();
          this.$element.find(".textview_mail").remove();
          var nel = $("<iframe class=\"textview_mail\" border=\"0\" width=\"100%\" height=\"100%\" frameborder=\"0\" name=\"ApplicationMailIframe_" + this.iframeIndex + "\"></iframe>");
          par.append(nel);
          par.append(this.loading);

          this.loading.show();

          return true;
        }

        return false;
      }
    });


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window_main = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window_main", false, app, windows);
        this._content = $("<div class=\"window_main\"> <div class=\"GtkWindow ApplicationMail window_main\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar_main\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_main_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_main_options\"> <img alt=\"gtk-options\" src=\"/img/icons/16x16/categories/applications-system.png\"/> <span>Options</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_main_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> <li class=\"GtkMenuItem menuitem2\"> <span><u>M</u>ail</span> <ul class=\"GtkMenu menu2\"> <li class=\"GtkImageMenuItem imagemenuitem_main_fetch\"> <img alt=\"gtk-fetch\" src=\"/img/icons/16x16/status/stock_mail-replied.png\"/> <span>Fetch messages</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_main_reload\"> <img alt=\"gtk-reload\" src=\"/img/icons/16x16/status/stock_repeat.png\"/> <span>Reload messages</span> </li> </li> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Horizontal box2\"> <tr> <td class=\"GtkBoxPosition Position_0\" style=\"width:200px\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview_list\"></div> </div> </td> <td class=\"GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview_mail\"></div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar_main\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Mail (UNDER DEVELOPMENT)';
        this._icon = 'status/mail-unread.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 440;
        this._height = 440;
        this._gravity = null;

        this.iconview       = null;
        this.currentAccount = {};
        this.currentFolder  = "INBOX";
        this.currentFilter  = "ALL";
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


      },

      EventMenuOptions : function(el, ev) {
        var self = this;

        var acc = this.app.getConfigAccount("default");
        var config_window = new Window_window_options(this.app);
        if ( this.app.addWindow(config_window) ) {
          config_window.show();
        }

        config_window.UpdateConfig(acc);
      },

      EventMenuFetch : function(el, ev) {
        this.app.TryConnect();
      },

      EventMenuReload : function(el, ev) {
        var account = this.app.getConfigAccount("default");
        this.app.setConfigAccount("default", account.host, account.username, account.password);
        this.app.TryConnect();
      },

      EventMenuQuit : function(el, ev) {
        this.find.$element.find(".Close").click();
      },

      UpdateStatusBar : function(str) {
        this.$element.find(".statusbar_main").html(str);
      },

      UpdateFoldersContent : function(content) {
        this.$element.find(".iconview_list").html(content);
      },

      UpdateFolders : function(folders, current) {
        current = current || 0;

        var self = this;
        var el, iter;
        var i = 0;
        var l = folders.length;
        var r = this.$element.find(".iconview_list");

        var currentItem;

        r.empty();
        for ( i; i < l; i++ ) {
          iter = folders[i];
          el = $(sprintf('<div>%s</div>', iter.name));
          if ( !currentItem && (current == iter.name) || (current === i) ) {
            el.addClass("Current");
            currentItem = el;
          }

          el.click((function(iiter) {
            return function() {
              if ( currentItem ) {
                $(currentItem).removeClass("Current");
              }

              if ( $(currentItem) != $(this) ) {
                $(this).addClass("Current");
              }

              currentItem = this;

              self.ChangeFolder(iiter.name);
            };
          })(iter));

          r.append(el);
        }

        this.app.setConfigAccountCacheFolders("default", folders);
      },

      UpdateMessages : function(result, cache) {
        var self = this;

        this.iconview.clear();

        if ( !cache ) {
          this.app.setConfigAccountCacheMessages("default", this.currentFolder, result, true);
          this.app.setConfigAccountTimestamp("default", this.currentFolder, (new Date()).getTime());
        }

        var mcache = this.app.getConfigAccountCacheMessages("default", this.currentFolder);
        if ( mcache ) {
          this.iconview.setList(mcache.items, mcache.columns, true);
        }
        //this.iconview.setList(result.items, result.columns, true);
      },

      Connect : function(account) {
        var self = this;

        this.currentAccount = {
          "host"      : account.host,
          "username"  : account.username,
          "password"  : account.password
        };

        this.UpdateFoldersContent($("<div>Loading folders...</div>"));
        this.UpdateStatusBar("Logging in...");

        // Load data from cache first
        var fcache = this.app.getConfigAccountCacheFolders("default");
        var mcache = this.app.getConfigAccountCacheMessages("default", this.currentFolder);
        if ( fcache ) {
          this.UpdateFolders(fcache, true);
        }
        if ( mcache ) {
          this.UpdateMessages(mcache, true);
        }

        // Update
        this.MailReadAccount(function(error, result) {
          if ( error ) {
            self.UpdateFoldersContent($("<div>Failed loading folders...</div>"));
            self.UpdateStatusBar("Error loading folders: " + error);
          } else {
            self.UpdateStatusBar("Loading messages...");
            self.MailReadFolder(self.currentFolder, function(error, result) {
              if ( error ) {
                self.UpdateStatusBar("Error loading messages: " + error);
              } else {
                self.UpdateStatusBar(sprintf("Total messages: %d, Unread: %d", sizeof(result), -1));
              }
            });
          }
        });
      },

      ChangeFolder : function(name) {
        var self = this;

        this.currentFolder = name;

        this.UpdateStatusBar("Loading messages...");

        this.MailReadFolder(this.currentFolder, function(error, result) {
          if ( error ) {
            self.UpdateStatusBar("Error loading messages: " + error);
          } else {
            self.UpdateStatusBar(sprintf("Total messages: %d, Unread: %d", result.length, -1));
          }
        });
      },

      // MAIL EVENTS

      MailReadAccount : function(callback) {
        callback = callback || function() {};

        var self = this;
        this.app._event("account", {"account" : self.currentAccount}, function(result, error) {
          if ( !error ) {
            self.UpdateFolders(result);
          }

          callback(error, result);
        });
      },

      MailReadFolder : function(folder, callback) {
        callback = callback || function() {};

        var self = this;
        var stamp = this.app.getConfigAccountTimestamp("default", folder) || 0;
        this.app._event("folder", {"account" : self.currentAccount, "folder" : folder, "iconview" : true, "filter" : self.currentFilter, "timestamp" : stamp}, function(result, error) {
          if ( !error ) {
            self.UpdateMessages(result);
          }

          callback(error, result);
        });
      },

      MailRead : function(id, callback) {
        callback = callback || function() {};

        var self = this;
        this.app._event("read", {"account" : self.currentAccount, "id" : id}, function(result, error) {
          callback(error, result);
        });
      },

      /*
      MailSend : function(callback) {
        callback = callback || function() {};

        this.app._event("send", {}, function(result, error) {
          if ( error ) {
            alert("An error occured!\n\n" + error);
          } else {
            console.log(result);
          }

          callback(error, result);
        });
      },
      */

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_main_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_main_options").click(function(ev) {
            self.EventMenuOptions(this, ev);
          });

          el.find(".imagemenuitem_main_fetch").click(function(ev) {
            self.EventMenuFetch(this, ev);
          });

          el.find(".imagemenuitem_main_reload").click(function(ev) {
            self.EventMenuReload(this, ev);
          });

          el.find(".imagemenuitem_main_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here
          var iv = this.$element.find(".iconview_mail");
          var t  = "list";

          this.iconview = new OSjs.Classes.IconView(iv, t, [], [], function(el, item, type, index) {
            el.find(".Sender").html(item.sender);
            el.find(".Subject").html(item.subject);
            el.find(".Date").html(item.date);
          }, function(el, item) {
            var win = self.app.OpenMailWindow();
            if ( win ) {
              self.MailRead(item.uid, function(error, result) {
                if ( !error ) {
                  win.ReadMail(item, result, self.currentAccount);
                }
              });
            }

            //self.onIconViewActivate(el, item);
          }, function(ev, el, item) {
            //self.onIconViewToggle(ev, el, item);
          });

          this._bind("resize", function() {
            self.iconview.resize();
          });

          return true;
        }

        return false;
      }
    });


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window_options = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window_options", false, app, windows);
        this._content = $("<div class=\"window_options\"> <div class=\"GtkWindow ApplicationMail window_options\"> <div class=\"OptionsContent\"></div> </div> </div> ").html();
        this._title = 'Mail Options';
        this._icon = 'status/mail-unread.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = true;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 250;
        this._height = 250;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },

      UpdateConfig : function(acc) {

      },

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          // Do your stuff here
          var root = this.$element.find(".OptionsContent");
          var row_host  = "<tr><td>Host:</td><td><input type=\"text\" value=\"\" name=\"host\" /></td></tr>";
          var row_user  = "<tr><td>Username:</td><td><input type=\"text\" value=\"\" name=\"username\" /></td></tr>";
          var row_pass  = "<tr><td>Password:</td><td><input type=\"password\" value=\"\" name=\"password\" /></td></tr>";
          var table     = $("<table>" + row_host + row_user + row_pass + "</table>");
          var buttons   = $("<div><button class=\"Save\">Save</button><button class=\"Close\">Close</button></div>");

          buttons.find(".Save").click(function() {
            var account = {
              "host"      : self.$element.find("input[name=host]").val(),
              "username"  : self.$element.find("input[name=username]").val(),
              "password"  : self.$element.find("input[name=password]").val()
            };
            self.app.setConfigAccount("default", account.host, account.username, account.password);
            self.app.TryConnect();

            self.close();
          });

          buttons.find(".Close").click(function() {
            self.close();
          });

          root.append(table);
          root.append(buttons);

          // Set options
          var acc = this.app.getConfigAccount("default");
          console.log(acc);

          if ( acc ) {
            this.$element.find("input[name=host]").val(acc.host);
            this.$element.find("input[name=username]").val(acc.username);
            this.$element.find("input[name=password]").val(acc.password);
          }

          return true;
        }

        return false;
      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __ApplicationMail = Application.extend({

      init : function() {
        this._super("ApplicationMail", argv);

        this._compability = [];
        this._storage_on  = true;
        this._storage     = defaultConfig;
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window_main(self);
        this._super(root_window);
        root_window.show();

        // Do your stuff here

        // Backward-compability
        try {
          var x = this._storage.accounts["default"].cache.messages;
          var y = this._storage.accounts["default"].timestamps;

          if ( x === undefined || y === undefined ) {
            throw "...";
          }

          delete x;
          delete y;
        } catch ( eee ) {
          this._storage = defaultConfig;
          this._saveStorage();
        }

        this.TryConnect();
      },

      TryConnect : function() {
        var acc = this.getConfigAccount("default");

        if ( !acc || !acc.host || !acc.username || !acc.password ) {
          API.system.alert("Configuration missing or incomplete.");
          this.OpenOptionsWindow();
        } else {
          this._root_window.Connect(acc);
        }
      },

      OpenMailWindow : function() {
        var win = new Window_window_mail(this);
        return this.addWindow(win);
      },

      OpenOptionsWindow : function() {
        this._root_window.EventMenuOptions();
      },

      // Configuration(s)

      setConfigAccount : function(name, host, username, password) {
        this._storage.accounts[name] = {
          "host"        : host,
          "username"    : username,
          "password"    : password,
          "timestamps"  : {},
          "cache"       : {
            "folders"     : [],
            "messages"    : {}
          }
        };

        this._saveStorage();
      },

      setConfigAccountCacheFolders : function(name, items) {
        name = name || "default";
        this._storage.accounts[name].cache.folders = items;
        this._saveStorage();
      },

      setConfigAccountCacheMessages : function(name, folder, items, append) {
        name = name || "default";
        if ( append ) {
          // Use cache as a reference when appending
          var tmp = this._storage.accounts[name].cache.messages[folder];
          if ( tmp ) {
            var tmpitems = tmp.items;

            var chk = {};
            var iter;

            // Compile a list of uids
            var x = 0;
            var ll = tmpitems.length;
            for ( x; x < ll; x++ ) {
              iter = tmpitems[x];
              chk[iter.uid] = true;
            }

            // Add missing messages to top of stack
            var i = 0;
            var initems = items.items;
            var l = initems.length;
            for ( i; i < l; i++ ) {
              iter = initems[i];
              if ( chk[iter.uid] === undefined ) {
                tmpitems.unshift(iter);
              }
            }

            // Set the new message list into cache
            tmp.items = tmpitems;
            this._storage.accounts[name].cache.messages[folder] = tmp;
          } else {
            this._storage.accounts[name].cache.messages[folder] = items;
          }
        } else {
          this._storage.accounts[name].cache.messages[folder] = items;
        }

        this._saveStorage();
      },

      setConfigAccountTimestamp : function(name, folder, stamp) {
        name = name || "default";
        this._storage.accounts[name].timestamps[folder] = stamp;
        this._saveStorage();
      },

      getConfigAccount : function(name) {
        name = name || "default";

        var tst = this._storage.accounts[name];
        return tst ? tst :false;
      },

      getConfigAccountCache : function(name) {
        name = name || "default";

        var tst = this.getConfigAccount(name);
        if ( tst && tst.cache ) {
          return tst.cache;
        }
        return false;
      },

      getConfigAccountCacheFolders : function(name) {
        name = name || "default";

        var tst = this.getConfigAccountCache(name);
        if ( tst && tst.folders ) {
          return tst.folders;
        }
        return false;
      },

      getConfigAccountCacheMessages : function(name, folder) {
        name = name || "default";

        var tst = this.getConfigAccountCache(name);
        if ( tst && tst.messages && tst.messages[folder] ) {
          return tst.messages[folder];
        }
        return false;
      },

      getConfigAccountTimestamp : function(name, folder) {
        name = name || "default";

        var tst = this.getConfigAccount(name);
        if ( tst && tst.timestamps && tst.timestamps[folder] ) {
          return tst.timestamps[folder];
        }
        return false;
      }

    });

    return new __ApplicationMail();
  };
})($);
