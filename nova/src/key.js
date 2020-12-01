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
