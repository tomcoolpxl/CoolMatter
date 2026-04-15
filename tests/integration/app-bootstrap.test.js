import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const rendererDomElement = { tagName: 'CANVAS' }
const controlsUpdate = vi.fn()
const sceneAdd = vi.fn()
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
}
const createAppState = vi.fn(() => appState)

vi.mock('../../src/scene/createScene.js', () => ({
  createScene: () => ({
    add: sceneAdd,
  }),
}))

vi.mock('../../src/scene/createCamera.js', () => ({
  createCamera: ({ width, height }) => ({
    width,
    height,
  }),
}))

vi.mock('../../src/scene/createRenderer.js', () => ({
  createRenderer: ({ width, height }) => ({
    width,
    height,
    domElement: rendererDomElement,
    render,
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

vi.mock('../../src/scene/sceneController.js', () => ({
  createSceneController,
}))

describe('app bootstrap', () => {
  beforeEach(() => {
    render.mockReset()
    controlsUpdate.mockReset()
    sceneAdd.mockReset()
    createAppState.mockClear()
    createSceneController.mockClear()
    appState.getState.mockClear()
    sceneController.getCurrentObjects.mockClear()
    sceneController.getCurrentSample.mockClear()
    global.window = {
      innerWidth: 1280,
      innerHeight: 720,
      requestAnimationFrame: vi.fn(),
    }
  })

  it('mounts the renderer element and starts the render loop', async () => {
    const root = {
      clientWidth: 800,
      clientHeight: 600,
      replaceChildren: vi.fn(),
    }
    const { createApp } = await import('../../src/app/createApp.js')

    const app = createApp(root)

    expect(root.replaceChildren).toHaveBeenCalledWith(rendererDomElement)
    expect(render).toHaveBeenCalledOnce()
    expect(controlsUpdate).toHaveBeenCalledOnce()
    expect(window.requestAnimationFrame).toHaveBeenCalledOnce()
    expect(createAppState).toHaveBeenCalledOnce()
    expect(createSceneController).toHaveBeenCalledOnce()
    expect(sceneAdd).toHaveBeenCalledWith(
      { type: 'ambient' },
      { type: 'directional' },
    )
    expect(app.appState).toBe(appState)
    expect(app.sceneController).toBe(sceneController)
    expect(app.electronPointCloud).toEqual({ kind: 'points' })
    expect(app.nucleusMarker).toEqual({ kind: 'nucleus' })
    expect(app.renderer.domElement).toBe(rendererDomElement)
  })
})
