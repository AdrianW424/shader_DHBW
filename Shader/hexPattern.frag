#ifdef GL_ES
precision highp float;
#endif

#define NUM_OCTAVES 5

const float PI = 3.1415926535897932384626433832795;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const int   complexity      = 30;    // More points of color.
float fluid_speed     = 3.0;  // Drives speed, higher number will make it slower.
float color_intensity = 0.5;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

vec2 random2D(vec2 xy){
    xy = vec2(  dot(xy,vec2(100.0,300.0)),
                dot(xy,vec2(270.0,180.0)) );
    return -1.0 + 2.0*fract(sin(xy)*45555.5454545);
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

float noise2D(vec2 xy) {
  vec2 xyInt = floor(xy);
  vec2 xyFrac = fract(xy);
  //vec2 u = xyFrac*xyFrac*(3.0-2.0*xyFrac);
  vec2 u = smoothstep(0.0,1.0,xyFrac);

      return mix( mix(  dot( random2D(xyInt + vec2(0.0,0.0) ), xyFrac - vec2(0.0,0.0) ),
                        dot( random2D(xyInt + vec2(1.0,0.0) ), xyFrac - vec2(1.0,0.0) ), u.x),
                mix(dot( random2D(xyInt + vec2(0.0,1.0) ), xyFrac - vec2(0.0,1.0) ),
                    dot( random2D(xyInt + vec2(1.0,1.0) ), xyFrac - vec2(1.0,1.0) ), u.x), u.y);
}

float allRndShape(vec2 st, float radius, float randomValue) {
	st = vec2(0.5)-st;
    float urRadis = length(st)*2.0;
    float noiseRadius = radius;
    float a = atan(st.y,st.x); // WINKEL
    
    noiseRadius += cos(a*60.)*noise2D(st+u_time*0.7)*.1;
    noiseRadius += (sin(a*10.)*.1 * sin(u_time+randomValue));
    return 1.-smoothstep(noiseRadius,noiseRadius+0.007,urRadis);
}

float shapeBorderWidth(vec2 st, float radius, float width, float randomValue) {
    return allRndShape(st,radius, randomValue)-allRndShape(st,radius-width, randomValue);
}

vec3 formContent(vec2 _st, float randomElement) {
    vec2 mouse_norm = vec2(u_mouse.x/u_resolution.x, 1.0 - u_mouse.y/u_resolution.y); // Maus gibt werte von 0 bis 1 über den Screen verteilt zurück
    float mouse_mult = 10.0;
    float mouse_offset = 0.0;
    //float fluid_speed = fract(sin(0.1)*100000.0);
    //float fluid_speed = sin(u_time)+2.0;
    float fluid_speed = (sin(randomElement*5.0))+1.8;
    //color_intensity += sin(randomElement*5.0)/10.+0.5;//((sin(randomElement*5.0)+1.0)/8.0)+0.3;

    vec2 p=(2.0*gl_FragCoord.xy-u_resolution)/max(u_resolution.x, u_resolution.y);
    p=_st;
    for (int i=1;i<complexity;i++)
    {
        vec2 newPoint = p + 2.*0.001+(randomElement*0.25);   
        
        newPoint.x+=0.6/float(i)*sin(float(i)*p.y+(0.5*cos(u_time)+0.5)/fluid_speed+17.0*float(i)) + 0.5 + mouse_norm.y/mouse_mult+mouse_offset;
        newPoint.y+=0.6/float(i)*sin(float(i)*p.x+(0.5*sin(u_time)+0.5)/fluid_speed+0.6*float(i+10)) - 0.5 - mouse_norm.x/mouse_mult+mouse_offset; 
        p=newPoint;
    }

    //vec3 color=vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity) * shapeBorderWidth(st,0.8,((sin(u_time*0.8)+1.0)/6.0)+0.06)+vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity) * shapeBorderWidth(st,0.4,((sin(u_time*0.8)+1.0)/6.0)+0.1);
    // vll noch die geschwindigkeit vom pulsieren rnd machen?
    vec3 baseColor = vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity); 
    vec3 color;
    float borderWidth = 0.02;
    float pulseSpeed = 0.5;
    for (float i=1.0; i<7.0; i++){
         color += baseColor * shapeBorderWidth(_st,0.9 - i * 0.25,((sin(u_time*pulseSpeed)+1.0)/10.0)+borderWidth, randomElement);
    }
    return color;
}



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
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 test = st;
    float randomValue = (st.x/2.)-(0.5*sin((st.x)*(3.)+0.5) + st.y)/2.0;//(gl_FragCoord.x+gl_FragCoord.y)/(u_resolution.x+u_resolution.y);
    st.x *= u_resolution.x/u_resolution.y;
    st = movingTiles(st, 4.,.1);

    //vec3 color = vec3( 1.0-circle(st, 0.5 ) );
    //vec3 color = vec3( 1.0-forms(st, 8 ) );
    //vec3 color = vec3( 0.0+boxFilling(test, randomValue) );
    vec3 testFarbe = boxFilling(test, randomValue);
    vec3 color = vec3( (1.-background()) - ((forms(st, 6)-background()) - formContent(st, randomValue)) * (0. + forms(st, 6)));//+boxFilling(st, randomValue));// + boxFilling(st, 5.));
    //vec3 color = vec3( (1.-background()) - ((forms(st, 6)-background()) - boxFilling(st, randomValue)) * (0. + forms(st, 6)));//+boxFilling(st, randomValue));// + boxFilling(st, 5.));

    gl_FragColor = vec4(color,1.0);
    
}

