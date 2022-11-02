#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

/*
void main() {
    //gl_FragColor = vec4(0.2, 0.3, 0.1, 1.0); //rbga
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec2 mP = u_mouse.xy/u_resolution;
    gl_FragColor = vec4(mP.x+st.x,mP.y+st.y,abs(sin(1.0*u_time)),1.0);
    
}
*/

// 1 on edges, 0 in middle
/*
float hex(vec2 p) {
  p.x *= 0.57735*2.0;
	p.y += mod(floor(p.x), 2.0)*0.5;
	p = abs((mod(p, 1.0) - 0.5));
	return abs(max(p.x*1.5 + p.y, p.y*2.0) - 1.0);
}

void main(void) { 
	vec2 pos = gl_FragCoord.xy;
	vec2 p = pos/100.0; 
	float  r = (1.0 -0.7)*0.5;	
	gl_FragColor = vec4(smoothstep(0.0, r + 0.05 , hex(p)));
}
*/

/*
Links
https://www.youtube.com/watch?v=d9QkhRefiEA&ab_channel=RichardOliverBray
https://www.youtube.com/watch?v=zIzlsphGjkY&ab_channel=NamePointer
https://www.youtube.com/watch?v=VLZjd_Y1gJ8&ab_channel=JohnJackson

*/

/*
Ein Tutorial
float circleShape(float r, vec2 pos) {
	 float value = distance(pos, vec2(0.5));
	 return step(r,value);
	 // value < radius 0.0
	 // value > radius 1.0
	//return distance(pos, vec2(0.5));
}

void main(){
	vec2 pixelCoord = gl_FragCoord.xy / u_resolution;
	float circleWidth = 0.2;
	float circle = circleShape(circleWidth, pixelCoord);
	vec3 color = vec3(circle);
	//gl_FragColor = vec4(color, 1.0);
	float borderWidth = 0.005;
	if (circle == 0.0) {
		gl_FragColor = vec4(0.8, 0.2, 0.01, 1.0); 
	} else {
		if (circleShape(circleWidth, vec2((pixelCoord.x - borderWidth), pixelCoord.y)) == 0.0
		|| circleShape(circleWidth, vec2((pixelCoord.x + borderWidth), pixelCoord.y)) == 0.0
		|| circleShape(circleWidth, vec2(pixelCoord.x, (pixelCoord.y + borderWidth))) == 0.0
		|| circleShape(circleWidth, vec2(pixelCoord.x, (pixelCoord.y - borderWidth))) == 0.0) {
			gl_FragColor = vec4(0.7, 0.1, 0.5, 1.0);
		} else {
			gl_FragColor = vec4(vec3(0.1137, 0.102, 0.102), 1.0);
		}
	}
}
*/

/*
Nächstes Tutorial:
https://www.youtube.com/watch?v=9oYssHkOn0I&list=PL4neAtv21WOmIrTrkNO3xCyrxg4LKkrF7&index=7&ab_channel=LewisLepton

float circleShape(vec2 pos, float r){
	return step(r,length(pos - vec2(0.5)));
}

void main() {
    //gl_FragColor = vec4(0.2, 0.3, 0.1, 1.0); //rbga
    vec2 position = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

	float circle = circleShape(position, 0.2);

	color = vec3(circle);

    gl_FragColor = vec4(color,1.0);
    
}
*/

/*
Moving Llight
https://www.youtube.com/watch?v=1EmrgnpXj7A&list=PL4neAtv21WOmIrTrkNO3xCyrxg4LKkrF7&index=21&ab_channel=LewisLepton

void main(){
	vec2 coord = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

	//coord.x += sin(u_time) + cos(u_time * 2.1);
	//coord.y += cos(u_time) + sin(u_time * 1.6);

	float color = 0.0;

	color += 0.1 * (abs(sin(u_time)) + 0.1) / length(coord);

	gl_FragColor = vec4(vec3(color),1.0);
}
*/

/*
More Light Stuff

void main(){
	vec2 coord = gl_FragCoord.xy / u_resolution;
	vec3 color = vec3(0);
	vec2 translate = vec2(-0.5,-0.5);
	coord += translate;

	//coord.x += (cos(u_time)*0.1);
	//coord.y += (sin(u_time)*0.1);

	for(int i = 0; i < 40; i++) {
		float r = 0.3;
		float rad = radians(360.0 / 40.0) * float(i);

		color += 0.003 / length(coord + vec2(r * cos(rad), r * sin(rad)));

		//color.r += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.9 / 12.0)));
		//color.g += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.6 / 4.0)));
		//color.b += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.3 / 9.0)));
	}

	gl_FragColor = vec4(color,1.0);
}
*/

/*
Test Stuff
*/
void main(){
	vec2 coord = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

	//coord.x += sin(u_time) + cos(u_time * 2.1);
	//coord.y += cos(u_time) + sin(u_time * 1.6);
	coord.x += (cos(u_time)*0.5);
	coord.y += (sin(u_time)*0.5);

	float color = 0.0;

	//color += 0.1 * (abs(sin(u_time)) + 0.1) / length(coord);
	color += 0.1 * 0.1 / length(coord);


	gl_FragColor = vec4(vec3(color),1.0);
}

