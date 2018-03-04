'use strict';

// canvasを作ってDOMに追加する
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);

// WebGL2のコンテキストを取得する
const gl = canvas.getContext('webgl2');

// シェーダのソースを読み込む関数
async function fetchShaderSource(vertexShaderPath, fragmentShaderPath) {
    const fetchVs = fetch(vertexShaderPath).then((response) => response.text());
    const fetchFs = fetch(fragmentShaderPath).then((response) => response.text());

    return Promise.all([fetchVs, fetchFs]);
}

// メイン関数
(async function main() {
    // シェーダのソースを取得する
    const VSHADER_PATH = './vertex_shader.glsl';
    const FSHADER_PATH = './fragment_shader.glsl';
    const [vertexShaderSource, fragmentShaderSource] = await fetchShaderSource(VSHADER_PATH, FSHADER_PATH);

    // 取得したソースを使ってシェーダをコンパイルする
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const vShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if(!vShaderCompileStatus) {
        const info = gl.getShaderInfoLog(vertexShader);
        console.log(info);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const fShaderCompileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if(!fShaderCompileStatus) {
        const info = gl.getShaderInfoLog(fragmentShader);
        console.log(info);
    }

    // シェーダプログラムの作成
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    //
    // プログラムのリンク前にtransformFeedbackVaryingsを使って
    // どの変数を書き戻すかを配列で指定しておく。
    // 第三引数はINTERLEAVED_ATTRIBSかSEPARATE_ATTRIBSのどちらか。
    // 今回はひとつだけなのでSEPARATE_ATTRIBSにする。
    //
    gl.transformFeedbackVaryings(program, ['result'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(program);

    // リンクできたかどうかを確認
    const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!linkStatus) {
        const info = gl.getProgramInfoLog(program);
        console.log(info);
    }

    // プログラムを使用
    gl.useProgram(program);

    //
    // バッファにデータを転送する
    //
    const matABuffer = gl.createBuffer();
    const matBBuffer = gl.createBuffer();
    const matALocation = gl.getAttribLocation(program, 'matA');
    const matBLocation = gl.getAttribLocation(program, 'matB');

    // mat2なので2x2要素
    const matRowSize = 2;
    const mat2Size = 2 * 2;
    const matOffset = matRowSize * Float32Array.BYTES_PER_ELEMENT;

    // matA
    gl.bindBuffer(gl.ARRAY_BUFFER, matABuffer);
    gl.enableVertexAttribArray(matALocation + 0);
    gl.enableVertexAttribArray(matALocation + 1);
    gl.vertexAttribPointer(matALocation + 0, matRowSize, gl.FLOAT, false, mat2Size, matOffset * 0);
    gl.vertexAttribPointer(matALocation + 1, matRowSize, gl.FLOAT, false, mat2Size, matOffset * 1);

    const matA = new Float32Array([1.0, 2.0, 3.0, 4.0]);
    gl.bufferData(gl.ARRAY_BUFFER, matA, gl.STATIC_DRAW);

    // matB
    gl.bindBuffer(gl.ARRAY_BUFFER, matBBuffer);
    gl.enableVertexAttribArray(matBLocation + 0);
    gl.enableVertexAttribArray(matBLocation + 1);
    gl.vertexAttribPointer(matBLocation + 0, matRowSize, gl.FLOAT, false, mat2Size, matOffset * 0);
    gl.vertexAttribPointer(matBLocation + 1, matRowSize, gl.FLOAT, false, mat2Size, matOffset * 1);

    const matB = new Float32Array([5.0, 6.0, 7.0, 8.0]);
    gl.bufferData(gl.ARRAY_BUFFER, matB, gl.STATIC_DRAW);

    //
    // ここからGPGPUの処理を行う
    // 具体的にはTransformFeedbackを利用し
    // バッファに結果を書き出す
    //
    const tfBuffer = gl.createBuffer();
    const transformFeedback = gl.createTransformFeedback();

    // バッファをバインドして初期化する
    // 結果がvec4なのでsizeはFloat32Array.BYTES_PER_ELEMENT * 4になる
    // 用途は適当に（今回はDYNAMIC_COPYにしてある）
    const size = Float32Array.BYTES_PER_ELEMENT * 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, tfBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.DYNAMIC_COPY);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // バインド解除

    // 一時的にラスタライザを無効化しておく
    gl.enable(gl.RASTERIZER_DISCARD);

    // それぞれバインドする
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer);

    // 今回は1回だけ実行するので1つだけ点を描画する命令を発行する
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, 1);

    // フィードバック終わり
    gl.endTransformFeedback();

    // もし必要であればラスタライザを有効化しておく
    gl.disable(gl.RASTERIZER_DISCARD);

    // 結果を読み出す。mat2なので2x2要素のFloat32Array
    const result = new Float32Array(2 * 2);
    const offset = 0;
    gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, offset, result);

    // 結果を表示する
    console.log(result);
})();