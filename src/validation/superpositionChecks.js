import { config } from '../app/config.js'
import { FOUR_PI, validationTolerances } from '../physics/constants.js'
import { createComplex, expImaginary, magnitudeSq } from '../utils/complex.js'
import { evaluateSuperpositionDensity } from '../physics/hydrogen/superposition.js'
import { assertApproxEqual } from '../utils/assert.js'

const RADIAL_STEPS = 20000

export function runSuperpositionChecks() {
  const radialCutoff = config.defaultTruncationRadius
  
  // 50/50 1s and 2s superposition
  const normFactor = 1 / Math.sqrt(2)
  const components = [
    { n: 1, l: 0, m: 0, weight: createComplex(normFactor, 0) },
    { n: 2, l: 0, m: 0, weight: createComplex(normFactor, 0) }
  ]

  const estimateT0 = estimateSuperpositionTotal(components, radialCutoff, 0)
  const estimateT10 = estimateSuperpositionTotal(components, radialCutoff, 10)

  // Probabilities should hold constant across time evolution
  assertApproxEqual(
    estimateT10,
    estimateT0,
    validationTolerances.normalizationEstimate,
    `Superposition total probability should be preserved at time t=10`
  )

  return [
    {
      checkName: 'superposition probability preservation',
      stateId: '1s+2s',
      tolerance: validationTolerances.normalizationEstimate,
      measuredResult: {
        estimateAtT0: estimateT0,
        estimateAtT10: estimateT10,
        diff: Math.abs(estimateT0 - estimateT10)
      },
      pass: true,
    }
  ]
}

function estimateSuperpositionTotal(components, radialCutoff, t) {
  const deltaR = radialCutoff / RADIAL_STEPS
  let integral = 0

  for (let step = 0; step < RADIAL_STEPS; step += 1) {
    const r = (step + 0.5) * deltaR
    // Because 1s and 2s have l=0, m=0, the angular part integrates to 4pi exactly
    const density = evaluateSuperpositionDensity(components, r, 0, 0, t)
    integral += FOUR_PI * r * r * density * deltaR
  }

  return integral
}
