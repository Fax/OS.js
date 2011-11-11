/*!
 * Dialog: CompabilityDialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
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
        this._content = "<div style=\"padding:10px;\"><div><b>Your browser is: <span style=\"color:" + color + ";\">" + supported + "</span></b></div> <table class=\"chart\"></table><div class=\"notes\"></div></div>";
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
        this._height = 330;
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

        $(table).css({
          "float" : "left",
          "width" : "49%",
          "margin-top" : "10px",
          "background" : "#fff",
          "height" : "226px"
        }).find("td").css({
          "padding" : "3px",
          "vertical-align" : "middle"
        });

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
        notes.append("<p><b>This message will only be showed once!</b></p>");

        $(notes).css({
          "float" : "right",
          "width" : "49%",
          "margin-top" : "10px",
          "background" : "#fff",
          "height" : "255px"
        }).find("p").css({"padding" : "5px", "margin" : "0"});
      }

    }); // @endclass

    return construct(BrowserDialog, argv); //new BrowserDialog(...);
  };
})($);

