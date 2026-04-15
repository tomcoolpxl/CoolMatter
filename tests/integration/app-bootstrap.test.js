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
    },
  })),
  applyRegenerationUpdate: vi.fn(),
  applyVisualUpdate: vi.fn(),
  update: vi.fn(),
  resetCamera: vi.fn(),
  destroy: vi.fn(),
}
const createSceneController = vi.fn(() => sceneController)
const appState = {
  getState: vi.fn(() => ({
    selectedStateId: '1s',
    sampleCount: 20000,
    pointSize: 0.04,
    opacity: 0.2,
    nucleusMode: 'visibleReference',
    seed: 12345,
    truncation: { kind: 'spherical', maxRadius: 12 },
  })),
  applyRegenerationUpdate: vi.fn((update) => ({
    selectedStateId: update.selectedStateId ?? '1s',
    sampleCount: update.sampleCount ?? 20000,
    pointSize: 0.04,
    opacity: 0.2,
    nucleusMode: 'visibleReference',
    seed: update.seed ?? 12345,
    truncation: { kind: 'spherical', maxRadius: 12 },
  })),
  applyVisualUpdate: vi.fn((update) => ({
    selectedStateId: '1s',
    sampleCount: 20000,
    pointSize: update.pointSize ?? 0.04,
    opacity: update.opacity ?? 0.2,
    nucleusMode: update.nucleusMode ?? 'visibleReference',
    seed: 12345,
    truncation: { kind: 'spherical', maxRadius: 12 },
  })),
}
const createAppState = vi.fn(() => appState)
const controlPanelElement = { tagName: 'ASIDE' }
const viewportElement = {
  tagName: 'DIV',
  className: '',
  children: [],
  clientWidth: 0,
  clientHeight: 0,
  append: vi.fn(function append(child) {
    this.children.push(child)
  }),
}
let capturedControlPanelOptions
const controlPanelUpdateDiagnostics = vi.fn()
const createControlPanel = vi.fn((options) => {
  capturedControlPanelOptions = options

  return {
    element: controlPanelElement,
    controls: {},
    updateDiagnostics: controlPanelUpdateDiagnostics,
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
  }),
}))

vi.mock('../../src/scene/createControls.js', () => ({
  createControls: () => ({
    update: controlsUpdate,
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
    appState.applyRegenerationUpdate.mockClear()
    appState.applyVisualUpdate.mockClear()
    sceneController.getCurrentObjects.mockClear()
    sceneController.getCurrentSample.mockClear()
    sceneController.applyRegenerationUpdate.mockClear()
    sceneController.applyVisualUpdate.mockClear()
    sceneController.resetCamera.mockClear()
    sceneController.destroy.mockClear()
    controlPanelUpdateDiagnostics.mockClear()
    viewportElement.className = ''
    viewportElement.children = []
    viewportElement.clientWidth = 0
    viewportElement.clientHeight = 0
    viewportElement.append.mockClear()
    capturedControlPanelOptions = undefined
    global.window = {
      innerWidth: 1280,
      innerHeight: 720,
      requestAnimationFrame: vi.fn(() => 99),
      cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      devicePixelRatio: 2,
    }
  })

  it('mounts the renderer element and starts the render loop', async () => {
    const root = {
      clientWidth: 800,
      clientHeight: 600,
      ownerDocument: {
        createElement: vi.fn(() => viewportElement),
      },
      replaceChildren: vi.fn(),
    }
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)

    expect(viewportElement.className).toBe('viewer-frame')
    expect(viewportElement.append).toHaveBeenCalledWith(rendererDomElement)
    expect(root.replaceChildren).toHaveBeenCalledWith(controlPanelElement, viewportElement)
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
    expect(app.viewport).toBe(viewportElement)
    expect(app.electronPointCloud).toEqual({ kind: 'points' })
    expect(app.nucleusMarker).toEqual({ kind: 'nucleus' })
    expect(app.renderer.domElement).toBe(rendererDomElement)
  })

  it('routes control-panel updates through app state and the scene controller split', async () => {
    const root = {
      clientWidth: 800,
      clientHeight: 600,
      ownerDocument: {
        createElement: vi.fn(() => viewportElement),
      },
      replaceChildren: vi.fn(),
    }
    const { createApp } = await import('../../src/app/createApp.js')

    createApp(root)

    capturedControlPanelOptions.onRegenerationUpdate({ sampleCount: 1500 })
    capturedControlPanelOptions.onVisualUpdate({ opacity: 0.55 })
    capturedControlPanelOptions.onResetCamera()

    expect(appState.applyRegenerationUpdate).toHaveBeenCalledWith({ sampleCount: 1500 })
    expect(sceneController.applyRegenerationUpdate).toHaveBeenCalledOnce()
    expect(controlPanelUpdateDiagnostics).toHaveBeenCalled()
    expect(appState.applyVisualUpdate).toHaveBeenCalledWith({ opacity: 0.55 })
    expect(sceneController.applyVisualUpdate).toHaveBeenCalledOnce()
    expect(sceneController.resetCamera).toHaveBeenCalledOnce()
  })

  it('owns resize updates for camera and renderer sizing', async () => {
    const root = {
      clientWidth: 900,
      clientHeight: 500,
      ownerDocument: {
        createElement: vi.fn(() => viewportElement),
      },
      replaceChildren: vi.fn(),
    }
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)

    viewportElement.clientWidth = 640
    viewportElement.clientHeight = 360
    app.handleResize()

    expect(app.camera.aspect).toBeCloseTo(640 / 360, 12)
    expect(app.camera.updateProjectionMatrix).toHaveBeenCalledTimes(2)
    expect(setPixelRatio).toHaveBeenLastCalledWith(2)
    expect(setSize).toHaveBeenLastCalledWith(640, 360)
  })

  it('tears down the render loop, listener, controls, renderer, and scene controller', async () => {
    const root = {
      clientWidth: 800,
      clientHeight: 600,
      ownerDocument: {
        createElement: vi.fn(() => viewportElement),
      },
      replaceChildren: vi.fn(),
    }
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)
    app.controls.dispose = vi.fn()
    app.renderer.dispose = vi.fn()
    const frameId = window.requestAnimationFrame.mock.results[0].value

    app.destroy()

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(frameId)
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', app.handleResize)
    expect(sceneController.destroy).toHaveBeenCalledOnce()
    expect(app.controls.dispose).toHaveBeenCalledOnce()
    expect(app.renderer.dispose).toHaveBeenCalledOnce()
  })
})
