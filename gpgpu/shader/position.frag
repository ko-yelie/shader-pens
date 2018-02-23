/* ----------------------------------------------------------------------------
 * position update shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D videoTexture;
uniform vec2      resolution;
void main(){
    vec2 coord = gl_FragCoord.st / resolution;
    vec4 video = texture2D(videoTexture, coord);
    gl_FragColor = video;
}
