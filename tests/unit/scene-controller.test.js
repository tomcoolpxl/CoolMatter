import { beforeEach, describe, expect, it, vi } from 'vitest'

const sampleHydrogenState = vi.fn()
const createElectronPointCloud = vi.fn()
const createNucleusMarker = vi.fn()

vi.mock('../../src/sampling/sampleHydrogenState.js', () => ({
  sampleHydrogenState,
}))

vi.mock('../../src/renderables/createElectronPointCloud.js', () => ({
  createElectronPointCloud,
}))

vi.mock('../../src/renderables/createNucleusMarker.js', () => ({
  createNucleusMarker,
}))

describe('scene controller', () => {
  beforeEach(() => {
    sampleHydrogenState.mockReset()
    createElectronPointCloud.mockReset()
    createNucleusMarker.mockReset()
  })

  it('creates the initial sample and current scene objects from the initial state', async () => {
    sampleHydrogenState.mockReturnValue({
      positions: new Float32Array([0, 0, 0]),
      metadata: { sampleCount: 1 },
    })
    const pointCloud = {
      material: {},
    }
    const nucleus = { kind: 'nucleus' }
    createElectronPointCloud.mockReturnValue(pointCloud)
    createNucleusMarker.mockReturnValue(nucleus)
    const scene = {
      add: vi.fn(),
      remove: vi.fn(),
    }
    const controls = { update: vi.fn() }
    const camera = {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
    }
    const { createSceneController } = await import('../../src/scene/sceneController.js')

    const controller = createSceneController({
      scene,
      camera,
      controls,
      initialState: {
        selectedStateId: '1s',
        sampleCount: 1,
        pointSize: 0.1,
        opacity: 0.25,
        nucleusMode: 'visibleReference',
        seed: 3,
        truncation: { kind: 'spherical', maxRadius: 4 },
      },
    })

    expect(sampleHydrogenState).toHaveBeenCalledOnce()
    expect(createElectronPointCloud).toHaveBeenCalledOnce()
    expect(createNucleusMarker).toHaveBeenCalledWith('visibleReference')
    expect(scene.add).toHaveBeenCalledWith(pointCloud, nucleus)
    expect(controller.getCurrentObjects().pointCloud).toBe(pointCloud)
    expect(pointCloud.material.size).toBe(0.1)
    expect(pointCloud.material.opacity).toBe(0.25)
  })

  it('resamples only on regeneration updates and replaces the point cloud', async () => {
    sampleHydrogenState
      .mockReturnValueOnce({ positions: new Float32Array([0, 0, 0]), metadata: { id: 1 } })
      .mockReturnValueOnce({ positions: new Float32Array([1, 1, 1]), metadata: { id: 2 } })
    const initialPointCloud = { material: {} }
    const nextPointCloud = { material: {} }
    createElectronPointCloud
      .mockReturnValueOnce(initialPointCloud)
      .mockReturnValueOnce(nextPointCloud)
    createNucleusMarker.mockReturnValue({ kind: 'nucleus' })
    const scene = {
      add: vi.fn(),
      remove: vi.fn(),
    }
    const controls = { update: vi.fn() }
    const camera = {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
    }
    const { createSceneController } = await import('../../src/scene/sceneController.js')
    const controller = createSceneController({
      scene,
      camera,
      controls,
      initialState: {
        selectedStateId: '1s',
        sampleCount: 1,
        pointSize: 0.1,
        opacity: 0.25,
        nucleusMode: 'visibleReference',
        seed: 3,
        truncation: { kind: 'spherical', maxRadius: 4 },
      },
    })

    controller.applyRegenerationUpdate({
      selectedStateId: '2s',
      sampleCount: 2,
      pointSize: 0.2,
      opacity: 0.5,
      nucleusMode: 'visibleReference',
      seed: 7,
      truncation: { kind: 'spherical', maxRadius: 6 },
    })

    expect(sampleHydrogenState).toHaveBeenCalledTimes(2)
    expect(scene.remove).toHaveBeenCalledWith(initialPointCloud)
    expect(scene.add).toHaveBeenCalledWith(nextPointCloud)
    expect(nextPointCloud.material.size).toBe(0.2)
    expect(nextPointCloud.material.opacity).toBe(0.5)
  })

  it('applies visual updates without resampling and can reset the camera', async () => {
    sampleHydrogenState.mockReturnValue({
      positions: new Float32Array([0, 0, 0]),
      metadata: { id: 1 },
    })
    const pointCloud = { material: {} }
    const initialNucleus = { kind: 'visible' }
    const physicalNucleus = { kind: 'physical' }
    createElectronPointCloud.mockReturnValue(pointCloud)
    createNucleusMarker
      .mockReturnValueOnce(initialNucleus)
      .mockReturnValueOnce(physicalNucleus)
    const scene = {
      add: vi.fn(),
      remove: vi.fn(),
    }
    const controls = { update: vi.fn() }
    const camera = {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
    }
    const { createSceneController } = await import('../../src/scene/sceneController.js')
    const controller = createSceneController({
      scene,
      camera,
      controls,
      initialState: {
        selectedStateId: '1s',
        sampleCount: 1,
        pointSize: 0.1,
        opacity: 0.25,
        nucleusMode: 'visibleReference',
        seed: 3,
        truncation: { kind: 'spherical', maxRadius: 4 },
      },
    })

    controller.applyVisualUpdate({
      selectedStateId: '1s',
      sampleCount: 1,
      pointSize: 0.33,
      opacity: 0.66,
      nucleusMode: 'physical',
      seed: 3,
      truncation: { kind: 'spherical', maxRadius: 4 },
    })
    controller.resetCamera()

    expect(sampleHydrogenState).toHaveBeenCalledOnce()
    expect(pointCloud.material.size).toBe(0.33)
    expect(pointCloud.material.opacity).toBe(0.66)
    expect(scene.remove).toHaveBeenCalledWith(initialNucleus)
    expect(scene.add).toHaveBeenCalledWith(physicalNucleus)
    expect(camera.position.set).toHaveBeenCalled()
    expect(camera.lookAt).toHaveBeenCalledWith(0, 0, 0)
    expect(controls.update).toHaveBeenCalled()
  })
})
