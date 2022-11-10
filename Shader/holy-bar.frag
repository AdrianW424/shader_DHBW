#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    float x = st.x;
    float y = clamp(x, 0.2, 0.8);

    vec3 colorA = vec3(1.0, 0.5333, 0.0);
    vec3 colorB = vec3(0.0, 0.0, 0.0);
    float time_coefficient = abs(sin(u_time + x));
    
    vec3 color = vec3(1);
    float pct = distance(st,vec2(0.5)) + plot(st,y);

    float square_thickness = 0.2;
    vec2 la = step(vec2(0.5+(0.5*square_thickness)),vec2(st));       // left-area
    vec2 ra = step(vec2(0.5+(0.5*square_thickness)),vec2(1.0-st));   // right-area
    vec2 ua = step(vec2(0.4),vec2(1.0-st));   // upper-area
    vec2 ba = step(vec2(0.6),vec2(st));   // bottom-area
    vec3 frame = vec3(((la.x + ra.x) * ( ua.y )) + ba.y );
    color = (1.0-pct)*color+pct*mix(colorA, colorB, time_coefficient);
    gl_FragColor = vec4((color * frame) * st.y,1.0);
}