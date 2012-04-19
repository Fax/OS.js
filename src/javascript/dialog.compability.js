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
      "title"         : "Browser compability",
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
    },
    "nb_NO" : {
      "title"         : "Nettleser støtte",
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
      "yourbrowser"   : "Din nettleser er"
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
        var supported = LABELS.supported;
        var color     = "black";

        var mob = MobileSupport();
        if ( ($.browser.msie || $.browser.opera) || (mob.iphone || mob.blackberry || mob.android) ) {
          supported = LABELS.partially;
          color = "#f3a433";
        } else {
          supported = LABELS.supported;
          color = "#137a26";
        }

        this._super("Crash", false);
        this._content = "<div style=\"padding:10px;\"><div><b>" + LABELS.yourbrowser + ": <span style=\"color:" + color + ";\">" + supported + "</span></b></div> <table class=\"outer\"><tr><td class=\"content\"><table class=\"chart\"></table></td><td class=\"space\">&nbsp;</td><td class=\"content\"><div class=\"notes\"></div></td></tr></table></div>";
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

        var mtable = el.find("table.outer");
        mtable.css("height", "280px");
        mtable.find("td.content").css({
          "width" : "230px",
          "verticalAlign" : "top",
          "backgroundColor" : "#fff"
        });
        mtable.find("td.space").css({
          "width" : "5px"
        });

        var table  = el.find("table.chart");
        var _row   = "<tr><td width=\"16\"><img alt=\"\" src=\"/img/icons/16x16/emblems/emblem-%s.png\" /></td><td>%s</td></tr>";
        var _check = OSjs.Public.CompabilityLabels;

        var row;
        var icon;
        for ( var c in _check ) {
          if ( _check.hasOwnProperty(c) ) {
            icon = _check[c] ? "default" : "important";
            row = $(sprintf(_row, icon, c));
            table.append(row);
          }
        }

        $(table).find("td").css({
          "padding" : "3px",
          "vertical-align" : "middle"
        });

        var details = [];

        if ( !OSjs.Compability.SUPPORT_UPLOAD ) {
          details.push("<li>" + LABELS.no_upload + "</li>");
        }
        if ( !OSjs.Compability.SUPPORT_WEBGL ) {
          details.push("<li>" + LABELS.no_gl + "</li>");
        }
        if ( OSjs.Compability.SUPPORT_WORKER ) {
          details.push("<li>" + LABELS.no_work + "</li>");
        }

        var notes = el.find("div.notes");
        if ( $.browser.msie || $.browser.opera ) {
          notes.append("<p>" + LABELS.browser_unsup + "</p>");
          if ( $.browser.msie ) {
            notes.append("<p>" + LABELS.browser_ie + "</p>");
          }
        } else {
          var mob = MobileSupport();
          if ( mob.iphone || mob.blackberry || mob.android ) {
            notes.append("<p>" + LABELS.browser_touch + "</p>");
          } else {
            notes.append("<p>" + LABELS.browser_supp + "</p>");
          }
        }

        if ( details.length ) {
          notes.append($("<p><b>" + LABELS.notes + "</b></p>"));
          if ( details.length ) {
            notes.append($("<ul class=\"CompactList\">" + details.join("") + "</ul>"));
          }
          notes.append($("<hr />").css({
            "background"  : "transparent",
            "display"     : "block",
            "position"    : "relative",
            "overflow"    : "hidden",
            'borderColor' : "#000",
            'borderWidth' : "1px",
            'borderBottom': "0 none",
            "color"       : "#000",
            "width"       : "95%"
          }));
        }

        notes.append($("<p><b>" + LABELS.footnote + "</b></p>").css("textAlign", "center"));

        $(notes).find("p").css({"padding" : "5px", "margin" : "0"});
      }

    }); // @endclass

    return construct(BrowserDialog, argv); //new BrowserDialog(...);
  };
})($);

