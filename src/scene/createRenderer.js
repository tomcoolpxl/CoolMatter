import * as THREE from 'three'

import { config } from '../app/config.js'

export function createRenderer({ width, height }) {
  const renderer = new THREE.WebGLRenderer({
    antialias: config.rendererAntialias,
  })

  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(width, height)

  return renderer
}
