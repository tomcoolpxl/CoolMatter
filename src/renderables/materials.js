import * as THREE from 'three'

import { config } from '../app/config.js'

export function createElectronPointMaterial() {
  return new THREE.PointsMaterial({
    color: config.electronColor,
    size: config.defaultPointSize,
    opacity: config.defaultOpacity,
    transparent: true,
    depthWrite: false,
  })
}

export function createNucleusMaterial() {
  return new THREE.MeshStandardMaterial({
    color: config.nucleusColor,
    emissive: config.nucleusColor,
    emissiveIntensity: 0.18,
    roughness: 0.32,
    metalness: 0.08,
  })
}
