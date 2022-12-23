#ifdef GL_ES
precision highp float;
#endif

const float PI = 3.1415926535897932384626433832795;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
const float Pi = 200.;
const int   complexity      = 30;    // More points of color.
const float fluid_speed     = 3.0;  // Drives speed, higher number will make it slower.
const float color_intensity = 0.5;
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec3 background() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy*3.0;
    // Remap the space to -1. to 1.
    st -= 1.5;
    st = st * (sin(u_time*0.1)*1.6+2.9);
    vec3 color = vec3(0.0);
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*u_time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

    float f = fbm(st+r);

    color = mix(vec3(1.0, 1.0, 1.0),
                vec3(0.0627, 0.098, 0.5725),
                clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
                vec3(1.0, 1.0, 1.0),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                vec3(0.6471, 0.9137, 0.9059),
                clamp(length(r.x),0.0,1.0));
    return 1. - vec3((f*f*f+.6*f*f+.5*f)*color);
}
vec2 movingTiles(vec2 _st, float _zoom, float _speed){
    _st *= _zoom;
    float time = u_time*_speed;
    if( fract(time)>0.5 ){
        if (fract( _st.y * 0.5) > 0.5){
            _st.x += fract(time)*2.0;
        } else {
            _st.x -= fract(time)*2.0;
        }
    } else {
        if (fract( _st.x * 0.5) > 0.5){
            _st.y += fract(time)*2.0;
        } else {
            _st.y -= fract(time)*2.0;
        }
    }
    return fract(_st);
}

vec2 rotation(vec2 p, float a)
{
    float sa = sin(a), ca = cos(a);
    return p * mat2(ca+1., -sa, sa, ca);
}

vec3 boxFilling(vec2 _st, float randomElement){
    _st = _st *2.-1.;
    for (int i=1;i<complexity;i++)
    {
        vec2 new_st=_st + u_time*0.01+randomElement;
        new_st.x+=0.6/float(i)*sin(float(i)*_st.y+u_time/fluid_speed+20.3*float(i)) + 0.5;// + mouse.y/mouse_factor+mouse_offset;
        new_st.y+=0.6/float(i)*sin(float(i)*_st.x+u_time/fluid_speed+0.3*float(i+10)) - 0.5;// - mouse.x/mouse_factor+mouse_offset;
        _st=new_st;
    }
    return vec3(color_intensity*sin(5.0*_st.x)+color_intensity, color_intensity*sin(3.0*_st.y)+color_intensity, color_intensity*sin(_st.x+_st.y)+color_intensity);
}

vec3 forms(vec2 _st, int sides) {
    // Remap the space to -1. to 1.
    _st = _st *2.-1.;
    // Angle and radius from the current pixel
    float a = atan(_st.x,_st.y)+PI;
    float r = (2.*PI)/float(sides);

    // Shaping function that modulate the distance
    float d = cos(floor(.5+a/r)*r-a)*length(_st);

    return vec3(1.0-smoothstep(1.0-.2,1.0-.22+.45*0.2,d));
}

float circle(vec2 _st, float _radius){
    vec2 pos = vec2(0.5)-_st;
    return smoothstep(1.0-_radius,1.0-_radius+_radius*0.2,1.-dot(pos,pos)*3.14);
}
float rnd(float x) {
  float y = fract(sin(x)*100000.0);
  return y;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 test = st;
    st.x *= u_resolution.x/u_resolution.y;
    float randomValue = (gl_FragCoord.x*gl_FragCoord.y)/(u_resolution.x*u_resolution.y);
    st = movingTiles(st, 5.,.1);

    //vec3 color = vec3( 1.0-circle(st, 0.5 ) );
    //vec3 color = vec3( 1.0-forms(st, 8 ) );
    //vec3 color = vec3( 0.0+boxFilling(test, randomValue) );
    vec3 testFarbe = boxFilling(test, randomValue);
    vec3 color = vec3( (1.-background()) - ((forms(st, 9)-background()) - boxFilling(st, randomValue)) * (0. + forms(st, 9)));//+boxFilling(st, randomValue));// + boxFilling(st, 5.));
    //vec3 color = vec3( (1.-background()) - ((forms(st, 6)-background()) - boxFilling(st, randomValue)) * (0. + forms(st, 6)));//+boxFilling(st, randomValue));// + boxFilling(st, 5.));

    gl_FragColor = vec4(color,1.0);
    
}

