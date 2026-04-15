import { cartesianToSpherical } from './coordinates.js'
import { evaluateAngularFactor00 } from './angular.js'
import { getHydrogenState } from './states.js'

export function evaluatePsiSpherical(stateId, r, theta, phi) {
  const state = getHydrogenState(stateId)
  const radial = state.evaluateRadial(r)
  const angular = evaluateAngularFactor00(theta, phi)

  return radial * angular
}

export function evaluateDensitySpherical(stateId, r, theta, phi) {
  const psi = evaluatePsiSpherical(stateId, r, theta, phi)

  return psi * psi
}

export function evaluateDensityCartesian(stateId, x, y, z) {
  const spherical = cartesianToSpherical(x, y, z)

  return evaluateDensitySpherical(
    stateId,
    spherical.r,
    spherical.theta,
    spherical.phi,
  )
}
