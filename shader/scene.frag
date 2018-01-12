precision highp float;          // 頂点シェーダと uniform を共有するために highp にする @@@
uniform vec4      globalColor;  // グローバルカラー
uniform sampler2D textureUnit0; // テクスチャユニット
uniform float     time;         // 時間の経過 @@@
varying vec4      vColor;       // 頂点シェーダから送られてきた色
varying vec2      vTexCoord;    // 頂点シェーダから送られてきたテクスチャ座標
void main(){
    // テクスチャから色を読み出し利用する
    vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);

    // 二値化したフラグを用いて出力する色を決める @@@
    vec4 dest = samplerColor0;

    gl_FragColor = vColor * dest * globalColor;
}
