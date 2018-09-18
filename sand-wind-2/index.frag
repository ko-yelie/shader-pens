precision highp float;
uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;
uniform vec2 imageResolution;
varying vec2 vUv;

uniform float timeK;
uniform float noiseUvX;
uniform float noiseUvY;
uniform float noiseTimeY;
uniform float smoothstepMin;
uniform float snoiseValK;
uniform float rndValK;
uniform float uvXK;
uniform float uvYK;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: random = require(glsl-random)
#pragma glslify: adjustRatio = require(../shaders/modules/ratio.glsl)

void main(){
  float cTime = time * timeK;
  vec2 uv = adjustRatio(vUv, imageResolution, resolution) * 2. - 0.5;

  vec2 noiseUv = vec2(uv.x * noiseUvX + cTime, uv.y * noiseUvY + cTime * noiseTimeY);
  float snoiseVal = smoothstep(smoothstepMin, 1., snoise2(noiseUv));
  float rndVal = random(uv + cTime);
  float dist = (snoiseVal * snoiseValK * rndVal * rndValK) / (snoiseValK * rndValK);
  //float dist = snoiseVal;
  uv.x += dist * uvXK;
  uv.y += sin(snoise2(vec2(uv.x) * 0.1) * sin(time)) * uvYK;
  vec4 color;
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) {
    color = vec4(0.);
  } else {
    color = texture2D(texture, uv);
  }
  color.a *= 1. - snoiseVal * 8.;

  gl_FragColor = color;
  //gl_FragColor = color * vec4(vec3(1.), 1. - pow(snoiseVal, 0.5));
  //gl_FragColor = vec4(vec3(dist), 1.);
  //gl_FragColor = vec4(vec3(snoiseVal), 1.);
}
