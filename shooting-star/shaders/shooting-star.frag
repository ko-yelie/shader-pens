precision highp float;
precision highp int;

// uniform float uProgress;
uniform float fadeSpeed;
uniform float shortRangeFadeSpeed;
uniform float minFlashingSpeed;
uniform float blur;

varying float vProgress;
varying float vRandom;
varying float vDiff;
varying float vSpreadLength;
varying float vPositionZ;

#pragma glslify: random = require(glsl-random)
#pragma glslify: diffEase = require(glsl-easings/quadratic-in)
#pragma glslify: spreadEase = require(glsl-easings/sine-out)

const vec3 baseColor = vec3(170., 133., 88.) / 255.;

void main(){
	vec2 p = gl_PointCoord * 2. - 1.;
	float len = length(p);

  float cRandom = random(vec2(vProgress * mix(minFlashingSpeed, 1., vRandom)));
  cRandom = mix(0.3, 2., cRandom);

  float cBlur = blur * mix(1., 0.3, vPositionZ);
	float shape = smoothstep(1. - cBlur, 1. + cBlur, (1. - cBlur) / len);
  shape *= mix(0.5, 1., vRandom);

  if (shape == 0.) discard;

  float darkness = mix(0.1, 1., vPositionZ);

  float alphaProgress = vProgress * fadeSpeed * mix(2.5, 1., pow(vDiff, 0.6));
  alphaProgress *= mix(shortRangeFadeSpeed, 1., spreadEase(vSpreadLength) * diffEase(vDiff));
  float alpha = 1. - min(alphaProgress, 1.);
  alpha *= cRandom * vDiff;

	gl_FragColor = vec4(baseColor * darkness * cRandom, shape * alpha);
}
