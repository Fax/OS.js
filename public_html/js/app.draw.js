/**
 * Application: Draw
 *
 * @package ajwm.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
var ApplicationDraw = (function($, undefined) {
  return function(Application, app, api, argv) {
    var _ApplicationDraw = Application.extend({
      init : function() {
        this._super("ApplicationDraw");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var el = app.$element;
        var canvas = el.find("canvas").get(0);

        var drawStart = null;
        var drawStop  = null;
        var drawCurrent = null;
        var canvasPos = null;

        var currentTool = $(el).find(".ApplicationDrawPanel button.Current");
        var currentToolText = $(el).attr("class").replace("draw_", "");

        $(el).find(".ApplicationDrawPanel button").click(function() {
          if ( $(this)[0] != $(currentTool)[0] ) {
            $(currentTool).removeClass("Current");

            currentTool = $(this).addClass("Current");
            currentToolText = $(this).attr("class").replace("draw_", "");
          }
        });

        if ( !canvas.getContext ) {
          return;
        }
        var context = canvas.getContext('2d');

        function mouseposX(ev) {
          var x;

          // Get the mouse position relative to the canvas element.
          if (ev.layerX || ev.layerX === 0) { // Firefox
            x = ev.layerX;
          } else if (ev.offsetX || ev.offsetX === 0) { // Opera
            x = ev.offsetX;
          }

          return x;
        }
        function mouseposY(ev) {
          var y;

          // Get the mouse position relative to the canvas element.
          if (ev.layerX || ev.layerX === 0) { // Firefox
            y = ev.layerY;
          } else if (ev.offsetX || ev.offsetX === 0) { // Opera
            y = ev.offsetY;
          }
          return y;
        }


        var isDrawing = false;
        $(canvas).css({
          "width" : "100%",
          "height" : "100%"
        }).mousedown(function(ev) {
          if ( !isDrawing ) {
            isDrawing = true;

            context.beginPath();
            context.moveTo(mouseposX(ev), mouseposY(ev));

            ev.preventDefault();
            ev.stopPropagation();
          }
        }).mousemove(function(ev) {
          if ( isDrawing ) {
            context.lineTo(mouseposX(ev), mouseposY(ev));
            context.stroke();

            ev.preventDefault();
            ev.stopPropagation();
          }
        }).mouseup(function(ev) {
          if ( isDrawing ) {
            ev.preventDefault();
            ev.stopPropagation();

            isDrawing = false;
          }

        }).click(function(ev) {
        });


        this._super();
      }
    });

    return new _ApplicationDraw();
  };
})($);
