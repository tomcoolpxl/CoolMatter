import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const setPixelRatio = vi.fn()
const setSize = vi.fn()
const rendererDomElement = { tagName: 'CANVAS' }
const controlsUpdate = vi.fn()
const sceneAdd = vi.fn()
const sceneRemove = vi.fn()
const sceneController = {
  getCurrentObjects: vi.fn(() => ({
    pointCloud: { kind: 'points' },
    nucleusMarker: { kind: 'nucleus' },
  })),
  getCurrentSample: vi.fn(() => ({
    metadata: {
      stateId: '1s',
      sampleCount: 2,
      seed: 12345,
      attemptCount: 22,
    },
  })),
  applyRegenerationUpdate: vi.fn(),
  applyVisualUpdate: vi.fn(),
  update: vi.fn(),
  resetCamera: vi.fn(),
  destroy: vi.fn(),
}
const createSceneController = vi.fn(() => sceneController)
const baseState = {
  superposition: [{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }],
  sampleCount: 20000,
  pointSize: 0.04,
  opacity: 0.2,
  nucleusMode: 'visibleReference',
  seed: 12345,
  truncation: { kind: 'spherical', maxRadius: 12 },
  isPlaying: false,
  timeScale: 1,
  time: 0,
  scintillationRate: 0.05,
  renderMode: 'point_cloud',
}
const appState = {
  getState: vi.fn(() => ({ ...baseState, superposition: baseState.superposition.map((entry) => ({ ...entry })) })),
  setTime: vi.fn(),
  applyRegenerationUpdate: vi.fn((update) => ({
    ...baseState,
    superposition: (update.superposition ?? baseState.superposition).map((entry) => ({ ...entry })),
    sampleCount: update.sampleCount ?? baseState.sampleCount,
    seed: update.seed ?? baseState.seed,
  })),
  applyVisualUpdate: vi.fn((update) => ({
    ...baseState,
    superposition: baseState.superposition.map((entry) => ({ ...entry })),
    pointSize: update.pointSize ?? baseState.pointSize,
    opacity: update.opacity ?? baseState.opacity,
    nucleusMode: update.nucleusMode ?? baseState.nucleusMode,
    isPlaying: update.isPlaying ?? baseState.isPlaying,
    timeScale: update.timeScale ?? baseState.timeScale,
    scintillationRate: update.scintillationRate ?? baseState.scintillationRate,
    renderMode: update.renderMode ?? baseState.renderMode,
  })),
}
const createAppState = vi.fn(() => appState)
const controlPanelElement = createFakeElement('aside')
let capturedControlPanelOptions
const controlPanelUpdateDiagnostics = vi.fn()
const controlPanelSyncState = vi.fn()
const createControlPanel = vi.fn((options) => {
  capturedControlPanelOptions = options

  return {
    element: controlPanelElement,
    controls: {},
    updateDiagnostics: controlPanelUpdateDiagnostics,
    syncState: controlPanelSyncState,
  }
})

vi.mock('../../src/scene/createScene.js', () => ({
  createScene: () => ({
    add: sceneAdd,
    remove: sceneRemove,
  }),
}))

vi.mock('../../src/scene/createCamera.js', () => ({
  createCamera: ({ width, height }) => ({
    width,
    height,
    updateProjectionMatrix: vi.fn(),
    position: { set: vi.fn() },
    lookAt: vi.fn(),
  }),
}))

vi.mock('../../src/scene/createRenderer.js', () => ({
  createRenderer: ({ width, height }) => ({
    width,
    height,
    domElement: rendererDomElement,
    render,
    setPixelRatio,
    setSize,
    dispose: vi.fn(),
  }),
}))

vi.mock('../../src/scene/createControls.js', () => ({
  createControls: () => ({
    update: controlsUpdate,
    dispose: vi.fn(),
    target: { set: vi.fn() },
  }),
}))

vi.mock('../../src/scene/createLights.js', () => ({
  createLights: () => ({
    ambientLight: { type: 'ambient' },
    directionalLight: { type: 'directional' },
  }),
}))

vi.mock('../../src/ui/appState.js', () => ({
  createAppState,
}))

vi.mock('../../src/ui/controlPanel.js', () => ({
  createControlPanel,
}))

vi.mock('../../src/scene/sceneController.js', () => ({
  createSceneController,
}))

