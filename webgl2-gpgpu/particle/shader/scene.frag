/* ----------------------------------------------------------------------------
 * scene shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D pictureTexture;
uniform vec2      resolution;
void main(){
  vec2 coord = gl_FragCoord.st / resolution;
  coord.y = 1. - coord.y;
  gl_FragColor = texture2D(pictureTexture, coord);
}
