import { config } from '../app/config.js'
import { FOUR_PI, validationTolerances } from '../physics/constants.js'
import { evaluateDensitySpherical } from '../physics/hydrogen/density.js'
import { hydrogenStates } from '../physics/hydrogen/states.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
import { createSphericalTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

const HISTOGRAM_BIN_COUNT = 12
const HISTOGRAM_SAMPLE_COUNT = 6000
const INTEGRATION_STEPS_PER_BIN = 1000

export function runHistogramChecks() {
  return Object.keys(hydrogenStates).map((stateId) => checkHistogramForState(stateId))
}

function checkHistogramForState(stateId) {
  const truncation = createSphericalTruncation(config.defaultTruncationRadius)
  const sample = sampleHydrogenState({
    stateId,
    sampleCount: HISTOGRAM_SAMPLE_COUNT,
    seed: config.defaultSeed,
    truncation,
  })
  const observed = buildObservedHistogram(sample.positions, truncation.maxRadius)
  const expected = buildExpectedHistogram(stateId, truncation.maxRadius)
  const maxBinError = getMaxBinError(observed, expected)

  assert(
    maxBinError <= validationTolerances.histogramBinFrequency,
    `${stateId} sampled radial histogram should match the expected truncated structure`,
  )

  return {
    checkName: `radial histogram (${stateId})`,
    stateId,
    tolerance: validationTolerances.histogramBinFrequency,
    measuredResult: {
      sampleCount: HISTOGRAM_SAMPLE_COUNT,
      seed: config.defaultSeed,
      radialCutoff: truncation.maxRadius,
      binCount: HISTOGRAM_BIN_COUNT,
      maxBinError,
      observedBins: observed,
      expectedBins: expected,
    },
    pass: true,
  }
}

function buildObservedHistogram(positions, maxRadius) {
  const counts = new Array(HISTOGRAM_BIN_COUNT).fill(0)
  const binWidth = maxRadius / HISTOGRAM_BIN_COUNT
  const sampleCount = positions.length / 3

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index]
    const y = positions[index + 1]
    const z = positions[index + 2]
    const radius = Math.sqrt((x * x) + (y * y) + (z * z))
    const binIndex = Math.min(
      HISTOGRAM_BIN_COUNT - 1,
      Math.floor(radius / binWidth),
    )

    counts[binIndex] += 1
  }

  return counts.map((count) => count / sampleCount)
}

function buildExpectedHistogram(stateId, maxRadius) {
  const masses = []
  let totalMass = 0

  for (let binIndex = 0; binIndex < HISTOGRAM_BIN_COUNT; binIndex += 1) {
    const start = (binIndex / HISTOGRAM_BIN_COUNT) * maxRadius
    const end = ((binIndex + 1) / HISTOGRAM_BIN_COUNT) * maxRadius
    const mass = integrateRadialMass(stateId, start, end)

    masses.push(mass)
    totalMass += mass
  }

  return masses.map((mass) => mass / totalMass)
}

function integrateRadialMass(stateId, start, end) {
  const deltaR = (end - start) / INTEGRATION_STEPS_PER_BIN
  let integral = 0

  for (let step = 0; step < INTEGRATION_STEPS_PER_BIN; step += 1) {
    const radius = start + ((step + 0.5) * deltaR)
    const density = evaluateDensitySpherical(stateId, radius, 0, 0)

    integral += FOUR_PI * radius * radius * density * deltaR
  }

  return integral
}

function getMaxBinError(observed, expected) {
  let maxError = 0

  for (let index = 0; index < observed.length; index += 1) {
    const error = Math.abs(observed[index] - expected[index])

    if (error > maxError) {
      maxError = error
    }
  }

  return maxError
}
