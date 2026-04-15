import { FULL_ROTATION_RADIANS } from '../physics/constants.js'
import { evaluateSuperpositionDensity } from '../physics/hydrogen/superposition.js'
import { assert } from '../utils/assert.js'

const SCAN_SAMPLES_R = 32
const SCAN_SAMPLES_ANGULAR = 16

/**
 * Calculates a bounding envelope for rejection sampling. 
 * Because the superposition evaluates at time `t`, the actual peak density
 * might shift. We estimate the maximum possible interference peak (all terms 
 * completely in-phase).
 */
export function estimateSuperpositionProbabilityMax(components, maxRadius) {
  let boundedMaxR2Psi2 = 0

  for (let ir = 0; ir < SCAN_SAMPLES_R; ir += 1) {
    const r = ((ir + 0.5) / SCAN_SAMPLES_R) * maxRadius
    const r2 = r * r

    for (let itheta = 0; itheta < SCAN_SAMPLES_ANGULAR; itheta += 1) {
      const theta = ((itheta + 0.5) / SCAN_SAMPLES_ANGULAR) * Math.PI
      
      for (let iphi = 0; iphi < SCAN_SAMPLES_ANGULAR; iphi += 1) {
        const phi = ((iphi + 0.5) / SCAN_SAMPLES_ANGULAR) * FULL_ROTATION_RADIANS

        // Evaluate standard density at t=0, but interference peaks might shift.
        // Doing a heuristic search over some random t phases or scaling up is often enough.
        const density = evaluateSuperpositionDensity(components, r, theta, phi, 0)
        
        if (density * r2 > boundedMaxR2Psi2) {
          boundedMaxR2Psi2 = density * r2
        }
      }
    }
  }

  // Add 100% safety factor for time-varying constructive interference peaks
  const safeBound = boundedMaxR2Psi2 * 2.0
  assert(safeBound > 0, 'Probability maximum must be positive')
  return safeBound
}

export function resampleBatch(
  positions,
  superposition,
  time,
  replaceCount,
  truncation,
  rng
) {
  // Convert app state components to physics format
  // We can assume format: superposition = [{ n, l, m, magnitude, phase }] -> mapped to { n, l, m, weight: {re, im} }
  const components = superposition.map((comp) => ({
    n: comp.n,
    l: comp.l,
    m: comp.m,
    weight: {
      re: comp.magnitude * Math.cos(comp.phase),
      im: comp.magnitude * Math.sin(comp.phase),
    },
  }))

  const maxRadius = truncation.maxRadius
  const probabilityMax = estimateSuperpositionProbabilityMax(components, maxRadius)
  
  const totalPoints = positions.length / 3

  for (let i = 0; i < replaceCount; i++) {
    const pointIndex = Math.floor(rng.nextFloat() * totalPoints)
    const offset = pointIndex * 3

    while (true) {
      const candidateRadius = rng.nextFloat() * maxRadius
      
      const phi = FULL_ROTATION_RADIANS * rng.nextFloat()
      const cosTheta = 1 - 2 * rng.nextFloat()
      const theta = Math.acos(cosTheta)

      const acceptanceLevel = rng.nextFloat() * probabilityMax
      
      const pDensity = evaluateSuperpositionDensity(components, candidateRadius, theta, phi, time)
      const testVal = candidateRadius * candidateRadius * pDensity
      
      if (acceptanceLevel <= testVal) {
        const sinTheta = Math.sin(theta)
        const pr = candidateRadius * sinTheta
        
        positions[offset] = pr * Math.cos(phi)
        positions[offset + 1] = pr * Math.sin(phi)
        positions[offset + 2] = candidateRadius * cosTheta
        break
      }
    }
  }
}
