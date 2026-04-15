import { describe, expect, it, vi } from 'vitest'

import { createControlPanel } from '../../src/ui/controlPanel.js'

describe('control panel', () => {
  it('creates guided state, motion, appearance, and advanced controls that route updates', () => {
    const regenerationUpdates = []
    const visualUpdates = []
    const resetCamera = vi.fn()
    const documentRef = createFakeDocument()
    const panel = createControlPanel({
      state: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
        ],
        sampleCount: 20000,
        pointSize: 0.04,
        opacity: 0.2,
        nucleusMode: 'visibleReference',
        seed: 12345,
        truncation: { kind: 'spherical', maxRadius: 12 },
        isPlaying: false,
        timeScale: 1.0,
        time: 0.0,
        scintillationRate: 0.05,
        renderMode: 'point_cloud',
      },
      diagnostics: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
        ],
        sampleCount: 20000,
        seed: 12345,
        truncationRadius: 12,
        latestSampleStateId: '1s',
        latestSampleAttemptCount: 44,
        validationStatus: 'Scientific validation available',
        validationCheckCount: 19,
        validationCommand: 'npm run validate',
      },
      onRegenerationUpdate(update) {
        regenerationUpdates.push(update)
        return {
          superposition: update.superposition ?? [{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }],
          sampleCount: update.sampleCount ?? 20000,
          pointSize: 0.04,
          opacity: 0.2,
          nucleusMode: 'visibleReference',
          seed: update.seed ?? 12345,
          truncation: { kind: 'spherical', maxRadius: 12 },
          isPlaying: false,
          timeScale: 1.0,
          time: 0.0,
          scintillationRate: 0.05,
          renderMode: 'point_cloud',
        }
      },
      onVisualUpdate(update) {
        visualUpdates.push(update)
        return {
          superposition: [{ n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }],
          sampleCount: 20000,
          pointSize: update.pointSize ?? 0.04,
          opacity: update.opacity ?? 0.2,
          nucleusMode: update.nucleusMode ?? 'visibleReference',
          seed: 12345,
          truncation: { kind: 'spherical', maxRadius: 12 },
          isPlaying: update.isPlaying ?? false,
          timeScale: update.timeScale ?? 1.0,
          time: 0.0,
          scintillationRate: update.scintillationRate ?? 0.05,
          renderMode: update.renderMode ?? 'point_cloud',
        }
      },
      onResetCamera: resetCamera,
      documentRef,
    })

    panel.controls.presetButtons[1].dispatch('click')
    panel.controls.pointSizeInput.value = '0.12'
    panel.controls.pointSizeInput.dispatch('input')
    panel.controls.opacityInput.value = '0.45'
    panel.controls.opacityInput.dispatch('input')
    panel.controls.seedInput.value = '77'
    panel.controls.seedInput.dispatch('change')
    panel.controls.playPauseGroup.buttons[1].dispatch('click')
    panel.controls.timeScaleInput.value = '2.5'
    panel.controls.timeScaleInput.dispatch('input')
    panel.controls.renderModeGroup.buttons[1].dispatch('click')
    panel.controls.nucleusModeGroup.buttons[1].dispatch('click')
    panel.controls.resetCameraButton.dispatch('click')
    panel.controls.addStateButtons[1].dispatch('click')

    expect(panel.element.className).toBe('control-panel')
    expect(regenerationUpdates).toEqual([
      { superposition: [{ n: 2, l: 0, m: 0, magnitude: 1, phase: 0 }] },
      { seed: 77 },
      {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
          { n: 2, l: 0, m: 0, magnitude: 1, phase: 0 },
        ],
      },
    ])
    expect(visualUpdates).toEqual([
      { pointSize: 0.12 },
      { opacity: 0.45 },
      { isPlaying: true },
      { timeScale: 2.5 },
      { renderMode: 'volumetric' },
      { nucleusMode: 'physical' },
    ])
    expect(resetCamera).toHaveBeenCalledOnce()
    expect(panel.element.children.some((child) => child.className === 'advanced-panel')).toBe(true)
  })

  it('updates the diagnostics block when asked', () => {
    const panel = createControlPanel({
      state: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
        ],
        sampleCount: 20000,
        pointSize: 0.04,
        opacity: 0.2,
        nucleusMode: 'visibleReference',
        seed: 12345,
        truncation: { kind: 'spherical', maxRadius: 12 },
        isPlaying: false,
        timeScale: 1.0,
        time: 0.0,
        scintillationRate: 0.05,
        renderMode: 'point_cloud',
      },
      diagnostics: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
        ],
        sampleCount: 20000,
        seed: 12345,
        truncationRadius: 12,
        latestSampleStateId: '1s',
        latestSampleAttemptCount: 44,
        validationStatus: 'Scientific validation available',
        validationCheckCount: 19,
        validationCommand: 'npm run validate',
      },
      onRegenerationUpdate() {},
      onVisualUpdate() {},
      onResetCamera() {},
      documentRef: createFakeDocument(),
    })

    panel.updateDiagnostics({
      superposition: [{ n: 2, l: 0, m: 0, magnitude: 1, phase: 0 }],
      sampleCount: 1500,
      seed: 77,
      truncationRadius: 8,
      latestSampleStateId: '2s',
      latestSampleAttemptCount: 19,
      validationStatus: 'Checks available',
      validationCheckCount: 19,
      validationCommand: 'npm run validate',
    })

    const advancedSection = panel.controls.advancedSection
    const diagnosticsSection = advancedSection.children[1].children[2]
    const diagnosticsValues = diagnosticsSection.children[1].children

    expect(diagnosticsSection.className).toBe('diagnostics')
    expect(diagnosticsValues.some((child) => child.textContent === '2s')).toBe(true)
    expect(diagnosticsValues.some((child) => child.textContent === '19')).toBe(true)
  })
})

function createFakeDocument() {
  return {
    createElement(tagName) {
      return createFakeElement(tagName, this)
    },
  }
}

function createFakeElement(tagName, ownerDocument) {
  return {
    tagName,
    children: [],
    listeners: {},
    className: '',
    textContent: '',
    value: '',
    type: '',
    id: '',
    min: '',
    max: '',
    step: '',
    open: false,
    ownerDocument,
    append(...children) {
      this.children.push(...children)
    },
    replaceChildren(...children) {
      this.children = []
      this.append(...children)
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener
    },
    setAttribute(name, value) {
      this[name] = value
    },
    dispatch(type) {
      this.listeners[type]?.({ target: this })
    },
  }
}
