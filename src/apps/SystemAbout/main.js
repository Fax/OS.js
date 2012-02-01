/*!
 * Application: SystemAbout
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.SystemAbout = (function($, undefined) {
  "$:nomunge";

  var _LINGUAS = {
    'en_US' : {
      "title" : "About"
    },
    'nb_NO' : {
      "title" : "Om Forfatter"
    }
  };

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS['en_US'];

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemAbout window1\"> <div class=\"SystemAbout\"><div class=\"SystemAboutInner\"><span>Created by Anders Evenrud</span><a href=\"http://no.linkedin.com/in/andersevenrud\" target=\"_blank\">LinkedIn</a><br /><a href=\"https://www.facebook.com/anders.evenrud\" target=\"_blank\">Facebook</a><br /><a href=\"mailto:andersevenrud@gmail.com\" target=\"_blank\">&lt;andersevenrud@gmail.com&gt;</a><br /><br />Icons from Gnome<br />Theme inspired by GTK</div></div> </div> </div> ").html();
        this._title = LABELS.title;
        this._icon = 'actions/gtk-about.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = false;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = true;
        this._width = 220;
        this._height = 160;
        this._gravity = "center";
      },

      destroy : function() {
        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          // Do your stuff here
          (function() {})();
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __SystemAbout = Application.extend({

      init : function() {
        this._super("SystemAbout", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();


        // Do your stuff here
      }
    });

    return new __SystemAbout();
  };
})($);

