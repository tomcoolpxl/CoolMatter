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
  const viewerPane = documentRef.createElement('section')
  const viewerHeader = documentRef.createElement('div')
  const viewerStatus = documentRef.createElement('div')
  const viewerStatusTitle = documentRef.createElement('strong')
  const viewerStatusMeta = documentRef.createElement('span')
  const viewerToolbar = documentRef.createElement('div')
  const playbackToggle = documentRef.createElement('button')
  const renderModeToggle = documentRef.createElement('button')
  const resetCameraButton = documentRef.createElement('button')
  const viewerHint = documentRef.createElement('p')
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
  viewerPane.className = 'viewer-pane'
  viewerHeader.className = 'viewer-header'
  viewerStatus.className = 'viewer-status'
  viewerStatusTitle.className = 'viewer-status-title'
  viewerStatusMeta.className = 'viewer-status-meta'
  viewerToolbar.className = 'viewer-toolbar'
  viewerHint.className = 'viewer-hint'
  viewport.className = 'viewer-frame'
  viewport.setAttribute?.('aria-label', '3D orbital viewer')
  viewport.append(renderer.domElement)

  playbackToggle.type = 'button'
  playbackToggle.className = 'viewer-tool viewer-tool-primary'
  renderModeToggle.type = 'button'
  renderModeToggle.className = 'viewer-tool'
  resetCameraButton.type = 'button'
  resetCameraButton.className = 'viewer-tool'
  resetCameraButton.textContent = 'Reset camera'
  viewerHint.textContent = 'Drag to orbit, right-drag or WASD to pan, and scroll to zoom.'

  viewerStatus.append(viewerStatusTitle, viewerStatusMeta)
  viewerToolbar.append(playbackToggle, renderModeToggle, resetCameraButton)
  viewerHeader.append(viewerStatus, viewerToolbar)
  viewerPane.append(viewerHeader, viewport, viewerHint)

  const controlPanel = createControlPanel({
    state: appState.getState(),
    diagnostics: buildDiagnostics(),
    onRegenerationUpdate(partialState) {
      const nextState = appState.applyRegenerationUpdate(partialState)

      sceneController.applyRegenerationUpdate(nextState)
      controlPanel.updateDiagnostics(buildDiagnostics())
      controlPanel.syncState?.(nextState)
      updateViewerChrome(nextState, partialState.superposition ? 'Orbital mix refreshed and normalized.' : 'Sampling refreshed.')
      return nextState
    },
    onVisualUpdate(partialState) {
      const nextState = appState.applyVisualUpdate(partialState)

      sceneController.applyVisualUpdate(nextState)
      controlPanel.updateDiagnostics(buildDiagnostics())
      controlPanel.syncState?.(nextState)
      updateViewerChrome(nextState)
      return nextState
    },
    onResetCamera() {
      sceneController.resetCamera()
      setTransientViewerMessage('Camera reset to the default framing.')
    },
  })

  resetCameraButton.addEventListener('click', () => {
    sceneController.resetCamera()
    setTransientViewerMessage('Camera reset to the default framing.')
  })
  playbackToggle.addEventListener('click', () => {
    const state = appState.getState()
    const nextState = appState.applyVisualUpdate({ isPlaying: !state.isPlaying })
    sceneController.applyVisualUpdate(nextState)
    controlPanel.syncState?.(nextState)
    updateViewerChrome(nextState)
  })
  renderModeToggle.addEventListener('click', () => {
    const state = appState.getState()
    const nextRenderMode = state.renderMode === 'volumetric' ? 'point_cloud' : 'volumetric'
    const nextState = appState.applyVisualUpdate({ renderMode: nextRenderMode })
    sceneController.applyVisualUpdate(nextState)
    controlPanel.syncState?.(nextState)
    updateViewerChrome(nextState)
  })

  root.replaceChildren(viewerPane, controlPanel.element)
  scene.add(ambientLight, directionalLight)
  updateViewerChrome(appState.getState())

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

    let newTime = state.time

    if (state.isPlaying) {
      const physicsDelta = rawDelta * state.timeScale
      newTime += physicsDelta
      appState.setTime(newTime)
      if (controlPanel.updateTimeText) {
        controlPanel.updateTimeText(newTime)
      }
      updateViewerChrome({ ...state, time: newTime })
    }

    sceneController.update(newTime, rawDelta)

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
    viewerPane,
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

  function updateViewerChrome(state, temporaryMessage = null) {
    const modeText = state.renderMode === 'volumetric' ? 'Volumetric' : 'Point Cloud'
    const playText = state.isPlaying ? 'Pause motion' : 'Play motion'

    playbackToggle.textContent = playText
    playbackToggle.setAttribute?.('aria-pressed', state.isPlaying ? 'true' : 'false')
    renderModeToggle.textContent = modeText
    viewerStatusTitle.textContent = formatMixSummary(state.superposition)
    viewerStatusMeta.textContent = temporaryMessage ?? `${modeText} · ${formatTimeLabel(state.time ?? 0)}`
  }

  function setTransientViewerMessage(message) {
    const state = appState.getState()
    updateViewerChrome(state, message)
    window.setTimeout?.(() => {
      updateViewerChrome(appState.getState())
    }, 1800)
  }
}

function formatMixSummary(superposition = []) {
  if (!Array.isArray(superposition) || superposition.length === 0) {
    return 'No active orbital'
  }

  return superposition.map((component) => {
    if (component.l === 0) {
      return `${component.n}s`
    }
    if (component.l === 1) {
      return `${component.n}p`
    }
    return `n${component.n} l${component.l} m${component.m}`
  }).join(' + ')
}

function formatTimeLabel(time) {
  return `t = ${Number(time).toFixed(2)} a.u.`
}
