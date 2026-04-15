import { describe, expect, it } from 'vitest'

import {
  evaluateDensityCartesian,
  evaluateDensitySpherical,
} from '../../src/physics/hydrogen/density.js'
import { getHydrogenState, hydrogenStates } from '../../src/physics/hydrogen/states.js'
import { runNodeChecks } from '../../src/validation/nodeChecks.js'
import { runNormalizationChecks } from '../../src/validation/normalizationChecks.js'

describe('density and validation modules', () => {
  it('keeps the state registry explicit and inspectable', () => {
    expect(Object.keys(hydrogenStates)).toEqual(['1s', '2s'])
    expect(getHydrogenState('1s').radialNodes).toEqual([])
    expect(getHydrogenState('2s').radialNodes).toEqual([2])
  })

  it('matches spherical and Cartesian density evaluation for the same point', () => {
    const sphericalDensity = evaluateDensitySpherical('2s', 1.5, Math.PI / 3, Math.PI / 4)
    const radialScale = 1.5 * Math.sin(Math.PI / 3)
    const cartesianDensity = evaluateDensityCartesian(
      '2s',
      radialScale * Math.cos(Math.PI / 4),
      radialScale * Math.sin(Math.PI / 4),
      1.5 * Math.cos(Math.PI / 3),
    )

    expect(sphericalDensity).toBeGreaterThanOrEqual(0)
    expect(cartesianDensity).toBeCloseTo(sphericalDensity, 12)
  })

  it('returns passing normalization checks with truncated reference mass recorded', () => {
    const results = runNormalizationChecks()

    expect(results).toHaveLength(2)
    expect(results.every((result) => result.pass)).toBe(true)

    const twoSResult = results.find((result) => result.stateId === '2s')
    expect(twoSResult.measuredResult.expectedNormalization).toBeLessThan(1)
    expect(twoSResult.measuredResult.radialCutoff).toBe(12)
  })

  it('returns passing node checks for 1s and 2s behavior', () => {
    const results = runNodeChecks()

    expect(results).toHaveLength(4)
    expect(results.every((result) => result.pass)).toBe(true)
    expect(results.some((result) => result.checkName === 'radial behavior (2s)')).toBe(true)
  })
})
