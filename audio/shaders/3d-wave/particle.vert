attribute float scale;

uniform float cameraZ;

varying float vColor;
varying vec3 vPosition;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float cScale = mix(0.2, 1., scale);

  vColor = pow(position.z / cameraZ, 3.);
  vColor *= mix(0.3, 1.8, pow(cScale, 2.));
  vPosition = position;

  gl_PointSize = mix(0.3, 7., pow(cScale, 6.)) * ( 300.0 / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
