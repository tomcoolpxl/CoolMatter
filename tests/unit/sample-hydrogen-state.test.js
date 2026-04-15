import { describe, expect, it } from 'vitest'

import { config } from '../../src/app/config.js'
import { sampleHydrogenState } from '../../src/sampling/sampleHydrogenState.js'
import { createSphericalTruncation } from '../../src/sampling/truncation.js'

describe('sampleHydrogenState', () => {
  it('returns metadata that matches the request inputs', () => {
    const truncation = createSphericalTruncation(8)
    const sample = sampleHydrogenState({
      stateId: '1s',
      sampleCount: 6,
      seed: 42,
      truncation,
    })

    expect(sample.positions).toBeInstanceOf(Float32Array)
    expect(sample.positions).toHaveLength(18)
    expect(sample.metadata).toMatchObject({
      method: 'truncated-radial-rejection-sampling',
      stateId: '1s',
      sampleCount: 6,
      seed: 42,
      truncation: {
        kind: 'spherical',
        maxRadius: 8,
      },
    })
    expect(sample.metadata.attemptCount).toBeGreaterThanOrEqual(6)
    expect(sample.metadata.radialProbabilityMax).toBeGreaterThan(0)
  })

  it('reproduces identical positions and metadata for the same seed', () => {
    const first = sampleHydrogenState({
      stateId: '2s',
      sampleCount: 5,
      seed: config.defaultSeed,
      truncation: createSphericalTruncation(),
    })
    const second = sampleHydrogenState({
      stateId: '2s',
      sampleCount: 5,
      seed: config.defaultSeed,
      truncation: createSphericalTruncation(),
    })

    expect(Array.from(first.positions)).toEqual(Array.from(second.positions))
    expect(second.metadata).toEqual(first.metadata)
  })

  it('keeps sampled positions within the truncation radius', () => {
    const sample = sampleHydrogenState({
      stateId: '1s',
      sampleCount: 10,
      seed: 123,
      truncation: createSphericalTruncation(5),
    })

    for (let index = 0; index < sample.positions.length; index += 3) {
      const x = sample.positions[index]
      const y = sample.positions[index + 1]
      const z = sample.positions[index + 2]
      const radius = Math.sqrt((x * x) + (y * y) + (z * z))

      expect(radius).toBeLessThanOrEqual(5.000001)
    }
  })
})
