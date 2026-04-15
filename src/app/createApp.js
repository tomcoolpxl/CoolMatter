import { createCamera } from '../scene/createCamera.js'
import { createControls } from '../scene/createControls.js'
import { createLights } from '../scene/createLights.js'
import { createRenderer } from '../scene/createRenderer.js'
import { createScene } from '../scene/createScene.js'
import { createSceneController } from '../scene/sceneController.js'
import { assert } from '../utils/assert.js'
import { createAppState } from '../ui/appState.js'
import { createControlPanel } from '../ui/controlPanel.js'

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
  const controlPanel = createControlPanel({
    state: appState.getState(),
    onRegenerationUpdate(partialState) {
      const nextState = appState.applyRegenerationUpdate(partialState)

      sceneController.applyRegenerationUpdate(nextState)
    },
    onVisualUpdate(partialState) {
      const nextState = appState.applyVisualUpdate(partialState)

      sceneController.applyVisualUpdate(nextState)
    },
    onResetCamera() {
      sceneController.resetCamera()
    },
  })

  root.replaceChildren(controlPanel.element, renderer.domElement)
  scene.add(ambientLight, directionalLight)

  function handleResize() {
    const nextWidth = root.clientWidth || window.innerWidth
    const nextHeight = root.clientHeight || window.innerHeight

    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(nextWidth, nextHeight)
  }

  window.addEventListener('resize', handleResize)

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
    controlPanel,
    handleResize,
    lights: {
      ambientLight,
      directionalLight,
    },
    electronPointCloud: sceneController.getCurrentObjects().pointCloud,
    nucleusMarker: sceneController.getCurrentObjects().nucleusMarker,
    initialSample: sceneController.getCurrentSample(),
  }
}
