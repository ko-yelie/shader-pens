/* ----------------------------------------------------------------------------
 * reset shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;
const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;
void main(){
    vec2 p = gl_FragCoord.st / resolution;
    float s =  sin(p.y * PI) * 20.;
    float x =  cos(p.x * PI2) * s;
    float y = -cos(p.y * PI);
    float z =  sin(p.x * PI2) * s;
    gl_FragColor = vec4(normalize(vec3(x, y, z)), 0.0);
}
