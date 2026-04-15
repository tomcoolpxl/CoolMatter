import { describe, expect, it, vi } from 'vitest'

import { createControlPanel } from '../../src/ui/controlPanel.js'

describe('control panel', () => {
  it('creates the required controls and routes updates to the correct handlers', () => {
    const regenerationUpdates = []
    const visualUpdates = []
    const resetCamera = vi.fn()
    const documentRef = createFakeDocument()
    const panel = createControlPanel({
      state: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }
        ],
        sampleCount: 20000,
        pointSize: 0.04,
        opacity: 0.2,
        nucleusMode: 'visibleReference',
        seed: 12345,
        truncation: { kind: 'spherical', maxRadius: 12 },
        isPlaying: false,
        timeScale: 1.0,
        time: 0.0
      },
      diagnostics: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }
        ],
        sampleCount: 20000,
        seed: 12345,
        truncationRadius: 12,
        latestSampleStateId: '1s',
        latestSampleAttemptCount: 44,
        validationStatus: 'Offline validation required before signoff',
        validationCheckCount: 18,
        validationCommand: 'npm run validate',
      },
      onRegenerationUpdate(update) {
        regenerationUpdates.push(update)
      },
      onVisualUpdate(update) {
        visualUpdates.push(update)
      },
      onResetCamera: resetCamera,
      documentRef,
    })

    panel.controls.sampleCountInput.value = '1500'
    panel.controls.sampleCountInput.dispatch('change')
    panel.controls.pointSizeInput.value = '0.12'
    panel.controls.pointSizeInput.dispatch('input')
    panel.controls.opacityInput.value = '0.45'
    panel.controls.opacityInput.dispatch('input')
    panel.controls.nucleusModeSelect.value = 'physical'
    panel.controls.nucleusModeSelect.dispatch('change')
    panel.controls.seedInput.value = '77'
    panel.controls.seedInput.dispatch('change')
    panel.controls.resetCameraButton.dispatch('click')
    
    // Test the new superposition mixer and play settings
    panel.controls.playPauseBtn.dispatch('click')
    panel.controls.timeScaleInput.value = '2.5'
    panel.controls.timeScaleInput.dispatch('input')
    
    panel.controls.addNInput.value = '2'
    panel.controls.addLInput.value = '1'
    panel.controls.addMInput.value = '0'
    panel.controls.addComponentBtn.dispatch('click')

    expect(panel.element.className).toBe('control-panel')
    expect(regenerationUpdates).toEqual([
      { sampleCount: 1500 },
      { seed: 77 },
      { superposition: [ { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }, { n: 2, l: 1, m: 0, magnitude: 1, phase: 0 } ]}
    ])
    expect(visualUpdates).toEqual([
      { pointSize: 0.12 },
      { opacity: 0.45 },
      { nucleusMode: 'physical' },
      { isPlaying: true },
      { timeScale: 2.5 },
    ])
    expect(resetCamera).toHaveBeenCalledOnce()
    expect(panel.element.children.some((child) => child.textContent === 'Drag to orbit, right-drag or WASD to pan, and scroll to zoom.')).toBe(true)
  })

  it('updates the diagnostics block when asked', () => {
    const panel = createControlPanel({
      state: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }
        ],
        sampleCount: 20000,
        pointSize: 0.04,
        opacity: 0.2,
        nucleusMode: 'visibleReference',
        seed: 12345,
        truncation: { kind: 'spherical', maxRadius: 12 },
      },
      diagnostics: {
        superposition: [
          { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 }
        ],
        sampleCount: 20000,
        seed: 12345,
        truncationRadius: 12,
        latestSampleStateId: '1s',
        latestSampleAttemptCount: 44,
        validationStatus: 'Offline validation required before signoff',
        validationCheckCount: 18,
        validationCommand: 'npm run validate',
      },
      onRegenerationUpdate() {},
      onVisualUpdate() {},
      onResetCamera() {},
      documentRef: createFakeDocument(),
    })

    panel.updateDiagnostics({
      superposition: [ { n: 2, l: 1, m: 0, magnitude: 1, phase: 0 } ],
      sampleCount: 1500,
      seed: 77,
      truncationRadius: 8,
      latestSampleStateId: '2s',
      latestSampleAttemptCount: 19,
      validationStatus: 'Offline validation required before signoff',
      validationCheckCount: 18,
      validationCommand: 'npm run validate',
    })

    const diagnosticsSection = panel.element.children.at(-1)
    const diagnosticsValues = diagnosticsSection.children[1].children

    expect(diagnosticsSection.className).toBe('diagnostics')
    expect(diagnosticsValues.some((child) => child.textContent === '|2,1,0⟩')).toBe(true)
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
    dispatch(type) {
      this.listeners[type]?.({ target: this })
    },
  }
}
