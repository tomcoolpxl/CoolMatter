import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement)

  controls.enablePan = false
  controls.update()

  return controls
}
