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

// プログラムをリンクして返す関数
function createProgram(vsSource, fsSource, feedbackVariables = []) {
  // シェーダをコンパイルする
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  const vShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if(!vShaderCompileStatus) {
    const info = gl.getShaderInfoLog(vertexShader);
    console.log(info);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
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

  // 書き出す変数
  if(feedbackVariables.length !== 0) {
    gl.transformFeedbackVaryings(program, feedbackVariables, gl.INTERLEAVED_ATTRIBS);
  }

  gl.linkProgram(program);

  // リンクできたかどうかを確認
  const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
  if(!linkStatus) {
    const info = gl.getProgramInfoLog(program);
    console.log(info);
  }

  return program;
}

// Vertex Array Objectを作成する関数
function createVAO(program, buffer, attributes, stride, data = null, usage = gl.STATIC_DRAW) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  let offset = 0;
  for(const attr of attributes) {
    const attrLocation = gl.getAttribLocation(program, attr.name);
    gl.enableVertexAttribArray(attrLocation);
    gl.vertexAttribPointer(attrLocation, attr.size, attr.type, false, stride, offset);
    offset += attr.byteSize;
  }

  if(data !== null) {
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  }

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vao;
}

const POINT_RESOLUTION = 256;
const VIDEO_BUFFER_INDEX = 1;
const PICTURE_BUFFER_INDEX = 3;
const resolution = [POINT_RESOLUTION, POINT_RESOLUTION];

