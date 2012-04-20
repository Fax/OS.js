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
      "overwrite"       : "Are you sure you want to overwrite this file?"
    },
    "nb_NO" : {
      "title_saveas"    : "Lagre som...",
      "title_open"      : "Åpne fil",
      "protected_file"  : "Denne filen er beskyttet!",
      "overwrite"       : "Vil du overskrive denne filen?"
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _FileOperationDialog = OperationDialog.extend({
      init : function(type, argv, clb_finish, cur_dir) {
        this.aargv         = argv         || {};
        this.atype         = type         || "open";
        this.clb_finish    = clb_finish   || function() {};
        this.selected_file = null;
        this.init_dir      = cur_dir      || "/";

        this._super("File");
        this._title        = type == "save" ? LABELS.title_saveas : LABELS.title_open;
        this._icon         = type == "save" ? "actions/document-save.png" : "actions/document-open.png";
        this._content      = $("<div class=\"OperationDialog OperationDialogFile\">    <div class=\"FileChooser\">      <ul>      </ul>    </div>    <div class=\"FileChooserInput\">      <input type=\"text\" />    </div>  </div>");
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
                  if ( o.icon.match(/^\//) ) {
                    el.find("img").attr("src", o.icon);
                  } else {
                    el.find("img").attr("src", "/img/icons/16x16/" + o.icon);
                  }
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
                            API.system.alert(LABELS.protected_file);
                          } else {
                            API.system.dialog("confirm", LABELS.overwrite, null, function() {
                              _doSelect();
                            });
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
          if ( is_save ) {
            if ( !self.selected_file ) {
              var val = $(inp).val();

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
              }
            }

          }

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
