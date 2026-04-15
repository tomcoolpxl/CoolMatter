import { config } from '../app/config.js'

export function createControlPanel({
  state,
  diagnostics,
  onRegenerationUpdate,
  onVisualUpdate,
  onResetCamera,
  documentRef = document,
}) {
  const element = documentRef.createElement('aside')
  element.className = 'control-panel'

  // Playback & Timeline Controls
  const playbackSection = documentRef.createElement('section')
  const playbackHeading = documentRef.createElement('h3')
  playbackHeading.textContent = 'Playback & Timeline'

  const playPauseBtn = documentRef.createElement('button')
  playPauseBtn.type = 'button'
  playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play'

  const timeScaleInput = createNumberControl(documentRef, {
    id: 'time-scale-input',
    labelText: 'Time Scale',
    value: state.timeScale ?? 1.0,
    min: -10,
    max: 10,
    step: 0.1,
  })

  const timeReadout = documentRef.createElement('p')
  timeReadout.className = 'time-readout'
  timeReadout.textContent = `Time: ${(state.time ?? 0).toFixed(2)}`

  playbackSection.append(playbackHeading, playPauseBtn, timeScaleInput.field, timeReadout)

  playPauseBtn.addEventListener('click', () => {
    const isPlaying = playPauseBtn.textContent === 'Play'
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play'
    onVisualUpdate({ isPlaying })
  })

  timeScaleInput.input.addEventListener('input', () => {
    onVisualUpdate({ timeScale: Number(timeScaleInput.input.value) })
  })

  // Superposition Mixer
  const superpositionSection = documentRef.createElement('section')
  const superpositionHeading = documentRef.createElement('h3')
  superpositionHeading.textContent = 'Superposition Mixer'

  const componentsList = documentRef.createElement('ul')
  componentsList.className = 'superposition-list'
  
  let currentSuperposition = [...(state.superposition || [])]

  function renderSuperpositionList() {
    componentsList.replaceChildren()
    
    // Auto-Normalization logic
    const sumSq = currentSuperposition.reduce((sum, c) => sum + c.magnitude * c.magnitude, 0)
    
    currentSuperposition.forEach((comp, i) => {
      const li = documentRef.createElement('li')
      
      const normMag = sumSq > 0 ? (comp.magnitude / Math.sqrt(sumSq)) : 0
      const pct = (normMag * normMag * 100).toFixed(1)
      
      const label = documentRef.createElement('div')
      label.textContent = `|${comp.n}, ${comp.l}, ${comp.m}⟩ (${pct}%)`
      
      const magSlider = createNumberControl(documentRef, {
        id: `mag-${i}`,
        labelText: 'Mag',
        value: comp.magnitude,
        min: 0,
        max: 1,
        step: 0.01
      })
      const phaseSlider = createNumberControl(documentRef, {
        id: `phase-${i}`,
        labelText: 'Phase',
        value: comp.phase,
        min: 0,
        max: Math.PI * 2,
        step: 0.01
      })
      const removeBtn = documentRef.createElement('button')
      removeBtn.type = 'button'
      removeBtn.textContent = 'Remove'

      magSlider.input.addEventListener('input', () => {
        currentSuperposition[i].magnitude = Number(magSlider.input.value)
        onRegenerationUpdate({ superposition: currentSuperposition })
        renderSuperpositionList()
      })
      phaseSlider.input.addEventListener('input', () => {
        currentSuperposition[i].phase = Number(phaseSlider.input.value)
        onRegenerationUpdate({ superposition: currentSuperposition })
      })
      removeBtn.addEventListener('click', () => {
        currentSuperposition.splice(i, 1)
        onRegenerationUpdate({ superposition: currentSuperposition })
        renderSuperpositionList()
      })

      li.append(label, magSlider.field, phaseSlider.field, removeBtn)
      componentsList.append(li)
    })
  }

  const addCompDiv = documentRef.createElement('div')
  addCompDiv.className = 'add-component-grid'
  const nInput = createNumberControl(documentRef, { id: 'add-n', labelText: 'n (size)', value: 1, min: 1, step: 1 })
  const lInput = createNumberControl(documentRef, { id: 'add-l', labelText: 'l (shape)', value: 0, min: 0, step: 1 })
  const mInput = createNumberControl(documentRef, { id: 'add-m', labelText: 'm (tilt)', value: 0, step: 1 })
  const addBtn = documentRef.createElement('button')
  addBtn.type = 'button'
  addBtn.textContent = 'Add Component'

  addBtn.addEventListener('click', () => {
    const n = Number(nInput.input.value)
    const l = Number(lInput.input.value)
    const m = Number(mInput.input.value)

    if (n > 0 && l >= 0 && l < n && m >= -l && m <= l) {
      currentSuperposition.push({ n, l, m, magnitude: 1, phase: 0 })
      onRegenerationUpdate({ superposition: currentSuperposition })
      renderSuperpositionList()
    }
  })

  addCompDiv.append(nInput.field, lInput.field, mInput.field, addBtn)
  superpositionSection.append(superpositionHeading, componentsList, addCompDiv)

  renderSuperpositionList()

  const sampleCountInput = createNumberControl(documentRef, {
    id: 'sample-count-input',
    labelText: 'Sample count',
    value: state.sampleCount,
    min: 1,
    step: 1,
  })
  const pointSizeInput = createNumberControl(documentRef, {
    id: 'point-size-input',
    labelText: 'Point size',
    value: state.pointSize,
    min: 0.001,
    step: 0.01,
  })
  const opacityInput = createNumberControl(documentRef, {
    id: 'opacity-input',
    labelText: 'Opacity',
    value: state.opacity,
    min: 0,
    max: 1,
    step: 0.01,
  })
  const nucleusModeSelect = createSelectControl(documentRef, {
    id: 'nucleus-mode-select',
    labelText: 'Nucleus mode',
    value: state.nucleusMode,
    options: [
      { value: 'visibleReference', text: 'Visible reference (not to scale)' },
      { value: 'physical', text: 'Physical scale' },
    ],
  })
  const seedInput = createNumberControl(documentRef, {
    id: 'seed-input',
    labelText: 'Seed',
    value: state.seed,
    min: 0,
    step: 1,
  })
  
  const resetCameraButton = documentRef.createElement('button')
  const controlsHelp = documentRef.createElement('p')
  const diagnosticsSection = documentRef.createElement('section')
  const diagnosticsHeading = documentRef.createElement('h2')
  const diagnosticsBody = documentRef.createElement('dl')

  resetCameraButton.type = 'button'
  resetCameraButton.textContent = 'Reset camera'
  controlsHelp.className = 'controls-help'
  controlsHelp.textContent = config.controlsHelpText
  diagnosticsSection.className = 'diagnostics'
  diagnosticsHeading.textContent = 'Diagnostics'
  diagnosticsBody.className = 'diagnostics-grid'

  sampleCountInput.input.addEventListener('change', () => {
    onRegenerationUpdate({ sampleCount: Number(sampleCountInput.input.value) })
  })
  pointSizeInput.input.addEventListener('input', () => {
    onVisualUpdate({ pointSize: Number(pointSizeInput.input.value) })
  })
  opacityInput.input.addEventListener('input', () => {
    onVisualUpdate({ opacity: Number(opacityInput.input.value) })
  })
  nucleusModeSelect.input.addEventListener('change', () => {
    onVisualUpdate({ nucleusMode: nucleusModeSelect.input.value })
  })
  seedInput.input.addEventListener('change', () => {
    onRegenerationUpdate({ seed: Number(seedInput.input.value) })
  })
  resetCameraButton.addEventListener('click', () => {
    onResetCamera()
  })

  element.append(
    playbackSection,
    superpositionSection,
    sampleCountInput.field,
    pointSizeInput.field,
    opacityInput.field,
    nucleusModeSelect.field,
    seedInput.field,
    controlsHelp,
    resetCameraButton,
    diagnosticsSection,
  )
  diagnosticsSection.append(diagnosticsHeading, diagnosticsBody)
  updateDiagnostics(diagnosticsBody, diagnostics, documentRef)

  return {
    element,
    controls: {
      playPauseBtn,
      timeScaleInput: timeScaleInput.input,
      timeReadout,
      addNInput: nInput.input,
      addLInput: lInput.input,
      addMInput: mInput.input,
      addComponentBtn: addBtn,
      componentsList,
      sampleCountInput: sampleCountInput.input,
      pointSizeInput: pointSizeInput.input,
      opacityInput: opacityInput.input,
      nucleusModeSelect: nucleusModeSelect.input,
      seedInput: seedInput.input,
      resetCameraButton,
    },
    updateDiagnostics(nextDiagnostics) {
      updateDiagnostics(diagnosticsBody, nextDiagnostics, documentRef)
    },
    updateTimeText(time) {
      timeReadout.textContent = `Time: ${time.toFixed(2)}`
    }
  }
}

