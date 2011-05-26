var ApplicationClock = (function() {

  return function(Application, app, api, argv) {

    var _ApplicationClock = Application.extend({
      init : function() {
        this._super("ApplicationClock");
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

      run : function() {

        var el   = app.$element;
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
    });

    return new _ApplicationClock();
  };


})();
