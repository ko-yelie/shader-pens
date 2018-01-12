attribute vec3  position;  // 頂点座標
attribute vec4  color;     // 頂点カラー
attribute vec2  texCoord;  // 頂点のテクスチャ座標
uniform   mat4  mvpMatrix; // 座標変換行列
uniform   float time;      // 時間の経過 @@@
varying   vec4  vColor;    // フラグメントシェーダへ送る色
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標
void main(){
  float dist = length(position.xz + 2.5) * 3.0;
  float s = sin(dist - time * 3.0) * 0.2;
  // float c = cos(dist - time * 3.0) * 0.2;
  float zk = (position.x + 2.5) / 5.0 * 2.0;
  float z = s * zk;
  vec3 p = vec3(position.x, position.y, z);

  vColor = color;

  vTexCoord = texCoord;

  gl_Position = mvpMatrix * vec4(p, 1.0);
  gl_PointSize = 2.0 + (s + 0.2) * zk;
}
