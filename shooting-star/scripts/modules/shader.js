let canvas, gl
const attributes = {}
const uniforms = {}

export function initPlaneCanvas (vertexShaderSource, fragmentShaderSource, image) {
  initWebGL()

  const program = createProgram(vertexShaderSource, fragmentShaderSource)
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

  const uniform = {
    time: {
      type: '1f'
    }
  }
  if (image) {
    uniform.texture = {
      type: '1i'
    }
  }
  createUniform(uniform, program)

  if (image) {
    createTexture(image)
    setUniform('texture', 0)
  }

  clearColor(0, 0, 0, 1)

  initSize(image.width, image.height)

  start((time) => {
    setUniform('time', time / 1000)
  }, 'TRIANGLE_STRIP', positionCount)
}

export function initWebGL () {
  canvas = document.createElement('canvas')
  gl = canvas.getContext('webgl')
  document.body.appendChild(canvas)
}

export function createProgram (vertexShaderSource, fragmentShaderSource) {
  const program = gl.createProgram()
  gl.attachShader(program, createVertexShader(vertexShaderSource))
  gl.attachShader(program, createFragmentShader(fragmentShaderSource))
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)
  return program
}

export function createVertexShader (source) {
  const shader = gl.createShader(gl.VERTEX_SHADER)

  return getShader(shader, source)
}

export function createFragmentShader (source) {
  const shader = gl.createShader(gl.FRAGMENT_SHADER)

  return getShader(shader, source)
}

export function getShader (shader, source) {
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    return
  }

  return shader
}

export function createAttribute (data, program) {
  Object.keys(data).forEach(key => {
    const { stride, value } = data[key]
    attributes[key] = {
      location: gl.getAttribLocation(program, key),
      stride,
      vbo: createVbo(value)
    }
  })
}

export function createVbo (data) {
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return vbo
}

export function setAttribute (name) {
  const { vbo, location, stride } = attributes[name]

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
}

export function createUniform (data, program) {
  Object.keys(data).forEach(key => {
    const uniform = data[key]
    uniforms[key] = {
      location: gl.getUniformLocation(program, key),
      type: `uniform${uniform.type}`
    }
  })
}

export function setUniform (name, value) {
  const uniform = uniforms[name]
  if (!uniform) return

  gl[uniform.type](uniform.location, value)
}

export function bindTexture (texture) {
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

export function createTexture (img) {
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

export function clearColor (...args) {
  gl.clearColor(...args)
}

export function loadImage (src, callback) {
  const img = new Image()
  img.addEventListener('load', () => {
    callback(img)
  })
  img.crossOrigin = 'anonymous'
  img.src = src
}

export function setSize (width = window.innerWidth, height = window.innerHeight) {
  const windowRatio = window.innerWidth / window.innerHeight
  const imgRatio = width / height

  if (imgRatio >= windowRatio) {
    canvas.width = window.innerWidth
    canvas.height = window.innerWidth / imgRatio
  } else {
    canvas.height = window.innerHeight
    canvas.width = window.innerHeight * imgRatio
  }

  gl.viewport(0, 0, canvas.width, canvas.height)

  setUniform('resolution', [canvas.width, canvas.height])
}

export function initSize (width, height) {
  setSize(width, height)
  window.addEventListener('resize', () => {
    setSize(width, height)
  })
}

export function start (draw, mode, count) {
  function render (time) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    draw(time)

    gl.drawArrays(gl[mode], 0, count)

    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
