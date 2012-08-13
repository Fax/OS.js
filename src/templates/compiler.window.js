
    /**
     * GtkWindow Class
     * @class
     */
    var Window_%WINDOW_NAME% = GtkWindow.extend({

      init : function(app) {
        this._super("Window_%WINDOW_NAME%", %IS_DIALOG%, app, windows);
        this._content = $("%CONTENT%");
%CODE_INIT%
      },

      destroy : function() {
        this._super();
      },

%CODE_CLASS%

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
%CODE_CREATE%
          // Do your stuff here

          return true;
        }

        return false;
      }
    });