describe('app bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    render.mockReset()
    setPixelRatio.mockReset()
    setSize.mockReset()
    controlsUpdate.mockReset()
    sceneAdd.mockReset()
    sceneRemove.mockReset()
    createAppState.mockClear()
    createSceneController.mockClear()
    createControlPanel.mockClear()
    appState.getState.mockClear()
    appState.setTime.mockClear()
    appState.applyRegenerationUpdate.mockClear()
    appState.applyVisualUpdate.mockClear()
    sceneController.getCurrentObjects.mockClear()
    sceneController.getCurrentSample.mockClear()
    sceneController.applyRegenerationUpdate.mockClear()
    sceneController.applyVisualUpdate.mockClear()
    sceneController.resetCamera.mockClear()
    sceneController.destroy.mockClear()
    controlPanelUpdateDiagnostics.mockClear()
    controlPanelSyncState.mockClear()
    capturedControlPanelOptions = undefined
    global.window = {
      innerWidth: 1280,
      innerHeight: 720,
      requestAnimationFrame: vi.fn(() => 99),
      cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      devicePixelRatio: 2,
      setTimeout: vi.fn(),
    }
  })

  it('mounts the viewer shell, renderer element, and starts the render loop', async () => {
    const root = createRoot()
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)

    expect(app.viewport.className).toBe('viewer-frame')
    expect(app.viewport.append).toHaveBeenCalledWith(rendererDomElement)
    expect(app.viewerPane.className).toBe('viewer-pane')
    expect(root.replaceChildren).toHaveBeenCalledWith(app.viewerPane, controlPanelElement)
    expect(render).toHaveBeenCalledOnce()
    expect(controlsUpdate).toHaveBeenCalledOnce()
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce()
    expect(setSize).toHaveBeenCalledWith(800, 600)
    expect(createAppState).toHaveBeenCalledOnce()
    expect(createSceneController).toHaveBeenCalledOnce()
    expect(createControlPanel).toHaveBeenCalledOnce()
    expect(window.addEventListener).toHaveBeenCalledWith('resize', app.handleResize)
    expect(createControlPanel.mock.calls[0][0].diagnostics.validationCheckCount).toBe(19)
    expect(sceneAdd).toHaveBeenCalledWith(
      { type: 'ambient' },
      { type: 'directional' },
    )
    expect(app.appState).toBe(appState)
    expect(app.sceneController).toBe(sceneController)
    expect(app.controlPanel.element).toBe(controlPanelElement)
    expect(app.electronPointCloud).toEqual({ kind: 'points' })
    expect(app.nucleusMarker).toEqual({ kind: 'nucleus' })
    expect(app.renderer.domElement).toBe(rendererDomElement)
  })

  it('routes control-panel updates through app state and scene-controller handlers', async () => {
    const root = createRoot()
    const { createApp } = await import('../../src/app/createApp.js')

    createApp(root)

    const nextRegenerationState = capturedControlPanelOptions.onRegenerationUpdate({ sampleCount: 1500 })
    const nextVisualState = capturedControlPanelOptions.onVisualUpdate({ opacity: 0.55 })
    capturedControlPanelOptions.onResetCamera()

    expect(appState.applyRegenerationUpdate).toHaveBeenCalledWith({ sampleCount: 1500 })
    expect(sceneController.applyRegenerationUpdate).toHaveBeenCalledOnce()
    expect(controlPanelUpdateDiagnostics).toHaveBeenCalled()
    expect(controlPanelSyncState).toHaveBeenCalledWith(nextRegenerationState)
    expect(appState.applyVisualUpdate).toHaveBeenCalledWith({ opacity: 0.55 })
    expect(sceneController.applyVisualUpdate).toHaveBeenCalledOnce()
    expect(controlPanelSyncState).toHaveBeenCalledWith(nextVisualState)
    expect(sceneController.resetCamera).toHaveBeenCalledOnce()
  })

  it('owns resize updates for camera and renderer sizing', async () => {
    const root = createRoot(900, 500)
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)

    app.viewport.clientWidth = 640
    app.viewport.clientHeight = 360
    app.handleResize()

    expect(app.camera.aspect).toBeCloseTo(640 / 360, 12)
    expect(app.camera.updateProjectionMatrix).toHaveBeenCalledTimes(2)
    expect(setPixelRatio).toHaveBeenLastCalledWith(2)
    expect(setSize).toHaveBeenLastCalledWith(640, 360)
  })

  it('tears down the render loop, listener, controls, renderer, and scene controller', async () => {
    const root = createRoot()
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)
    const frameId = window.requestAnimationFrame.mock.results[0].value

    app.destroy()

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(frameId)
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', app.handleResize)
    expect(sceneController.destroy).toHaveBeenCalledOnce()
    expect(app.controls.dispose).toHaveBeenCalledOnce()
    expect(app.renderer.dispose).toHaveBeenCalledOnce()
  })
})

function createRoot(width = 800, height = 600) {
  return {
    clientWidth: width,
    clientHeight: height,
    ownerDocument: createFakeDocument(),
    replaceChildren: vi.fn(),
  }
}

function createFakeDocument() {
  return {
    createElement(tagName) {
      return createFakeElement(tagName)
    },
  }
}

function createFakeElement(tagName) {
  return {
    tagName,
    className: '',
    children: [],
    clientWidth: 0,
    clientHeight: 0,
    append: vi.fn(function append(...children) {
      this.children.push(...children)
    }),
    replaceChildren: vi.fn(function replaceChildren(...children) {
      this.children = children
    }),
    addEventListener: vi.fn(),
    setAttribute: vi.fn(),
    textContent: '',
  }
}
