import { describe, expect, it } from 'vitest'

import { BOHR_RADIUS_A0 } from '../../src/physics/constants.js'
import {
  evaluateRadial1s,
  evaluateRadial2s,
} from '../../src/physics/hydrogen/radial.js'
import { getHydrogenState } from '../../src/physics/hydrogen/states.js'

describe('radial hydrogen formulas', () => {
  it('keeps 1s positive and monotonically decaying over sample radii', () => {
    const near = evaluateRadial1s(0.25 * BOHR_RADIUS_A0)
    const middle = evaluateRadial1s(1 * BOHR_RADIUS_A0)
    const far = evaluateRadial1s(4 * BOHR_RADIUS_A0)

    expect(near).toBeGreaterThan(0)
    expect(middle).toBeGreaterThan(0)
    expect(far).toBeGreaterThan(0)
    expect(near).toBeGreaterThan(middle)
    expect(middle).toBeGreaterThan(far)
  })

  it('changes sign once for 2s at its documented radial node', () => {
    const state = getHydrogenState('2s')

    expect(evaluateRadial2s(1.75 * BOHR_RADIUS_A0)).toBeGreaterThan(0)
    expect(evaluateRadial2s(state.radialNodes[0])).toBeCloseTo(0, 12)
    expect(evaluateRadial2s(2.25 * BOHR_RADIUS_A0)).toBeLessThan(0)
  })
})
