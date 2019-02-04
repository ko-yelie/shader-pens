precision highp float;
precision highp int;

// uniform float uProgress;
uniform float alphaSpeed;
uniform float maxAlpha;
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
	vec2 p = gl_PointCoord.st * 2. - 1.;
	float len = length(p);

  float cRandom = random(vec2(vProgress * 0.001 * vRandom));
  cRandom = mix(0.3, 2., cRandom);

  float darkness = mix(0.1, 1., vPositionZ);

  float cBlur = blur * mix(1., 0.3, vPositionZ);
	float shape = smoothstep(1. - cBlur, 1. + cBlur, (1. - cBlur) / len);
  shape *= mix(0.5, 1., vRandom);

  float alphaProgress = vProgress * alphaSpeed * mix(2.5, 1., pow(vDiff, 0.6));
  alphaProgress *= mix(maxAlpha, 1., spreadEase(vSpreadLength) * diffEase(vDiff));
  float alpha = 1. - min(alphaProgress, 1.);
  alpha *= cRandom * vDiff;

	gl_FragColor = vec4(baseColor * darkness * cRandom, shape * alpha);
}
