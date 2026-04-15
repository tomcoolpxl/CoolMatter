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
      state = sanitizeRegenerationState({
        ...state,
        ...partialState,
        truncation: partialState.truncation ? { ...partialState.truncation } : { ...state.truncation },
      }, state)

      return cloneState(state)
    },
    applyVisualUpdate(partialState) {
      assertAllowedKeys(partialState, VISUAL_KEYS, 'visual')
      state = sanitizeVisualState({
        ...state,
        ...partialState,
      }, state)

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

function sanitizeRegenerationState(candidateState, previousState) {
  return {
    ...candidateState,
    selectedStateId: sanitizeStateId(candidateState.selectedStateId, previousState.selectedStateId),
    sampleCount: sanitizeInteger(
      candidateState.sampleCount,
      previousState.sampleCount,
      config.minSampleCount,
    ),
    seed: sanitizeInteger(
      candidateState.seed,
      previousState.seed,
      config.minSeed,
      config.maxSeed,
    ),
    truncation: sanitizeTruncation(candidateState.truncation, previousState.truncation),
  }
}

function sanitizeVisualState(candidateState, previousState) {
  return {
    ...candidateState,
    pointSize: sanitizeFiniteNumber(
      candidateState.pointSize,
      previousState.pointSize,
      config.minPointSize,
    ),
    opacity: sanitizeFiniteNumber(
      candidateState.opacity,
      previousState.opacity,
      config.minOpacity,
      config.maxOpacity,
    ),
    nucleusMode: sanitizeNucleusMode(candidateState.nucleusMode, previousState.nucleusMode),
  }
}

function sanitizeStateId(value, fallback) {
  return config.supportedStateIds.includes(value) ? value : fallback
}

function sanitizeNucleusMode(value, fallback) {
  return config.supportedNucleusModes.includes(value) ? value : fallback
}

function sanitizeInteger(value, fallback, min, max = Infinity) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return clamp(Math.round(value), min, max)
}

function sanitizeFiniteNumber(value, fallback, min, max = Infinity) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return clamp(value, min, max)
}

function sanitizeTruncation(value, fallback) {
  if (
    typeof value !== 'object'
    || value === null
    || value.kind !== 'spherical'
    || !Number.isFinite(value.maxRadius)
    || value.maxRadius <= 0
  ) {
    return { ...fallback }
  }

  return { kind: 'spherical', maxRadius: value.maxRadius }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
