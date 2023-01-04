uniform vec2 u_resolution;

vec2 rnd(vec2 x) {
    vec2
    float y.x = fract(sin(x.x)*100000.0);
    return y;
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Ken Perlin's Improved Noise
  float a = rnd(i);
  float b = rnd(i + vec2(1.0, 0.0));
  float c = rnd(i + vec2(0.0, 1.0));
  float d = rnd(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}



void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;

  float n = noise(st);
  gl_FragColor = vec4(vec3(n), 1.0);
}