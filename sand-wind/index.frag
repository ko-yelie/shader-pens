precision highp float;
uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;
uniform vec2 imageResolution;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: random = require(glsl-random)
#pragma glslify: adjustRatio = require(../shaders/modules/ratio.glsl)

void main(){
  float cTime = time * 0.2;
  vec2 uv = adjustRatio(vUv, imageResolution, resolution) * 2. - 0.5;

  vec2 noiseUv = vec2(uv.x * 0.5 + cTime, uv.y * 3. + cTime * 0.1);
  float snoiseVal = smoothstep(0.2, 1., snoise2(noiseUv));
  float rndVal = random(uv + cTime);
  float dist = (snoiseVal * 3. * rndVal * 2.) / (2. * 3.);
  //float dist = snoiseVal;
  uv.x += dist * 1.;
  uv.y += sin(snoise2(vec2(uv.x) * 1.) * sin(time)) * 0.01;
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
