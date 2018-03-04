#version 300 es

// 入力
in vec4 vecA;
in vec4 vecB;

// 出力（バッファに書き出す）
out vec4 result;

void main() {
  // 計算してバッファに書き出す
  result = vecA + vecB;
}
