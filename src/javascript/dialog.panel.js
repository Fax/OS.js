/*!
 * OperationDialog: PanelItemOperationDialog
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
OSjs.Dialogs.PanelItemOperationDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"     : "Configure"
    },
    "nb_NO" : {
      "title"     : "Konfigurer"
    }
  };

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var _PanelItemOperationDialog = OperationDialog.extend({
      init : function(item, clb_create, clb_finish, title, additem) {
        this.item         = item         || null;
        this.type         = item._named === undefined ? "panel" : "item";
        this.clb_finish   = clb_finish   || function() {};
        this.clb_create   = clb_create   || function() {};

        var content = "";
        if ( additem ) {
          content = "<div class=\"OperationDialog OperationDialogPanelItemAdd\">    <div class=\"OperationDialogInner Wrapper\">      <ul>      </ul>    </div>  </div>";
        } else {
          content = "<div class=\"OperationDialog OperationDialogPanelItem\">    <div class=\"OperationDialogInner\">    </div>  </div>";
        }

        this._super("PanelItem");
        this._title    = title || LABELS.title + " " + this.type;
        this._content  = $(content);
        this._width    = 400;
        this._height   = 340;
        this._gravity  = "center";

        if ( this.type == "panel" ) {
          this._icon    = "categories/applications-utilities.png";
        }
      },


      create : function(id, mcallback) {
        var self = this;
        this._super(id, mcallback);
        this.clb_create(self);
      }
    });

    return construct(_PanelItemOperationDialog, argv);
  };
})($);
