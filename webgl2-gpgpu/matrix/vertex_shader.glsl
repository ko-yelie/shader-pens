#version 300 es

// 入力
in mat2 matA;
in mat2 matB;

// 出力（バッファに書き出す）
out mat2 result;

void main() {
  // 計算してバッファに書き出す
  result = matA + matB;
}
