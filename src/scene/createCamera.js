import * as THREE from 'three'

import { config } from '../app/config.js'

export function createCamera({ width, height }) {
  const camera = new THREE.PerspectiveCamera(
    config.cameraFovDegrees,
    width / height,
    config.cameraNear,
    config.cameraFar,
  )

  camera.position.set(
    config.defaultCameraPosition.x,
    config.defaultCameraPosition.y,
    config.defaultCameraPosition.z,
  )
  camera.lookAt(0, 0, 0)

  return camera
}
