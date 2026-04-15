import { describe, expect, it } from 'vitest'

import { config } from '../../src/app/config.js'
import { sampleHydrogenState } from '../../src/sampling/sampleHydrogenState.js'
import { createSphericalTruncation } from '../../src/sampling/truncation.js'
import { collectValidationResults } from '../../src/validation/runValidation.js'

describe('sampling pipeline', () => {
  it('produces a reproducible sampled pipeline boundary for the default state', () => {
    const sample = sampleHydrogenState({
      stateId: config.initialStateId,
      sampleCount: 12,
      seed: config.defaultSeed,
      truncation: createSphericalTruncation(),
    })

    expect(sample.positions).toHaveLength(36)
    expect(sample.metadata.stateId).toBe(config.initialStateId)
    expect(sample.metadata.sampleCount).toBe(12)
    expect(sample.metadata.attemptCount).toBeGreaterThanOrEqual(12)
  })

  it('exposes deterministic sampling in the aggregated validation pipeline', () => {
    const results = collectValidationResults()
    const samplingResult = results.find(
      (result) => result.checkName === 'deterministic sampling summary',
    )

    expect(samplingResult).toBeDefined()
    expect(samplingResult.pass).toBe(true)
    expect(samplingResult.measuredResult.sampleCount).toBe(4)
    expect(samplingResult.measuredResult.stateId).toBe(config.initialStateId)
  })

  it('exposes histogram validation in the aggregated validation pipeline', () => {
    const results = collectValidationResults()
    const histogramResult = results.find(
      (result) => result.checkName === 'radial histogram (1s)',
    )

    expect(histogramResult).toBeDefined()
    expect(histogramResult.pass).toBe(true)
    expect(histogramResult.measuredResult.sampleCount).toBe(6000)
    expect(histogramResult.measuredResult.maxBinError).toBeLessThanOrEqual(histogramResult.tolerance)
  })
})
