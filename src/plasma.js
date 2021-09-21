function createPlasma() {
    var WINDOW_WIDTH;
    var WINDOW_HEIGHT;
    var gl;

    function Demo() {
        this.running = true;
        this.texWidth = 256;
        this.texHeight = 256;
        this.imageData = null;
        this.distTable = [];
        this.angleTable = [];
        this.texture = [];
        this.shader = null;
        this.buffer = null;
        this.canvas = null;
        this.timeStart = 0;
        this.uniforms = {};
    }

     // "external" API to run demo
    Demo.prototype.run = function() {

        // must create a new canvas because the existing canvas has a 2d context
        var screen = document.getElementById('screen');
        WINDOW_WIDTH = screen.clientWidth;
        WINDOW_HEIGHT = screen.clientHeight;
        this.canvas = document.createElement('canvas');
        this.canvas.width = WINDOW_WIDTH;
        this.canvas.height = WINDOW_HEIGHT;
        var overlay = document.getElementById('overlay');
        overlay.appendChild(this.canvas);

        // hide the 2d context canvas     
        document.getElementById('stage').style.display =  "none";

        this.timeStart = performance.now();

        this.running = true;

        this.initGL();

        if (!gl) this.quit();

        this.createShaderProgram();

        gl.useProgram(this.shader);

        // initialize attributes
        var verticesLoc = gl.getAttribLocation(this.shader, 'a_position');
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1.0,  1.0, 
           1.0, -1.0, 
          -1.0, -1.0, 

          -1.0,  1.0, 
           1.0,  1.0,
           1.0, -1.0
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(verticesLoc);
        gl.vertexAttribPointer(verticesLoc, 2, gl.FLOAT, false, 0, 0);

        // setup uniforms
        this.uniforms['u_resolution'] = gl.getUniformLocation(this.shader, 'u_resolution');
        gl.uniform2fv(this.uniforms['u_resolution'], [WINDOW_WIDTH, WINDOW_HEIGHT]);
        this.uniforms['u_time'] = gl.getUniformLocation(this.shader, 'u_time');

        this.render();
    }

    Demo.prototype.initGL = function() {
        gl = this.canvas.getContext("webgl") || 
             this.canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    Demo.prototype.createShaderProgram = function() {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, string_plasma_vert);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader,string_plasma_frag);
        gl.compileShader(fragmentShader);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            var linkErrLog = gl.getProgramInfoLog(program);
            console.log("Shader program did not link successfully. "
                         + "Error log: " + linkErrLog);
            this.quit();
            return;
        }

        this.shader = program;
    }

    Demo.prototype.render = function() {
      if(!this.running) return;

      requestAnimationFrame(this.render.bind(this));

      gl.uniform1f(this.uniforms['u_time'], (performance.now() - this.timeStart) / 1000.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    Demo.prototype.quit = function() {
        this.running = false;
        this.cleanup();
        document.getElementById('stage').style.display =  "block";
        this.canvas.remove();
    }

    Demo.prototype.cleanup = function() {
        gl.useProgram(null);
        if (this.buffer) gl.deleteBuffer(this.buffer);
        if (this.shader) gl.deleteProgram(this.shader);
    }

    return new Demo();
}


//
// FRAGMENT SHADER
//
var string_plasma_frag = `
#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.1415926535
#define HALF_PI 1.57079632679
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Normalized pixel coordinates (from 0 to 1)    
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
        
    vec2 center = u_resolution.xy / 2.0;
    vec2 circle_offset = vec2(center.x * sin(0.17 * u_time), center.y  * cos(0.245 * u_time));
      
    float d = length(gl_FragCoord.xy + circle_offset - center);
    
    float plasma0 = sin(0.015 * d);
    
    float off1 = 69.0 * sin(0.007 * u_time);
    float plasma1 = sin(0.0211 * gl_FragCoord.x - off1);
    
    float off2 = 52.3 * cos(0.023 * u_time);
    float plasma2 = cos(0.019 * (gl_FragCoord.y + gl_FragCoord.x) + off2);
    
    float off3 = 75.2 * cos(0.009 * u_time);
    float plasma3 = sin(0.02 * gl_FragCoord.y - off3);
    
    float off4 = 48.1 * sin(0.007 * u_time);
    float plasma4 = cos(0.018 * gl_FragCoord.y - off4);

    float value = plasma0 + plasma1 + plasma2 + plasma3 + plasma4;
  
    // Output to screen
    gl_FragColor = vec4(0.0,value,0.5*value,1.0);
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

//
// VERTEX SHADER
// 
var string_plasma_vert = `
#ifdef GL_ES
precision mediump float;
#endif
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
