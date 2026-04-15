import { createCamera } from '../scene/createCamera.js'
import { createControls } from '../scene/createControls.js'
import { createLights } from '../scene/createLights.js'
import { createRenderer } from '../scene/createRenderer.js'
import { createScene } from '../scene/createScene.js'
import { createSceneController } from '../scene/sceneController.js'
import { assert } from '../utils/assert.js'
import { createAppState } from '../ui/appState.js'

export function createApp(root) {
  assert(root, 'Expected app root element')

  const width = root.clientWidth || window.innerWidth
  const height = root.clientHeight || window.innerHeight
  const scene = createScene()
  const camera = createCamera({ width, height })
  const renderer = createRenderer({ width, height })
  const controls = createControls(camera, renderer.domElement)
  const { ambientLight, directionalLight } = createLights()
  const appState = createAppState()
  const sceneController = createSceneController({
    scene,
    camera,
    controls,
    initialState: appState.getState(),
  })

  root.replaceChildren(renderer.domElement)
  scene.add(ambientLight, directionalLight)

  function renderFrame() {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(renderFrame)
  }

  renderFrame()

  return {
    scene,
    camera,
    renderer,
    controls,
    appState,
    sceneController,
    lights: {
      ambientLight,
      directionalLight,
    },
    electronPointCloud: sceneController.getCurrentObjects().pointCloud,
    nucleusMarker: sceneController.getCurrentObjects().nucleusMarker,
    initialSample: sceneController.getCurrentSample(),
  }
}
