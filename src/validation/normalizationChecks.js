import { config } from '../app/config.js'
import { FOUR_PI, validationTolerances } from '../physics/constants.js'
import { evaluateDensitySpherical } from '../physics/hydrogen/density.js'
import { hydrogenStates } from '../physics/hydrogen/states.js'
import { assertApproxEqual } from '../utils/assert.js'

const RADIAL_STEPS = 20000

export function runNormalizationChecks() {
  return Object.keys(hydrogenStates).map((stateId) => {
    const radialCutoff = config.defaultTruncationRadius
    const estimate = estimateNormalization(stateId, radialCutoff)
    const expected = getExpectedTruncatedNormalization(stateId, radialCutoff)

    assertApproxEqual(
      estimate,
      expected,
      validationTolerances.normalizationEstimate,
      `${stateId} normalization estimate should match the expected truncated mass`,
    )

    return {
      checkName: `normalization (${stateId})`,
      stateId,
      tolerance: validationTolerances.normalizationEstimate,
      measuredResult: {
        normalizationEstimate: estimate,
        expectedNormalization: expected,
        radialCutoff,
        radialSteps: RADIAL_STEPS,
      },
      pass: true,
    }
  })
}

function estimateNormalization(stateId, radialCutoff) {
  const deltaR = radialCutoff / RADIAL_STEPS
  let integral = 0

  for (let step = 0; step < RADIAL_STEPS; step += 1) {
    const r = (step + 0.5) * deltaR
    const density = evaluateDensitySpherical(stateId, r, 0, 0)
    integral += FOUR_PI * r * r * density * deltaR
  }

  return integral
}

function getExpectedTruncatedNormalization(stateId, radialCutoff) {
  if (stateId === '1s') {
    return 1 - Math.exp(-2 * radialCutoff) * (
      (2 * radialCutoff * radialCutoff)
      + (2 * radialCutoff)
      + 1
    )
  }

  if (stateId === '2s') {
    return 1 - (
      Math.exp(-radialCutoff) * (
        Math.pow(radialCutoff, 4)
        + (4 * radialCutoff * radialCutoff)
        + (8 * radialCutoff)
        + 8
      )
    ) / 8
  }

  throw new Error(`No truncated normalization reference implemented for ${stateId}`)
}
