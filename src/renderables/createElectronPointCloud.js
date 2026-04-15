import * as THREE from 'three'

import { createElectronPointMaterial } from './materials.js'

export function createElectronPointCloud(positions) {
  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = createElectronPointMaterial()
  const pointCloud = new THREE.Points(geometry, material)

  pointCloud.name = 'electronPointCloud'

  return pointCloud
}
