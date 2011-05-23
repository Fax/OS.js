var ApplicationClock = (function() {

  function CreateClock(el) {
    var radius = $(el).width() / 2;
    var face = $('<div class="face"></div>');

    var _update = function(a,b,c) {
      var rp=b*Math.PI*2/c-Math.PI/2;
      for ( var i = 0; i < a.length; i++ ) {
        a[i].css({
          top : (radius + Math.sin(rp) * i) + 'px',
          left : (radius + Math.cos(rp) * i) + 'px'
        });
      }
    };

    var _create = function(x, y) {
      var a = [];
      var l = Math.floor(radius * x);
      for ( var i = 0; i < l; i++ ) {
        var mark = $('<div></div>').addClass(y);
        $(face).append(mark);
        a.push(mark);
      }
      return a;
    };

    var l = 12;
    for ( var i = 0; i < 12; i++ ) {
      mark = $('<div></div>').html(i + 1);
      $(face).append(mark);
    }

    var hhs = _create(0.50, "hh");
    var mms = _create(0.75, "mm");
    var sss = _create(0.90, "ss");

    $(el).append(face);

    var n = radius * 0.9;
    for(i=0;i<12;i++){
      var rp=(i+1)*2*Math.PI/12-Math.PI/2;
      var p = $($(face).children().get(i));

      p.css({
        top : radius+Math.sin(rp)*n-p.height()/2+'px',
        left : radius+Math.cos(rp)*n-p.width()/2+'px'
      });
    }

    return setInterval(function() {
      var d = new Date();
      var ss = d.getSeconds() + d.getMilliseconds() / 1000;
      var mm = d.getMinutes() + ss / 60;
      var hh = d.getHours() + mm / 60;

      _update(hhs, (hh % 12), 12);
      _update(mms, mm, 60);
      _update(sss, ss, 60);
    }, 200);
  }


  return function(Application, app, api) {

    var _ApplicationClock = Application.extend({
      init : function() {
        this.clock = null;

        this._super("ApplicationClock");
      },

      destroy : function() {
        if ( this.clock ) {
          clearInterval(this.clock);
        }

        this._super();
      },

      run : function() {
        this.clock = CreateClock(app.$element.find(".clock"));

        this._super();
      }
    });

    return new _ApplicationClock();
  };


})();
