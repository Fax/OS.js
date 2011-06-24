var wgl = (function() {

  var horizAspect = 480.0/640.0;

  function loadIdentity(gl) {
    mvMatrix = Matrix.I(4);
  }
  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }
  function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
  }
  function setMatrixUniforms(gl) {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  function initBuffers(gl) {
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    var vertices = [
      1.0,  1.0,  0.0,
      -1.0, 1.0,  0.0,
      1.0,  -1.0, 0.0,
      -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }


  function initShaders(gl) {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program.");
    }
    gl.useProgram(shaderProgram);
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
  }


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }
    var theSource = "";
    var currentChild = shaderScript.firstChild;
    while(currentChild) {
      if (currentChild.nodeType == 3) {
        theSource += currentChild.textContent;
      }
      currentChild = currentChild.nextSibling;
    }
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;  // Unknown shader type
    }
    gl.shaderSource(shader, theSource);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  return Class.extend({

    init : function() {
      this.canvas = document.createElement("canvas");

      this.gl = this.create();
    },

    destroy : function() {

    },

    create : function() {
      if ( this.canvas ) {
        try {
          gl = this.canvas.getContext("experimental-webgl");
        } catch ( e ) {}

        if ( gl ) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
          gl.clearDepth(1.0);                                     // Clear everything
          gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
          gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
          gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

          return gl;
        }

        return false;
      }
    },

    draw : function() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
      loadIdentity(this.gl);
      mvTranslate([-0.0, 0.0, -6.0]);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, squareVerticesBuffer);
      this.gl.vertexAttribPointer(vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
      setMatrixUniforms(this.gl);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

  });

})();
