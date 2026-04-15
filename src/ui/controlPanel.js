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

  const stateSelect = createSelectControl(documentRef, {
    id: 'state-select',
    labelText: 'State',
    value: state.selectedStateId,
    options: config.supportedStateIds.map((stateId) => ({
      value: stateId,
      text: stateId,
    })),
  })
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
  const diagnosticsSection = documentRef.createElement('section')
  const diagnosticsHeading = documentRef.createElement('h2')
  const diagnosticsBody = documentRef.createElement('dl')

  resetCameraButton.type = 'button'
  resetCameraButton.textContent = 'Reset camera'
  diagnosticsSection.className = 'diagnostics'
  diagnosticsHeading.textContent = 'Diagnostics'
  diagnosticsBody.className = 'diagnostics-grid'

  stateSelect.input.addEventListener('change', () => {
    onRegenerationUpdate({
      selectedStateId: stateSelect.input.value,
    })
  })
  sampleCountInput.input.addEventListener('change', () => {
    onRegenerationUpdate({
      sampleCount: Number(sampleCountInput.input.value),
    })
  })
  pointSizeInput.input.addEventListener('input', () => {
    onVisualUpdate({
      pointSize: Number(pointSizeInput.input.value),
    })
  })
  opacityInput.input.addEventListener('input', () => {
    onVisualUpdate({
      opacity: Number(opacityInput.input.value),
    })
  })
  nucleusModeSelect.input.addEventListener('change', () => {
    onVisualUpdate({
      nucleusMode: nucleusModeSelect.input.value,
    })
  })
  seedInput.input.addEventListener('change', () => {
    onRegenerationUpdate({
      seed: Number(seedInput.input.value),
    })
  })
  resetCameraButton.addEventListener('click', () => {
    onResetCamera()
  })

  element.append(
    stateSelect.field,
    sampleCountInput.field,
    pointSizeInput.field,
    opacityInput.field,
    nucleusModeSelect.field,
    seedInput.field,
    resetCameraButton,
    diagnosticsSection,
  )
  diagnosticsSection.append(diagnosticsHeading, diagnosticsBody)
  updateDiagnostics(diagnosticsBody, diagnostics, documentRef)

  return {
    element,
    controls: {
      stateSelect: stateSelect.input,
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
  }
}

function updateDiagnostics(container, diagnostics, documentRef) {
  container.replaceChildren(
    ...createDiagnosticsEntries(documentRef, [
      ['State', diagnostics.selectedStateId],
      ['Sample count', String(diagnostics.sampleCount)],
      ['Seed', String(diagnostics.seed)],
      ['Truncation radius', String(diagnostics.truncationRadius)],
      ['Last sample state', diagnostics.latestSampleStateId],
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
  input.min = String(min)
  input.step = String(step)

  if (max !== undefined) {
    input.max = String(max)
  }

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
