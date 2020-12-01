function Player() {
  this.hp = 10;
  this.max_hp = 10;
  this.w = 48;
  this.h = 72; 
  this.x = 10;
  this.y = canvas_height - this.h; 
  this.vx = 0;
  this.vy = 0;
  this.walk_speed = .248;
  this.knockback_speed = 0.92;
  this.dir = 1; // 1 == right, -1 == left
  this.can_attack = true;
  this.attack_timer = 0;
  this.anim_timer = 0;
  this.anim_delay = 16*4;
  this.frame_offset = 0;
}

Player.prototype.update = function(dt) {
  if (this.hp <= 0) {
    this.draw_dead();
    return;
  }

  this.vx *= Math.abs(this.vx) > 0.001 ? 0.8 : 0;
  this.vy *= Math.abs(this.vy) > 0.001 ? 0.8 : 0;

  if (input.left && !input.right) {
    this.dir = -1;
    this.vx = -this.walk_speed * dt;
  } else if (input.right && !input.left) {
    this.dir = 1;
    this.vx = this.walk_speed * dt; 
  }

  this.x += this.vx;
  this.y += this.vy;

  if (this.x < 0) this.x = 0;
  if (this.x + this.w > canvas_width) this.x = canvas_width - this.w;

  // attack
  if (this.can_attack && input.attack) {
    this.can_attack = false;
    this.attack_timer = 500;

    var hitbox;
    if (this.dir == -1)
      hitbox = { x: this.x - this.w, y: this.y, w: this.w, h: this.h }
    else 
      hitbox = { x: this.x + this.w, y: this.y, w: this.w, h: this.h }

    if(collide(hitbox, monster)) {
      monster.hp -= 1;
      blood_psystems.push(new ParticleSystem(
        6,                    // red for blood
        monster.x + 0.5 * monster.w, 
        monster.y + 0.5 * monster.h, // position
        2,                    // blood particle system
        monster               // blood target
      ));
      monster.vx = this.dir * monster.knockback_speed * dt;
    }
  }

  if (this.attack_timer > 0) 
    this.attack_timer -= dt;
  else
    this.can_attack = true;


  // check chest collision
  if (key && key.state == 'held' && !chest.did_hit && collide(this, chest)) {
    chest.did_hit = true;
    do_fireworks = true;
    clear_info.fade = true;
  }

  // draw health
  if (this.hp < this.max_hp && monster.alive_last_frame) {
    ctx.fillStyle = '#990511';
    ctx.strokeStyle = '#990511';
    ctx.rect(this.x, this.y - 12, this.w, 7);
    ctx.stroke();
    ctx.fillRect(this.x, this.y - 12, lerp(0, this.w, this.hp/this.max_hp), 7)
  }

  // draw player
  this.anim_timer += dt;
  if (this.anim_timer > this.anim_delay) {
    this.frame_offset = this.frame_offset == 0 ? 1 : 0;
    this.anim_timer = 0;
  }

  if (this.dir == -1) { 
  // facing left
    if ((this.can_attack && input.attack) || !this.can_attack) {
      ctx.drawImage(img_nova, (8 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else if (input.left && !input.right) {
      ctx.drawImage(img_nova, (6 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img_nova, 5*this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    }

  } else { 
  // facing right
    if ((this.can_attack && input.attack) || !this.can_attack) {
      ctx.drawImage(img_nova, (3 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else if (input.right && !input.left) {
      ctx.drawImage(img_nova, (1 + this.frame_offset) * this.w, 0, this.w, this.h, 
                              this.x, this.y, this.w, this.h);
    } else {
      ctx.drawImage(img_nova, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

Player.prototype.draw_dead = function() {
  ctx.drawImage(img_nova, 10*this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
}
