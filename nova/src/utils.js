
function collide(a, b) {
  if (
    // top-left
    (a.x >= b.x && a.x <= b.x + b.w &&
     a.y >= b.y && a.y <= b.y + b.h) ||
    // top-right
    (a.x + a.w >= b.x && a.x + a.w <= b.x + b.w &&
     a.y >= b.y && a.y <= b.y + b.h) ||
    // bottom-left
    (a.x >= b.x && a.x <= b.x + b.w &&
     a.y + a.h >= b.y && a.y + a.h <= b.y + b.h) ||
    // bottom-right
    (a.x + a.w >= b.x && a.x + a.w <= b.x + b.w &&
     a.y + a.h >= b.y && a.y + a.h <= b.y + b.h))
  {
    return true;
  }

  return false;
}

// color: { r: 0-255, g: 0-255, b: 0-255 }
function lerp_color(color_a, color_b, amt) {
  return {
    r: Math.floor(lerp(color_a.r, color_b.r, amt)),
    g: Math.floor(lerp(color_a.g, color_b.g, amt)),
    b: Math.floor(lerp(color_a.b, color_b.b, amt))
  }
}

function lerp(a, b, amt) {
  var result = (1-amt) * a + amt * b;
  if (result < a) result = a;
  if (result > b) result = b;
  return result;
}


// min inclusive, max exclusive
function rand_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


