import { config } from '../app/config.js'
import { createSeededRng } from '../sampling/rng.js'
import { createSphericalTruncation, describeTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

const RNG_SEQUENCE_LENGTH = 5

export function runDeterministicChecks() {
  return [
    checkDeterministicRngSequence(),
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

function collectFloats(rng, count) {
  const values = []

  for (let index = 0; index < count; index += 1) {
    values.push(rng.nextFloat())
  }

  return values
}
