import { describe, expect, it } from 'vitest'

import { config } from '../../src/app/config.js'
import { createElectronPointCloud } from '../../src/renderables/createElectronPointCloud.js'
import { createNucleusMarker } from '../../src/renderables/createNucleusMarker.js'
import {
  createElectronPointMaterial,
  createNucleusMaterial,
} from '../../src/renderables/materials.js'

describe('renderables', () => {
  it('creates point-cloud and nucleus materials from config defaults', () => {
    const pointMaterial = createElectronPointMaterial()
    const nucleusMaterial = createNucleusMaterial()

    expect(pointMaterial.isPointsMaterial).toBe(true)
    expect(pointMaterial.size).toBe(config.defaultPointSize)
    expect(pointMaterial.opacity).toBe(config.defaultOpacity)
    expect(pointMaterial.color.getHex()).toBe(config.electronColor)

    expect(nucleusMaterial.isMeshStandardMaterial).toBe(true)
    expect(nucleusMaterial.color.getHex()).toBe(config.nucleusColor)
  })

  it('creates an electron point cloud from prepared Cartesian positions only', () => {
    const positions = new Float32Array([0, 0, 0, 1, 2, 3])
    const pointCloud = createElectronPointCloud(positions)

    expect(pointCloud.isPoints).toBe(true)
    expect(pointCloud.name).toBe('electronPointCloud')
    expect(pointCloud.geometry.getAttribute('position').array).toBe(positions)
    expect(pointCloud.geometry.getAttribute('position').count).toBe(2)
  })

  it('creates nucleus markers for both scale modes at the origin', () => {
    const physical = createNucleusMarker('physical')
    const visibleReference = createNucleusMarker('visibleReference')

    expect(physical.isMesh).toBe(true)
    expect(physical.userData.nucleusMode).toBe('physical')
    expect(physical.geometry.parameters.radius).toBe(config.physicalNucleusRadius)
    expect(visibleReference.geometry.parameters.radius).toBe(config.visibleReferenceNucleusRadius)
    expect(visibleReference.position.length()).toBe(0)
  })
})
