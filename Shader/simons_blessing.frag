/*
#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform float time;
uniform vec2  mouse;
uniform vec2  u_resolution;


void main(){

    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // ring
    float t = 0.02 / abs(0.5 - length(p));
    
    gl_FragColor = vec4(vec3(t), 1.0);
}
*/



#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

#define PI 3.141592658979
#define TAU PI*2.

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float dist(vec3 r) {
	vec3 p = r;
	p.z += u_time;
	p = abs(mod(p, 2.)-1.);
	float d = length(max(abs(p)-vec3(0.3), 0.));
	return d;
}

vec3 normal(vec3 r) {
	vec2 d = vec2(0.01, 0.);
	return normalize(vec3(
		dist(r+d.xyy)-dist(r-d.xyy),
		dist(r+d.yxy)-dist(r-d.yxy),
		dist(r+d.yyx)-dist(r-d.yyx)
		));
}

void main( void ) {

	vec3 c = vec3(0.);
	vec2 p = (gl_FragCoord.xy-u_resolution/2.)/u_resolution.x;
	vec3 r = 0.001*vec3(p * (1. + length(p) * u_mouse.x * 80.), 1.);
	vec3 l = vec3(0.3, 0.3, -1.);
	
	float d;
	
	for(int i=0; i < 64; i++) {
		d = dist(r);
		r += d * normalize(r);
		if(abs(d) < 0.01) {
			float ac = fract( (fract(r.x*5.)>0.7 ^^ fract(r.y*5.+r.z*0.3)>0.5? r.x: r.y)*3. -u_time) < 0.4? 1.-0.1*abs(r.y): 1.-abs(r.x);
			c += dot(normal(r), l);
			break;
		}
	}
	c += abs(r) * 0.1;
	
	gl_FragColor = vec4(c, 1.);

}



/*
#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_resolution;


void main( void ) {
	vec2 uv = (gl_FragCoord.xy - u_resolution * 0.7) / max(u_resolution.x, u_resolution.y) * 3.0;
	uv *= 1.0;
	
	float e = 0.0;
	for (float i=3.0;i<=15.0;i+=1.0) {
		e += 0.007/abs( (i/15.) +sin((u_time/2.0) + 0.15*i*(uv.x) *( cos(i/4.0 + (u_time / 2.0) + uv.x*2.2) ) ) + 2.5*uv.y);
	gl_FragColor = vec4( vec3(e/1.6, e/1.6, e/1.6), 1.0);	

	}
	
}
*/

/*
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
vec2 rot(vec2 p, float a)
{
    float sa = sin(a), ca = cos(a);
	return p * mat2(ca, -sa, sa, ca);
}   
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - u_resolution.xy/2.) / u_resolution.y;
	p*=2.2;
	
	p = rot(p, sin(u_time+p.y*1.2+p.x)*38.9);
	
  float angle = atan(p.y, p.x);
  float radius = length(p*p) * (1. + sin(p.x*6.0+angle+p.y*9.0 + u_time)*.1);
  float thin = 0.03 + 0.08*sin(p.y*10.0+u_time*1. + angle);
  vec3 color = vec3(0.5+0.4*cos(angle*vec3(3.7,1.8,2.9))) * thin / abs (radius - 0.3+sin(20.0*p.x*p.y)*0.1);
  gl_FragColor = vec4(color,1.);
}
*/

