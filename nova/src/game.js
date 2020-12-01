// globals
var canvas, ctx, canvas_width, canvas_height, prev_frame, running, 
    player, chest, key, monster, do_fireworks, psystems, input, clear_info,
    game_start, start_button, initiated_start;

function init() {
  canvas = document.getElementById('canvas');
  canvas_width = canvas.width;
  canvas_height = canvas.height;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  game_start = false;
  initiated_start = false;
  start_button = {
    x: 0.5 * canvas_width - 90, 
    y: 300,
    w: 180, h: 50,
    text: 'Begin',
    color: '#DB4040',
    hover_color: '#C23046',
    current_color: '#DB4040',
  };

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
    attack: 0,
    enter: 0
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
  canvas.addEventListener('click', handle_click_to_start);
  canvas.addEventListener('mousemove', handle_mouse_move);
}

function start_screen() {
  // draw button
  ctx.fillStyle = start_button.current_color;
  ctx.fillRect(start_button.x, start_button.y, start_button.w, start_button.h);
  ctx.font = '25px Helvetica';
  ctx.fillStyle = '#000000';
  ctx.fillText(start_button.text, start_button.x + 55, start_button.y + 34);

  // draw instructions
  var center_x = 0.5 * canvas_width;
  var center_y = 0.5 * canvas_height;
  var y_off = 120;
  ctx.fillText('Controls', center_x - 50, y_off);
  ctx.fillText('arrow keys - move', center_x - 100, y_off + 50 + 3);
  ctx.fillText('x - attack', center_x - 100, y_off + 75 + 6);
  ctx.fillText('escape - restart', center_x - 100, y_off + 100 + 9);

  if (input.enter) initiated_start = true;

  if (initiated_start) {
    game_start = true;
    canvas.removeEventListener('click', handle_click_to_start);
    canvas.removeEventListener('mousemove', handle_mouse_move);
  }
}

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

  if (!game_start) {
    start_screen();
    return;
  }

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

  if (player.hp <= 0) {
    draw_death_screen();
  }
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
  if (e.key == "x")          input.attack = 1;
  if (e.key == "Enter")      input.enter = 1;
}

function handle_keyup(e) {
  if (e.key == "ArrowLeft")  input.left = 0;
  if (e.key == "ArrowRight") input.right = 0;
  if (e.key == "x")          input.attack = 0;
  if (e.key == "Enter")      input.enter = 0;

  if (e.key == "Escape")     init();
}

function handle_click_to_start(e) {
  var rect = canvas.getBoundingClientRect();
  var scale_x = canvas.width / rect.width;
  var scale_y = canvas.height / rect.height;
  var x = (e.clientX - rect.x) * scale_x;
  var y = (e.clientY - rect.y) * scale_y;

  if (x >= start_button.x && x <= start_button.x + start_button.w &&
      y >= start_button.y && y <= start_button.y + start_button.h)
  {
    initiated_start = true;
  }
}

function handle_mouse_move(e) {
  var rect = canvas.getBoundingClientRect();
  var scale_x = canvas.width / rect.width;
  var scale_y = canvas.height / rect.height;
  var x = (e.clientX - rect.x) * scale_x;
  var y = (e.clientY - rect.y) * scale_y;

  if (x >= start_button.x && x <= start_button.x + start_button.w &&
      y >= start_button.y && y <= start_button.y + start_button.h)
  {
    start_button.current_color = start_button.hover_color;
  } else {
    start_button.current_color = start_button.color;
  }
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

function draw_death_screen() {
  var center_x = 0.5 * canvas_width;
  var center_y = 0.5 * canvas_height;
  var y_off = 200;
  ctx.font = '25px Helvetica';
  ctx.fillStyle = '#000000';
  ctx.fillText('you died...', center_x - 50, y_off);
  ctx.fillText('press escape to restart', center_x - 130, y_off + 50 + 3);
}
