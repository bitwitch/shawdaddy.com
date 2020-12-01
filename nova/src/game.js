// globals
var canvas, ctx, canvas_width, canvas_height, prev_frame, running, 
    player, chest, key, monster, do_fireworks, psystems, input, clear_info,
    game_start;

function init() {
  game_start = false;
  canvas = document.getElementById('canvas');
  // TODO(shaw): update to make responsive
  canvas_width = canvas.width;
  canvas_height = canvas.height;
  ctx = canvas.getContext('2d');
  prev_frame = Date.now();
  running = true;
  do_fireworks = false;
  psystems = [];

  clear_info = {
    color: '#ADA599',
    value: 1,
    fade: false,
    fade_first_time: true,
    fade_lerp: 1,
    fade_speed: 0.001,
    fade_start_color: {r:173, g:165, b:153},
    fade_stop_color: {r:12, g:52, b:79}
  }

  input = {
    left: 0,
    right: 0,
    space: 0,
    attack: 0,
    action: 0
  }

  chest = {
    w: 64,
    h: 64,
    x: canvas_width - 64,
    y: canvas_height - 64,
    did_hit: false
  }

  key = null;
  player = new Player();
  monster = new Monster();

  document.addEventListener('keydown', handle_keydown);
  document.addEventListener('keyup', handle_keyup);
}

//function start_screen() {
  //ctx.font = '25px Helvetica';
  //ctx.fillStyle = '#000000';
  //ctx.fillText('Press any key to begin', 50, 90);
  //ctx.fillText('arrow keys - move', 50, 90 + 50);
  //ctx.fillText('x - attack', 50, 90 + 75);
  //ctx.fillText('escape - restart', 50, 90 + 100);
//}

function run() {
  if (running) {
    window.requestAnimationFrame(run);
  }

  var cur_frame = Date.now();
  var dt = cur_frame - prev_frame;
  prev_frame = cur_frame;

  if (clear_info.fade) {
    fade(dt);
  } 

  ctx.fillStyle = clear_info.color;
  ctx.fillRect(0, 0, canvas_width, canvas_height);
  ctx.beginPath();

  // update fireworks
  if (do_fireworks) {
    fireworks(dt);
  }

  // update key
  if (key && key.active) {
    key.update(dt);
  }

  // draw chest
  if (chest.did_hit)
    ctx.drawImage(img_chest, 64, 0, 64, 64, chest.x, chest.y, chest.w, chest.h);
  else
    ctx.drawImage(img_chest, 0, 0, 64, 64, chest.x, chest.y, chest.w, chest.h);

  monster.update(dt);

  player.update(dt);

}

function fireworks(dt) {
  if (Math.random() < 0.05) {
    psystems.push(new ParticleSystem(
      rand_int(0, 5),                  // color id
      Math.random() * canvas_width,    // x-pos
      canvas_height));                 // y-pos
  }

  for (var i=0; i<psystems.length; i++) {
    var psystem = psystems[i];
    psystem.run(dt, ctx);
    // if system contains no particles, remove particle system
    if (psystem.particles.length == 0) {
      psystems.splice(i, 1);
    }
  }

  //ctx.fillStyle = '#CAB192';
  ctx.fillStyle = '#FF7062';
  ctx.font = '50px Helvetica';
  ctx.fillText('Happy Birthday Nova!', 100, 200);
}

function handle_keydown(e) {
  if (e.key == "ArrowLeft")  input.left = 1;
  if (e.key == "ArrowRight") input.right = 1;
  if (e.key == " ")          input.space = 1;
  if (e.key == "x")          input.attack = 1;
  if (e.key == "z")          input.action = 1;
}

function handle_keyup(e) {
  if (e.key == "ArrowLeft")  input.left = 0;
  if (e.key == "ArrowRight") input.right = 0;
  if (e.key == " ")          input.space = 0;
  if (e.key == "x")          input.attack = 0;
  if (e.key == "z")          input.action = 0;
  if (e.key == "Escape")     init();
}

// min inclusive, max exclusive
function rand_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function fade(dt) {
  if (clear_info.fade_first_time) {
    clear_info.fade_lerp = 0;
    clear_info.fade_first_time = false;
  }

  if (clear_info.fade_lerp >= 1) {
    clear_info.fade = false;
    clear_info.fade_first_time = true;
    return;
  }

  clear_info.fade_lerp += clear_info.fade_speed * dt;

  var color = lerp_color(clear_info.fade_start_color, clear_info.fade_stop_color, clear_info.fade_lerp);

  clear_info.color = `rgba(${color.r},${color.g},${color.b})`
}

function Key(sx, sy, dx, dy) {
  this.start_x = sx;
  this.start_y = sy;
  this.end_x = dx;
  this.end_y = dy;
  this.x = sx;
  this.y = sy;
  this.w = 32;
  this.h = 32;
  this.lerp_speed = 0.001;
  this.lerp_amt = 0;
  this.active = false;
  this.state = 'landing'
}

Key.prototype.update = function(dt) {
  switch(this.state) {
    case 'landing': this.landing(dt); break;
    case 'idle': this.idle(dt); break;
    case 'held': this.held(dt); break;
    case 'used': this.active = false; break;
  }

  ctx.drawImage(img_key, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
}

Key.prototype.landing = function (dt) {
  this.lerp_amt += this.lerp_speed * dt;
  this.x = lerp(this.start_x, this.end_x, this.lerp_amt);
  this.y = lerp(this.start_y, this.end_y, this.lerp_amt);

  if (this.lerp_amt >= 1) {
    this.state = 'idle';
  }
}

Key.prototype.held = function(dt) {
  this.x = player.x + 10;
  this.y = player.y - 25;
  if (chest.did_hit) {
    this.state = 'used';
  }
}

Key.prototype.idle = function(dt) {
  if (collide(this, player)) {
    this.state = 'held'
  }
}
