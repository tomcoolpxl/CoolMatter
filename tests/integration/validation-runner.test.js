import { describe, expect, it } from 'vitest'

import {
  assertValidationPassed,
  collectValidationResults,
  summarizeValidationResults,
} from '../../src/validation/runValidation.js'

describe('validation runner', () => {
  it('executes the full scientific validation pipeline successfully', () => {
    const results = collectValidationResults()

    expect(results).toHaveLength(18)
    expect(results.every((result) => result.pass)).toBe(true)

    const normalization2s = results.find(
      (result) => result.checkName === 'normalization (2s)',
    )
    expect(normalization2s.measuredResult.expectedNormalization).toBeLessThan(1)
    expect(normalization2s.measuredResult.radialCutoff).toBe(12)
    expect(results.some((result) => result.checkName === 'deterministic rng sequence')).toBe(true)
    expect(results.some((result) => result.checkName === 'deterministic sampling summary')).toBe(true)
    expect(results.some((result) => result.checkName === 'radial histogram (1s)')).toBe(true)
    expect(results.some((result) => result.checkName === 'radial histogram (2s)')).toBe(true)
    expect(results.some((result) => result.checkName === 'invalid truncation failure')).toBe(true)
  })

  it('fails summaries that contain any failed check result', () => {
    const summary = summarizeValidationResults([
      { checkName: 'good', pass: true },
      { checkName: 'bad', pass: false },
    ])

    expect(summary).toEqual({
      totalChecks: 2,
      passedChecks: 1,
      failedChecks: ['bad'],
    })
    expect(() => assertValidationPassed(summary)).toThrow('Validation checks failed: bad')
  })
})
