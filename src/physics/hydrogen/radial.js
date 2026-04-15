import { BOHR_RADIUS_A0 } from '../constants.js'

export function evaluateRadial1s(r) {
  return 2 * Math.exp(-r / BOHR_RADIUS_A0) / Math.pow(BOHR_RADIUS_A0, 1.5)
}

export function evaluateRadial2s(r) {
  const scaledRadius = r / BOHR_RADIUS_A0
  const prefactor = 1 / (2 * Math.sqrt(2) * Math.pow(BOHR_RADIUS_A0, 1.5))

  return prefactor * (2 - scaledRadius) * Math.exp(-scaledRadius / 2)
}
