import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement)

  controls.target.set(0, 0, 0)
  controls.enablePan = true
  controls.keys = {
    LEFT: 'KeyA',
    UP: 'KeyW',
    RIGHT: 'KeyD',
    BOTTOM: 'KeyS',
  }
  controls.listenToKeyEvents?.(window)
  controls.update()

  return controls
}
