/*!
 * Application: ApplicationClock
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationClock = (function($, undefined) {
  "$:nomunge";

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationClock window1\"> <div class=\"Clock\"><div class=\"HourShadow\"></div><div class=\"Hour\"></div><div class=\"MinuteShadow\"></div><div class=\"Minute\"></div><div class=\"SecondShadow\"></div><div class=\"Second\"></div></div> </div> </div> ").html();
        this._title = 'Clock';
        this._icon = 'status/appointment-soon.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 200;
        this._height = 230;
        this._gravity = 'center';

        this.int_sec = null;
        this.int_min = null;
        this.int_hour = null;
      },

      destroy : function() {
        clearTimeout(this.int_sec);
        clearTimeout(this.int_min);
        clearTimeout(this.int_hour);

        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
          // Do your stuff here

          var hour = $(el).find(".Hour, .HourShadow");
          var min  = $(el).find(".Minute, .MinuteShadow");
          var sec  = $(el).find(".Second, .SecondShadow");

          this.int_sec = setInterval( function() {
            var d = new Date();
            var seconds = d.getSeconds();
            var sdegree = seconds * 6;
            var srotate = "rotate(" + sdegree + "deg)";

            sec.css("-webkit-transform", srotate );

          }, 1000 );

          this.int_hour = setInterval( function() {
            var d = new Date();
            var hours = d.getHours();
            var mins = d.getMinutes();
            var hdegree = hours * 30 + Math.round(mins / 2);
            var hrotate = "rotate(" + hdegree + "deg)";

            hour.css("-webkit-transform", hrotate );

          }, 1000 );

          this.int_min = setInterval( function() {
            var d = new Date();
            var mins = d.getMinutes();
            var mdegree = mins * 6;
            var mrotate = "rotate(" + mdegree + "deg)";

            min.css("-webkit-transform", mrotate );
          }, 1000 );
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationClock = Application.extend({

      init : function() {
        this._super("ApplicationClock", argv);
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

    return new __ApplicationClock();
  };
})($);