function updateDiagnostics(container, diagnostics, documentRef) {
  const stateStr = diagnostics.superposition 
    ? diagnostics.superposition.map(s => `|${s.n},${s.l},${s.m}⟩`).join(' + ')
    : diagnostics.selectedStateId || ''
    
  container.replaceChildren(
    ...createDiagnosticsEntries(documentRef, [
      ['State(s)', stateStr],
      ['Sample count', String(diagnostics.sampleCount)],
      ['Seed', String(diagnostics.seed)],
      ['Truncation radius', String(diagnostics.truncationRadius)],
      ['Last sample attempts', String(diagnostics.latestSampleAttemptCount)],
      ['Validation', `${diagnostics.validationStatus} (${diagnostics.validationCheckCount} checks)`],
      ['Validation command', diagnostics.validationCommand],
    ]),
  )
}

function createDiagnosticsEntries(documentRef, entries) {
  return entries.flatMap(([termText, descriptionText]) => {
    const term = documentRef.createElement('dt')
    const description = documentRef.createElement('dd')

    term.textContent = termText
    description.textContent = descriptionText

    return [term, description]
  })
}

function createNumberControl(documentRef, {
  id,
  labelText,
  value,
  min,
  max,
  step,
}) {
  const field = documentRef.createElement('label')
  const text = documentRef.createElement('span')
  const input = documentRef.createElement('input')

  field.htmlFor = id
  text.textContent = labelText
  input.id = id
  input.type = 'number'
  input.value = String(value)
  if (min !== undefined) input.min = String(min)
  if (step !== undefined) input.step = String(step)
  if (max !== undefined) input.max = String(max)

  field.append(text, input)

  return { field, input }
}

function createSelectControl(documentRef, {
  id,
  labelText,
  value,
  options,
}) {
  const field = documentRef.createElement('label')
  const text = documentRef.createElement('span')
  const input = documentRef.createElement('select')

  field.htmlFor = id
  text.textContent = labelText
  input.id = id

  for (const optionData of options) {
    const option = documentRef.createElement('option')
    option.value = optionData.value
    option.textContent = optionData.text
    option.selected = optionData.value === value
    input.append(option)
  }

  input.value = value
  field.append(text, input)

  return { field, input }
}
