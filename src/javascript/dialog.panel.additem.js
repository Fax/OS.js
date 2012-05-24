/*!
 * OperationDialog: PanelAddItemOperationDialog
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
OSjs.Dialogs.PanelAddItemOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"     : "Add new panel item"
    },
    "nb_NO" : {
      "title"     : "Legg til panel-objekt"
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelAddItemOperationDialog = OperationDialog.extend({
      init : function(panel, items, finished) {
        this.items        = items || [];
        this.clb_finish   = finished   || function() {};

        this._super("PanelItem");
        this._title    = LABELS.title;
        this._content  = $("<div class=\"OperationDialog OperationDialogPanelItemAdd\">    <div class=\"OperationDialogInner Wrapper\">      <ul>      </ul>    </div>  </div>");
        this._width    = 400;
        this._height   = 320;
        this._gravity  = "center";
        this._icon     = "categories/applications-utilities.png";
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);

        var items = this.items;
        var name, li, current, selected;

        for ( name in items ) {
          if ( items.hasOwnProperty(name) ) {
            li = $("<li><img alt=\"/img/blank.gif\" /><div class=\"Inner\"><div class=\"Title\">Title</div><div class=\"Description\">Description</div></div></li>");
            li.find("img").attr("src", API.ui.getIcon(items[name].icon, "32x32"));
            li.find(".Title").html(items[name].title);
            li.find(".Description").html(items[name].description);

            (function(litem, iname/*, iitem*/) {
              litem.click(function() {
                if ( current && current != this ) {
                  $(current).removeClass("Current");
                }
                $(this).addClass("Current");
                current = this;
                selected = iname;

                self.$element.find(".DialogButtons .Ok").removeAttr("disabled");
              });

              litem.dblclick(function() {
                self.$element.find(".DialogButtons .Ok").click();
              });
            })(li, name, items[name]);
              self.$element.find(".DialogContent ul").append(li);
            }
          }

          self.$element.find(".DialogButtons .Close").show();
          self.$element.find(".DialogButtons .Ok").show().click(function() {
            if ( selected ) {
              self.clb_finish(selected);
            }
          }).attr("disabled", "disabled");
      }
    });

    return construct(_PanelAddItemOperationDialog, argv);
  };
})($);
