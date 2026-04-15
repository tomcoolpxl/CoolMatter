import { BOHR_RADIUS_A0, validationTolerances } from '../physics/constants.js'
import { getHydrogenState, hydrogenStates } from '../physics/hydrogen/states.js'
import { assert, assertApproxEqual } from '../utils/assert.js'

export function runNodeChecks() {
  return [
    ...Object.keys(hydrogenStates).map((stateId) => checkNodeMetadata(stateId)),
    check1sRadialBehavior(),
    check2sRadialBehavior(),
  ]
}

function checkNodeMetadata(stateId) {
  const state = getHydrogenState(stateId)
  const expectedNodeCount = state.n - state.l - 1

  assert(
    state.radialNodes.length === expectedNodeCount,
    `${stateId} radial node metadata should match n - l - 1`,
  )

  return {
    checkName: `node metadata (${stateId})`,
    stateId,
    tolerance: 0,
    measuredResult: {
      expectedNodeCount,
      radialNodes: state.radialNodes,
    },
    pass: true,
  }
}

function check1sRadialBehavior() {
  const state = getHydrogenState('1s')
  const probeRadii = [0.25, 1, 4].map((radius) => radius * BOHR_RADIUS_A0)
  const values = probeRadii.map((radius) => state.evaluateRadial(radius))

  for (const value of values) {
    assert(value > 0, '1s radial factor should remain positive')
  }

  return {
    checkName: 'radial behavior (1s)',
    stateId: '1s',
    tolerance: 0,
    measuredResult: {
      probeRadii,
      values,
    },
    pass: true,
  }
}

function check2sRadialBehavior() {
  const state = getHydrogenState('2s')
  const nodeRadius = state.radialNodes[0]
  const beforeNode = state.evaluateRadial(1.75 * BOHR_RADIUS_A0)
  const atNode = state.evaluateRadial(nodeRadius)
  const afterNode = state.evaluateRadial(2.25 * BOHR_RADIUS_A0)

  assert(beforeNode > 0, '2s radial factor should be positive before its radial node')
  assert(afterNode < 0, '2s radial factor should be negative after its radial node')
  assertApproxEqual(
    nodeRadius,
    2 * BOHR_RADIUS_A0,
    validationTolerances.nodeRadius,
    '2s radial node should be located at 2 a0',
  )
  assertApproxEqual(
    atNode,
    0,
    validationTolerances.nodeAmplitude,
    '2s radial factor should vanish at the radial node',
  )

  return {
    checkName: 'radial behavior (2s)',
    stateId: '2s',
    tolerance: validationTolerances.nodeAmplitude,
    measuredResult: {
      nodeRadius,
      beforeNode,
      atNode,
      afterNode,
    },
    pass: true,
  }
}
