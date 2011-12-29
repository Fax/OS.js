/*!
 * Application: ApplicationMail
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationMail = (function($, undefined) {
  "$:nomunge";

  var iframeCount = 0;

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
        this._content = $("<div class=\"window_main\"> <div class=\"GtkWindow ApplicationMail window_main\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar_main\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_main_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_main_options\"> <img alt=\"gtk-options\" src=\"/img/icons/16x16/categories/applications-system.png\"/> <span>Options</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_main_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Horizontal box2\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"width:200px\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview_list\"></div> </div> </td> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkIconView GtkObject iconview_mail\"></div> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar_main\"></div> </div> </td> </tr> </table> </div> </div> ").html();
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

        this.currentAccount = {};
        this.currentFolder  = "INBOX";
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        var self = this;


      },

      EventMenuOptions : function(el, ev) {
        var self = this;

        var acc;
        if ( this.app._storage && this.app._storage.accounts ) {
          acc = this.app._storage.accounts['default'];
        }

        var config_window = new Window_window_options(this.app);
        if ( this.app.addWindow(config_window) ) {
          config_window.show();
        }

        config_window.UpdateConfig(acc);
      },

      EventMenuQuit : function(el, ev) {
        var self = this;


      },

      UpdateStatusBar : function(str) {
        this.$element.find(".statusbar_main").html(str);
      },

      UpdateFoldersContent : function(content) {
        this.$element.find(".iconview_list").html(content);
      },

      UpdateMessagesContent : function(content) {
        this.$element.find(".iconview_mail").html(content);
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
          if ( (current == iter.name) || (current === i) ) {
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
      },

      UpdateMessages : function(list, current) {
        current = current || 0;

        var self = this;
        var el, iter;
        var i = 0;
        var l = list.length;
        var r = this.$element.find(".iconview_mail");

        var currentItem;

        r.empty();
        for ( i; i < l; i++ ) {
          iter = list[i];
          el = $(sprintf('<div>%s</div>', iter.subject));
          if ( (current == iter.header) || (current === i) ) {
            el.addClass("Current");
            currentItem = el;
          }

          el.click(function() {
            if ( currentItem ) {
              $(currentItem).removeClass("Current");
            }

            if ( $(currentItem) != $(this) ) {
              $(this).addClass("Current");
            }

            currentItem = this;
          });

          el.dblclick((function(iiter) {
            return function() {
              var win = self.app.OpenMailWindow();
              if ( win ) {
                self.MailRead(iiter.id, function(error, result) {
                  if ( !error ) {
                    win.ReadMail(iiter, result, self.currentAccount);
                  }
                });
              }
            };
          })(iter));

          r.append(el);
        }
      },

      Connect : function(account) {
        var self = this;

        this.currentAccount = account;

        this.UpdateFoldersContent($("<div>Loading folders...</div>"));
        this.UpdateMessagesContent($("<div>Loading messages...</div>"));
        this.UpdateStatusBar("Logging in...");

        this.MailReadAccount(function(error, result) {
          if ( error ) {
            self.UpdateFoldersContent($("<div>Failed loading folders...</div>"));
            self.UpdateStatusBar("Error loading folders: " + error);
          } else {
            self.UpdateStatusBar("Loading messages...");
            self.MailReadFolder(self.currentFoler, function(error, result) {
              if ( error ) {
                self.UpdateMessagesContent($("<div>Failed loading messages...</div>"));
              } else {
                self.UpdateStatusBar(sprintf("Total messages: %d, Unread: %d", result.length, -1));
              }
            });
          }
        });
      },

      ChangeFolder : function(name) {
        var self = this;

        this.currentFolder = name;

        this.UpdateMessagesContent($("<div>Loading messages...</div>"));
        this.UpdateStatusBar("Loading messages...");

        this.MailReadFolder(this.currentFolder, function(error, result) {
          if ( error ) {
            self.UpdateMessagesContent($("<div>Failed loading messages...</div>"));
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
        this.app._event("folder", {"account" : self.currentAccount, "folder" : folder}, function(result, error) {
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

          el.find(".imagemenuitem_main_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here

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
            self.app.SaveSettings("default", account, true);

            self.close();
          });

          buttons.find(".Close").click(function() {
            self.close();
          });

          root.append(table);
          root.append(buttons);

          // Set options
          var acc;
          if ( this.app._storage && this.app._storage.accounts ) {
            acc = this.app._storage.accounts['default'];
          }

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
        this._storage_on = true;

        this.accounts = [];
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
        var acc;
        if ( this.LoadSettings() ) {
          acc = this._storage.accounts['default'];
        }

        if ( !acc ) {
          this.OpenOptionsWindow();
        } else {
          root_window.Connect(acc);
        }

      },

      LoadSettings : function() {
        if ( this._storage && this._storage.accounts ) {
          this.accounts = this._storage.accounts;

          return true;
        }
        return false;
      },

      SaveSettings : function(name, opts, reconnect) {
        var self = this;

        if ( name && opts ) {
          this.accounts = {};
          this.accounts[name] = opts;
        }

        this._storage = {
          "accounts" : self.accounts
        };
        this._saveStorage();

        var acc = this._storage.accounts['default'];
        if ( acc && reconnect ) {
          this._root_window.Connect(acc);
        }
      },

      OpenMailWindow : function() {
        var win = new Window_window_mail(this);
        return this.addWindow(win);
      },

      OpenOptionsWindow : function() {
        this._root_window.EventMenuOptions();
      }

    });

    return new __ApplicationMail();
  };
})($);
