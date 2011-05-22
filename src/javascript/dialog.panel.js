/*!
 * OperationDialog: PanelPreferencesOperationDialog
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
OSjs.Dialogs.PanelPreferencesOperationDialog = (function($, undefined) {

  var _LINGUAS = {
    "en_US" : {
      "title"     : "Configure Panels"
    },
    "nb_NO" : {
      "title"     : "Konfigurer Paneler"
    }
  };

  return function(OperationDialog, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelPreferencesOperationDialog = OperationDialog.extend({
      init : function(onchange) {
        this._super("PanelPreferences");

        this._title = LABELS.title;
        this._width    = 400;
        this._height   = 340;
        this._gravity = "center";
        this._icon = "categories/applications-utilities.png";
        this._content = $("<div class=\"OperationDialog OperationDialogPanel\"><div class=\"OperationDialogInner\"><ul></ul></div></div>");

        this._onchange = onchange || function() {};
      },

      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var _panels   = [];
        var _size     = 0;
        var _current  = -1;
        var _selected = null;

        var _selectItem = function(item) {
          if ( _selected )
            _selected.removeClass("Selected");

          item.addClass("Selected");
          _selected = item;
        };

        var _createPrefs = function(el, panel) {
          var opa  = 100;
          var type = "solid";
          var opt  = null;
          var lbl  = OSjs.Labels.PanelPreferences;

          if ( panel.style && panel.style.opacity ) {
            if ( panel.style.opacity != "default" ) {
              opa = panel.style.opacity;
            }
          }
          if ( panel.style && panel.style.type ) {
            if ( panel.style.type != "default" ) {
              type = panel.style.type;
            }
          }
          if ( panel.style && panel.style.background ) {
            opt = panel.style.background;
          }

          el.append(sprintf("<div class=\"PType\"><div class=\"Label\">%s</div><div class=\"Option\"><select></select></div></div>", lbl.type));
          //el.append(sprintf("<div class=\"POption\"><div class=\"Label\">%s</div><div class=\"Option\"></div></div>", lbl.opt));
          el.append(sprintf("<div class=\"POpacity\"><div class=\"Label\">%s</div><div class=\"Option\"><div class=\"Slider\"></div></div></div>", lbl.opacity));

          el.find(".PType select").append(sprintf("<option value=\"solid\">%s</option>", lbl.solid));
          //el.find(".PType select").append(sprintf("<option value=\"image\">%s</option>", lbl.background));
          el.find(".PType select").append(sprintf("<option value=\"transparent\">%s</option>", lbl.transparent));

          // Type
          el.find(".PType select").change(function() {
            self._onchange(panel, "type", $(this).val());
          });
          el.find(".PType select").val(type);

          // Background
          /*
          el.find(".POption select").change(function() {
            __onchange(panel, "background", $(this).val());
          });
          el.find(".POption .Option").html(opt || "None");
          */

          // Opacity
          var stimeout = null;

          el.find(".POpacity .Slider").slider({
            min   : 1,
            max   : 100,
            value : opa,
            slide : function() {
              if ( stimeout ) {
                clearTimeout(stimeout);
                stimeout = null;
              }
              stimeout = setTimeout((function(slider) {
                return function() {
                  self._onchange(panel, "opacity", slider.slider("value"));
                };
              })($(this)), 100);
            }
          });
        };

        var _refreshList = function(list) {
          list.empty();

          _panels   = API.user.settings.get("desktop.panels", true);
          _size     = 0;
          _current  = -1;

          var pp = 0, li;
          for ( pp; pp < _panels.length; pp++ ) {
            li = $(sprintf("<li><!--<div class=\"Header\">Panel %d</div>--><div class=\"Prefs\"></div></li>", parseInt(_panels[pp].index, 10) + 1));

            _createPrefs(li.find(".Prefs"), _panels[pp]);

            li.click((function(i) {
              return function() {
                _current = i;
              };
            })(_size));

            _size++;
            list.append(li);
          }
        };

        var list = this.$element.find(".OperationDialogInner ul");
        _refreshList(list);

        this.$element.find(".DialogButtons .Close").show();
        this.$element.find(".DialogButtons .Ok").show();
      }
    });

    return construct(_PanelPreferencesOperationDialog, argv);
  };
})($);
