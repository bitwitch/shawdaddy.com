function createTunnel() {
    var WINDOW_HEIGHT = 650;
    var WINDOW_WIDTH = 850;
    var elapsedTime = 0;

    var canvas;

    function Demo() {
        this.running = true;
        this.texWidth = 256;
        this.texHeight = 256;
        this.imageData = null;
        this.distTable = [];
        this.angleTable = [];
        this.texture = [];
    }

    // "external" API to run demo
    Demo.prototype.run = function() {
        canvas = document.getElementById('stage');
        canvas.width = WINDOW_WIDTH;
        canvas.height = WINDOW_HEIGHT;
        var ctx = canvas.getContext('2d');

        this.prevFrame = Date.now();

        // create ImageData object
        this.imageData = ctx.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);

        // generate XOR texture
        for (var y=0; y < this.texHeight; y++) {
            this.texture[y] = [];
            for (var x=0; x < this.texWidth; x++) {
                this.texture[y][x] = (x * 256 / this.texWidth) ^ (y * 256 / this.texHeight);
            }
        }

        // generate lookup tables
        for (var y=0; y < WINDOW_HEIGHT * 2; y++) {
            this.distTable[y] = [];
            this.angleTable[y] = [];
            for (var x=0; x < WINDOW_WIDTH * 2; x++) {
                var ratio = 32.0;

                var pixelDist = Math.sqrt((x - WINDOW_WIDTH) * (x - WINDOW_WIDTH) + (y - WINDOW_HEIGHT) * (y - WINDOW_HEIGHT));
                var distance = 0;
                if (pixelDist != 0) {
                    distance = Math.floor(ratio * this.texHeight / pixelDist) % this.texHeight;
                }
                var angle = 0.5 * this.texWidth * Math.atan2(y - WINDOW_HEIGHT, x - WINDOW_WIDTH) / 3.1416;
                this.distTable[y][x] = distance;
                this.angleTable[y][x] = angle;
            }
        }

        // run demo
        console.log('running demo');
        this.loop(ctx);
    }

    Demo.prototype.loop = function(ctx) {
        if (this.running) {
            window.requestAnimationFrame(this.loop.bind(this, ctx));
        }

        var thisFrame = Date.now();
        var dt = thisFrame - this.prevFrame;
        this.prevFrame = thisFrame;

        elapsedTime += dt;

        this.update(dt, ctx);
        this.draw(ctx);
    }

    Demo.prototype.update = function(dt, ctx) {
        var time = 0.0005 * elapsedTime + 2;

        var shiftX = Math.floor(this.texWidth * 1.0 * time);
        var shiftY = Math.floor(this.texHeight * 0.25 * time);
        var lookX  = Math.floor(WINDOW_WIDTH / 2) + Math.floor(WINDOW_WIDTH / 2 * Math.sin(time * 0.5)); 
        var lookY  = Math.floor(WINDOW_HEIGHT / 2) + Math.floor(WINDOW_HEIGHT / 2 * Math.sin(time)); 

        var i;
        for (var y=0; y < WINDOW_HEIGHT; y++)
        for (var x=0; x < WINDOW_WIDTH; x++) {
            var texY = Math.floor(this.distTable[y + lookY][x + lookX] + shiftX) % this.texHeight;
            var texX = Math.floor(this.angleTable[y + lookY][x + lookX] + shiftY) % this.texWidth;
            var color = this.texture[texY][texX];

            i = WINDOW_WIDTH * y * 4 + (x * 4); 
            this.imageData.data[i + 0] = 0;  // R value
            this.imageData.data[i + 1] = 0;    // G value
            this.imageData.data[i + 2] = color;  // B value
            this.imageData.data[i + 3] = 255;  // A value
        }
    }

    Demo.prototype.draw = function(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.putImageData(this.imageData, 0, 0);
    }

    Demo.prototype.quit = function() {
        this.running = false;
    }

    return new Demo();
}
