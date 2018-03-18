/* ----------------------------------------------------------------------------
 * reset shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform vec2  resolution;
uniform sampler2D videoTexture;
const   float PI  = 3.1415926;
const   float PI2 = PI * 2.0;
void main(){
    vec2 p = gl_FragCoord.st / resolution * 2. - 1.;
    // float s =  sin(p.y * PI);
    // float x =  cos(p.x * PI2) * s;
    // float y = -cos(p.y * PI);
    // float z =  sin(p.x * PI2) * s;
    // gl_FragColor = vec4(normalize(vec3(x, y, z)), 0.0);
    gl_FragColor = vec4(p * 3., 0., 1.);
}
