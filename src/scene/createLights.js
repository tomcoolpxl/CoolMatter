import * as THREE from 'three'

export function createLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75)

  directionalLight.position.set(4, 6, 8)

  return {
    ambientLight,
    directionalLight,
  }
}
