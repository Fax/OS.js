/*!
 * Dialog: CompabilityDialog
 *
 * Copyright (c) 2011, Anders Evenrud
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

  return function(Window, Application, argv) {
    "GtkWindow:nomunge, Application:nomunge, argv:nomunge";

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
        var supported = "Supported";
        var color     = "black";

        var mob = MobileSupport();
        if ( ($.browser.msie || $.browser.opera) || (mob.iphone || mob.blackberry || mob.android) ) {
          supported = "Partially supported";
          color = "#f3a433";
        } else {
          supported = "Supported";
          color = "#137a26";
        }

        this._super("Crash", false);
        this._content = "<div style=\"padding:10px;\"><div><b>Your browser is: <span style=\"color:" + color + ";\">" + supported + "</span></b></div> <table class=\"outer\"><tr><td class=\"content\"><table class=\"chart\"></table></td><td class=\"space\">&nbsp;</td><td class=\"content\"><div class=\"notes\"></div></td></tr></table></div>";
        this._title = "Browser compability";
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
        this._height = 380;
        this._gravity = "center";
      },

      /**
       * BrowserDialog::create() -- Create DOM elements etc
       * @see Window
       * @return $
       */
      create : function(id, mcallback) {
        var self = this;
        var el = this._super(id, mcallback);

        var mtable = el.find("table.outer");
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
          details.push("<li>You will not be able to upload any files into the filesystem because 'Async Upload' is not supported.</li>");
        }
        if ( !OSjs.Compability.SUPPORT_WEBGL ) {
          details.push("<li>No 3D (OpenGL) content can be desplayed as WebGL is not supported. (Check your browser documentation)</li>");
        }
        if ( OSjs.Compability.SUPPORT_WORKER ) {
          details.push("<li>Some applications uses Web Workers to handle intensive operations to decrease processing times.</li>");
        }

        var notes = el.find("div.notes");
        if ( $.browser.msie || $.browser.opera ) {
          notes.append("<p>Glade CSS style problems occurs in IE and Opera for &lt;table&gt; elements.</p>");
          if ( $.browser.msie ) {
            notes.append("<p>IE is lacking some CSS effects and HTML5/W3C features.</p>");
          }
        } else {
          var mob = MobileSupport();
          if ( mob.iphone || mob.blackberry || mob.android ) {
            notes.append("<p>Your device is not fully supported due to lacking Touch support.</p>");
          } else {
            notes.append("<p>Your browser does not have any known problems.</p>");
          }
        }

        if ( details.length ) {
          notes.append($("<p><b>Please note that:</b></p>"));
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

        notes.append($("<p><b>This message will only be showed once!</b></p>").css("textAlign", "center"));

        $(notes).find("p").css({"padding" : "5px", "margin" : "0"});
      }

    }); // @endclass

    return construct(BrowserDialog, argv); //new BrowserDialog(...);
  };
})($);

