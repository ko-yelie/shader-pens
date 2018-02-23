attribute vec3 position;
uniform   mat4  mvpMatrix;
uniform   float pointSize;
uniform   sampler2D positionTexture;
const float size = 5.;
void main(){
    gl_Position = vec4(position, 1.0);
    gl_PointSize = pointSize * max(1. * 1.25, 0.75);
}