// メイン関数
async function main(video) {
  const PARTICLE_NUM = 1000; // パーティクルの数
  const MAX_SPEED = 0.001; // パーティクルの最大速度
  const MAX_LIFE = 1000.0; // パーティクルの最大寿命
  const originPoint = new Float32Array([0.0, 0.0]); // 原点

  // マウスポインタの場所をパーティクル発生の原点にする
  canvas.addEventListener('mousemove', (mEvent) => {
    originPoint[0] = -1.0 + (mEvent.clientX / canvas.width) * 2;
    originPoint[1] = 1.0 - (mEvent.clientY / canvas.height) * 2;
  });

  // シェーダのソースを取得する
  const UPDATER_VS_PATH = './particle_updater_vs.glsl';
  const UPDATER_FS_PATH = './particle_updater_fs.glsl';
  const [updaterVertexShaderSource, updaterFragmentShaderSource] = await fetchShaderSource(UPDATER_VS_PATH, UPDATER_FS_PATH);

  const RENDERER_VS_PATH = './particle_renderer_vs.glsl';
  const RENDERER_FS_PATH = './particle_renderer_fs.glsl';
  const [rendererVertexShaderSource, rendererFragmentShaderSource] = await fetchShaderSource(RENDERER_VS_PATH, RENDERER_FS_PATH);

  const SCENE_VS_PATH = './shader/scene.vert';
  const SCENE_FS_PATH = './shader/scene.frag';
  const [sceneVertexShaderSource, sceneFragmentShaderSource] = await fetchShaderSource(SCENE_VS_PATH, SCENE_FS_PATH);

  const RESET_VS_PATH = './shader/reset.vert';
  const RESET_FS_PATH = './shader/reset.frag';
  const [resetVertexShaderSource, resetFragmentShaderSource] = await fetchShaderSource(RESET_VS_PATH, RESET_FS_PATH);

  const VIDEO_VS_PATH = './shader/video.vert';
  const VIDEO_FS_PATH = './shader/video.frag';
  const [videoVertexShaderSource, videoFragmentShaderSource] = await fetchShaderSource(VIDEO_VS_PATH, VIDEO_FS_PATH);

  const PICTURE_VS_PATH = './shader/picture.vert';
  const PICTURE_FS_PATH = './shader/picture.frag';
  const [pictureVertexShaderSource, pictureFragmentShaderSource] = await fetchShaderSource(PICTURE_VS_PATH, PICTURE_FS_PATH);

  // 書き戻す変数
  const feedbackVariables = [
    'vertexPosition',
    'vertexVelocity',
    'vertexAge',
    'vertexLife'
  ];

  // Update用のプログラムとRender用のプログラムを作成する
  const updaterProgram = createProgram(updaterVertexShaderSource, updaterFragmentShaderSource, feedbackVariables);
  const rendererProgram = createProgram(rendererVertexShaderSource, rendererFragmentShaderSource);
  const sceneProgram = createProgram(sceneVertexShaderSource, sceneFragmentShaderSource);
  const resetProgram = createProgram(resetVertexShaderSource, resetFragmentShaderSource);
  const videoProgram = createProgram(videoVertexShaderSource, videoFragmentShaderSource);
  const pictureProgram = createProgram(pictureVertexShaderSource, pictureFragmentShaderSource);

  // バッファの初期化時に黒で初期化するようにする
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // パーティクルの初期データを用意する
  const particleInitialData = [];
  for(let i = 0; i < PARTICLE_NUM; i++) {
    // 初期xy座標
    particleInitialData.push(originPoint[0]);
    particleInitialData.push(originPoint[1]);

    // 速度（-MAX_SPEEDから+MAX_SPEEDまでの間）
    const vx = -MAX_SPEED + (Math.random() * (MAX_SPEED * 2));
    const vy = -MAX_SPEED + (Math.random() * (MAX_SPEED * 2));
    particleInitialData.push(vx);
    particleInitialData.push(vy);

    // 年齢
    particleInitialData.push(0.0);

    // 寿命
    const life = Math.random() * MAX_LIFE;
    particleInitialData.push(life);
  }

  const particleInitialDataF32 = new Float32Array(particleInitialData);

  // 各VAOを作成する
  // [input, output] * [Update, Render] の計4つ

  // 入力用のバッファと出力用のバッファ
  const inputBuffer = gl.createBuffer();
  const outputBuffer = gl.createBuffer();

  const updaterAttributes = [
    {
      name: 'particlePosition',
      size: 2,
      type: gl.FLOAT,
      byteSize: 2 * Float32Array.BYTES_PER_ELEMENT,
    },
    {
      name: 'particleVelocity',
      size: 2,
      type: gl.FLOAT,
      byteSize: 2 * Float32Array.BYTES_PER_ELEMENT,
    },
    {
      name: 'particleAge',
      size: 1,
      type: gl.FLOAT,
      byteSize: 1 * Float32Array.BYTES_PER_ELEMENT,
    },
    {
      name: 'particleLife',
      size: 1,
      type: gl.FLOAT,
      byteSize: 1 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  const rendererAttributes = [
    {
      name: 'particlePosition',
      size: 2,
      type: gl.FLOAT,
      byteSize: 2 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  const sceneAttributes = [
    {
      name: 'position',
      size: 3,
      type: gl.FLOAT,
      byteSize: 3 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  const resetAttributes = [
    {
      name: 'position',
      size: 3,
      type: gl.FLOAT,
      byteSize: 3 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  const videoAttributes = [
    {
      name: 'position',
      size: 3,
      type: gl.FLOAT,
      byteSize: 3 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  const pictureAttributes = [
    {
      name: 'position',
      size: 3,
      type: gl.FLOAT,
      byteSize: 3 * Float32Array.BYTES_PER_ELEMENT
    }
  ];

  gl.uniform2fv(gl.getUniformLocation(resetProgram, 'resolution'), resolution);
  gl.uniform1i(gl.getUniformLocation(resetProgram, 'videoTexture'), 0);

  const STRIDE = updaterAttributes.reduce((prev, current) => prev + current.byteSize, 0);

  // input - Update
  const inputBufferUpdateVAO = createVAO(updaterProgram, inputBuffer, updaterAttributes,
                       STRIDE, particleInitialDataF32, gl.DYNAMIC_COPY);

  // output - Update
  const outputBufferUpdateVAO = createVAO(updaterProgram, outputBuffer, updaterAttributes,
                      STRIDE, particleInitialDataF32, gl.DYNAMIC_COPY);

  // input - Render
  const inputBufferRenderVAO = createVAO(rendererProgram, inputBuffer, rendererAttributes, STRIDE);

  // output - Render
  const outputBufferRenderVAO = createVAO(rendererProgram, outputBuffer, rendererAttributes, STRIDE);

  // フィードバックを作成する
  const transformFeedback = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

  const buffers = [inputBuffer, outputBuffer];
  const updateVAOs = [inputBufferUpdateVAO, outputBufferUpdateVAO];
  const renderVAOs = [inputBufferRenderVAO, outputBufferRenderVAO];
  let inputIndex = 0;
  let outputIndex = 1;

  // ループを開始する
  let prevTimeMs = performance.now(); // 前回処理したときの時間（ミリ秒）
  function loop(timestampMs) {
    // 前回からの経過時間を計算する
    const elapsedTime = timestampMs - prevTimeMs;

    //
    // テクスチャの転送
    //
    const texture = gl.createTexture();     // テクスチャの作成
    gl.bindTexture(gl.TEXTURE_2D, texture); // テクスチャのバインド
    gl.texImage2D(gl.TEXTURE_2D, 0,
                  gl.RGBA, gl.RGBA,
                  gl.UNSIGNED_BYTE, video); // テクスチャデータの転送
    gl.generateMipmap(gl.TEXTURE_2D); // ミップマップの作成

    // カラーバッファをクリアする
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 計算用のプログラムを使用する
    gl.useProgram(updaterProgram);

    // uniform変数をセットする
    gl.uniform2fv(gl.getUniformLocation(updaterProgram, 'origin'), originPoint);
    gl.uniform1f(gl.getUniformLocation(updaterProgram, 'elapsedTimeDelta'), elapsedTime);

    // ラスタライザを無効化
    gl.enable(gl.RASTERIZER_DISCARD);

    // 計算してフィードバックする
    gl.bindVertexArray(updateVAOs[inputIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[outputIndex]);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, PARTICLE_NUM); // PARTICLE_NUM個の計算をする
    gl.endTransformFeedback();

    // バインド解除
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    // ラスタライザの再有効化
    gl.disable(gl.RASTERIZER_DISCARD);

    // プログラムを使用する
    gl.useProgram(videoProgram);
    // uniform変数をセットする
    gl.uniform2fv(gl.getUniformLocation(videoProgram, 'resolution'), resolution);
    gl.uniform1i(gl.getUniformLocation(videoProgram, 'videoTexture'), 0);
    // ラスタライザを無効化
    gl.enable(gl.RASTERIZER_DISCARD);
    // 計算してフィードバックする
    gl.bindVertexArray(updateVAOs[inputIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[outputIndex]);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, PARTICLE_NUM); // PARTICLE_NUM個の計算をする
    gl.endTransformFeedback();
    // バインド解除
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    // ラスタライザの再有効化
    gl.disable(gl.RASTERIZER_DISCARD);

    gl.uniform2fv(gl.getUniformLocation(pictureProgram, 'resolution'), resolution);
    gl.uniform1i(gl.getUniformLocation(pictureProgram, 'videoTexture'), VIDEO_BUFFER_INDEX + inputIndex);
    gl.uniform1i(gl.getUniformLocation(pictureProgram, 'prevVideoTexture'), VIDEO_BUFFER_INDEX + outputIndex);
    gl.uniform1i(gl.getUniformLocation(pictureProgram, 'prevPictureTexture'), PICTURE_BUFFER_INDEX + outputIndex);

    // 描画用のプログラムを使用する
    gl.useProgram(rendererProgram);
    gl.bindVertexArray(renderVAOs[outputIndex]);
    gl.drawArrays(gl.POINTS, 0, PARTICLE_NUM);

    gl.uniform2fv(gl.getUniformLocation(sceneProgram, 'resolution'), resolution);
    gl.uniform1i(gl.getUniformLocation(sceneProgram, 'pictureTexture'), PICTURE_BUFFER_INDEX + inputIndex);

    // swap
    [inputIndex, outputIndex] = [outputIndex, inputIndex];

    // 繰り返す
    prevTimeMs = timestampMs;
    requestAnimationFrame((ts) => loop(ts));
  }

  // ループ開始
  requestAnimationFrame((ts) => loop(ts));
}

function initWebcam(){
  var video = document.createElement('video');
  video.width = POINT_RESOLUTION;
  video.height = POINT_RESOLUTION;
  video.loop = true;
  //Webcam video
  window.URL = window.URL || window.webkitURL;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  //get webcam
  navigator.getUserMedia({
    video: true
  }, function(stream) {
    //on webcam enabled
    video.src = window.URL.createObjectURL(stream);

    const canplayHandler = function(){
      // 複数回呼ばれないようにイベントを削除
      video.removeEventListener('canplay', canplayHandler, true);
      // video 再生開始をコール
      video.play();

      main(video);
    };
    video.addEventListener('canplay', canplayHandler, true);
  }, function(error) {
    prompt.innerHTML = 'Unable to capture WebCam. Please reload the page.';
  });
}
initWebcam();
