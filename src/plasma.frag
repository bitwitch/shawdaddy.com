//void mainImage( out vec4 fragColor, in vec2 fragCoord )
//{ 
//    // Normalized pixel coordinates (from 0 to 1)    
//    vec2 uv = fragCoord/iResolution.xy;
//        
//    vec2 center = iResolution.xy / 2.0;
//    vec2 circle_offset = vec2(center.x * sin(0.17 * iTime), center.y  * cos(0.245 * iTime));
//      
//    float d = length(fragCoord + circle_offset - center);
//    
// 	float plasma0 = sin(0.015 * d);
//    
//    float off1 = 69.0 * sin(0.007 * iTime);
// 	float plasma1 = sin(0.0211 * fragCoord.x - off1);
//    
//    float off2 = 52.3 * cos(0.023 * iTime);
//    float plasma2 = cos(0.019 * (fragCoord.y + fragCoord.x) + off2);
//    
//    float off3 = 75.2 * cos(0.009 * iTime);
//    float plasma3 = sin(0.02 * fragCoord.y - off3);
//    
//    float off4 = 48.1 * sin(0.007 * iTime);
//    float plasma4 = cos(0.018 * fragCoord.y - off4);
//
//
//    float value = plasma0 + plasma1 + plasma2 + plasma3 + plasma4;
//  
//   
//    // Output to screen
//    fragColor = vec4(0.0,value,0.5*value,1.0);
//}

// Author: Patricio Gonzalez Vivo
#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.1415926535
#define HALF_PI 1.57079632679
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;
uniform sampler2D u_logo; // data/logo.jpg
uniform vec2 u_logoResolution;
vec2 scale(vec2 st, float s) {
    return (st-.5)*s+.5;
}
vec2 ratio(in vec2 st, in vec2 s) {
    return mix( vec2((st.x*s.x/s.y)-(s.x*.5-s.y*.5)/s.y,st.y),
                vec2(st.x,st.y*(s.y/s.x)-(s.y*.5-s.x*.5)/s.x),
                step(s.x,s.y));
}
float circleSDF(vec2 st) {
    return length(st - 0.5) * 2.0;
}
vec2 sphereCoords(vec2 _st, float _scale){
    float maxFactor = sin(1.570796327);
    vec2 uv = vec2(0.0);
    vec2 xy = 2.0 * _st.xy - 1.0;
    float d = length(xy);
    if (d < (2.0-maxFactor)){
        d = length(xy * maxFactor);
        float z = sqrt(1.0 - d * d);
        float r = atan(d, z) / 3.1415926535 * _scale;
        float phi = atan(xy.y, xy.x);
        uv.x = r * cos(phi) + 0.5;
        uv.y = r * sin(phi) + 0.5;
    } else {
        uv = _st.xy;
    }
    return uv;
}
vec4 sphereTexture(in sampler2D _tex, in vec2 _uv, float _time) {
    vec2 st = sphereCoords(_uv, 1.0);
    float aspect = u_tex0Resolution.y/u_tex0Resolution.x;
    st.x = fract(st.x * aspect + _time);
    return texture2D(_tex, st);
}
vec3 sphereNormals(in vec2 uv) {
    uv = fract(uv)*2.0-1.0;
    vec3 ret;
    ret.xy = sqrt(uv * uv) * sign(uv);
    ret.z = sqrt(abs(1.0 - dot(ret.xy,ret.xy)));
    ret = ret * 0.5 + 0.5;
    return mix(vec3(0.0), ret, smoothstep(1.0,0.98,dot(uv,uv)) );
}
void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st = scale(st, 2.0);
    st = ratio(st, u_resolution);
    vec3 color = vec3(0.0);
    color = sphereTexture(u_tex0, st, u_time * 0.01).rgb;
    // Calculate sun direction
    float speedSun = 0.25;
    vec3 sunPos = normalize(vec3(cos(u_time * speedSun - HALF_PI), 0.0, sin(speedSun * u_time - HALF_PI)));
    vec3 surface = normalize(sphereNormals(st)*2.0-1.0);

    // Add Shadows
    color *= clamp(dot(sunPos, surface), 0.0, 1.0);
    // Blend black the edge of the sphere
    float radius = 1.0 - circleSDF(st);
    color *= smoothstep(0.001, 0.02, radius);
    st = scale(st, 2.);
    color += texture2D(u_logo, st).rgb * step(.0001,st.y) * step(st.y,.999);
    gl_FragColor = vec4(color, 1.0);
}
