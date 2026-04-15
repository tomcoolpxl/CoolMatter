import { config } from '../app/config.js'
import { createSphericalTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

const REGENERATION_KEYS = ['selectedStateId', 'sampleCount', 'seed', 'truncation']
const VISUAL_KEYS = ['pointSize', 'opacity', 'nucleusMode']

export function createAppState() {
  let state = {
    selectedStateId: config.initialStateId,
    sampleCount: config.initialSampleCount,
    pointSize: config.defaultPointSize,
    opacity: config.defaultOpacity,
    nucleusMode: config.initialNucleusMode,
    seed: config.defaultSeed,
    truncation: createSphericalTruncation(config.defaultTruncationRadius),
  }

  return {
    getState() {
      return cloneState(state)
    },
    applyRegenerationUpdate(partialState) {
      assertAllowedKeys(partialState, REGENERATION_KEYS, 'regeneration')
      state = {
        ...state,
        ...partialState,
        truncation: partialState.truncation ? { ...partialState.truncation } : { ...state.truncation },
      }

      return cloneState(state)
    },
    applyVisualUpdate(partialState) {
      assertAllowedKeys(partialState, VISUAL_KEYS, 'visual')
      state = {
        ...state,
        ...partialState,
      }

      return cloneState(state)
    },
  }
}

function assertAllowedKeys(partialState, allowedKeys, updateKind) {
  for (const key of Object.keys(partialState)) {
    assert(
      allowedKeys.includes(key),
      `Unsupported ${updateKind} update field: ${key}`,
    )
  }
}

function cloneState(state) {
  return {
    ...state,
    truncation: { ...state.truncation },
  }
}
