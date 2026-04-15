import { FULL_ROTATION_RADIANS } from '../physics/constants.js'
import { sphericalToCartesian } from '../physics/hydrogen/coordinates.js'
import { getHydrogenState } from '../physics/hydrogen/states.js'
import { createSeededRng } from './rng.js'
import {
  assertValidTruncation,
  createSphericalTruncation,
  describeTruncation,
} from './truncation.js'
import { assert } from '../utils/assert.js'

const RADIAL_SCAN_STEPS = 4096

export function sampleHydrogenState({
  stateId,
  sampleCount,
  seed,
  truncation = createSphericalTruncation(),
}) {
  const state = getHydrogenState(stateId)

  assert(state.l === 0 && state.m === 0, 'Phase 1 sampling only supports s states')
  assert(Number.isInteger(sampleCount), 'Sample count must be an integer')
  assert(sampleCount >= 0, 'Sample count must be non-negative')
  assertValidTruncation(truncation)

  const rng = createSeededRng(seed)
  const radialProbabilityMax = estimateRadialProbabilityMax(state, truncation.maxRadius)
  const positions = new Float32Array(sampleCount * 3)
  let attemptCount = 0

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const radius = sampleAcceptedRadius(state, truncation.maxRadius, radialProbabilityMax, rng, () => {
      attemptCount += 1
    })
    const sphericalDirection = sampleUniformDirection(rng)
    const cartesian = sphericalToCartesian(
      radius,
      sphericalDirection.theta,
      sphericalDirection.phi,
    )
    const offset = sampleIndex * 3

    positions[offset] = cartesian.x
    positions[offset + 1] = cartesian.y
    positions[offset + 2] = cartesian.z
  }

  return {
    positions,
    metadata: {
      method: 'truncated-radial-rejection-sampling',
      stateId: state.id,
      sampleCount,
      seed,
      truncation: describeTruncation(truncation),
      radialProbabilityMax,
      attemptCount,
    },
  }
}

function sampleAcceptedRadius(state, maxRadius, radialProbabilityMax, rng, onAttempt) {
  while (true) {
    onAttempt()

    const candidateRadius = rng.nextFloat() * maxRadius
    const acceptanceLevel = rng.nextFloat() * radialProbabilityMax

    if (acceptanceLevel <= evaluateRadialProbabilityDensity(state, candidateRadius)) {
      return candidateRadius
    }
  }
}

function sampleUniformDirection(rng) {
  const phi = FULL_ROTATION_RADIANS * rng.nextFloat()
  const cosTheta = 1 - (2 * rng.nextFloat())
  const theta = Math.acos(cosTheta)

  return { theta, phi }
}

function estimateRadialProbabilityMax(state, maxRadius) {
  let maxValue = 0

  for (let step = 0; step < RADIAL_SCAN_STEPS; step += 1) {
    const radius = ((step + 0.5) / RADIAL_SCAN_STEPS) * maxRadius
    const value = evaluateRadialProbabilityDensity(state, radius)

    if (value > maxValue) {
      maxValue = value
    }
  }

  assert(maxValue > 0, 'Radial probability maximum must be positive within the truncation domain')

  return maxValue
}

function evaluateRadialProbabilityDensity(state, radius) {
  const radial = state.evaluateRadial(radius)

  return radius * radius * radial * radial
}
