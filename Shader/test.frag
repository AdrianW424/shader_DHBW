#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	vec2 mP = u_mouse.xy/u_resolution;
	gl_FragColor = vec4(mP.x+st.x,mP.y+st.y,abs(sin(1.0*u_time)),1.0);
}