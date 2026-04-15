import * as THREE from 'three'

import { config } from '../app/config.js'
import { createNucleusMaterial } from './materials.js'

export function createNucleusMarker(mode = config.initialNucleusMode) {
  const radius = mode === 'physical'
    ? config.physicalNucleusRadius
    : config.visibleReferenceNucleusRadius

  const geometry = new THREE.SphereGeometry(radius, 24, 24)
  const material = createNucleusMaterial()
  const nucleus = new THREE.Mesh(geometry, material)

  nucleus.name = 'nucleusMarker'
  nucleus.position.set(0, 0, 0)
  nucleus.userData.nucleusMode = mode

  return nucleus
}
