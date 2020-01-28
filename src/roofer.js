//TODO(shaw): bug at bridge section. if you jump from bridge to right building and land half on the right building, 
// you fall through, ground collision is not detected. this is the only place this seems to occur
var createRoofer = function() {

  var canvas = document.getElementById('stage'); 
  var ctx = canvas.getContext('2d');
  var tunes = new Audio('../assets/DD2W2.mp3');

  var blueBuildings = new Image(); 
  blueBuildings.src = "../assets/buildings.png";
  //blueBuildings.onload = function () {
    //console.log('image loaded');
  //}

  var gameState = {
    entities: [], 
    blocks: [],
    buildings: [],
    foreground: [],
    started: false,
    gameOver: false,
  }

  var grav = 2;
  var worldEnd = 11000; 
  var darkGreen = "#367f69";

  var canJump = true; 
  var grounded = false;
  var left = false;
  var right = false; 
  var jump = false;

  var pixel = {
    x: 20, 
    y: 40,
    width: 50,
    height: 50,
    speed: 10,
    jumpSpeed: 30,
    vely: 0
  }

  var camera = { 
    x: 0, 
    y: 0,
    boxBound: 450
  }

  // Initialization ---
  function initStage () {
    ctx.drawImage(blueBuildings, 0, 0); 
    ctx.fillStyle = "#d54223";
    ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
    loadLevel(); 
    // drawEntities(blocks); 

  }


  //TODO(shaw): make general function for loading any level 
  function loadLevel () {
    new Block(0, canvas.height - 180, 190, 180, darkGreen);
    new Block(200, canvas.height - 100, 400, 100, darkGreen);
    new Block(650, canvas.height - 100, 600, 100, darkGreen);
    new Block(1350, canvas.height - 100, 500, 100, darkGreen);
    new Block(1950, canvas.height - 100, 500, 100, darkGreen);

    new Block(2600, canvas.height - 200, 300, 200, darkGreen);
    new Block(2900, canvas.height - 100, 300, 100, darkGreen);

    new Block(3300, canvas.height - 150, 300, 150, darkGreen);
    new Block(3500, canvas.height - 300, 300, 300, darkGreen);
    new Block(3750, canvas.height - 100, 300, 100, darkGreen);

    // tall skinny section
    new Block(4200, canvas.height - 250, 60, 250, darkGreen);
    new Block(4500, canvas.height - 400, 60, 400, darkGreen);
    new Block(4900, canvas.height - 50, 60, 50, darkGreen);

    new Block(5200, canvas.height - 127, 200, 127, darkGreen);
    new Block(5400, canvas.height - 100, 400, 10, darkGreen);
    new Block(5800, canvas.height - 127, 200, 127, darkGreen);

    new Block(6300, canvas.height - 50, 400, 50, darkGreen);
    new Block(6900, canvas.height - 200, 200, 200, darkGreen);
    new Block(7300, canvas.height - 400, 200, 400, darkGreen);

    // inside building 
    new Building(7750, canvas.height - 450, 1200, 250, "#57cca8");
    new Foreground(7950, canvas.height - 450, 40, 250, darkGreen);
    new Foreground(8150, canvas.height - 450, 40, 250, darkGreen);
    new Foreground(8350, canvas.height - 450, 40, 250, darkGreen);
    new Foreground(8550, canvas.height - 450, 40, 250, darkGreen);
    new Foreground(8750, canvas.height - 450, 40, 250, darkGreen);
    new Block(7750, canvas.height - 200, 1200, 200, darkGreen);
    new Block(7750, 0, 1200, canvas.height - 450, darkGreen);

    new Block(9100, canvas.height - 300, 300, 300, darkGreen);
    new Block(9400, canvas.height - 150, 200, 150, darkGreen);

    new Block(9800, canvas.height - 350, 100, 350, darkGreen);
  }

  // Input ---
  function handleKeydown (e) {
    if (!gameState.started && e.code === "Enter") {
      gameState.gameOver = false; 
      gameState.started = true;
      roofer.startGame();
    } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
      left = true; 
    } else if (e.code === "KeyD" || e.code === "ArrowRight") {
      right = true;  
    } else if (e.code === "Space" || e.code === "KeyJ") {
      jump = true;
    } 
    
    // else if (e.code === "KeyH") {
    //   console.log({ pixel, fucker, right, left}); 
    // } 
    // else if (e.code === "KeyP") {
      // tunes.paused ? tunes.play() : tunes.pause(); 
    // }
  }

  function handleKeyup (e) {
    if (e.code === "KeyA" || e.code === "ArrowLeft") {
      left = false; 
    } else if (e.code === "KeyD" || e.code === "ArrowRight") {
      right = false;  
    } else if (e.code === "Space" || e.code === "KeyJ") {
      jump = false;
    }
  }

  // Movement ---
  function movePixel () {
    // check for roof collision
    if (pixel.vely < 0) {
      var roofCollisionBlock = detectRoofCollision(pixel);
      if (roofCollisionBlock) {
        pixel.vely = 0; 
        pixel.y = roofCollisionBlock.y + roofCollisionBlock.height; 
      }
    }

    if (left) {
      var horizontalCollisionBlock = detectCollisionLeft(pixel);
      if (horizontalCollisionBlock) {
        pixel.x = horizontalCollisionBlock.x + horizontalCollisionBlock.width;
      } else if (canMoveLeft()){
        pixel.x -= pixel.speed;
      }
    } else if (right) {
      var horizontalCollisionBlock = detectCollisionRight(pixel); 
      if (horizontalCollisionBlock) {
        pixel.x = horizontalCollisionBlock.x - pixel.width; 
      } else if (canMoveRight()){
        pixel.x += pixel.speed; 
      }
    }

    var groundCollisionBlock = detectGroundCollision(pixel);
    if (groundCollisionBlock) {
      grounded = true;
      canJump = true;
      pixel.vely = 0; 
      pixel.y = groundCollisionBlock.y - pixel.height;
    }  else {
      grounded = false;
    }

    if (!grounded) {
      pixel.y += pixel.vely; 
      pixel.vely += grav;
    }

    if (grounded && canJump && jump) {
      pixel.vely = -pixel.jumpSpeed; 
      canJump = false; 
      grounded = false; 
    }

    if (pixel.y > canvas.height) {
      gameState.gameOver = true;
    }
  }

  function moveWorld () {
    if (left && camera.x <= 0) {
      return; 
    }

    if (right && (pixel.x + pixel.width >= canvas.width - camera.boxBound)) {
      camera.x += pixel.speed; 
      for (var i=0, len = gameState.entities.length; i < len; i++) {
        gameState.entities[i].x -= pixel.speed; 
      }
    } else if (left && (pixel.x <= camera.boxBound)) {
      camera.x -= pixel.speed; 
      for (var i=0, len = gameState.entities.length; i < len; i++) {
        gameState.entities[i].x += pixel.speed; 
      }
    } 
  }

  function canMoveLeft () {
    return (
      !right &&
      pixel.x > 0 && 
      (
        camera.x <= 0 || 
        pixel.x > camera.boxBound 
      )
    )
  }

  function canMoveRight () {
    return (
      !left && 
      pixel.x + pixel.width < canvas.width &&
      (
        camera.x + canvas.width >= worldEnd || 
        pixel.x + pixel.width < canvas.width - camera.boxBound
      )
    )
  }
    
  function detectCollisionLeft (entity) {
    var { length } = gameState.blocks; 
    for (var i=0; i<length; i++) {
      var block = gameState.blocks[i]; 
      if (entity.y + entity.height > block.y &&
          entity.y < block.y + block.height && 
          left &&
          entity.x - entity.speed  < block.x + block.width &&
          entity.x + entity.width - entity.speed > block.x)
      {
        return block; 
      }
    }
    return false; 
  }

  function detectCollisionRight (entity) {
    var { length } = gameState.blocks; 
    for (var i=0; i<length; i++) {
      var block = gameState.blocks[i]; 
      if (entity.y + entity.height > block.y &&
          entity.y < block.y + block.height && 
          right &&
          entity.x + entity.width + entity.speed > block.x && 
          entity.x + entity.speed < block.x + block.width) 
      {
        return block; 
      }
    }
    return false; 
  }

  function detectRoofCollision (entity) {
    var { length } = gameState.blocks; 
    for (var i=0; i<length; i++) {
      var block = gameState.blocks[i]; 
      if (
        // block is above entity 
        block.y + block.height <= entity.y && 
        block.x < entity.x + entity.width && 
        block.x + block.width > entity.x &&
        //entity is ABOUT to collide with block
        entity.y + entity.vely <= block.y + block.height) 
      {
        return block;
      }
    }
    return false; 
  }

  function detectGroundCollision (entity) {
    var { length } = gameState.blocks; 
    for (var i=0; i<length; i++) {
      var block = gameState.blocks[i]; 
      if (
        // block is below entity 
        block.y >= entity.y + entity.height && 
        block.x < entity.x + entity.width && 
        block.x + block.width > entity.x &&
        //entity is ABOUT to collide with block
        entity.y + entity.height + entity.vely >= block.y) 
      {
        return block; 
      }
    }
    return false; 
  }

  // Constructors ---
  function Block (x, y, width, height, color) {
    var block = { x, y, width, height, color }; 
    gameState.entities.push(block); 
    gameState.blocks.push(block); 
    return block;
  }

  function Building (x, y, width, height, color) {
    var building = { x, y, width, height, color }; 
    gameState.entities.push(building); 
    gameState.buildings.push(building); 
    return building;
  }

  function Foreground (x, y, width, height, color) {
    var item = { x, y, width, height, color }; 
    gameState.entities.push(item); 
    gameState.foreground.push(item); 
    return item;
  }

  // Drawing ---
  function drawGameOverScreen () {
    ctx.fillStyle = '#000000'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    ctx.font = '100px Arial'; 
    ctx.textAlign = 'center'; 
    ctx.fillStyle = '#ffffff'; 
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 3);

    ctx.font = '50px Arial'; 
    ctx.fillText('Press enter to restart', canvas.width / 2, canvas.height / 1.75);
  }

  function drawCameraBound () {
    ctx.fillStyle = "#c6c6c6";
    ctx.fillRect(camera.boxBound, 0, canvas.width - (2 * camera.boxBound), canvas.height); 
  }

  function drawEntities (collection) {
    for (var i=0, len=collection.length; i<len; i++) {
      var item = collection[i]; 
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, item.width, item.height);
    }
  } 

  function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(blueBuildings, 0, 0, canvas.width, canvas.height); 
    // drawCameraBound();
    drawEntities(gameState.entities);
    // drawEntities(buildings);
    
    ctx.fillStyle = "#d54223";
    ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height); 
    drawEntities(gameState.foreground);
  }

  // Game Loop ---
  function update (time) { // browser generated timestamp 

    if (!roofer.quit) {

      if (gameState.gameOver) {
        drawGameOverScreen();
        doom(); 
        loadLevel(); // TODO(shaw): decide whos responsible for this after gameover 
      } else {
        movePixel();
        moveWorld();
        draw();
        requestAnimationFrame(update);
      }

    }
  }

  function doom () {
    gameState.gameOver = true;
    gameState.started = false;
    gameState.entities = []; 
    gameState.blocks = [];
    gameState.buildings = [];
    gameState.foreground = []; 

    pixel.x = 20;  
    pixel.y = 40;
    pixel.width = 50;
    pixel.height = 50;
    pixel.speed = 10;
    pixel.jumpSpeed = 30; 
    pixel.vely = 0; 

    camera.x = 0; 
    camera.y = 0; 
  }

  // API ---
  var roofer = {}; 
  
  roofer.quit = false;

  roofer.init = function() {
    document.addEventListener('keydown', handleKeydown); 
    document.addEventListener('keyup', handleKeyup);
    initStage();  
  }
  
  roofer.startGame = function() {
    roofer.quit = false; 
    gameState.started = true; 
    gameState.gameOver = false;
    requestAnimationFrame(update);  
  }

  roofer.quitGame = function() {
    document.removeEventListener('keydown', handleKeydown); 
    document.removeEventListener('keyup', handleKeyup);
    
    gameState = {
      entities: [], 
      blocks: [],
      buildings: [],
      foreground: [],
      started: false,
      gameOver: false
    }

  }

  roofer.playMusic = function() {
    tunes.play();
  }

  roofer.pauseMusic = function() {
    tunes.pause();
  }

  return roofer;

};
