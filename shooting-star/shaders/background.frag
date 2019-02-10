precision highp float;
precision highp int;

uniform float timestamp;

uniform float speed;

varying vec2 vUv;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main(){
	gl_FragColor = vec4(vec3(snoise3(vec3(vUv, timestamp * speed)) * 0.2), 1.);
}
