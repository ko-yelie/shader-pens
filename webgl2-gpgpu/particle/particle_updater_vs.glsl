#version 300 es

// パーティクル発生の中心点
uniform vec2 origin;
// 前回からの経過時間
uniform float elapsedTimeDelta;

// パーティクルの現在位置
in vec2 particlePosition;
// パーティクルの速度
in vec2 particleVelocity;
// パーティクルの経過時間
in float particleAge;
// パーティクルの寿命
in float particleLife;

out vec2 vertexPosition;
out vec2 vertexVelocity;
out float vertexAge;
out float vertexLife;

void main() {
  if (particleAge > particleLife) {
    // 寿命を超えたら元の場所に戻す
    vertexPosition = origin;
    vertexVelocity = particleVelocity;
    vertexAge = 0.0;
    vertexLife = particleLife;
  } else {
    // 超えてなければ更新する
    vertexPosition = particlePosition + (particleVelocity * elapsedTimeDelta);
    vertexVelocity = particleVelocity;
    vertexAge = particleAge + elapsedTimeDelta;
    vertexLife = particleLife;
  }
}
