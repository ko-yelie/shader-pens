// import * as dat from 'dat.gui'

import { noop } from './utils'

export default class Controller {
  constructor (options) {
    const { closed } = options
    this.gui = new dat.GUI(options)
    this.gui.closed = closed
  }

  /**
   * addData
   *
   * @param {Object} data
   * @param {Object} [options={}]
   * @param {function} [options.callback=noop]
   * @param {function} [options.folder=gui]
   * @memberof Controller
   */
  addData (data, options = {}) {
    const {
      folder = this.gui,
      callback = noop,
      isUniform
    } = options
    const dataKeys = Object.keys(data)
    const datData = {}

    dataKeys.forEach(key => {
      datData[key] = data[key].value
    })

    dataKeys.forEach(key => {
      const {
        isColor,
        value,
        range,
        onChange,
        listen
      } = data[key]

      let type
      if (isUniform) {
        switch (typeof value) {
          case 'boolean':
            type = '1i'
            break;
          case 'array':
            type = value.length + 'f'
            break;
          case 'object':
            type = 't'
            break;
          default:
            type = '1f'
            break;
        }
      }

      let controller

      if (isColor) {
        controller = folder.addColor(datData, key)
      } else {
        let guiRange = []
        if (range) {
          guiRange = range
        } else if (key === 'frame') {
          guiRange = [0, 1]
        } else if (typeof value === 'number') {
          if (value < 1 && value >= 0) {
            guiRange = [0, 1]
          } else {
            const diff = Math.pow(10, String(Math.floor(value)).length - 1) * 2
            guiRange = [value - diff, value + diff]
          }
        }

        controller = folder.add(datData, key, ...guiRange)
      }

      onChange && controller.onChange(value => { onChange(value) })
      listen && controller.listen()

      callback(key, { type, value })
    })

    return datData
  }

  addUniformData (data, uniforms = {}, options = {}) {
    return this.addData(data, {
      callback: (key, obj) => {
        uniforms[key] = obj
      },
      folder: options.folder,
      isUniform: true
    })
  }

  addFolder (name, isClosed) {
    const folder = this.gui.addFolder(name)
    !isClosed && folder.open()
    return folder
  }
}
