import { config } from '../app/config.js'
import { createSeededRng } from '../sampling/rng.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
import { createSphericalTruncation, describeTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

const RNG_SEQUENCE_LENGTH = 5

export function runDeterministicChecks() {
  return [
    checkDeterministicRngSequence(),
    checkDeterministicSamplingSummary(),
    checkDefaultTruncationDescription(),
  ]
}

function checkDeterministicRngSequence() {
  const rngA = createSeededRng(config.defaultSeed)
  const rngB = createSeededRng(config.defaultSeed)
  const sequenceA = collectFloats(rngA, RNG_SEQUENCE_LENGTH)
  const sequenceB = collectFloats(rngB, RNG_SEQUENCE_LENGTH)

  assert(
    JSON.stringify(sequenceA) === JSON.stringify(sequenceB),
    'Same seed should reproduce the same RNG sequence',
  )

  return {
    checkName: 'deterministic rng sequence',
    tolerance: 0,
    measuredResult: {
      seed: config.defaultSeed,
      sequence: sequenceA,
    },
    pass: true,
  }
}

function checkDefaultTruncationDescription() {
  const truncation = createSphericalTruncation()
  const description = describeTruncation(truncation)

  return {
    checkName: 'default truncation description',
    tolerance: 0,
    measuredResult: {
      truncation: description,
    },
    pass: true,
  }
}

function checkDeterministicSamplingSummary() {
  const truncation = createSphericalTruncation()
  const sampleA = sampleHydrogenState({
    stateId: '1s',
    sampleCount: 4,
    seed: config.defaultSeed,
    truncation,
  })
  const sampleB = sampleHydrogenState({
    stateId: '1s',
    sampleCount: 4,
    seed: config.defaultSeed,
    truncation,
  })
  const positionsA = Array.from(sampleA.positions)
  const positionsB = Array.from(sampleB.positions)

  assert(
    JSON.stringify(positionsA) === JSON.stringify(positionsB),
    'Same seed should reproduce the same sampled positions',
  )
  assert(
    JSON.stringify(sampleA.metadata) === JSON.stringify(sampleB.metadata),
    'Same seed should reproduce the same sampling metadata',
  )

  return {
    checkName: 'deterministic sampling summary',
    tolerance: 0,
    measuredResult: {
      stateId: sampleA.metadata.stateId,
      seed: sampleA.metadata.seed,
      sampleCount: sampleA.metadata.sampleCount,
      attemptCount: sampleA.metadata.attemptCount,
      firstPosition: positionsA.slice(0, 3),
    },
    pass: true,
  }
}

function collectFloats(rng, count) {
  const values = []

  for (let index = 0; index < count; index += 1) {
    values.push(rng.nextFloat())
  }

  return values
}
