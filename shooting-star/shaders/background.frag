precision highp float;
precision highp int;

uniform float timestamp;

uniform float speed;
uniform float zoom;
uniform float alpha;
uniform vec3 color;

varying vec2 vUv;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
// #pragma glslify: pnoise3 = require(glsl-noise/periodic/3d)

// const vec3 baseColor = vec3(170., 133., 88.) / 255.;

void main(){
  float cTime = timestamp / 1000. * speed;
  vec3 cColor = color / 255.;

  vec2 noiseUv = vUv * zoom;
  noiseUv.x += cTime;
  float noise = snoise3(vec3(noiseUv, cTime));
  float noise2 = snoise3(vec3(vUv * zoom + 0.5 / zoom, cTime));
  // float noise = pnoise3(vec3(vUv * zoom, cTime), vec3(0.));

	// gl_FragColor = vec4(vec3(cColor * noise), alpha);
	gl_FragColor = vec4(cColor * vec3(noise / noise2) * alpha, 1.);
}
