import * as dat from 'dat.gui'

import WebGL from './scripts/top'

const webGL = new WebGL({
  backgroundCanvas: document.getElementById('background'),
  textCanvas: document.getElementById('text')
})

webGL.change()
