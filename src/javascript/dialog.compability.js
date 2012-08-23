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
  /*
  ,
      "supported"     : "Supported",
      "partially"     : "Partially supported",
      "no_upload"     : "You will not be able to upload any files into the filesystem because 'Async Upload' is not supported.",
      "no_work"       : "Some applications uses Web Workers to handle intensive operations to decrease processing times.",
      "no_gl"         : "No 3D (OpenGL) content can be displayed as WebGL is not supported. (Check your browser documentation)",
      "browser_unsup" : "Glade CSS style problems occurs in IE and Opera for &lt;table&gt; elements.",
      "browser_ie"    : "IE is lacking some CSS effects and HTML5/W3C features.",
      "browser_touch" : "Your device is not fully supported due to lacking Touch support.",
      "browser_supp"  : "Your browser does not have any known problems.",
      "notes"         : "Please note that:",
      "footnote"      : "This message will only be showed once!",
      "yourbrowser"   : "Your browser is"
      */
    },
    "nb_NO" : {
      "title"         : "Nettleser-støtte"/*,
      "supported"     : "Støttet",
      "partially"     : "Delvis støttet",
      "no_upload"     : "Du vil ikke kunne laste opp filer pga. manglende 'Async Upload' støtte.",
      "no_work"       : "Noen applikasjoner bruker 'WebWorker' for å avbelaste tunge operasjoner.",
      "no_gl"         : "Ingen 3D (OpenGL) innhold kan vises pga manglende støtte. (Se dokumentasjon for din nettleser)",
      "browser_unsup" : "Glade CSS problemer oppstår i IE og Opera for &lt;table&gt; elementer.",
      "browser_ie"    : "IE mangler CSS effekter og HTML5/W3C støtte.",
      "browser_touch" : "Din enhet er ikke helt kompatibel pga bevegelses-skjerm.",
      "browser_supp"  : "Din nettleser har ingen kjente problemer.",
      "notes"         : "Bemerk at:",
      "footnote"      : "Denne meldingen vises kun én gang!",
      "yourbrowser"   : "Din nettleser er"*/
    }
  };

  return function(Window, API, argv) {
    "GtkWindow:nomunge, API:nomunge, argv:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    /**
     * BrowserDialog -- Browser Compability Dialog
     * @extends Window
     * @class
     */
    var BrowserDialog = Window.extend({

      /**
       * BrowserDialog::init() -- Constructor
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
       * BrowserDialog::create() -- Create DOM elements etc
       * @see Window
       * @return $
       */
      create : function(id, mcallback) {
        var el = this._super(id, mcallback);

        var is_mobile     = false;
        var is_supported  = true;

        var mob = MobileSupport();
        if ( mob.iphone || mob.blackberry || mob.android ) {
          is_mobile     = true;
          is_supported  = false;
        }
        if ( ($.browser.msie || $.browser.opera) || (mob.iphone || mob.blackberry || mob.android) ) {
          is_supported  = false;
        }

        var items  = [];
        var header = $(sprintf("<div class=\"Header\">%s: <span class=\"%s\">%s</span>. </div><div class=\"Note\">%s</div>",
                               "Your browser is",
                               (is_supported ? "supported" : ""),
                               (is_supported ? "Supported" : "Partially Supported"),
                               "Any features not supported is listed below"));

        if ( is_mobile ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Mobile support", "There is currently no maintainance for Mobile browsers"));
        }

        if ( !OSjs.Compability.SUPPORT_UPLOAD ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Asynchronous File Upload", "You will not be able to upload any files"));
        }
        if ( !OSjs.Compability.SUPPORT_WEBGL ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "WebGL (3D Canvas)", "3D Applications cannot be used because no support was found (or enabled?)"));
        }
        if ( !OSjs.Compability.SUPPORT_WORKER ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "WebWorkers", "Any applications using WebWorkers to function will not start"));
        }
        if ( !OSjs.Compability.SUPPORT_VIDEO ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Video", "Your browser does not support Video playback"));
        }
        if ( !OSjs.Compability.SUPPORT_AUDIO ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Video", "Your browser does not support Audio playback"));
        }
        if ( !OSjs.Compability.SUPPORT_RICHTEXT ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Richtext Editing", "Found no support for Richtext"));
        }
        if ( !OSjs.Compability.SUPPORT_DND ) {
          items.push(sprintf("<div class=\"Item\"><span>%s</span><p>%s</p></div>", "Drag-and-Drop", "DnD has been disabled because no support was found, or enabled"));
        }

        var table  = $("<div class=\"Items\">" + items.join("\n") + "</div>");
        el.find(".CompabilityDialogTable").append(header, table);
      }

    }); // @endclass

    return construct(BrowserDialog, argv); //new BrowserDialog(...);
  };
})($);

