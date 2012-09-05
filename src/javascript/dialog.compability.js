/*!
 * Dialog: CompabilityDialog
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
OSjs.Dialogs.CompabilityDialog = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    "en_US" : {
      "title"         : "Browser compability"
    },
    "nb_NO" : {
      "title"         : "Nettleser-støtte"
    }
  };

  return function(Window, API, argv) {
    "GtkWindow:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    /**
     * _CompabilityDialog -- Browser Compability Dialog
     * @extends Window
     * @class
     */
    var _CompabilityDialog = Window.extend({

      /**
       * _CompabilityDialog::init() -- Constructor
       * @see Window
       * @constructor
       */
      init : function() {
        this._super("Crash", false);
        this._content = $("<div class=\"CompabilityDialogTable\"></div>");
        this._title = LABELS.title;
        this._icon = 'status/software-update-available.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = false;
        this._is_minimizable = true;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = false;
        this._is_ontop = true;
        this._width = 500;
        this._height = 340;
        this._gravity = "center";
      },

      /**
       * _CompabilityDialog::create() -- Create DOM elements etc
       * @see Window
       * @return $
       */
      create : function(id, mcallback) {
        var el      = this._super(id, mcallback);
        var items   = [];
        var header  = $(sprintf("<div class=\"Header\">%s: <span class=\"%s\">%s</span>. </div><div class=\"Note\">%s</div>",
                               "Your browser is",
                               (OSjs.Navigator.SUPPORTED ? "supported" : ""),
                               (OSjs.Navigator.SUPPORTED ? "Supported" : "Partially Supported"),
                               "Any features not supported is listed below"));

        if ( !OSjs.Navigator.SUPPORTED ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Glade\\GTK+ CSS Layouts", "You may not be able to use some Applications due to breaking User Interface layouts."));
        }

        if ( OSjs.Navigator.MOBILE ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Mobile support", "There is currently no maintainance for Mobile browsers"));
        }

        if ( !OSjs.Compability.SUPPORT_FS ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Local Filesystem", "You will not be able to store any files in the browser storage. This does not affect access to files stored in your Home directory."));
        }
        if ( !OSjs.Compability.SUPPORT_UPLOAD ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Asynchronous File Upload", "You will not be able to upload any files to your filesystem."));
        }
        if ( !OSjs.Compability.SUPPORT_WEBGL ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "WebGL (3D Canvas)", "3D Applications cannot be used because no support was found (or enabled?)"));
        }
        if ( !OSjs.Compability.SUPPORT_WORKER ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "WebWorkers", "Any applications using WebWorkers to function will not start"));
        }
        if ( !OSjs.Compability.SUPPORT_VIDEO ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Video", "Your browser does not support Video playback."));
        }
        if ( !OSjs.Compability.SUPPORT_AUDIO ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Video", "Your browser does not support Audio playback."));
        }
        if ( !OSjs.Compability.SUPPORT_RICHTEXT ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Richtext Editing", "Found no support for Richtext."));
        }
        if ( !OSjs.Compability.SUPPORT_DND ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Drag-and-Drop", "DnD has been disabled because no support was found, or enabled."));
        }

        var table  = $("<div class=\"Items\">" + items.join("\n") + "</div>");
        el.find(".CompabilityDialogTable").append(header, table);
      }

    }); // @endclass

    return construct(_CompabilityDialog, argv); //new _CompabilityDialog(...);
  };
})($);

