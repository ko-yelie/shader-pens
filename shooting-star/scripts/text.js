// import * as THREE from 'three'

import { easingList } from './modules/easing'
import { getTextCoordinate } from './modules/canvas'
import store from './store'

import vertexShader from '../shaders/general/three-raw-plain.vert'
import fragmentShader from '../shaders/text.frag'

const TEXT = 'Shooting Star'
const FONT_SIZE = 30
const LETTER_SPACING = 0.18
const FONT = 'Georgia, serif'
const COLOR = '#fff'

export const TEXT_DURATION = 1080
export const EASE = 'easeOutQuint'

const data = {
  visible: {
    value: true
  },
  duration: {
    value: TEXT_DURATION,
    range: [0, 5000]
  },
  easing: {
    value: EASE,
    range: [easingList]
  }
}

const uniformData = {
  alpha: {
    value: 0.85,
    range: [0, 1]
  }
}
const DATA_KEYS = Object.keys(uniformData)

export default class Text {
  constructor () {
    const { root, controller } = store

    const folder = this.folder = controller.addFolder('Text')
    this.datData = controller.addData(data, { folder })

    const textWidth = FONT_SIZE * TEXT.length + FONT_SIZE * LETTER_SPACING * (TEXT.length - 1)
    const textHeight = FONT_SIZE * 1.2
    const pixelRatio = window.devicePixelRatio
    const textCanvas = getTextCoordinate({
      text: TEXT,
      fontSize: FONT_SIZE,
      height: textHeight,
      letterSpacing: LETTER_SPACING,
      font: FONT,
      color: COLOR,
      pixelRatio
    })
    const width = textCanvas.width / pixelRatio
    const height = textCanvas.height / pixelRatio
    const halfWidth = width / 2

    const texture = new THREE.Texture(textCanvas)
    texture.needsUpdate = true
    texture.minFilter = THREE.LinearFilter

    const geometry = new THREE.PlaneBufferGeometry(width, height)

    const uniforms = {
      map: {
        value: texture
      },
      uProgress: {
        value: -store.clientHalfWidth
      },
      uStartX: {
        value: store.clientHalfWidth - halfWidth
      },
      uRatio: {
        value: width / height
      }
    }

    this.datUniformData = controller.addUniformData(uniformData, uniforms, { folder })

    const material = this.material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true
    })

    const mesh = this.mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    mesh.visible = this.datData.visible
    mesh.position.setZ(0.1)

    root.add(mesh)

    root.addUpdateCallback(timestamp => {
      this.mesh.visible = this.datData.visible
      DATA_KEYS.forEach(key => {
        this.material.uniforms[key].value = this.datUniformData[key]
      })
    })
  }

  update (progress) {
    this.material.uniforms['uProgress'].value = progress
  }
}
