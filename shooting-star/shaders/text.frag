precision highp float;
precision highp int;

uniform sampler2D map;
uniform float uProgress;
uniform float uStartX;
uniform float uRatio;
uniform float alpha;

varying vec2 vUv;

void main(){
	vec4 textureColor = texture2D(map, vUv);
	float angle = uRatio / 3.;
	float isShow = step(1., 1. - vUv.x + (uProgress / uStartX * 0.5 + 0.5) - abs(vUv.y - 0.5) / angle);
	gl_FragColor = vec4(textureColor.rgb, textureColor.a * alpha * isShow);
	// gl_FragColor = vec4(isShow);
}
