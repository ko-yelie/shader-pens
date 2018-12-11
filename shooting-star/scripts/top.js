import Controller from './datGUI-utils'
import ShootingStar from './shooting-star'
import Text from './text'
import store from './store'

export default class WebGL {
  constructor ({
    backgroundCanvas,
    textCanvas,
    container = document.body
  }) {
    const controller = new Controller({
      closed: true
    })
    store.controller = controller
    controller.gui.closed = true

    this.shootingStar = new ShootingStar(backgroundCanvas, container)
    this.text = new Text(textCanvas, container)
  }

  change () {
    this.text.change()
  }
}
