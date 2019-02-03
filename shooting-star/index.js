import * as THREE from 'three'

import THREERoot from './scripts/modules/THREERoot'
import Controller from './scripts/modules/datGUI-utils'
import { animate } from './scripts/modules/animation'
import { easingList } from './scripts/modules/easing'
import ShootingStar from './scripts/shooting-star'
import Text from './scripts/text'
import store from './scripts/store'

export const CAMERA_Z = 5000
export const MAX_CAMERA_Z = 5000
export const FIRST_DURATION = 1000
export const TEXT_DURATION = 1000
export const EASE = 'easeOutQuart'
export const DELAY = 600

const data = {
  play: {
    value: null
  },
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

class WebGL {
  constructor ({
    canvas,
    container = document.body
  }) {
    const controller = new Controller({
      closed: true
    })
    store.controller = controller

    data['play'].value = () => {
      this.textStart()
    }
    const folder = controller.addFolder('Text')
    store.textDatData = controller.addData(data, { folder })

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
      canvas,
      alpha: true,
      isAutoStart: false
    })

    this.setSize()
    root.addResizeCallback(() => {
      this.setSize()
    })

    this.text = new Text()
    this.shootingStar = new ShootingStar()
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
    this.root.start()

    const period = Math.PI * 3

    animate(progress => {
      this.shootingStar.draw({
        clientX: Math.cos(progress * period) * 150,
        clientY: (progress * store.clientHeight - store.clientHalfHeight) * 1.2
      })
    }, {
      duration: FIRST_DURATION,
      easing: EASE,
      onAfter: () => {
        this.shootingStar.draw({
          clientX: -store.clientHalfWidth,
          clientY: (store.clientHeight - store.clientHalfHeight) * 1.2
        })
        this.shootingStar.draw({
          clientX: -store.clientHalfWidth * 1.1,
          clientY: 0
        })

        this.textStart()
      }
    })
  }

  textStart () {
    animate(progress => {
      this.shootingStar.draw({
        clientX: progress,
        clientY: 0
      })

      this.text.update(progress)
    }, {
      begin: -store.clientHalfWidth,
      finish: store.clientHalfWidth,
      duration: store.textDatData.duration,
      easing: store.textDatData.easing,
      onAfter: () => {
        this.shootingStar.start()
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
