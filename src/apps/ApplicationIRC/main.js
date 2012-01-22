/*!
 * Application: ApplicationIRC
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.ApplicationIRC = (function($, undefined) {
  "$:nomunge";

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    /**
     * IRC Class
     *
     * @link http://www.irchelp.org/irchelp/rfc/chapter4.html
     * @link http://calebdelnay.com/blog/2010/11/parsing-the-irc-message-format-as-a-client
     * @author Anders Evenrud <andersevenrud@gmail.com>
     * @class
     */
    var IRC = Class.extend({

      init : function(opts) {
        this._socket = null;
        this.nick   = opts.nick; //"osjs";
        this.host   = "localhost";
        this.server = opts.server; //"efnet.xs4all.nl";
        this.port   = opts.port; //6667;

        this.on_connect = function() {};
        this.on_disconnect = function() {};

        this.win = null;
      },

      destroy : function() {
        var self = this;

        if ( this._socket ) {
          this.send("QUIT");

          setTimeout(function() {
            self._socket.destroy();
          }, 0);

          setTimeout(function() {
            self._socket = null;
          }, 0);
        }
      },

      connect : function(socket) {
        var self = this;
        if ( !this._socket ) {
          this._socket = socket;
          this._socket.on_open = function(ev) {
            self.socket_open(ev);
          };
          this._socket.on_close = function(ev) {
            self.socket_close(ev);
          };
          this._socket.on_message = function(ev, js, error) {
            self.socket_recv(ev, js, error);
          };
          this._socket.on_error = function(ev) {
            self.socket_error(ev);
          };

          this._socket.connect();

          this.on_connect();
        }
      },

      print : function(msg, tab, callback) {
        callback = callback || function() {};
        var el;
        var d = new Date();
        var timestamp = sprintf("[%02d:%02d:%02d] ", d.getHours(), d.getMinutes(), d.getSeconds());

        var r = false;
        if ( tab ) {
          el = this.win.app.addTab(tab).find(".Textarea");
          r = true;
        } else {
          el = this.win.$element.find(".textview_status");
        }

        if ( el && el.get(0) ) {
          if ( r ) {
            el.append("<b>" + timestamp + "</b>" + msg);
          } else {
            var val = el.val();
            el.val(val + timestamp + msg);
          }
          el.scrollTop(el.get(0).scrollHeight);


          callback(el.parent());
        }
      },

      send : function(msg) {
        this._socket.send(JSON.stringify({'method' : 'tcp_send', 'arguments' : [msg + "\r\n"]}));
      },

      socket_open : function(ev) {
        this._socket.send(JSON.stringify({'method' : 'tcp_open', 'arguments' : [this.server, this.port]}));

        if ( this.win ) {
          this.win.$element.find(".imagemenuitem_connect").addClass("Disabled");
          this.win.$element.find(".imagemenuitem_disconnect").removeClass("Disabled");
        }
      },

      socket_close : function(ev) {
        this._socket = null;

        if ( this.win ) {
          this.win.$element.find(".imagemenuitem_connect").removeClass("Disabled");
          this.win.$element.find(".imagemenuitem_disconnect").addClass("Disabled");
          this.win.$element.find(".imagemenuitem_options").addClass("Disabled");
        }

        this.on_disconnect();
      },

      socket_error : function(ev) {
        if ( this.win ) {
          this.win.$element.find(".imagemenuitem_connect").removeClass("Disabled");
          this.win.$element.find(".imagemenuitem_disconnect").addClass("Disabled");
          this.win.$element.find(".imagemenuitem_options").removeClass("Disabled");
        }

        this.socket_close(ev);
      },

      socket_recv : function(ev, js, data, err) {
        if ( !err && js ) {
          if ( js.result ) {
            if ( js.method == "tcp_open" ) {
              this.send(sprintf("NICK %s", this.nick));
              this.send(sprintf("USER %s localhost %s :%s", this.nick, this.server, this.nick));
            }
          } else if ( js.response ) {
            var res = js.response;

            var lines = res.split("\r\n");
            var line, pline, tab;
            for ( var i = 0; i < lines.length; i++ ) {
              line = lines[i];

              if ( line ) {

                // Parse cmd
                var prefix = "";
                var command = "";
                var parameters = [];
                var trailing = null;

                var prefixEnd = -1;
                if ( line.match(/^:/) ) {
                  prefixEnd = line.indexOf(" ");
                  prefix = line.substr(1, prefixEnd -1);
                }
                var trailingStart = line.indexOf(" :");
                if ( trailingStart >= 0 ) {
                  trailing = line.substr(trailingStart + 2);
                } else {
                  trailingStart = line.length;
                }

                var commandAndParams = line.substr(prefixEnd + 1, trailingStart - prefixEnd -1).split(" ");
                command = commandAndParams.shift();
                if ( commandAndParams.length ) {
                  parameters = commandAndParams;
                }

                if ( trailing ) {
                  parameters.push(trailing);
                }

                // Perform CMDs
                var removeTab;
                var user;
                var callback = null;

                switch ( command ) {
                  case "PRIVMSG" :
                    if ( parameters[0].match(/^#/) ) {
                      tab = "channel-" + parameters[0].replace("#", "");
                      user = prefix.split("!")[0];
                      if ( user == this.nick ) {
                        pline = sprintf("<span class=\"me\">&lt;<i>%s</i>&gt; %s</span>", user, parameters[1]);
                      } else {
                        pline = sprintf("<span class=\"other\">&lt;<i>%s</i>&gt; %s</span>", user, parameters[1]);
                      }
                    } else {
                      user = prefix.split("!")[0];
                      tab = "user-" + user;
                      if ( user == this.nick ) {
                        pline = sprintf("<span class=\"me\">&lt;<i>%s</i>&gt; %s</span>", user, parameters[1]);
                      } else {
                        pline = sprintf("<span class=\"other\">&lt;<i>%s</i>&gt; %s</span>", user, parameters[1]);
                      }
                    }
                  break;
                  case "366" : // End of names
                    tab = "channel-" + parameters[1].replace("#", "");
                    //pline = "/NAMES End"; //parameters.slice(1, parameters.length).join(" ");
                    pline = "End of /NAMES";
                  break;
                  case "353" : // NAMES
                    tab = "channel-" + parameters[2].replace("#", "");
                    var users = parameters[3].split(" "); //slice(3, parameters.length);
                    pline = "<span class=\"names\"><b>NAMES: </b>" + users.join(" ") + "</span>";

                    callback = function(el) {
                      el.find("select").html("");
                      for ( var u = 0; u < users.length; u++ ) {
                        el.find("select").append(sprintf("<option>%s</option>", users[u]));
                      }
                    };
                  break;
                  case "372" : // MOTD
                    line = parameters[1];
                  break;

                  case "332" : // TOPIC
                    tab = "channel-" + parameters[1].replace("#", "");
                    pline = "<span class=\"topic\"><b>TOPIC: </b><u>" + parameters[2] + "</u></span>";
                  break;

                  /*
                  case "443" : // NICK IN USE
                  break;
                  */

                  case "JOIN" :
                    tab = "channel-" + parameters[0].replace("#", "");
                    pline = sprintf("<span class=\"join\"><b>%s</b> JOINs %s</span>", prefix, parameters[0]);

                    user = prefix.split("!")[0];
                    if ( user != this.nick ) {
                      callback = function(el) {
                        el.find("select").append(sprintf("<option>%s</option>", user));
                      };
                    }
                  break;
                  case "PART" :
                    user = prefix.split("!")[0];
                    tab = "channel-" + parameters[0].replace("#", "");

                    /*if ( user == this.nick ) {
                      removeTab = tab;
                    } else {*/
                    if ( user != this.nick ) {
                      callback = function(el) {
                        el.find("select option").each(function() {
                          if ( $(this).html() == user ) {
                            $(this).remove();
                          }
                        });
                      };
                    }

                    pline = sprintf("<span class=\"part\"><b>%s</b> PARTs %s</span>", prefix, parameters[0]);
                  break;
                  case "KICK" :
                    user = prefix.split("!")[0];
                    tab = "channel-" + parameters[0].replace("#", "");

                    callback = function(el) {
                      el.find("select option").each(function() {
                        if ( $(this).html() == parameters[1] ) {
                          $(this).remove();
                        }
                      });
                    };

                    pline = sprintf("<span class=\"kick\"><b>%s</b> KICKs %s</span>", prefix, parameters[1]);
                  break;

                  case "MODE" :
                    if ( parameters[0].match(/^#/) ) {
                      tab = "channel-" + parameters[0].replace("#", "");

                      if ( parameters[2] ) {
                        pline = sprintf("<span class=\"mode\"><b>%s</b> sets MODE <b>%s</b> on %s</span>", prefix, parameters[1], parameters[2]);

                        callback = function(el) {
                          el.find("select option").each(function() {
                            if ( $(this).html().replace(/^\@|\+/, "") == parameters[2] ) {
                              switch ( parameters[1] ) {
                                case "+o" :
                                  $(this).html("@" + parameters[2]);
                                break;
                                case "+v" :
                                  $(this).html("+" + parameters[2]);
                                break;
                                default :
                                  $(this).html(parameters[2]);
                                break;
                              }
                            }
                          });
                        };
                      } else {
                        pline = sprintf("<span class=\"mode\"><b>%s</b> sets MODE %s</span>", prefix, parameters[1]);
                      }
                    }
                  break;

                  case "PING" :
                    this.send("PONG :" + trailing);
                  break;

                  /*
                  case "ERROR" :
                  break;
                  */

                  default :
                    tab = null;
                  break;

                }

                this.print(line + "\n");

                if ( pline ) {
                  this.print(pline + "\n", tab, callback);
                }

                console.group("MATCH");
                console.log("prefix", prefix);
                console.log("command", command);
                console.log("parameters", parameters);
                console.groupEnd();
              }
            } // for

          }

        }
      }

    });


    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * GtkWindow Class
     * @class
     */
    var Window_dialog1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_dialog1", false, app, windows);
        this._content = $("<div class=\"dialog1\"> <div class=\"GtkDialog ApplicationIRC dialog1\" style=\"padding:5px\"> <table class=\"GtkBox Vertical dialog-vbox1\"> <tr> <td class=\"Expand Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <table class=\"GtkBox Vertical box2\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label2\">Server</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_server\" type=\"text\"/> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label3\">Port</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_3\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_port\" type=\"text\"/> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_4\" style=\"height:20px\"> <div class=\"TableCellWrap\"> <div class=\"GtkLabel label4\">Nick</div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_5\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_nick\" type=\"text\"/> </div> </td> </tr> </table> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <ul class=\"GtkButtonBox Horizontal dialog-action_area1\" style=\"text-align:end\"> <li> <button class=\"GtkButton button_close\"><img alt=\"gtk-close\" src=\"/img/icons/16x16/actions/gtk-close.png\"/>Close</button> </li> <li> <button class=\"GtkButton button_ok\"><img alt=\"gtk-ok\" src=\"/img/icons/16x16/actions/gtk-save.png\"/>Ok</button> </li> </ul> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'IRC Options';
        this._icon = 'apps/system-users.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 320;
        this._height = 260;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventButtonClose : function(el, ev) {
        var self = this;

        this.close();
      },


      EventButtonOk : function(el, ev) {
        var self = this;

        this.app._storage = {
          "server" : this.$element.find(".entry_server").val(),
          "port"   : this.$element.find(".entry_port").val(),
          "nick"   : this.$element.find(".entry_nick").val()
        };
        this.app._saveStorage();

        this.EventButtonClose(el, ev);
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".button_close").click(function(ev) {
            self.EventButtonClose(this, ev);
          });

          el.find(".button_ok").click(function(ev) {
            self.EventButtonOk(this, ev);
          });

          // Do your stuff here

          var s = this.app._storage;
          if ( s ) {
            this.$element.find(".entry_server").val(s["server"]);
            this.$element.find(".entry_port").val(s["port"]);
            this.$element.find(".entry_nick").val(s["nick"]);
          }

          return true;
        }

        return false;
      }
    });

    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationIRC window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_connect\"> <img alt=\"gtk-connect\" src=\"/img/icons/16x16/actions/stock_media-play.png\"/> <span>Connect</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_disconnect\"> <img alt=\"gtk-disconnect\" src=\"/img/icons/16x16/actions/gtk-stop.png\"/> <span>Disconnect</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_options\"> <img alt=\"gtk-preferences\" src=\"/img/icons/16x16/categories/gtk-preferences.png\"/> <span>Preferences</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <div class=\"GtkNotebook notebook1\"> <ul> <li class=\"GtkLabel label1\"> <div> <a href=\"#tab-2\">Status</a> </div> </li> </ul> <div class=\"GtkTab\" id=\"tab-2\"> <textarea class=\"GtkTextView GtkObject textview_status\"></textarea> </div> </div> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\" style=\"height:30px\"> <div class=\"TableCellWrap\"> <input class=\"GtkEntry GtkObject entry_message\" type=\"text\"/> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_3\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'IRC';
        this._icon = 'apps/system-users.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = true;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 600;
        this._height = 400;
        this._gravity = null;

      },

      destroy : function() {
        this._super();
      },


      EventMenuConnect : function(el, ev) {
        var self = this;

        if ( this.app ) {
          this.app.connect();
        }
      },


      EventMenuDisconnect : function(el, ev) {
        var self = this;

        if ( this.app ) {
          this.app.disconnect();
        }
      },


      EventMenuOptions : function(el, ev) {
        var self = this;

        if ( this.app ) {
          this.app.options();
        }
      },

      EventMenuQuit : function(el, ev) {
        var self = this;

        this.$element.find(".ActionClose").click();
      },

      EventProcessMessage : function(el, ev, tabIndex) {
        var self = this;
        var msg = $(el).val();

        // TODO: "/CLOSE"
        if ( msg.match(/^\/(\S+) (.*)/i) ) {
          var expl = msg.split(/^\/(\S+) (.*)/i);
          if ( expl[1] && expl[2] ) {
            this.app.process(expl[1].toLowerCase(), expl[2]);
          }
        } else {
          this.app.message(msg, tabIndex);
        }

      },

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          var currentTab = 0;

          el.find(".imagemenuitem_connect").click(function(ev) {
            self.EventMenuConnect(this, ev);
          });

          el.find(".imagemenuitem_disconnect").click(function(ev) {
            self.EventMenuDisconnect(this, ev);
          });

          el.find(".imagemenuitem_options").click(function(ev) {
            self.EventMenuOptions(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          el.find(".entry_message").keypress(function(ev) {
            var k = ev.keyCode || ev.which;
            if ( k == 13 ) {
              self.EventProcessMessage(this, ev, currentTab);
              $(this).val("");
            }
          });

          // Do your stuff here
          el.click(function(ev) {
            var t = ev.target || ev.srcElement;
            if ( t.tagName.toLowerCase() == "textarea" || $(t).hasClass(".Textarea") ) {
              el.find(".entry_message").focus();
            }
          });

          el.find(".GtkNotebook").tabs({
            "select" : function(ev,ui) {
              currentTab = ui.index;

              setTimeout(function() {
                var txt = $(ui.panel).find("textarea").get(0) || $(ui.panel).find(".Textarea").get(0);
                if ( txt ) {
                  $(txt).scrollTop(txt.scrollHeight);
                }
              }, 10);
            }
          });

          this.$element.find(".imagemenuitem_connect").removeClass("Disabled");
          this.$element.find(".imagemenuitem_disconnect").addClass("Disabled");

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
    var __ApplicationIRC = Application.extend({

      init : function() {
        this._super("ApplicationIRC", argv);
        this._compability = ["socket"];
        this._storage_on = true;
        this._storage = {
          "server"      : "efnet.xs4all.nl",
          "port"        : 6667,
          "nick"        : "osjs",
          "autoconnect" : false
        };

        this.irc = null;
      },

      destroy : function() {
        this.disconnect();

        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here
        if ( this._storage["autoconnect"] === true ) {
          this.connect();
        }
      },

      connect : function() {
        var self = this;

        this._event("alive", {}, function(result, error) {
          if ( !error && result && result.result !== undefined ) {
            self._connect();

            if ( self.irc ) {
              if ( result.result === false ) {
                self.irc.print("<<< WebSocket server is not running!\n");
              }
            }
          } else {
            self.irc.print("<<< WebSocket server is not running!\n");
          }
        });
      },

      _connect : function() {
        var self = this;

        if ( !this.irc ) {
          this._root_window.$element.find(".imagemenuitem_connect").addClass("Disabled");
          this._root_window.$element.find(".imagemenuitem_disconnect").removeClass("Disabled");
          this._root_window.$element.find(".imagemenuitem_options").addClass("Disabled");

          this.irc = new IRC(this._storage);
          this.irc.on_disconnect = function() {
            self.irc.print(">>> Socket closed\n");
            self.disconnect();
          };
          this.irc.on_connect = function() {
            self.irc.print(">>> Opening socket\n");
            self.irc.print("--- " + self.irc.server + ":" + self.irc.port + "\n");
          };

          this.irc.win = this._root_window;
          this.irc.connect(this.createSocket("IRC"));
        }
      },

      disconnect : function() {
        if ( this.irc ) {
          this.irc.destroy();
          this.irc = null;

          this._root_window.$element.find(".imagemenuitem_connect").removeClass("Disabled");
          this._root_window.$element.find(".imagemenuitem_disconnect").addClass("Disabled");
          this._root_window.$element.find(".imagemenuitem_options").removeClass("Disabled");
        }
      },

      options : function() {
        if ( !this._root_window.$element.find(".imagemenuitem_options").hasClass("Disabled") ) {
          var inw = new Window_dialog1(this);
          this._addWindow(inw);
          inw.show();
        }
      },

      addTab : function(id) {
        id = id.toLowerCase();
        var self = this;

        if ( !$("#tabs-" + id).get(0) ) {
          var nb = this._root_window.$element.find(".notebook1");
          var ul = nb.find("ul:first-child");
          var name = id.replace(/^user\-|channel\-/, "");
          var type = "user";

          if ( id.match(/^channel/) ) {
            name = "#" + name;
            type = "channel";
          }

          var sel;
          //var txt = $("<textarea class=\"GtkTextView\"></textarea>");
          var txt = $("<div class=\"Textarea\"></div>");

          nb.tabs("add", "#tabs-" + id, name);
          $("#tabs-" + id).append(txt);

          if ( type == "channel" ) {
            sel = $("<select></select>");
            sel.attr("multiple", true);

            $("#tabs-" + id).append(sel);
            sel.addClass("GtkObject");
          }

          txt.parent().addClass("GtkTab");
          txt.addClass("GtkObject");
          $("#tabs-" + id).addClass("Tab_" + type);

          setTimeout(function() {
            try {
              nb.tabs("select", (nb.tabs("length")-1));
            } catch ( e ) {
              //console.error("IRC", e); FIXME
            }
          }, 0);
        }

        return $("#tabs-" + id);
      },

      removeTab : function(id) {
        id = id.toLowerCase();

        if ( !$("#tabs-" + id).get(0) ) {
          return;
        }

        var nb = this._root_window.$element.find(".notebook1");

        var index = $("#tabs-" + id);

        if ( index.get(0) ) {
          nb.tabs("remove", index.index() - 1);
        }
        nb.tabs("select", 0);
      },

      process : function(func, args) {
        switch ( func ) {
          case "join"    :
          case "j"       :
            this.irc.send("JOIN " + args);
          break;

          case "part"    :
          case "p"       :
            this.irc.send("PART " + args);
          break;

          case "privmsg" :
          case "msg"     :
          case "m"       :
            var aargs = args.split(" ");
            var arg1 = aargs.shift();
            var arg2 = aargs.join(" ");

            this.irc.send(sprintf("PRIVMSG %s :%s", arg1, arg2));

            var tab;
            if ( arg1.match(/^#/) ) {
              tab = "channel-" + arg1.replace("#", "");
            } else {
              tab = "user-" + arg1;
            }

            var pline = sprintf("<span class=\"me\">&lt;<i>%s</i>&gt; %s</span>", this.irc.nick, arg2);
            this.irc.print(pline + "\n", tab);
          break;

          default :
            this.irc.send(func + " " + args);
          break;
        }
      },

      message : function(msg, tabIndex) {
        if ( tabIndex > 0 ) {
          var tab = this._root_window.$element.find(".GtkNotebook ul.ui-tabs-nav li").get(tabIndex);
          var panel = this._root_window.$element.find(".GtkNotebook .GtkTab").get(tabIndex);
          if ( panel && tab ) {
            var name = $(tab).find("a span").html() || $(tab).find("a").html();
            if ( $(panel).hasClass("Tab_channel") ) {
              this.process("privmsg", name + " " + msg);
            } else if ( $(panel).hasClass("Tab_user") ) {
              this.process("privmsg", name + " " + msg);
            }
          }
        }
      }
    });

    return new __ApplicationIRC();
  };
})($);
