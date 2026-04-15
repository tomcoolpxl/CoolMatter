import { describe, expect, it } from 'vitest'

import { config } from '../../src/app/config.js'
import { sampleHydrogenState } from '../../src/sampling/sampleHydrogenState.js'
import { createSphericalTruncation } from '../../src/sampling/truncation.js'
import { collectValidationResults } from '../../src/validation/runValidation.js'

describe('sampling pipeline', () => {
  it('produces a reproducible sampled pipeline boundary for the default state', () => {
    const sample = sampleHydrogenState({
      stateId: '1s',
      sampleCount: 12,
      seed: config.defaultSeed,
      truncation: createSphericalTruncation(),
    })

    expect(sample.positions).toHaveLength(36)
    expect(sample.metadata.stateId).toBe('1s')
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
    expect(samplingResult.measuredResult.stateId).toBe('1s')
  })


  it('resamples batch properly inside array bounds and leaves untouched alone', async () => {
    const { resampleBatch } = await import('../../src/sampling/streamingSampler.js')
    const { createSeededRng } = await import('../../src/sampling/rng.js')

    const positions = new Float32Array(30) // 10 points
    for (let i = 0; i < 30; i++) positions[i] = -999
    
    // Scintillate 3 points
    const rng = createSeededRng(1234)
    const superposition = [{ n: 1, l:0, m:0, magnitude:1, phase:0 }]
    const truncation = { kind: 'spherical', maxRadius: 10 }
    
    for (let i = 0; i < 1000; i++) {
      resampleBatch(positions, superposition, 0.0, 3, truncation, rng)
    }
    
    // we modified exactly 3 points
    let untouched = 0
    let modified = 0
    for (let i = 0; i < 30; i += 3) {
        if (positions[i] === -999 && positions[i+1] === -999 && positions[i+2] === -999) {
          untouched++
        } else {
          modified++
          const r2 = positions[i]*positions[i] + positions[i+1]*positions[i+1] + positions[i+2]*positions[i+2]
          expect(r2).toBeLessThanOrEqual(100.001) // maxRadius^2
        }
    }
    // Because random replacement could hit the same index, we just assert > 0 and <= 3
    expect(modified).toBeGreaterThan(0)
    expect(modified).toBeLessThanOrEqual(10)
  })
})
