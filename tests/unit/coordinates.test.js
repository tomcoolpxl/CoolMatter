import { describe, expect, it } from 'vitest'

import {
  cartesianToSpherical,
  sphericalToCartesian,
} from '../../src/physics/hydrogen/coordinates.js'

describe('coordinate utilities', () => {
  it('pins the origin to a deterministic spherical representation', () => {
    expect(cartesianToSpherical(0, 0, 0)).toEqual({ r: 0, theta: 0, phi: 0 })
  })

  it('normalizes phi into the [0, 2pi) range', () => {
    const spherical = cartesianToSpherical(0, -2, 0)

    expect(spherical.phi).toBeGreaterThanOrEqual(0)
    expect(spherical.phi).toBeLessThan(2 * Math.PI)
  })

  it('round-trips a mixed-sign point through spherical coordinates', () => {
    const spherical = cartesianToSpherical(-1.25, 2.5, -3.75)
    const cartesian = sphericalToCartesian(spherical.r, spherical.theta, spherical.phi)

    expect(cartesian.x).toBeCloseTo(-1.25, 12)
    expect(cartesian.y).toBeCloseTo(2.5, 12)
    expect(cartesian.z).toBeCloseTo(-3.75, 12)
  })
})
