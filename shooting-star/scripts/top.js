import * as THREE from 'three'

import THREERoot from './modules/THREERoot'
import Controller from './modules/datGUI-utils'
import ShootingStar from './shooting-star'
import Text from './text'
import store from './store'
import {
  CAMERA_Z,
  MAX_CAMERA_Z
} from './constant'

export default class WebGL {
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
      canvas,
      alpha: true
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

  change () {
    this.text.change()
  }
}
