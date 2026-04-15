import { describe, expect, it } from 'vitest'

import { collectValidationResults } from '../../src/validation/runValidation.js'

describe('validation runner', () => {
  it('executes the full scientific validation pipeline successfully', () => {
    const results = collectValidationResults()

    expect(results).toHaveLength(11)
    expect(results.every((result) => result.pass)).toBe(true)

    const normalization2s = results.find(
      (result) => result.checkName === 'normalization (2s)',
    )
    expect(normalization2s.measuredResult.expectedNormalization).toBeLessThan(1)
    expect(normalization2s.measuredResult.radialCutoff).toBe(12)
  })
})
