/*!
 * OperationDialog: FileOperationDialog
 * Used for Open and Save operations.
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var FileOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _FileOperationDialog = OperationDialog.extend({
      init : function(type, argv, clb_finish, cur_dir) {
        this.aargv         = argv         || {};
        this.atype         = type         || "open";
        this.clb_finish    = clb_finish   || function() {};
        this.selected_file = null;
        this.init_dir      = cur_dir      || "/";

        this._super("File");
        this._title        = type == "save" ? "Save As..." : "Open File";
        this._icon         = type == "save" ? "actions/document-save.png" : "actions/document-open.png";
        this._content      = $("#OperationDialogFile").html();
        this._is_resizable = true;
        this._width        = 400;
        this._height       = 300;
      },

      create : function(id, mcallback) {
        var self = this;

        this._super(id, mcallback);

        var ul          = this.$element.find("ul");
        var inp         = this.$element.find("input[type='text']");
        var prev        = null;
        var current_dir = "";
        var is_save     = self.atype == "save";
        var currentFile = null;

        var readdir = function(path)
        {
          if ( path == current_dir )
            return;

          var ignores = path == "/" ? ["..", "."] : ["."];
          currentFile = null;

          API.system.call("readdir", {'path' : path, 'mime' : self.aargv, 'ignore' : ignores}, function(result, error) {
            $(ul).die();
            $(ul).unbind();

            ul.find("li").empty().remove();

            if ( error === null ) {
              var i = 0;
              for ( var f in result ) {
                if ( result.hasOwnProperty(f) ) {
                  var o = result[f];
                  var el = $("<li><img alt=\"\" src=\"/img/blank.gif\" /><span></span></li>");
                  el.find("img").attr("src", "/img/icons/16x16/" + o.icon);
                  el.find("span").html(f);
                  el.addClass(i % 2 ? "odd" : "even");
                  if ( o['protected'] == "1" ) {
                    el.addClass("Disabled");
                  }

                  (function(vo) {
                    el.click(function() {

                      if ( prev !== null && prev !== this ) {
                        $(prev).removeClass("current");
                      }

                      if ( prev !== this ) {
                        $(this).addClass("current");
                      }

                      if ( vo.type == "file" ) {
                        if ( vo['protected'] == "1" && is_save ) {
                          self.selected_file = null;
                          self.$element.find("button.Ok").attr("disabled", "disabled");
                          currentFile = null;
                          $(inp).val("");
                        } else {
                          self.selected_file = vo;
                          self.$element.find("button.Ok").removeAttr("disabled");
                          currentFile = this;
                          $(inp).val(vo.path);
                        }

                      } else {
                        self.selected_file = null;
                        $(inp).val("");
                        self.$element.find("button.Ok").attr("disabled", "disabled");

                        currentFile = null;
                      }

                      prev = this;
                    });

                    el.dblclick(function() {

                      if ( vo.type != "file" ) {
                        readdir(vo.path);
                      } else {

                        var _doSelect = function() {
                          self.selected_file = vo;
                          $(inp).val(vo.path);

                          self.$element.find("button.Ok").removeAttr("disabled");
                          self.$element.find("button.Ok").click();
                        };

                        if ( is_save ) {
                          if ( vo['protected'] == "1" ) {
                            alert("This file is protected!"); // FIXME
                          } else {
                            if ( confirm("Are you sure you want to overwrite this file?") ) { // FIXME
                              _doSelect();
                            }
                          }
                        } else {
                          _doSelect();
                        }
                      }

                    });
                  })(o);

                  $(ul).append(el);

                  i++;
                }
              }
            }

            self.$element.find("button.Ok").attr("disabled", "disabled");
          });

          current_dir = path;
        };


        if ( !is_save ) {
          $(inp).focus(function() {
            $(this).blur();
          }).addClass("Disabled");
        }

        $(inp).keydown(function(ev) {
          var keyCode = ev.which || ev.keyCode;
          var val = $(this).val();

          if ( keyCode == 13 ) {
            if ( !is_save ) {
              if ( !self.$element.find("button.Ok").attr("disabled") ) {
                if ( currentFile ) {
                  $(currentFile).trigger('dblclick');
                }
              }
            } else {
              if ( val ) {
                if ( !val.match(/^\//) ) {
                  val = (current_dir == "/" ? "/" : (current_dir + "/")) + val;
                }

                self.selected_file = {
                  "path" : val,
                  "size" : -1,
                  "mime" : "",
                  "icon" : "",
                  "type" : "file"
                };
                self.$element.find("button.Ok").click();
              }
            }
          }
        });

        $(inp).keyup(function(ev) {
          var keyCode = ev.which || ev.keyCode;
          var val = $(this).val();

          if ( is_save ) {
            if ( val ) {
              self.$element.find("button.Ok").removeAttr("disabled");
            } else {
              self.$element.find("button.Ok").attr("disabled", "disabled");
            }
          }
        });

        this.$element.find(".DialogButtons .Close").hide();
        this.$element.find(".DialogButtons .Cancel").show();

        this.$element.find(".DialogButtons .Ok").show().click(function() {
          if ( self.selected_file ) {
            self.clb_finish(self.selected_file.path, self.selected_file.mime);
          }
        }).attr("disabled", "disabled");

        readdir(this.init_dir);


      }
    });

    return construct(_FileOperationDialog, argv);
  };
})($);