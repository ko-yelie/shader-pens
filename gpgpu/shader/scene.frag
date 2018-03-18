/* ----------------------------------------------------------------------------
 * scene shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D pictureTexture;
uniform sampler2D positionTexture;
uniform vec2      resolution;
void main(){
  vec2 coord = gl_FragCoord.st / resolution;
  vec4 picture = texture2D(pictureTexture, coord);
  vec4 position = texture2D(positionTexture, coord);
  gl_FragColor = vec4(picture + position);
}
