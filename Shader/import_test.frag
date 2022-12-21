
#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable

#define PI 3.141592658979
#define TAU PI*2.

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Kamera-Position und -Orientierung
uniform vec3 u_camera;
uniform vec3 u_cameraDirection;
uniform vec3 u_cameraUp;

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

float shadow(vec3 r) {
vec3 p = r;
p.z += u_time;
p = abs(mod(p, 2.)-1.);
float d = length(max(abs(p)-vec3(0.3), 0.));
return d < 0.01? 1.: 0.;
}

void main( void ) {
    vec3 c = vec3(0.);
    vec2 p = (gl_FragCoord.xy-u_resolution/2.)/u_resolution.x;

    // Berechne Richtungsvektor für den Strahl, der vom aktuellen Pixel ausgeht
    vec3 rayDirection = normalize(u_cameraDirection + p.x * u_cameraUp + p.y * cross(u_cameraDirection, u_cameraUp));

    // Berechne Startpunkt für den Strahl
    vec3 rayOrigin = u_camera;

    vec3 r = rayOrigin + 0.001*rayDirection;
    vec3 l = vec3(0.3, 0.3, -1.);

    float d;

    for(int i=0; i < 64; i++) {
        d = dist(r);
        r += d * normalize(r);
        if(abs(d) < 0.01) {
            float ac = fract( (fract(r.x*5.)>0.7 ^^ fract(r.y*5.+r.z*0.3)>0.5? r.x: r.y)*3. -u_time) < 0.4? 1.-0.1*abs(r.y): 1.-abs(r.x);
            c += dot(normal(r), l);
    c *= shadow(r);
    break;
    }
    }
    c += abs(r) * 0.1;

    gl_FragColor = vec4(c, 1.);

}
/*
#define PI 3.141592658979
#define TAU PI*2.

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// Kamera-Position und -Orientierung
uniform vec3 cameraPosition;
uniform vec3 cameraDirection;
uniform vec3 cameraUp;

float dist(vec3 r) {
    vec3 p = r;
    p.z += time;
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

float shadow(vec3 r) {
    vec3 p = r;
    p.z += time;
    p = abs(mod(p, 2.)-1.);
    float d = length(max(abs(p)-vec3(0.3), 0.));
    return d < 0.01? 1.: 0.;
}

void main() {
    vec3 c = vec3(0.);
    vec2 p = (gl_FragCoord.xy-resolution/2.)/resolution.x;

    // Berechne Richtungsvektor für den Strahl, der vom aktuellen Pixel ausgeht
    vec3 rayDirection = normalize(cameraDirection + p.x * cameraUp + p.y * cross(cameraDirection, cameraUp));

    // Berechne Startpunkt für den Strahl
    vec3 rayOrigin = cameraPosition;

    vec3 r = rayOrigin + 0.001*rayDirection;
    vec3 l = vec3(0.3, 0.3, -1.);

    float d;

    for(int i=0; i < 64; i++) {
        d = dist(r);
        r += d * normalize(r);
        if(abs(d) < 0.01) {
            float ac = fract( (fract(r.x*5.)>0.7 ^^ fract(r.y*5.+r.z*0.3)>0.5? r.x: r.y)*3. -time) < 0.4? 1.-0.1*abs(r.y): 1.-abs(r.x);
            c += dot(normal(r), l);
            c *= shadow(r);
            break;
        }
    }
    c += abs(r) * 0.1;

    gl_FragColor = vec4(c, 1.);
}
*/