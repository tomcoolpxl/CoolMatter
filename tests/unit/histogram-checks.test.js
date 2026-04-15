import { describe, expect, it } from 'vitest'

import { runHistogramChecks } from '../../src/validation/histogramChecks.js'

describe('histogram validation', () => {
  it('returns passing radial histogram checks for the supported states', () => {
    const results = runHistogramChecks()

    expect(results).toHaveLength(2)
    expect(results.every((result) => result.pass)).toBe(true)
    expect(results.every((result) => result.measuredResult.sampleCount === 6000)).toBe(true)
    expect(results.every((result) => result.measuredResult.binCount === 12)).toBe(true)
    expect(results.every((result) => result.measuredResult.maxBinError <= result.tolerance)).toBe(true)
  })

  it('returns normalized observed and expected histogram bins', () => {
    const result = runHistogramChecks()[0]
    const observedTotal = result.measuredResult.observedBins.reduce((sum, value) => sum + value, 0)
    const expectedTotal = result.measuredResult.expectedBins.reduce((sum, value) => sum + value, 0)

    expect(observedTotal).toBeCloseTo(1, 12)
    expect(expectedTotal).toBeCloseTo(1, 12)
  })
})
