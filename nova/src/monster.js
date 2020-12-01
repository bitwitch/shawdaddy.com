function Monster() {
  this.hp = 10;
  this.max_hp = 10;
  this.w = 51;
  this.h = 78;
  this.x = canvas_width - 100;
  this.y = canvas_height - this.h; 
  this.vx = 0;
  this.vy = 0;
  this.walk_speed = .2;
  this.dir = -1;
  this.state = 'wait'
  this.attack_timer = 0;
  this.can_attack = true;
  this.attacking = false;
  this.anim_timer = 0;
  this.anim_delay = 16*8;
  this.frame_offset = 0;
  this.alive_last_frame = true;
}

Monster.prototype.update = function(dt) {
  this.vx = 0;
  this.vy = 0;

  if (this.hp <= 0) { 
    this.state = 'dead';
    if (this.alive_last_frame) {
      this.alive_last_frame = false;
      key = new Key(this.x, this.y, this.x + 0.5 * this.w - this.dir * 75, canvas_height - 32);
      key.active = true;
    }
  }

  switch(this.state) {
    case 'wait': this.wait(dt); break;
    case 'idle': this.idle(dt); break;
    case 'hunt': this.hunt(dt); break;
    case 'attack': this.attack(dt); break;
    case 'dead': break;
  }

  // calculate if can attack again
  if (this.attack_timer > 0) 
    this.attack_timer -= dt;
  else {
    this.attacking = false;
    this.can_attack = true;
  }

  if (this.state == 'dead') {
    ctx.drawImage(img_monster, 16 * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    return;
  }

  // draw health
  if (this.hp < this.max_hp) {
    ctx.fillStyle = '#990511';
    ctx.strokeStyle = '#990511';
    ctx.rect(this.x, this.y - 12, this.w, 7);
    ctx.stroke();
    ctx.fillRect(this.x, this.y - 12, lerp(0, this.w, this.hp/this.max_hp), 7)
  }

  // draw monster
  this.anim_timer += dt;
  if (this.anim_timer > this.anim_delay) {
    if (this.frame_offset++ > 2) {
      this.frame_offset = 0;
    }
    this.anim_timer = 0;
  }


  if (this.dir == -1) { 
  // facing left
    if (this.attacking) {
      ctx.drawImage(img_monster, (5 + this.frame_offset % 3) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else if (this.state == 'hunt') {
      ctx.drawImage(img_monster, (1 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img_monster, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    }

  } else { 
  // facing right
   if (this.attacking) {
      ctx.drawImage(img_monster, (13 + this.frame_offset % 3) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else if (this.state == 'hunt') {
      ctx.drawImage(img_monster, (9 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img_monster, 8 * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    }

  }
}

Monster.prototype.wait = function(dt) {
  if (player.x > 0.25 * canvas_width) {
    this.state = 'hunt'
  }
}

Monster.prototype.idle = function(dt) {
}

Monster.prototype.hunt = function(dt) {
  if (player.x + player.w + 25 < this.x) {
    this.vx = -this.walk_speed * dt;
    this.dir = -1;
  } else if (player.x - 25 > this.x + this.w) {
    this.vx = this.walk_speed * dt; 
    this.dir = 1;
  } else {
    this.can_attack = false;
    this.attack_timer = 400;
    this.state = 'attack'
  }

  this.x += this.vx;
  this.y += this.vy;
}

Monster.prototype.attack = function(dt) {
  if (this.can_attack) { 
    this.attacking = true;
    this.can_attack = false;
    this.attack_timer = 1000;

    var hitbox;
    if (this.dir == -1)
      hitbox = { x: this.x - 0.5 * this.w, y: this.y, w: 0.5 * this.w, h: this.h }
    else 
      hitbox = { x: this.x + this.w, y: this.y, w: 0.5 * this.w, h: this.h }

    if(collide(hitbox, player)) {
      player.hp -= 1;
    }
  }

  if (this.anim_timer == 0 && this.frame_offset == 3 && 
     (player.x + player.w + 25 < this.x || player.x - 25 > this.x + this.w))
  {
    this.state = 'hunt';
  }

}
