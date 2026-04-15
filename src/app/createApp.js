import { createCamera } from '../scene/createCamera.js'
import { createControls } from '../scene/createControls.js'
import { createLights } from '../scene/createLights.js'
import { createRenderer } from '../scene/createRenderer.js'
import { createScene } from '../scene/createScene.js'
import { createSceneController } from '../scene/sceneController.js'
import { validationSummary } from '../validation/manifest.js'
import { assert } from '../utils/assert.js'
import { createAppState } from '../ui/appState.js'
import { createControlPanel } from '../ui/controlPanel.js'

export function createApp(root) {
  assert(root, 'Expected app root element')

  const documentRef = root.ownerDocument ?? document
  const viewport = documentRef.createElement('div')
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
  function buildDiagnostics() {
    const state = appState.getState()
    const sample = sceneController.getCurrentSample()

    return {
      superposition: state.superposition,
      sampleCount: state.sampleCount,
      seed: state.seed,
      truncationRadius: state.truncation.maxRadius,
      latestSampleStateId: sample.metadata?.stateId || 'mix',
      latestSampleAttemptCount: sample.metadata?.attemptCount || 0,
      validationStatus: validationSummary.statusText,
      validationCheckCount: validationSummary.expectedCheckCount,
      validationCommand: validationSummary.command,
    }
  }
  viewport.className = 'viewer-frame'
  viewport.append(renderer.domElement)

  const controlPanel = createControlPanel({
    state: appState.getState(),
    diagnostics: buildDiagnostics(),
    onRegenerationUpdate(partialState) {
      const nextState = appState.applyRegenerationUpdate(partialState)

      sceneController.applyRegenerationUpdate(nextState)
      controlPanel.updateDiagnostics(buildDiagnostics())
    },
    onVisualUpdate(partialState) {
      const nextState = appState.applyVisualUpdate(partialState)

      sceneController.applyVisualUpdate(nextState)
      controlPanel.updateDiagnostics(buildDiagnostics())
    },
    onResetCamera() {
      sceneController.resetCamera()
    },
  })

  root.replaceChildren(controlPanel.element, viewport)
  scene.add(ambientLight, directionalLight)

  function handleResize() {
    const nextWidth = viewport.clientWidth || root.clientWidth || window.innerWidth
    const nextHeight = viewport.clientHeight || root.clientHeight || window.innerHeight

    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(nextWidth, nextHeight)
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  let animationFrameId = null
  let isDestroyed = false
  let lastTime = performance.now()

  function renderFrame(currentTime) {
    if (isDestroyed) {
      return
    }

    const state = appState.getState()
    // Calculate raw delta in seconds
    const rawDelta = (currentTime - lastTime) / 1000
    lastTime = currentTime

    if (state.isPlaying) {
      const delta = rawDelta * state.timeScale
      const newTime = state.time + delta
      appState.setTime(newTime)
      sceneController.update(newTime, delta)
      if (controlPanel.updateTimeText) {
        controlPanel.updateTimeText(newTime)
      }
    }

    controls.update()
    renderer.render(scene, camera)
    animationFrameId = window.requestAnimationFrame(renderFrame)
  }

  renderFrame(performance.now())

  return {
    scene,
    camera,
    renderer,
    controls,
    appState,
    sceneController,
    controlPanel,
    viewport,
    handleResize,
    lights: {
      ambientLight,
      directionalLight,
    },
    electronPointCloud: sceneController.getCurrentObjects().pointCloud,
    nucleusMarker: sceneController.getCurrentObjects().nucleusMarker,
    initialSample: sceneController.getCurrentSample(),
    destroy() {
      isDestroyed = true

      if (animationFrameId !== null) {
        window.cancelAnimationFrame?.(animationFrameId)
      }

      window.removeEventListener?.('resize', handleResize)
      sceneController.destroy?.()
      scene.remove(ambientLight, directionalLight)
      controls.dispose?.()
      renderer.dispose?.()
    },
  }
}
