/* ----------------------------------------------------------------------------
 * scene shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec4 globalColor;
uniform sampler2D prevTexture;
uniform sampler2D currentTexture;
uniform vec2      resolution;
const float minAlpha = 0.05;
void main(){
  vec2 coord = gl_FragCoord.st / resolution;
  coord.y = 1. - coord.y;
  vec4 prev = texture2D(prevTexture, coord);
  vec4 current = texture2D(currentTexture, coord);
  float diff = ((current.r + current.g + current.b) - (prev.r + prev.g + prev.b)) / 3.;
  float isMove = step(0.08, diff);
  gl_FragColor = vec4(current.rgb + (1. - current.rgb) * isMove * 0.3, isMove);
}
