import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const rendererDomElement = { tagName: 'CANVAS' }
const controlsUpdate = vi.fn()

vi.mock('../../src/scene/createScene.js', () => ({
  createScene: () => ({
    add: vi.fn(),
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

describe('app bootstrap', () => {
  beforeEach(() => {
    render.mockReset()
    controlsUpdate.mockReset()
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
    expect(app.renderer.domElement).toBe(rendererDomElement)
  })
})
