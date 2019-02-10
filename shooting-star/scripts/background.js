import * as THREE from 'three'

// import './modules/three/original/postprocessing/BloomPass'
import store from './store'

import vertexShader from '../shaders/general/three-raw-plain.vert'
import fragmentShader from '../shaders/background.frag'

const data = {
  visible: {
    value: true
  }
}

const uniformData = {
  speed: {
    type: '1f',
    value: 0.001,
    range: [0, 0.1]
  }
}
const DATA_KEYS = Object.keys(uniformData)

export default class ShootingStar {
  constructor () {
    const { root, controller } = store
    this.root = root

    this.rate = 1
    this.setSize()

    const folder = controller.addFolder('Background')
    this.datData = controller.addData(data, { folder })

    const front = new THREE.Vector2()

    const uniforms = {
      resolution: {
        value: store.resolution
      },
      timestamp: {
        value: 0
      }
    }

    this.datUniformData = controller.addUniformData(uniformData, uniforms, { folder })

    const geometry = this.geometry = new THREE.PlaneBufferGeometry(store.clientWidth, store.clientHeight)

    const material = this.material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthTest: false
    })

    const mesh = this.mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    mesh.visible = this.datData.visible

    root.add(mesh)

    // root.initPostProcessing([
    //   new THREE.BloomPass(1.3, 25, 3.1, 256),
    //   new THREE.ShaderPass(THREE.CopyShader)
    // ])

    root.addResizeCallback(() => {
      this.setSize()

      material.uniforms['resolution'].value = store.resolution

      // let scale
      // if (store.ratio > store.initialRatio) {
      //   scale = store.clientHeight / store.initialClientHeight
      // } else {
      //   scale = store.clientWidth / store.initialClientWidth
      // }
      // console.log(scale)
      // mesh.scale.set(scale, scale, 1)
    })

    root.addUpdateCallback(timestamp => {
      this.update(timestamp)
    })
  }

  setSize () {
    this.rate = Math.min(
      store.ratio > store.initialRatio
        ? store.clientHeight / store.initialClientHeight
        : store.clientWidth / store.initialClientWidth
      , 1)
    this.rate *= 1 / (store.clientHeight / store.initialClientHeight)
  }

  update (timestamp) {
    this.timestamp = timestamp
    this.material.uniforms['timestamp'].value = timestamp

    this.mesh.visible = this.datData.visible
    DATA_KEYS.forEach(key => {
      this.material.uniforms[key].value = this.datUniformData[key]
    })
  }
}

