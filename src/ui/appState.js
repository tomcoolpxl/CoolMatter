import { config } from '../app/config.js'
import { createSphericalTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'

const REGENERATION_KEYS = ['superposition', 'sampleCount', 'seed', 'truncation']
const VISUAL_KEYS = ['pointSize', 'opacity', 'nucleusMode', 'isPlaying', 'timeScale', 'scintillationRate', 'renderMode']

export function createAppState() {
  let state = {
    superposition: [...config.initialSuperposition],
    sampleCount: config.initialSampleCount,
    pointSize: config.defaultPointSize,
    opacity: config.defaultOpacity,
    nucleusMode: config.initialNucleusMode,
    seed: config.defaultSeed,
    time: config.initialTime,
    isPlaying: config.initialIsPlaying,
    timeScale: config.initialTimeScale,
    scintillationRate: config.initialScintillationRate ?? 0,
    renderMode: config.initialRenderMode ?? 'point_cloud',
    truncation: createSphericalTruncation(config.defaultTruncationRadius),
  }

  return {
    getState() {
      return cloneState(state)
    },
    setTime(time) {
      if (Number.isFinite(time)) {
        state.time = time
      }
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
    superposition: state.superposition.map((comp) => ({ ...comp })),
    truncation: { ...state.truncation },
  }
}

function sanitizeRegenerationState(candidateState, previousState) {
  return {
    ...candidateState,
    superposition: sanitizeSuperposition(candidateState.superposition, previousState.superposition),
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
    isPlaying: Boolean(candidateState.isPlaying ?? previousState.isPlaying),
    timeScale: sanitizeFiniteNumber(
      candidateState.timeScale,
      previousState.timeScale,
      -100, // min timeScale
      100, // max timeScale
    ),
    scintillationRate: sanitizeFiniteNumber(
      candidateState.scintillationRate,
      previousState.scintillationRate,
      config.minScintillationRate ?? 0,
      config.maxScintillationRate ?? 10,
    ),
    renderMode: ['point_cloud', 'volumetric'].includes(candidateState.renderMode) 
      ? candidateState.renderMode 
      : previousState.renderMode,
  }
}

function sanitizeSuperposition(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback
  }
  const valid = value.filter(comp => 
    typeof comp === 'object' && comp !== null &&
    Number.isInteger(comp.n) && comp.n >= 1 &&
    Number.isInteger(comp.l) && comp.l >= 0 && comp.l < comp.n &&
    Number.isInteger(comp.m) && Math.abs(comp.m) <= comp.l &&
    Number.isFinite(comp.magnitude) && comp.magnitude >= 0 &&
    Number.isFinite(comp.phase)
  )
  if (valid.length === 0) return fallback

  // Normalize. Reject zero-norm mixes because they produce zero density everywhere
  // and break rejection-sampling bounds.
  let sumSq = 0
  for (const comp of valid) sumSq += comp.magnitude * comp.magnitude
  if (sumSq <= 0) {
    return fallback
  }

  const invNorm = 1.0 / Math.sqrt(sumSq)
  for (const comp of valid) comp.magnitude *= invNorm
  return valid
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
