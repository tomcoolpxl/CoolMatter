import { describe, expect, it } from 'vitest'

import { config } from '../../src/app/config.js'
import { createSeededRng } from '../../src/sampling/rng.js'
import {
  createSphericalTruncation,
  describeTruncation,
  isRadiusWithinTruncation,
} from '../../src/sampling/truncation.js'
import { runDeterministicChecks } from '../../src/validation/deterministicChecks.js'
import { runTruncationChecks } from '../../src/validation/truncationChecks.js'

describe('rng and truncation modules', () => {
  it('reproduces the same sequence for the same seed', () => {
    const rngA = createSeededRng(config.defaultSeed)
    const rngB = createSeededRng(config.defaultSeed)
    const valuesA = [rngA.nextFloat(), rngA.nextFloat(), rngA.nextFloat()]
    const valuesB = [rngB.nextFloat(), rngB.nextFloat(), rngB.nextFloat()]

    expect(valuesA).toEqual(valuesB)
  })

  it('produces different sequences for different seeds', () => {
    const rngA = createSeededRng(config.defaultSeed)
    const rngB = createSeededRng(config.defaultSeed + 1)
    const valuesA = [rngA.nextFloat(), rngA.nextFloat(), rngA.nextFloat()]
    const valuesB = [rngB.nextFloat(), rngB.nextFloat(), rngB.nextFloat()]

    expect(valuesA).not.toEqual(valuesB)
  })

  it('uses an explicit spherical truncation description', () => {
    const truncation = createSphericalTruncation()

    expect(describeTruncation(truncation)).toEqual({
      kind: 'spherical',
      maxRadius: config.defaultTruncationRadius,
    })
    expect(isRadiusWithinTruncation(config.defaultTruncationRadius, truncation)).toBe(true)
    expect(isRadiusWithinTruncation(config.defaultTruncationRadius + 0.01, truncation)).toBe(false)
  })

  it('returns passing deterministic and truncation validation checks', () => {
    const deterministicResults = runDeterministicChecks()
    const truncationResults = runTruncationChecks()

    expect(deterministicResults.every((result) => result.pass)).toBe(true)
    expect(truncationResults.every((result) => result.pass)).toBe(true)
  })
})
