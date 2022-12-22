#ifdef GL_ES
precision highp float;
#endif

const float PI = 3.1415926535897932384626433832795;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

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

vec3 weirdForms(vec2 _st, float randomElement){
    _st = _st *2.-1.;
    vec2 parameters = gl_FragCoord.xy/u_resolution.xy;
    _st*=1.2;// + (randomElement/4.);
    
    _st = rotation(_st, sin(u_time+_st.y*1.2+_st.x)*1.);
        
    float angle = atan(_st.y, _st.x);
    float radius = length(_st*_st);
    float thin = 0.02+0.01*sin(u_time);
    return vec3(0.5+0.4*cos(angle*vec3(3.7,1.8,2.9))) * thin / abs (radius - 0.3+sin(20.0*_st.x*_st.y)*0.1);
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

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    float randomValue = (mod(gl_FragCoord.x, gl_FragCoord.y) / 100.0);
    st = movingTiles(st, 5.,0.1);

    //vec3 color = vec3( 1.0-circle(st, 0.5 ) );
    //vec3 color = vec3( 1.0-forms(st, 8 ) );
    vec3 color = vec3( 1.0 - forms(st, 8) + weirdForms(st, randomValue) );

    gl_FragColor = vec4(color,1.0);
    
}

