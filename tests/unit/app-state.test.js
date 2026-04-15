import { describe, expect, it } from 'vitest'

import { createAppState } from '../../src/ui/appState.js'

describe('app state', () => {
  it('creates the expected initial state from config defaults', () => {
    const appState = createAppState()
    const state = appState.getState()

    expect(state.superposition).toEqual([{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }])
    expect(state.sampleCount).toBe(2000000)
    expect(state.pointSize).toBe(0.01)
    expect(state.opacity).toBe(0.11)
    expect(state.nucleusMode).toBe('physical')
    expect(state.isPlaying).toBe(false)
    expect(state.timeScale).toBe(1.0)
    expect(state.scintillationRate).toBe(0.05)
    expect(state.time).toBe(0.0)
    expect(state.seed).toBe(12345)
    expect(state.truncation).toEqual({
      kind: 'spherical',
      maxRadius: 12,
    })
  })

  it('updates regeneration fields without mutating visual fields', () => {
    const appState = createAppState()

    const state = appState.applyRegenerationUpdate({
      superposition: [{ n: 2, l: 0, m: 0, magnitude: 1, phase: 0 }],
      sampleCount: 1500,
      seed: 99,
    })

    expect(state.superposition).toEqual([{ n: 2, l: 0, m: 0, magnitude: 1, phase: 0 }])
    expect(state.sampleCount).toBe(1500)
    expect(state.seed).toBe(99)
    expect(state.pointSize).toBe(0.01)
    expect(state.opacity).toBe(0.11)
    expect(state.nucleusMode).toBe('physical')
  })

  it('updates visual fields without mutating regeneration fields', () => {
    const appState = createAppState()

    const state = appState.applyVisualUpdate({
      pointSize: 0.12,
      opacity: 0.45,
      nucleusMode: 'visibleReference',
      isPlaying: true,
      timeScale: 2.0,
      scintillationRate: 0.1,
    })

    expect(state.pointSize).toBe(0.12)
    expect(state.opacity).toBe(0.45)
    expect(state.nucleusMode).toBe('visibleReference')
    expect(state.isPlaying).toBe(true)
    expect(state.timeScale).toBe(2.0)
    expect(state.scintillationRate).toBe(0.1)
    expect(state.superposition).toEqual([{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }])
    expect(state.sampleCount).toBe(2000000)
    expect(state.seed).toBe(12345)
  })

  it('sanitizes invalid regeneration input instead of crashing state', () => {
    const appState = createAppState()

    const state = appState.applyRegenerationUpdate({
      superposition: 'bogus',
      sampleCount: Number.NaN,
      seed: -7,
      truncation: { kind: 'spherical', maxRadius: 0 },
    })

    expect(state.superposition).toEqual([{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }])
    expect(state.sampleCount).toBe(2000000)
    expect(state.seed).toBe(0)
    expect(state.truncation).toEqual({
      kind: 'spherical',
      maxRadius: 12,
    })
  })

  it('normalizes valid superpositions to unit total weight', () => {
    const appState = createAppState()

    const state = appState.applyRegenerationUpdate({
      superposition: [
        { n: 1, l: 0, m: 0, magnitude: 3, phase: 0 },
        { n: 2, l: 0, m: 0, magnitude: 4, phase: 1 },
      ],
    })

    expect(state.superposition[0].magnitude).toBeCloseTo(0.6)
    expect(state.superposition[1].magnitude).toBeCloseTo(0.8)
  })

  it('rejects zero-norm superpositions and keeps the previous valid state', () => {
    const appState = createAppState()

    appState.applyRegenerationUpdate({
      superposition: [
        { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
        { n: 2, l: 0, m: 0, magnitude: 1, phase: 0 },
      ],
    })

    const state = appState.applyRegenerationUpdate({
      superposition: [
        { n: 1, l: 0, m: 0, magnitude: 0, phase: 0 },
        { n: 2, l: 0, m: 0, magnitude: 0, phase: 0 },
      ],
    })

    expect(state.superposition).toHaveLength(2)
    expect(state.superposition[0]).toMatchObject({ n: 1, l: 0, m: 0, phase: 0 })
    expect(state.superposition[1]).toMatchObject({ n: 2, l: 0, m: 0, phase: 0 })
    expect(state.superposition[0].magnitude).toBeCloseTo(Math.SQRT1_2)
    expect(state.superposition[1].magnitude).toBeCloseTo(Math.SQRT1_2)
  })

  it('clamps visual input into valid ranges', () => {
    const appState = createAppState()

    const state = appState.applyVisualUpdate({
      pointSize: 0,
      opacity: 4,
      nucleusMode: 'invalid',
      scintillationRate: -1,
    })

    expect(state.pointSize).toBe(0.001)
    expect(state.opacity).toBe(1)
    expect(state.scintillationRate).toBe(0)
    expect(state.nucleusMode).toBe('physical')
  })
})
