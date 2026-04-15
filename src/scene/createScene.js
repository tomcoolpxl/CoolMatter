import * as THREE from 'three'

import { config } from '../app/config.js'

export function createScene() {
  const scene = new THREE.Scene()

  scene.background = new THREE.Color(config.sceneBackgroundColor)

  return scene
}
