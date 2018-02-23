/* ----------------------------------------------------------------------------
 * reset shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;
uniform sampler2D videoTexture;
void main(){
  vec2 p = gl_FragCoord.st / resolution;
  gl_FragColor = texture2D(videoTexture, p);
}
