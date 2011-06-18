/**
 * Application: SystemAbout
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var SystemAbout = (function($, undefined) {
  return function(Window, Application, API, argv) {




    var Window_window1 = Window.extend({

      init : function(app) {
        this._super("SystemAbout", false, {}, {});
        this.content = $("<div class=\"window1\"> <div class=\"GtkWindow SystemAbout window1\"> <div class=\"SystemAbout\"><div class=\"SystemAboutInner\"><span>Created by Anders Evenrud</span><a href=\"http://no.linkedin.com/in/andersevenrud\" target=\"_blank\">LinkedIn</a><br /><a href=\"https://www.facebook.com/anders.evenrud\" target=\"_blank\">Facebook</a><br /><a href=\"mailto:andersevenrud@gmail.com\" target=\"_blank\">&lt;andersevenrud@gmail.com&gt;</a><br /><br />Icons from Gnome<br />Theme inspired by GTK</div></div> </div> </div> ").html();
        this.title = 'About';
        this.icon = 'actions/gtk-about.png';
        this.is_draggable = true;
        this.is_resizable = false;
        this.is_scrollable = false;
        this.is_sessionable = true;
        this.is_minimizable = false;
        this.is_maximizable = false;
        this.is_closable = true;
        this.is_orphan = true;
        this.width = 220;
        this.height = 120;
        this.gravity = "center";

        this.app = app;
      },

      destroy : function() {
        this._super();
      },



      create : function(id, zi, mcallback) {
        var el = this._super(id, zi, mcallback);
        var self = this;

        if ( el ) {
          el.find(".GtkScale").slider();

          el.find(".GtkToolItemGroup").click(function() {
            $(this).parents(".GtkToolPalette").first().find(".GtkToolItemGroup").removeClass("Checked");

            if ( $(this).hasClass("Checked") ) {
              $(this).removeClass("Checked");
            } else {
              $(this).addClass("Checked");
            }
          });

          el.find(".GtkToggleToolButton button").click(function() {
            if ( $(this).parent().hasClass("Checked") ) {
              $(this).parent().removeClass("Checked");
            } else {
              $(this).parent().addClass("Checked");
            }
          });



          // Do your stuff here

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

        this._super(self);

        var root_window = new Window_window1();
        root_window.show(self);

        // Do your stuff here
      }
    });

    return new __SystemAbout();
  };
})($);

