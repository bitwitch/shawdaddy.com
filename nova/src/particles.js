function ParticleSystem(colorId, x, y, state=1, bloodTarget=null) {
  this.origin = { x: x, y: y };
  this.particles = [];
  this.maxParticles = 500;
  this.maxLife = 1000;
  this.explodeTime = 0;
  this.thrustTime = 0;
  this.bleedTime = 0;
  this.bloodTarget = bloodTarget;
  this.thrustSpeed = Math.random() * 0.15 + 0.05; // 0.05 - 0.2
  this.colors = {
    'ORANGE':    0,
    'BLUE':      1,
    'GREEN':     2,
    'LIGHTBLUE': 3,
    'PINK':      4,
    'GREY':      5,
    'RED':       6
  }
  this.colorId = colorId;
  this.states = {
    'EXPLOSION': 0,
    'THRUSTER': 1,
    'BLOOD': 2
  }
  this.state = state;
}

ParticleSystem.prototype.run = function(dt, ctx) {

  if (this.state == this.states.EXPLOSION) {
    this.explode(dt);
  } else if (this.state == this.states.THRUSTER) {
    this.thrust(dt);
  } else if (this.state == this.states.BLOOD) {
    this.bleed(dt);
  }

  // update particles
  var i;
  for (i = this.particles.length-1; i >= 0; i--) {
    var p = this.particles[i];
    // update vel
    p.vel.x += p.acc.x;
    p.vel.y += p.acc.y;
    // update pos
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    // update lifespan
    if (this.state == this.states.EXPLOSION) 
      p.lifespan -= 3;
    else if (this.state == this.states.THRUSTER) 
      p.lifespan -= 5;
    else if (this.state == this.states.BLOOD) 
      p.lifespan -= 9;

    if (p.lifespan < 0) {
      this.particles.splice(i, 1);
    } else {
      ctx.fillStyle = 'rgba('+p.color.r+','+p.color.g+
          ','+p.color.b+','+p.lifespan/255+')';
      ctx.fillRect(p.pos.x, p.pos.y, p.w, p.h);
    }
  }
}

ParticleSystem.prototype.explode = function(dt) {
  if (this.particles.length < this.maxParticles && this.explodeTime < this.maxLife) {
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
    this.particles.push(new Particle(
      this.states.EXPLOSION, this.colorId, this.origin.x, this.origin.y ));
  }
  this.explodeTime += dt;
}

ParticleSystem.prototype.thrust = function(dt) {
  this.origin.y -= this.thrustSpeed * dt;
  this.thrustTime += dt;

  if ((this.thrustTime > 1000 && Math.random() < 0.003) ||
       this.origin.y < 100)
  {
    this.state = this.states.EXPLOSION;
    return;
  }

  if (this.particles.length < this.maxParticles) {
    this.particles.push(new Particle(
      this.states.THRUSTER, this.colors.GREY, this.origin.x, this.origin.y )); 
  }
}

ParticleSystem.prototype.bleed = function(dt) {
  if (this.bloodTarget) {
    this.origin.x = this.bloodTarget.x + 0.5 * this.bloodTarget.w;
    this.origin.y = this.bloodTarget.y + 0.5 * this.bloodTarget.h;
  }
  this.bleedTime += dt;

  if (this.particles.length < this.maxParticles && this.bleedTime < 300) {
    this.particles.push(new Particle(
      this.states.BLOOD, this.colors.RED, this.origin.x, this.origin.y ));
  }
}

function Particle(type, colorId, x, y) {
  this.acc = { x: 0, y: 0 }; 
  this.pos = { x: x, y: y };
  this.lifespan = 255;
  var size = Math.random()*3;
  this.w = size; 
  this.h = size; 

  this.types = {
    'EXPLOSION': 0,
    'THRUSTER': 1,
    'BLOOD': 2
  }

  this.type = type;

  // set velocity
  if (this.type == this.types.THRUSTER) {
    this.vel = { x: Math.random() * 0.5 - 0.25, y: Math.random()*1.2 };
  } else {
    this.vel = { x: Math.random()*2 - 1, y: Math.random()*2 - 1 };
  }

  // blood particles are larger and move faster
  if (this.type == this.types.BLOOD) {
    this.w *= 2;
    this.h *= 2;
    this.vel.x *= 2;
    this.vel.y *= 1.5;
  }

  this.colors = {
    'ORANGE':    0,
    'BLUE':      1,
    'GREEN':     2,
    'LIGHTBLUE': 3,
    'PINK':      4,
    'GREY':      5,
    'RED':       6,
  }

  // set color
  switch(colorId) {
    case this.colors.GREY:
      var grey = Math.floor(Math.random() * 100 + 30);
      this.color = { r: grey, g: grey, b: grey };
      break;
    case this.colors.PINK:
      this.color = { r: 215,
                     g: rand_int(0, 85),         
                     b: rand_int(90, 210) }; 
      break;
    case this.colors.LIGHTBLUE:
      this.color = { r: rand_int(59, 89), 
                     g: rand_int(155, 255),
                     b: 230 };
      break;
    case this.colors.GREEN:
      this.color = { r: rand_int(0, 187),
                     g: 215, 
                     b: rand_int(55, 105)};
      break;
    case this.colors.BLUE:
      this.color = { r: rand_int(0, 100),
                     g: rand_int(0, 238),
                     b: 255 };
      break;
    case this.colors.RED:
      this.color = { r: rand_int(120, 200),
                     g: rand_int(0, 20),
                     b: rand_int(0, 20) };
      break;
    default /* ORANGE */:
      this.color = { r: 255, 
                     g: rand_int(0, 238), 
                     b: 0 };
      break;
  }
}

