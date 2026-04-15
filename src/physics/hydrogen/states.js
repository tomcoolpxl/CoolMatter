import { BOHR_RADIUS_A0 } from '../constants.js'
import { evaluateRadial1s, evaluateRadial2s } from './radial.js'

export const hydrogenStates = {
  '1s': {
    id: '1s',
    n: 1,
    l: 0,
    m: 0,
    label: 'Hydrogen 1s',
    radialNodes: [],
    evaluateRadial: evaluateRadial1s,
  },
  '2s': {
    id: '2s',
    n: 2,
    l: 0,
    m: 0,
    label: 'Hydrogen 2s',
    radialNodes: [2 * BOHR_RADIUS_A0],
    evaluateRadial: evaluateRadial2s,
  },
}

export function getHydrogenState(stateId) {
  const state = hydrogenStates[stateId]

  if (!state) {
    throw new Error(`Unsupported hydrogen state: ${stateId}`)
  }

  return state
}
