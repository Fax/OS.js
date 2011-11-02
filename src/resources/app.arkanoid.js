/*!
 * Application: ApplicationArkanoid
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationArkanoid = (function($, undefined) {
    "$:nomunge";

    var KEY_TAB = 9;
    var KEY_ENTER = 13;
    var KEY_BACKSPACE = 8;
    var KEY_UP = 38;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    var canvas          = null;
    var canvasWidth     = 800;
    var canvasHeight    = 400;
    var interval        = null;
    var colors          = {};
    var pressed         = null;
    var finished        = false;
    var started         = false;

    var paddleMoveSpeed = 5;
    var paddleWidth     = 150;
    var paddleHeight    = 15;
    var paddleX         = (canvasWidth / 2) - (paddleWidth / 2);
    var paddleY         = (canvasHeight - paddleHeight);
    var ballSize        = 10;
    var ballX           = ((canvasWidth / 2) - (ballSize / 2));
    var ballY           = ((canvasHeight / 2) - (ballSize / 2));
    var ballMoveSpeed   = 10;
    var ballMoveX       = 2;
    var ballMoveY       = 4;
    var brickPadding    = 5;
    var brickCols       = 5;
    var brickRows       = 5;
    var brickWidth      = ((canvasWidth-brickPadding) / brickCols) - brickPadding;
    var brickHeight     = 15;
    var bricksLeft      = -1;
    var bricks          = [];
    var minX            = ballSize / 2;
    var minY            = ballSize / 2;
    var maxX            = canvasWidth - (ballSize / 2);
    var maxY            = canvasHeight - (ballSize / 2) - (paddleHeight);

    function reset() {
      stop();

      finished   = false;

      bricks     = new Array(brickRows);
      bricksLeft = (brickCols * brickRows);

      for ( var y = 0; y < brickRows; y++ ) {
        bricks[y] = new Array(brickCols);
        for ( var x = 0; x < brickCols; x++ ) {
          bricks[y][x] = 1;
        }
      }

      paddleX    = (canvasWidth / 2) - (paddleWidth / 2);
      paddleY    = (canvasHeight - paddleHeight);
      ballX      = ((canvasWidth / 2) - (ballSize / 2));
      ballY      = ((canvasHeight / 2) - (ballSize / 2));

      colors = {
        "fill" : canvas.createLinearGradient(0, 0, 0, canvasHeight, {"0" : "#402d00", "1" : "#181100"}),//"#222222",
        "ball" : "#ffffff",
        "paddle" : "#e6e6e6",
        "paddle_stroke" : "#000000",
        "brick"  :         canvas.createLinearGradient(0, 0, 0, (brickHeight * brickRows), {"0" : "#00ABEB", "1" : "#ffffff"}), //"#00ff00",
        "brick_stroke" : "#ffffff"
      };

      canvas.$context.font = "100px Monospace";
    }

    /**
     * Start Game
     */
    function start() {
      started = true;

      reset();

      interval = setInterval(function() {
        loop();
      }, 10);
    }

    /**
     * End Game
     */
    function stop() {
      clearInterval(interval);
    }

    /**
     * Draw Scene
     */
    function draw() {
      // Clear screen
      canvas.clear(colors.fill);

      // Draw bricks
      for ( var y = 0; y < brickRows; y++ ) {
        for ( var x = 0; x < brickCols; x++ ) {
          if ( bricks[y][x] === 1 ) {
            canvas.rect(
              (x * (brickWidth + brickPadding)) + brickPadding,
              (y * (brickHeight + brickPadding)) + brickPadding,
              brickWidth,
              brickHeight, colors.brick, colors.brick_stroke);
          }
        }
      }

      // Draw paddle
      canvas.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 5, colors.paddle, colors.paddle_stroke);

      // Draw ball
      canvas.circle(ballX, ballY, ballSize, colors.ball);

      if ( finished || !started ) {
        canvas.text("Press Enter", 60, 240);
      }
    }

    /**
     * Loop
     */
    function loop() {
      draw();

      if ( finished ) {
        stop();
        return;
      }

      // Check keypress
      if ( pressed === KEY_LEFT ) {
        if ( paddleX > paddleMoveSpeed ) {
          paddleX -= paddleMoveSpeed;
        } else {
          paddleX = 0;
        }
      } else if ( pressed === KEY_RIGHT ) {
        if ( paddleX < ((canvasWidth - paddleWidth) - paddleMoveSpeed) ) {
          paddleX += paddleMoveSpeed;
        } else {
          paddleX = (canvasWidth - paddleWidth);
        }
      }

      // Collision detection
      var rowheight = brickHeight + brickPadding;
      var colwidth = brickWidth + brickPadding;
      var row = Math.floor(ballY/rowheight);
      var col = Math.floor(ballX/colwidth);
      if (ballY < brickRows * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
        ballMoveY = -ballMoveY;
        bricks[row][col] = 0;
        bricksLeft--;
      }

      if ( bricksLeft <= 0 ) {
        finished = true;
      }

      // Hit sides
      if (ballX + ballMoveX > maxX || ballX + ballMoveX < minX) {
        ballMoveX = -ballMoveX;
      }

      // Hit top
      if (ballY + ballMoveY < minY) {
        ballMoveY = -ballMoveY;
      }

      // Hit paddle
      else if (ballY + ballMoveY > (maxY)) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          //ballMoveY = -ballMoveY;
          ballmoveX = ((ballMoveX + paddleWidth / 2) / paddleWidth);
          ballMoveY = -ballMoveY;
        }
        // Hit bottom
        else {
          finished = true;
        }
      }

      ballX += ballMoveX;
      ballY += ballMoveY;
    }


  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";


    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////


    /**
     * GtkWindow Class
     * @class
     */
    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationArkanoid window1\"> <div class=\" \"></div> </div> </div> ").html();
        this._title = 'Arkanoid';
        this._icon = 'emblems/emblem-new.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = false;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 810;
        this._height = 438;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          // Do your stuff here

          return true;
        }

        return false;
      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __ApplicationArkanoid = Application.extend({

      init : function() {
        this._super("ApplicationArkanoid", argv);
        this._compability = ["canvas"];
      },

      destroy : function() {
        if ( canvas ) {
          canvas.destroy();
          canvas = null;
        }

        $(document).unbind("keydown", this.keydown_handler);
        $(document).unbind("keyup",   this.keyup_handler);

        this._super();
      },

      keydown_handler : function(ev) {
        pressed = ev.which || ev.keyCode;
        if ( pressed == 13 ) {
          start();
        }
        ev.preventDefault();
        ev.stopPropagation();
      },

      keyup_handler : function(ev) {
        pressed = null;

        ev.preventDefault();
        ev.stopPropagation();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here
        canvas = new CanvasHelper(root_window.$element.find(".window1 div").get(0), canvasWidth, canvasHeight);
        if ( canvas ) {
          $(document).bind("keydown", this.keydown_handler);
          $(document).bind("keyup",   this.keyup_handler);

          reset();
          draw();
        }
      }
    });

    return new __ApplicationArkanoid();
  };
})($);
