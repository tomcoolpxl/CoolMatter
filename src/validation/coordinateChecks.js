import { validationTolerances } from '../physics/constants.js'
import {
  cartesianToSpherical,
  sphericalToCartesian,
} from '../physics/hydrogen/coordinates.js'
import { assert, assertApproxEqual } from '../utils/assert.js'

export function runCoordinateChecks() {
  const checks = []

  checks.push(checkOriginHandling())

  for (const point of ROUND_TRIP_POINTS) {
    checks.push(checkRoundTrip(point))
  }

  return checks
}

function checkOriginHandling() {
  const spherical = cartesianToSpherical(0, 0, 0)

  assertApproxEqual(
    spherical.r,
    0,
    validationTolerances.originRadius,
    'Origin radius should remain zero',
  )
  assert(spherical.theta === 0, 'Origin theta should be pinned to 0')
  assert(spherical.phi === 0, 'Origin phi should be pinned to 0')

  return {
    checkName: 'origin handling',
    tolerance: validationTolerances.originRadius,
    measuredResult: spherical,
    pass: true,
  }
}

function checkRoundTrip(point) {
  const spherical = cartesianToSpherical(point.x, point.y, point.z)
  const reconstructed = sphericalToCartesian(
    spherical.r,
    spherical.theta,
    spherical.phi,
  )

  assertApproxEqual(
    reconstructed.x,
    point.x,
    validationTolerances.coordinateRoundTrip,
    `Round-trip x mismatch for ${point.label}`,
  )
  assertApproxEqual(
    reconstructed.y,
    point.y,
    validationTolerances.coordinateRoundTrip,
    `Round-trip y mismatch for ${point.label}`,
  )
  assertApproxEqual(
    reconstructed.z,
    point.z,
    validationTolerances.coordinateRoundTrip,
    `Round-trip z mismatch for ${point.label}`,
  )

  return {
    checkName: `coordinate round-trip (${point.label})`,
    tolerance: validationTolerances.coordinateRoundTrip,
    measuredResult: reconstructed,
    pass: true,
  }
}

const ROUND_TRIP_POINTS = [
  { label: 'axis-x', x: 1, y: 0, z: 0 },
  { label: 'axis-y', x: 0, y: -2, z: 0 },
  { label: 'axis-z', x: 0, y: 0, z: 3 },
  { label: 'quadrant-mixed', x: -1.25, y: 2.5, z: -3.75 },
]
