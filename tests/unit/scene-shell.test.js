import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('three/addons/controls/OrbitControls.js', () => {
  class OrbitControls {
    constructor(camera, domElement) {
      this.camera = camera
      this.domElement = domElement
      this.enablePan = true
      this.update = vi.fn()
    }
  }

  return { OrbitControls }
})

describe('scene shell factories', () => {
  beforeEach(() => {
    vi.resetModules()
    global.window = {
      devicePixelRatio: 2,
    }
  })

  it('creates a black scene background', async () => {
    const { createScene } = await import('../../src/scene/createScene.js')

    const scene = createScene()

    expect(scene.background.getHex()).toBe(0x000000)
  })

  it('creates a perspective camera from config defaults', async () => {
    const { createCamera } = await import('../../src/scene/createCamera.js')

    const camera = createCamera({ width: 800, height: 400 })

    expect(camera.isPerspectiveCamera).toBe(true)
    expect(camera.fov).toBe(45)
    expect(camera.aspect).toBe(2)
    expect(camera.position.z).toBe(16)
  })

  it('creates minimal ambient and directional lights', async () => {
    const { createLights } = await import('../../src/scene/createLights.js')

    const lights = createLights()

    expect(lights.ambientLight.isAmbientLight).toBe(true)
    expect(lights.directionalLight.isDirectionalLight).toBe(true)
    expect(lights.directionalLight.position.z).toBe(8)
  })

  it('creates orbit controls with panning disabled', async () => {
    const { createControls } = await import('../../src/scene/createControls.js')
    const controls = createControls({ id: 'camera' }, { id: 'canvas' })

    expect(controls.enablePan).toBe(false)
    expect(controls.update).toHaveBeenCalledOnce()
  })

  it('creates a renderer with config antialias and requested size', async () => {
    const rendererRender = vi.fn()
    const setPixelRatio = vi.fn()
    const setSize = vi.fn()

    vi.doMock('three', async () => {
      const actual = await vi.importActual('three')

      class WebGLRenderer {
        constructor(options) {
          this.options = options
          this.domElement = { tagName: 'CANVAS' }
        }

        setPixelRatio(value) {
          setPixelRatio(value)
        }

        setSize(width, height) {
          setSize(width, height)
        }

        render(...args) {
          rendererRender(...args)
        }
      }

      return {
        ...actual,
        WebGLRenderer,
      }
    })

    const { createRenderer } = await import('../../src/scene/createRenderer.js')
    const renderer = createRenderer({ width: 640, height: 360 })

    expect(renderer.options).toEqual({ antialias: true })
    expect(setPixelRatio).toHaveBeenCalledWith(2)
    expect(setSize).toHaveBeenCalledWith(640, 360)
  })
})
