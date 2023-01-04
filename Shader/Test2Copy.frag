precision highp float;

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const int   complexity      = 30;    // More points of color.
float fluid_speed     = 3.0;  // Drives speed, higher number will make it slower.
float color_intensity = 0.5;

vec2 random2D(vec2 xy){
    xy = vec2( dot(xy,vec2(100.0,300.0)),
              dot(xy,vec2(270.0,180.0)) );
    return -1.0 + 2.0*fract(sin(xy)*45555.5454545);
}

float noise2D(vec2 xy) {
  vec2 xyInt = floor(xy);
  vec2 xyFrac = fract(xy);
  //vec2 u = xyFrac*xyFrac*(3.0-2.0*xyFrac);
  vec2 u = smoothstep(0.0,1.0,xyFrac);

      return mix( mix( dot( random2D(xyInt + vec2(0.0,0.0) ), xyFrac - vec2(0.0,0.0) ),
                     dot( random2D(xyInt + vec2(1.0,0.0) ), xyFrac - vec2(1.0,0.0) ), u.x),
                mix( dot( random2D(xyInt + vec2(0.0,1.0) ), xyFrac - vec2(0.0,1.0) ),
                     dot( random2D(xyInt + vec2(1.0,1.0) ), xyFrac - vec2(1.0,1.0) ), u.x), u.y);
}


float allRndShape(vec2 st, float radius) {
	st = vec2(0.5)-st;
    float urRadis = length(st)*2.0;
    float noiseRadius = radius;
    float a = atan(st.y,st.x); // WINKEL
    float m = abs(mod(a+u_time*2.,3.14*2.)-3.14)/0.1;
    
    m += noise2D(st+u_time*.1)*.01;
    noiseRadius += cos(a*60.)*noise2D(st+u_time*0.7)*.1;
    noiseRadius += (sin(a*10.)*.01*pow(m,0.5));
    return 1.-smoothstep(noiseRadius,noiseRadius+0.007,urRadis);
}

float shapeBorderWidth(vec2 st, float radius, float width) {
    return allRndShape(st,radius)-allRndShape(st,radius-width);
}

vec3 formContent(vec2 _st) {
    vec2 mouse_norm = vec2(u_mouse.x/u_resolution.x, 1.0 - u_mouse.y/u_resolution.y); // Maus gibt werte von 0 bis 1 über den Screen verteilt zurück
    float mouse_mult = 10.0;
    float mouse_offset = 0.0;
    vec2 st = vec2(gl_FragCoord.xy / u_resolution.xy);
    //float fluid_speed = fract(sin(0.1)*100000.0);
    //float fluid_speed = sin(u_time)+2.0;
    //float fluid_speed = (sin(VARIABLE*5.0))+1.8;
    //float color_intensity = ((sin(VARIABLE*5.0)+1.0)/6.0)+0.3;

    vec2 p=(2.0*gl_FragCoord.xy-u_resolution)/max(u_resolution.x, u_resolution.y);

    for (int i=1;i<complexity;i++)
    {
        vec2 newPoint = p + u_time*0.001;   
        
        newPoint.x+=0.6/float(i)*sin(float(i)*p.y+u_time/fluid_speed+17.0*float(i)) + 0.5 + mouse_norm.y/mouse_mult+mouse_offset;
        newPoint.y+=0.6/float(i)*sin(float(i)*p.x+u_time/fluid_speed+0.6*float(i+10)) - 0.5 - mouse_norm.x/mouse_mult+mouse_offset; 
        p=newPoint;
    }

    //vec3 color=vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity) * shapeBorderWidth(st,0.8,((sin(u_time*0.8)+1.0)/6.0)+0.06)+vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity) * shapeBorderWidth(st,0.4,((sin(u_time*0.8)+1.0)/6.0)+0.1);
    // vll noch die geschwindigkeit vom pulsieren rnd machen?
    vec3 baseColor = vec3(color_intensity*cos(5.0*p.x)+color_intensity, color_intensity*cos(3.0*p.y)+color_intensity, color_intensity*cos(p.x+p.y)+color_intensity); 
    vec3 color;
    float borderWidth = 0.02;
    float pulseSpeed = 0.5;
    for (float i=1.0; i<7.0; i++){
         color += baseColor * shapeBorderWidth(st,0.9 - i * 0.25,((sin(u_time*pulseSpeed)+1.0)/10.0)+borderWidth);
    }
    return color;
}

void main()
{    
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    gl_FragColor=vec4(formContent(st), 1);
}