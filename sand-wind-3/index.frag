precision highp float;
uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;
uniform vec2 imageResolution;
varying vec2 vUv;
varying vec2 vPosition;

uniform bool onlyColor;
uniform float frame;
uniform float timeK;
uniform float radius;
uniform float startX;
uniform float endX;
uniform float smoothstepMin;
uniform float uvXK;
uniform float uvYK;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: random = require(glsl-random)
#pragma glslify: adjustRatio = require(../shaders/modules/ratio.glsl)

void main(){
  vec2 uv = adjustRatio(vUv, imageResolution, resolution) * 2. - 0.5;
  vec2 cUv = uv;

  float cTime = sin(time * timeK) * 0.5 + 0.5;
  cTime = frame;
  float rndVal = random(uv + cTime);
  // rndVal = snoise2(uv * 100000. + cTime);
  // rndVal = snoise2(vec2(uv.x) * 100000.);
  // rndVal = snoise2(vec2(uv.y) * 100000.);
  vec2 position = vPosition;
  position.x += mix(startX * radius, 0., cTime) + mix(0.5, 1., rndVal);
  float dist = -position.x + cTime * endX;
  dist = smoothstep(smoothstepMin, 1., dist);

  float whiteNoise = mix(0., 0.5, random(vec2(uv.x - cTime, uv.y)));
  whiteNoise = 0.;
  dist = pow(max(cTime - (uv.x + whiteNoise), 0.), 2.) * endX;

  cUv.x += dist * uvXK;
  // cUv.y += sin(snoise2(vec2(cUv.x) * 0.1) * sin(cTime)) * uvYK;

  vec4 color;
  if (cUv.x < 0. || cUv.x > 1. || cUv.y < 0. || cUv.y > 1.) {
    color = vec4(0.);
  } else {
    color = texture2D(texture, cUv);
  }
  color.a *= 1. - dist;

  gl_FragColor = onlyColor ? vec4(vec3(dist), 1.) : color;
}
