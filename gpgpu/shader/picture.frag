/* ----------------------------------------------------------------------------
 * velocity update shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D prevPictureTexture;
uniform sampler2D videoTexture;
uniform sampler2D prevVideoTexture;
uniform sampler2D prevVideoTexture2;
uniform sampler2D prevVideoTexture3;
uniform vec2      resolution;
const float threshold = 0.1;
const float fadeoutSpeed = 0.04;
const float attenuationRate = 1. - fadeoutSpeed;
void main(){
    vec2 coord = gl_FragCoord.st / resolution;
    vec4 prevPicture = texture2D(prevPictureTexture, coord);
    vec4 video = texture2D(videoTexture, coord);
    vec4 prevVideo = texture2D(prevVideoTexture, coord);
    vec4 prevVideo2 = texture2D(prevVideoTexture2, coord);
    vec4 prevVideo3 = texture2D(prevVideoTexture3, coord);
    float diff3 = abs(((prevVideo2.r + prevVideo2.g + prevVideo2.b) - (prevVideo3.r + prevVideo3.g + prevVideo3.b))) / 3.;
    float diff2 = abs(((prevVideo.r + prevVideo.g + prevVideo.b) - (prevVideo2.r + prevVideo2.g + prevVideo2.b))) / 3.;
    float diff = abs(((video.r + video.g + video.b) - (prevVideo.r + prevVideo.g + prevVideo.b))) / 3.;
    float isMove = max(step(threshold, diff), step(0.1, diff + diff2 + diff3));
    gl_FragColor = vec4(video.rgb, 1.) * isMove + vec4(prevPicture.rgb * attenuationRate * (1. - isMove), 1.);
}
