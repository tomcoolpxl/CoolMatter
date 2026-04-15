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
        selectedStateId: '1s',
        sampleCount: 20000,
        pointSize: 0.04,
        opacity: 0.2,
        nucleusMode: 'visibleReference',
        seed: 12345,
        truncation: { kind: 'spherical', maxRadius: 12 },
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

    panel.controls.stateSelect.value = '2s'
    panel.controls.stateSelect.dispatch('change')
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

    expect(panel.element.className).toBe('control-panel')
    expect(regenerationUpdates).toEqual([
      { selectedStateId: '2s' },
      { sampleCount: 1500 },
      { seed: 77 },
    ])
    expect(visualUpdates).toEqual([
      { pointSize: 0.12 },
      { opacity: 0.45 },
      { nucleusMode: 'physical' },
    ])
    expect(resetCamera).toHaveBeenCalledOnce()
  })
})

function createFakeDocument() {
  return {
    createElement(tagName) {
      return createFakeElement(tagName)
    },
  }
}

function createFakeElement(tagName) {
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
    append(...children) {
      this.children.push(...children)
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener
    },
    dispatch(type) {
      this.listeners[type]?.({ target: this })
    },
  }
}
