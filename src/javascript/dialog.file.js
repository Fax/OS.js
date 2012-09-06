/*!
 * OperationDialog: FileOperationDialog
 * Used for Open and Save operations.
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.FileOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title_saveas"    : "Save As...",
      "title_open"      : "Open File",
      "protected_file"  : "This file is protected!",
      "overwrite"       : "Are you sure you want to overwrite this file?",
      "gohome"          : "Go to home directory",
      "load_preview"    : "Loading preview ...",
      "fail_preview"    : "Failed to load preview ..."
    },
    "nb_NO" : {
      "title_saveas"    : "Lagre som...",
      "title_open"      : "Åpne fil",
      "protected_file"  : "Denne filen er beskyttet!",
      "overwrite"       : "Vil du overskrive denne filen?",
      "gohome"          : "Gå til hjem-mappe",
      "load_preview"    : "Laster hurtigvisning ...",
      "fail_preview"    : "Hurtigvisning feilet ..."
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var FileOperationView = OSjs.Classes.IconView.extend({
      init : function(win, area) {
        this._super(area, "list", {"dnd" : false, "multiselect" : false, "dnd_items" : false});

        this.win = win;
      },

      createItem : function(view, iter) {
        var ispkg = false;
        if ( iter.mime.match(/^OSjs\/(Application|PanelItem|Service|BackgroundService)/) ) {
          ispkg = basename(iter.path);
        }

        var el = $(sprintf("<tr class=\"GtkIconViewItem\"><td><img alt=\"\" src=\"%s\" /></td><td>%s</td></tr>",
                         API.ui.getIcon(iter.icon, "16x16", ispkg),
                         iter.name));

        el.data("name", iter.name);
        el.data("mime", iter.mime);
        el.data("size", iter.size);
        el.data("path", iter.path);
        el.data("type", iter.type);
        el.data("protected", iter['protected']);

        return el;
      },

      onItemSelect : function(ev, el, item, focus) {
        this.win.select(item);
        return this._super(ev, el, item, focus);
      },

      onItemActivate : function(ev, el, item) {
        var self = this;
        if ( el && item ) {
          if ( item.type == "dir" ) {
            if ( item.name == ".." ) {
              var prev = item.path || "/";
              /*
              var tmp  = item.path.split("/");
              console.warn(tmp, item.path);
              if ( tmp.length > 1 ) {
                tmp.pop();
                prev = tmp.join("/") || "/";
              }
              */
              this.win.readdir(prev);
            } else {
              this.win.readdir(item.path);
            }
          } else {
            if ( !this.win.$element.find("button.Ok").attr("disabled") ) {
              this.win.send();
            }
          }
        }

        return this._super(ev, el, item);
      }


    });

    /**
     * Arguments:
     * type       Dialog type (open/save)
     * cwd        Current working directory
     * mime       MIME Filter list
     * on_apply   Callback function
     */
    var _FileOperationDialog = OperationDialog.extend({
      init : function(args) {
        this.view_dir      = (args.cwd      || "/");
        this.view_filter   = (args.mime     || []);
        this.view_type     = (args.type     || "open");
        this.view_preview  = (args.preview  || false);
        this.clb_finish    = args.on_apply  || function() {};

        this._super("File");
        this._is_resizable = true;
        this._title        = this.view_type == "save" ? LABELS.title_saveas : LABELS.title_open;
        this._icon         = this.view_type == "save" ? "actions/document-save.png" : "actions/document-open.png";
        this._width        = 400;
        this._height       = 350;

        if ( this.view_type == "open" ) {
          this._content      = $("<div class=\"OperationDialog OperationDialogFile FileOpen\"> <div class=\"DirNavigator\"><button>/</button></div>   <div class=\"FileChooser\">      <div class=\"GtkIconView\">      </div>    </div>    <div class=\"FileChooserInput\">      <input type=\"text\" />    </div> <div class=\"FilePreview\"> </div>  </div>");

          if ( this.view_preview ) {
            this._content.addClass("FileOpenPreview");
            this._width = 600;
          } else {
            this._content.find(".FilePreview").hide();
          }
        } else {
          this._content      = $("<div class=\"OperationDialog OperationDialogFile FileSave\">  <div class=\"DirNavigator\"><button>/</button></div>  <div class=\"FileChooser\">      <div class=\"GtkIconView\">      </div>    </div>    <div class=\"FileChooserInput\">      <input type=\"text\" />    </div>  </div>");
        }

        this.iframe   = null;
        this.iconview = null;
        this.selected = null;
      },

      destroy : function() {
        if ( this.iconview ) {
          this.iconview .destroy();
          this.iconview = null;
        }
        if ( this.iframe ) {
          this.iframe.destroy();
          this.iframe = null;
        }
        this.selected = null;

        this._super();
      },

      readdir : function(path) {
        var self = this;

        path = path || this.view_dir;
        var mime = this.view_filter;
        var ignores = [];

        var bcontainer = this.$element.find(".DirNavigator").empty();
        var paths = path.replace(/^\//, "").split(/\//);

        b = $(sprintf("<button><img alt=\"%s\" title=\"%s\" width=\"%d\" height=\"%d\" src=\"%s\" /></button>", LABELS.gohome, LABELS.gohome, 16, 16, API.ui.getIcon("places/user-home.png", "16x16")));
        b.data("dir", "User");
        bcontainer.append(b);

        bcontainer.append("<div class=\"Space\">&nbsp;</div>");

        b = $(sprintf("<button><span>%s</span></button>", "/"));
        b.data("dir", "");
        bcontainer.append(b);

        var i = 0, l = paths.length, b, p, last = [];
        for ( i; i < l; i++ ) {
          p = paths[i];
          if ( p ) {
            last.push(p);
            b = $(sprintf("<button><span>%s</span></button>", p));
            b.data("dir", last.join("/"));
            bcontainer.append(b);
          }
        }

        bcontainer.find("button").click(function() {
          self.readdir("/" + $(this).data("dir"));
        });

        this.selected = null;
        this.$element.find("button.Ok").attr("disabled", "disabled");
        this.$element.find("input[type=text]").val("");

        API.system.call("readdir", {'path' : path, 'mime' : mime, 'ignore' : ignores}, function(result, error) {
          if ( !error ) {
            self.iconview.render(result, ["icon", "filename"], "list");
          }

          self.view_dir = path;
        });
      },

      preview : function(path, mime) {
        if ( this.iframe) {
          this.iframe.setContent("");
          if ( path && mime ) {
            this.iframe.setContent(LABELS.load_peview);

            var self = this;
            API.system.call("preview", {"path" : path, "mime" : mime, "iframe" : true}, function(result, error) {
              if ( error ) {
                self.iframe.setContent(LABELS.fail_preview);
                return;
              }
              self.iframe.setContent(result);
            }, false);
          }
        }
      },

      select : function(item) {
        this.selected = item;
        this.$element.find("button.Ok").attr("disabled", "disabled");
        this.$element.find("input[type=text]").val("");

        this.preview();

        if ( item ) {
          this.$element.find("input[type=text]").val(basename(item.path));
          if ( item.type != "dir" ) {
            if ( this.view_preview ) {
              this.preview(item.path, item.mime);
            }

            if ( this.view_type != "open" ) {
              if ( item['protected'] == "1" ) {
                this.$element.find("button.Ok").removeAttr("disabled");
              }
            } else {
              this.$element.find("button.Ok").removeAttr("disabled");
            }
          }
        }
      },

      send : function() {
        var self = this;

        var _send = function() {
          var i = self.selected;
          if ( i ) {
            if ( i.type == "dir" )
              return;

            self.clb_finish(i.path, i.mime);

            setTimeout(function() {
              self.close();
            }, 0);
          }
        };

        // Check input field
        if ( this.view_type != "open" ) {
          var val = this.$element.find("input[type='text']").val();
          if ( !this.selected || (val != this.selected.name) ) {
            if ( val ) {
              if ( !val.match(/^\//) ) {
                val = (self.view_dir == "/" ? "/" : (self.view_dir + "/")) + val;
              }

              this.select({
                "path"      : val,
                "size"      : -1,
                "mime"      : "",
                "icon"      : "",
                "type"      : "file",
                "protected" : 0
              });
            }
          }

          if ( this.selected ) {
            var exists = false;
            var test = this.iconview.getItem("path", this.selected.path);
            if ( test && test.size() ) {
              this.select(test.data());
              exists = true;
            }

            if ( this.selected['protected'] == "1" ) {
              API.ui.alert(LABELS.protected_file);
              return;
            }

            if ( exists ) {
              API.ui.dialog("confirm", LABELS.overwrite, null, function() {
                _send();
              });
              return;
            }
          }
        }

        // Normal operation "Open"
        _send();
      },

      create : function(id, mcallback) {
        var self = this;

        this._super(id, mcallback);
        var is_save     = this.view_type == "save";
        var area        = this.$element.find(".GtkIconView");
        var inp         = this.$element.find("input[type='text']");

        if ( this.view_preview ) {
          var parea = $("<iframe frameborder=\"0\" border=\"0\" cellspacing=\"0\" src=\"about:blank\" class=\"GtkRichtext\"></iframe>");
          this.$element.find(".FilePreview").append(parea);
          this.iframe = new OSjs.Classes.IFrame(parea);
          this._addObject(this.iframe);
        }

        this.iconview = new FileOperationView(this, area);
        this._addObject(this.iconview);

        if ( !is_save ) {
          $(inp).focus(function() {
            $(this).blur();
          }).addClass("Disabled");
        }

        $(inp).keydown(function(ev) {
          ev.stopPropagation();

          var keyCode = ev.which || ev.keyCode;
          if ( keyCode === 13 ) {
            ev.preventDefault();
            self.$element.find(".DialogButtons .Ok").click();
            return false;
          }

          return true;
        }).keyup(function(ev) {
          if ( is_save ) {
            if ( $(this).val() ) {
              self.$element.find("button.Ok").removeAttr("disabled");
            } else {
              self.$element.find("button.Ok").attr("disabled", "disabled");
            }
          }
        });

        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Cancel").show();
        this.$element.find(".DialogButtons .Ok").show();
        this.$element.find(".DialogButtons .Ok").unbind("click").attr("disabled", "disabled");

        this.$element.find(".DialogButtons .Ok").click(function(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          if ( !$(this).attr("disabled") ) {
            self.send();
          }
          return false;
        });


        this.readdir(this.view_dir);
      }
    });

    return construct(_FileOperationDialog, argv);
  };
})($);
