import TEXTURE_SRC from '../image/tatsu.png'

function init (img) {
  initWebGL()

  const program = createProgram(require('./index.vert'), require('./index.frag'))
  if (!program) return

  const position = [
    -1, 1, 0,
    -1, -1, 0,
    1, 1, 0,
    1, -1, 0
  ]
  const positionCount = position.length / 3

  createAttribute({
    position: {
      stride: 3,
      value: position
    }
  }, program)

  setAttribute('position')

  createUniform({
    time: {
      type: '1f'
    },
    resolution: {
      type: '2fv'
    },
    texture: {
      type: '1i'
    },
    imageResolution: {
      type: '2fv'
    }
  }, program)

  createTexture(img)
  setUniform('texture', 0)
  setUniform('imageResolution', [img.naturalWidth, img.naturalHeight])

  clearColor(0, 0, 0, 1)

  initSize()

  start((time) => {
    setUniform('time', time / 1000)
  }, 'TRIANGLE_STRIP', positionCount)
}

loadImage(TEXTURE_SRC, init)

// --------------------
// library
// --------------------
let canvas, gl
const attributes = {}
const uniforms = {}

function initWebGL () {
  canvas = document.createElement('canvas')
  gl = canvas.getContext('webgl')
  document.body.appendChild(canvas)
}

function createShader (strings, type) {
  const shader = gl.createShader(gl[type])

  gl.shaderSource(shader, strings)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    return
  }

  return shader
}

function createProgram (vart, frag) {
  const program = gl.createProgram()
  gl.attachShader(program, createShader(vart, 'VERTEX_SHADER'))
  gl.attachShader(program, createShader(frag, 'FRAGMENT_SHADER'))
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)
  return program
}

function createAttribute (data, program) {
  Object.keys(data).forEach(key => {
    const { stride, value } = data[key]
    attributes[key] = {
      location: gl.getAttribLocation(program, key),
      stride,
      vbo: createVbo(value)
    }
  })
}

function createVbo (data) {
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return vbo
}

function setAttribute (name) {
  const { vbo, location, stride } = attributes[name]

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
}

function createUniform (data, program) {
  Object.keys(data).forEach(key => {
    const uniform = data[key]
    uniforms[key] = {
      location: gl.getUniformLocation(program, key),
      type: `uniform${uniform.type}`
    }
  })
}

function setUniform (name, value) {
  const uniform = uniforms[name]
  if (!uniform) return

  gl[uniform.type](uniform.location, value)
}

function bindTexture (texture) {
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

function createTexture (img) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
}

function clearColor (...args) {
  gl.clearColor(...args)
}

function loadImage (src, callback) {
  const img = new Image(src)
  img.addEventListener('load', () => {
    callback(img)
  })
  img.crossOrigin = 'anonymous'
  img.src = src
}

function setSize () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  gl.viewport(0, 0, canvas.width, canvas.height)

  setUniform('resolution', [canvas.width, canvas.height])
}

function initSize () {
  setSize()
  window.addEventListener('resize', () => {
    setSize()
  })
}

function start (draw, mode, count) {
  function render (time) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    draw(time)

    gl.drawArrays(gl[mode], 0, count)

    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
