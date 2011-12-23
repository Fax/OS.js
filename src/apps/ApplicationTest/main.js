/*!
 * Application: ApplicationTest
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @class
 */
OSjs.Applications.ApplicationTest = (function($, undefined) {
  "$:nomunge";

   function makeSpectralColor(hue) {
      var section = Math.floor(hue*6);
      var fraction = hue*6 - section;
      var rgb;
      switch (section) {
        case 0:
           r = 1;
           g = fraction;
           b = 0;
           break;
        case 1:
           r = 1 - fraction;
           g = 1;
           b = 0;
           break;
        case 2:
           r = 0;
           g = 1;
           b = fraction;
           break;
        case 3:
           r = 0;
           g = 1 - fraction;
           b = 1;
           break;
        case 4:
           r = fraction;
           g = 0;
           b = 1;
           break;
        case 5:
           r = 1;
           g = 0;
           b = 1 - fraction;
           break;
        default:
           break;
      }
      var rx = new Number(Math.floor(r*255)).toString(16);
      if (rx.length == 1)
         rx = "0" + rx;
      var gx = new Number(Math.floor(g*255)).toString(16);
      if (gx.length == 1)
         gx = "0" + gx;
      var bx = new Number(Math.floor(b*255)).toString(16);
      if (bx.length == 1)
         bx = "0" + bx;
      var color = "#" + rx + gx + bx;
      return color;
   }

  /////////////////////////////////////////////////////////////////////////////
  // MANDELBROT
  /////////////////////////////////////////////////////////////////////////////

  var Mandelbrot = Class.extend({

    // References
    _app              : null,
    _canvas           : null,
    _context          : null,
    _label            : null,
    _tmp_canvas       : null,
    _tmp_context      : null,

    // Current work
    _start            : null,
    _stop             : null,
    _jobs             : [],
    _jobs_complete    : 0,
    _jobs_iter        : 0,
    _running          : false,
    _timeout          : null,
    _palette          : [],
    _palette_length   : 0,

    // Positioning
    _xmin             : 0,
    _xmax             : 490,
    _xmax             : 0,
    _ymax             : 260,
    _dx               : 0,
    _dy               : 0,

    // Default options
    _options          : {
      "workerCount"         : 0,
      "maxIters"            : 0,
      "stretchPalette"      : true,
      "fixedPalette"        : false,
      "fixedPaletteLength"  : 0
    },

    //
    // Magics
    //

    init : function(app, canvas, label, options) {
      this._app     = app;
      this._canvas  = canvas;
      this._context = canvas.getContext("2d");
      this._label   = label;
      this._timeout = null;
      this._running = false;

      var c = document.createElement("canvas");
      var o = c.getContext("2d");
      c.width = canvas.width;
      c.height = canvas.height;

      this._tmp_canvas  = c;
      this._tmp_context = o;

      this.setOptions(options);
    },

    destroy : function() {
      this._context = null;
      this._canvas = null;
      if ( this._timeout ) {
        clearTimeout(this._timeout);
      }
      this._timeout = null;
      this._running = false;
      this._tmp_context = null;
      this._tmp_canvas = null;
    },

    run : function () {
      this.RestoreDefaults();
      this.CreatePalette();
      this.setWorkerCount();

      this.Start();
    },


    //
    // Events
    //

    WorkerJobFinished : function(ev, data) {
      if ( data.jobNum != this._jobs_iter ) {
        return;
      }

      console.group("ApplicationTest::Mandelbrot::WorkerJobFinished()");

      var iterCount = data.iterationCounts;
      var row       = data.row;
      var columns   = this._canvas.width;

      console.log("Row", row);
      console.log("Columns", columns);

      for ( var col = 0; col < columns; col++ ) {
        var ct = iterCount[col];
        if ( ct < 0 ) {
          this._tmp_context.fillStyle = "#000";
        } else {
          this._tmp_context.fillStyle = this._palette[(iterCount[col] % this._palette_length)];
        }

        this._tmp_context.fillRect(col, row, 1, 1);
      }

      this._jobs_complete++;
      if ( this._jobs_complete == this._canvas.height ) {
        this.Stop();
      } else if ( this._jobs.length > 0 ) {
        var w = this._app.getWorker("ApplicationTest_" + data.jobNum);
        var j = this._jobs.pop();
        j.workerNum = data.workerNum;
        w.post(j);
      }

      console.groupEnd();
    },

    //
    // Methods
    //

    Start : function() {
      var self = this;

      console.group("ApplicationTest::Mandelbrot::Start()");
      if ( this._running ) {
        this.Stop();
      } else {
        this._start = (new Date()).getTime();
      }

      this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
      this._tmp_context.fillStyle = "#BBB";
      this._tmp_context.fillRect(0, 0, this._canvas.width, this._canvas.height);

      this._jobs          = [];
      this._jobs_complete = 0;

      var y       = this._ymax;
      var rows    = this._canvas.height;
      var columns = this._canvas.width;

      console.log("Rows", rows);
      console.log("Cols", columns);

      for ( var row = 0; row < rows; row++ ) {
        this._jobs[rows - 1 - row] = {
          jobNum          : this._jobs_iter,
          row             : row,
          maxIterations   : this._options.maxIters,
          y               : y,
          xmin            : this._xmin,
          columns         : columns,
          dx              : this._dx
        };
        y -= this._dy;
      }

      console.log("Worker count", this._options.workerCount);

      for ( var i = 0; i < this._options.workerCount; i++ ) {
        var j = this._jobs.pop();
        var w = this._app.getWorker("ApplicationTest_" + i);
        j.workerNum = i;
        w.post(j);
      }

      this._running = true;

      this._timeout = setTimeout(function() {
        self.Repaint();
      }, 100);

      console.groupEnd();
    },

    Stop : function() {
      console.group("ApplicationTest::Mandelbrot::Stop()");

      if ( this._running ) {
        this._jobs_iter++;
        this._running = false;

        if  ( this._timeout ) {
          clearTimeout(this._timeout);
        }

        this._timeout = null;
        this.Repaint();

        this._stop = (new Date()).getTime();

        this._label.html("Rendered in " + (this._stop - this._start) + "ms using " + this._options.workerCount + " workers and " + this._options.maxIters + " iterations");

        console.log("Stopped jobs", this._jobs_iter);
      }

      console.groupEnd();
    },


    Repaint : function() {
      var self = this;

      this._context.drawImage(this._tmp_canvas, 0, 0);
      if ( this._running ) {
        this._timeout = setTimeout(function() {
          self.Repaint();
        }, 100);
        console.log("ApplicationTest::Mandelbrot::Repaint()", "Draw");
      } else {
        console.log("ApplicationTest::Mandelbrot::Repaint()", "Idle");
      }
    },

    RestoreDefaults : function() {
      // Settings
      var x1 = -2.2;
      var x2 = 0.8;
      var y1 = -1.2;
      var y2 = 1.2;

      var options = {
        "workerCount"         : 4,
        "maxIters"            : 100,
        "stretchPalette"      : true,
        "fixedPalette"        : true,
        "fixedPaletteLength"  : 250
      };

      this.setOptions(options);

      // Defaults
      this._jobs            = [];
      this._jobs_iter       = 0;
      this._palette         = [];
      this._palette_length  = 0;

      // Position
      this._xmin = x1;
      this._xmax = x2;
      this._ymin = y1;
      this._ymax = y2;
      this._dx   = (this._xmax - this._xmin) / (this._canvas.width - 1);
      this._dy   = (this._ymax - this._ymin) / (this._canvas.height - 1);

      console.group("ApplicationTest::Mandelbrot::RestoreDefaults()");
      console.log("Positions", [x1,x2,y1,y2], this._dx, this._dy);
      console.log("Workers", this._options.workerCount);
      console.log("Max Iterations", this._options.maxIters);
      console.log("Fixed Palette", this._options.fixedPalette);
      console.log("Palette length", this._options.fixedPaletteLength);
      console.log("Stretch palette", this._options.stretchPalette);
      console.groupEnd();
    },

    CreatePalette : function() {
      console.group("ApplicationTest::Mandelbrot::CreatePalette()");
      var length = this._options.stretchPalette ? this._options.maxIters : this._options.fixedPaletteLength;
      if (length == this._palette_length) {
        console.groupEnd();
        return;
      }

      var paletteLength = length;
      var palette       = [];

      var i = 0, hue = 0;
      for (i; i < paletteLength; i++) {
        hue         = i / paletteLength;
        palette[i]  = makeSpectralColor(hue);
      }

      this._palette         = palette;
      this._palette_length  = paletteLength;

      console.log("Palette", palette);
      console.log("Length", paletteLength);
      console.groupEnd();
    },

    //
    // Setters / Getters
    //

    setOptions : function(opts) {
      if ( opts !== undefined && opts instanceof Object ) {
        for ( var i in opts ) {
          if ( opts.hasOwnProperty(i) ) {
            if ( this._options[i] !== undefined ) {
              this._options[i] = opts[i];
            }
          }
        }
      }
    },

    setWorkerCount : function(count, update) {
      count = parseInt(count, 10);
      update = update === undefined ? true : update;

      if ( !count || isNaN(count) ) {
        count = this._options.workerCount;
      }

      console.group("ApplicationTest::Mandelbrot::setWorkerCount()");
      console.log("Count", count);
      var self = this;
      if ( count > 0 ) {
        if ( update ) {
          // First -- Clear all workers
          this._app._clearWorkers();

          // Then update new workers
          var w;
          var i = 0;

          for ( i; i < count; i++ ) {
            w = this._app.addWorker("ApplicationTest_" + i, "worker.js", function(ev, data) {
              self.WorkerJobFinished(ev, data);
            });
          }

          console.log("Created", i, "workers");
        }

        this._options.workerCount = count;
      }

      console.groupEnd();
    }

  });

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

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
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTest window1\"> <div class=\" \"></div> </div> </div> ").html();
        this._title = 'WebWorker Test';
        this._icon = 'status/starred.png';
        this._is_draggable = true;
        this._is_resizable = false;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = false;
        this._is_closable = true;
        this._is_orphan = false;
        this._skip_taskbar = false;
        this._skip_pager = false;
        this._width = 500;
        this._height = 300;
        this._gravity = null;

        this.canvas = null;
        this.context = null;
        this.label = null;
      },

      destroy : function() {
        this._super();
      },


      run : function() {

      },

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
          // Do your stuff here
          this.$element.find(".window1").html("");

          var label = $("<div><span>Loading...</span></div");
          this.$element.find(".window1").append(label);
          label.css({
            "position"    : "absolute",
            "top"         : "5px",
            "right"       : "5px",
            "fontFamily"  : "Monospace",
            "fontSize"    : "12px",
            "textAlign"   : "right",
            "color"       : "#000000",
            "zIndex"      : 1000,
            "width"       : "490px",
            "height"      : "12px"
          });

          this.label = label;

          var canvas  = document.createElement("canvas");
          if ( canvas ) {
            canvas.width = 490;
            canvas.height = 260;

            var context = canvas.getContext("2d");
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, 490, 260);

            this.context = context;
            this.canvas  = canvas;

            this.$element.find(".window1").append(canvas);
          }

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
    var __ApplicationTest = Application.extend({

      init : function() {
        this._super("ApplicationTest", argv);
        this._compability = ["canvas", "worker"];

        this.mb = null;
      },

      destroy : function() {
        if ( this.mb ) {
          this.mb.destroy();
          this.mb = null;
        }

        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);

        this._super(root_window);

        root_window.show();

        // Do your stuff here

        this.mb = new Mandelbrot(this, root_window.canvas, root_window.label.find("span"));

        console.group("ApplicationTest::Application::run()");
        console.log("Mandelbrot", this.mb);
        console.groupEnd();

        this.mb.run();
      }

    });

    return new __ApplicationTest();
  };
})($);
