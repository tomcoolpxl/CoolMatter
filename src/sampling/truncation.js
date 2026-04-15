import { config } from '../app/config.js'
import { assert } from '../utils/assert.js'

export function createSphericalTruncation(maxRadius = config.defaultTruncationRadius) {
  const truncation = {
    kind: 'spherical',
    maxRadius,
  }

  assertValidTruncation(truncation)

  return truncation
}

export function assertValidTruncation(truncation) {
  assert(typeof truncation === 'object' && truncation !== null, 'Truncation must be an object')
  assert(truncation.kind === 'spherical', 'Only spherical truncation is supported in Phase 1')
  assert(Number.isFinite(truncation.maxRadius), 'Truncation maxRadius must be finite')
  assert(truncation.maxRadius > 0, 'Truncation maxRadius must be greater than zero')
}

export function isRadiusWithinTruncation(radius, truncation) {
  assert(Number.isFinite(radius), 'Radius must be finite')
  assert(radius >= 0, 'Radius must be non-negative')
  assertValidTruncation(truncation)

  return radius <= truncation.maxRadius
}

export function describeTruncation(truncation) {
  assertValidTruncation(truncation)

  return {
    kind: truncation.kind,
    maxRadius: truncation.maxRadius,
  }
}
