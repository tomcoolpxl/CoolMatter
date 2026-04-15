import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const rendererDomElement = { tagName: 'CANVAS' }
const controlsUpdate = vi.fn()
const sceneAdd = vi.fn()
const sampleHydrogenState = vi.fn(() => ({
  positions: new Float32Array([0, 0, 0, 1, 1, 1]),
  metadata: {
    stateId: '1s',
    sampleCount: 2,
    seed: 12345,
  },
}))
const electronPointCloud = { kind: 'points' }
const nucleusMarker = { kind: 'nucleus' }

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

vi.mock('../../src/sampling/sampleHydrogenState.js', () => ({
  sampleHydrogenState,
}))

vi.mock('../../src/renderables/createElectronPointCloud.js', () => ({
  createElectronPointCloud: vi.fn(() => electronPointCloud),
}))

vi.mock('../../src/renderables/createNucleusMarker.js', () => ({
  createNucleusMarker: vi.fn(() => nucleusMarker),
}))

describe('app bootstrap', () => {
  beforeEach(() => {
    render.mockReset()
    controlsUpdate.mockReset()
    sceneAdd.mockReset()
    sampleHydrogenState.mockClear()
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
    expect(sampleHydrogenState).toHaveBeenCalledOnce()
    expect(sceneAdd).toHaveBeenCalledWith(
      { type: 'ambient' },
      { type: 'directional' },
      electronPointCloud,
      nucleusMarker,
    )
    expect(app.electronPointCloud).toBe(electronPointCloud)
    expect(app.nucleusMarker).toBe(nucleusMarker)
    expect(app.renderer.domElement).toBe(rendererDomElement)
  })
})
