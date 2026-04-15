import { config } from '../app/config.js'
import {
  assertValidTruncation,
  createSphericalTruncation,
  isRadiusWithinTruncation,
} from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

export function runTruncationChecks() {
  return [
    checkRadiusMembership(),
    checkInvalidTruncationFailure(),
  ]
}

function checkRadiusMembership() {
  const truncation = createSphericalTruncation(config.defaultTruncationRadius)
  const insideRadius = config.defaultTruncationRadius - 0.5
  const outsideRadius = config.defaultTruncationRadius + 0.5

  assert(
    isRadiusWithinTruncation(insideRadius, truncation),
    'Radius inside the cutoff should be accepted',
  )
  assert(
    !isRadiusWithinTruncation(outsideRadius, truncation),
    'Radius outside the cutoff should be rejected',
  )

  return {
    checkName: 'truncation radius membership',
    tolerance: 0,
    measuredResult: {
      truncation,
      insideRadius,
      outsideRadius,
    },
    pass: true,
  }
}

function checkInvalidTruncationFailure() {
  const invalidTruncation = {
    kind: 'spherical',
    maxRadius: 0,
  }

  let message = ''

  try {
    assertValidTruncation(invalidTruncation)
  } catch (error) {
    message = error.message
  }

  assert(
    message === 'Truncation maxRadius must be greater than zero',
    'Invalid truncation should fail fast with a clear message',
  )

  return {
    checkName: 'invalid truncation failure',
    tolerance: 0,
    measuredResult: {
      message,
    },
    pass: true,
  }
}
