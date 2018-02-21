attribute vec2  texCoord;
uniform   mat4  mvpMatrix;
uniform   float pointSize;
uniform   sampler2D positionTexture;
void main(){
    vec4 position = texture2D(positionTexture, texCoord);
    gl_Position = mvpMatrix * vec4(position.xyz, 1.0);
    gl_PointSize = pointSize * max(position.w * 1.25, 0.75);
}