/*
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_value;

const float Pi = 200.
	;
const int   complexity      = 30;    // More points of color.
const float fluid_speed     = 12.0;  // Drives speed, higher number will make it slower.
const float color_intensity = 0.5;
void main()
{
    vec2 p=(2.0*gl_FragCoord.xy-u_resolution)/max(u_resolution.x, u_resolution.y);

    for (int i=1;i<complexity;i++)
    {
        vec2 newp=p + u_time*0.001;
        newp.x+=0.6/float(i)*sin(float(i)*p.y+u_time/fluid_speed+20.3*float(i)) + 0.5;// + mouse.y/mouse_factor+mouse_offset;
        newp.y+=0.6/float(i)*sin(float(i)*p.x+u_time/fluid_speed+0.3*float(i+10)) - 0.5;// - mouse.x/mouse_factor+mouse_offset;
        p=newp;
    }
    vec3 col=vec3(color_intensity*sin(5.0*p.x)+color_intensity, color_intensity*sin(3.0*p.y)+color_intensity, color_intensity*sin(p.x+p.y)+color_intensity);
    gl_FragColor=vec4(col, 1);
}
*/

/*
#ifdef GL_ES
precision mediump float;
#endif
 
#extension GL_OES_standard_derivatives : enable
 
#define PI 3.141592658979
#define TAU PI*2.
 
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
 
 float de(vec3 p){
    float s=3., e;
    for(int i=0;i<12;++i)
      p=mod(p-1.,2.)-1.,
      s*=e=1.7/dot(p,p),
      p*=e;
    return length(p.yz)/s;
  }
 
vec3 normal(vec3 r) {
	vec2 d = vec2(0.01, 0.);
	return normalize(vec3(
		de(r+d.xyy)-de(r-d.xyy),
		de(r+d.yxy)-de(r-d.yxy),
		de(r+d.yyx)-de(r-d.yyx)
		));
}
 
void main( void ) {
 
	vec3 c = vec3(0.);
	vec2 p = (gl_FragCoord.xy-u_resolution/2.)/u_resolution.x;
	vec3 r = normalize(vec3(p, 0.2));
	vec3 P = vec3((u_mouse.xy - .5) * 2., 0.);
	P.z += u_time * .8;
	vec3 l = vec3(0.3, 0.3, -.8);
	
	float d;
	
	for(int i=0; i < 80; i++) {
		d = de(P);
		P += d * normalize(r);
		if (abs(d) < 0.001) {
			c += dot(normal(P), l);
			c = normal(P) * .5 + .5;
			//c = vec3(d * 300.);
			break;
		}
	}
	//c += abs(r) * 1.;
	
	gl_FragColor = vec4(c, 1.);
 
}
*/

/*
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float u_time;
uniform vec2 u_mouse, u_resolution;

#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))		
#define A(u,w) 	k=length(p.xy); p.x=k*(mod(atan(p.y,p.x),2.*3.14/u)-3.14/u); p.y=k-w		
#define B(u) 	k=length(p.yz); p.y=k*((atan(p.z,p.y))-4./u); p.z=k	
float random(vec2 pos) {  return fract(sin(pos.x*1399.9898+pos.y*78.233) * 43758.5453123); }

void main( void ) {
	vec2 uv = (gl_FragCoord.xy - .5*u_resolution)/u_resolution.y; 
	vec3 rd = normalize(vec3(uv, 1)), q = vec3(0,60,-180), p; 
	gl_FragColor = vec4(0,0,-.2-rd.y,1);
	for (float i = 1.; i < 99.; i++) {
		float t=u_time+3016.;
		p=q;
		float k, m=length(p.xy)/4000./sin(t/20.);
		p.xz+=vec2(cos(t)/m,sin(t)/m)*sin(abs(p.z/8.))/length(p)*4.;
		p.yz *= rot(u_mouse.y*.1+4.9); 
		p.xy *= rot(-t/(1.+length(p)) +sqrt(length(p)));
		A(24.,25.+5.*sin(t/5.7));
		B((.3+length(p)/20.));
		float s=atan(p.y,p.x);
		float h=t/length(p)/2.;
		float d = abs(p.x)+abs(p.y)+(p.z)  -(1.07+.07*sin(h+s))*length(p); 
		if (d < 0.1 ) {  gl_FragColor = vec4((22.*random(p.xy)/i));  break;  }
		q += rd * d/(1.+length(p)/50.);
	}
}
*/
