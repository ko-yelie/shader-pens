// import * as THREE from 'three'

import THREERoot from './scripts/modules/THREERoot'
import Controller from './scripts/modules/datGUI-utils'
import { animate } from './scripts/modules/animation'
// import './scripts/modules/three/original/postprocessing/BloomPass'
// import Background from './scripts/background'
import ShootingStar from './scripts/shooting-star'
import Text from './scripts/text'
import store from './scripts/store'

const CAMERA_Z = 5000
const MAX_CAMERA_Z = 5000
const FIRST_DURATION = 1080
const DELAY = 300

const data = {
  play: {
    value: null
  }
}

class WebGL {
  constructor ({
    canvas,
    container = document.body
  }) {
    const controller = new Controller({
      closed: true
    })
    store.controller = controller

    const initialClientWidth = store.initialClientWidth = container.clientWidth
    const initialClientHeight = store.initialClientHeight = container.clientHeight
    // store.initialRatio = container.clientWidth / container.clientHeight
    store.initialRatio = 1

    const root = this.root = store.root = new THREERoot({
      isDev: true,
      container,
      fov: Math.atan(initialClientHeight / 2 / CAMERA_Z) * (180 / Math.PI) * 2,
      zFar: MAX_CAMERA_Z,
      cameraPosition: [0, 0, CAMERA_Z],
      aspect: window.innerWidth / window.innerHeight,
      canvas
    })

    this.setSize()
    root.addResizeCallback(() => {
      this.setSize()
    })

    // this.background = new Background()

    this.text = new Text()

    this.shootingStar = new ShootingStar()

    data['play'].value = () => {
      this.textStart()
    }
    controller.addData(data, { folder: this.text.folder })

    // root.initPostProcessing([
    //   new THREE.BloomPass(),
    //   new THREE.ShaderPass(THREE.CopyShader)
    // ])
  }

  setSize () {
    const clientWidth = store.clientWidth = this.root.canvas.clientWidth
    const clientHeight = store.clientHeight = this.root.canvas.clientHeight
    store.clientHalfWidth = clientWidth / 2
    store.clientHalfHeight = clientHeight / 2
    store.resolution = new THREE.Vector2(clientWidth, clientHeight)
    store.ratio = clientWidth / clientHeight
  }

  start () {
    const period = Math.PI * 3
    const amplitude = Math.min(Math.max(store.clientWidth * 0.1, 100), 180)

    animate(progress => {
      this.shootingStar.draw({
        clientX: Math.cos(progress * period) * amplitude,
        clientY: (progress * store.clientHeight - store.clientHalfHeight) * 1.3
      })
    }, {
      duration: FIRST_DURATION,
      onAfter: () => {
        this.shootingStar.draw({
          clientX: -store.clientHalfWidth,
          clientY: store.clientHeight - store.clientHalfHeight
        })
        this.shootingStar.draw({
          clientX: -store.clientHalfWidth * 1.1,
          clientY: 0
        })

        setTimeout(() => {
          this.textStart()
        }, 300)
      }
    })
  }

  textStart () {
    animate(progress => {
      this.shootingStar.draw({
        clientX: progress,
        clientY: 0
      })

      this.text.update(progress - store.clientWidth * 0.08)
    }, {
      begin: -store.clientHalfWidth * 1.1,
      finish: store.clientHalfWidth * 1.1,
      duration: this.text.datData.duration,
      easing: this.text.datData.easing,
      onAfter: () => {
        this.shootingStar.start()

        document.body.classList.add('o-start')
      }
    })
  }
}

const webGL = new WebGL({
  canvas: document.getElementById('canvas')
})

setTimeout(() => {
  webGL.start()
}, DELAY)
