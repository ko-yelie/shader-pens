// import * as THREE from 'three'

import { getTextCoordinate } from './modules/canvas'
import store from './store'

import vertexShader from '../shaders/general/three-raw-plain.vert'
import fragmentShader from '../shaders/text.frag'

const TEXT = 'Shooting Star'
const FONT_SIZE = 30
const LETTER_SPACING = 0.2
const FONT = 'Georgia, serif'
const COLOR = '#fff'

export default class Text {
  constructor () {
    const { root } = store

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

    const material = this.material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true
    })

    const mesh = this.mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    mesh.visible = store.textDatData.visible
    mesh.position.setZ(0.1)

    root.add(mesh)

    root.addUpdateCallback(timestamp => {
      this.mesh.visible = store.textDatData.visible
    })
  }

  update (progress) {
    this.material.uniforms['uProgress'].value = progress
  }
}
