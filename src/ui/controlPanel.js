import { config } from '../app/config.js'

const MIX_PRESETS = [
  {
    id: 'preset-1s',
    title: '1s Ground',
    description: 'Compact, spherically symmetric ground state.',
    superposition: [
      { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
    ],
  },
  {
    id: 'preset-2s',
    title: '2s Excited',
    description: 'Excited s-state with a radial node.',
    superposition: [
      { n: 2, l: 0, m: 0, magnitude: 1, phase: 0 },
    ],
  },
  {
    id: 'preset-mix',
    title: '1s + 2s Mix',
    description: 'Balanced superposition for time-based interference.',
    superposition: [
      { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 },
      { n: 2, l: 0, m: 0, magnitude: 1, phase: 0 },
    ],
  },
]

const ADDABLE_STATES = [
  { id: '1s', label: 'Add 1s', component: { n: 1, l: 0, m: 0, magnitude: 1, phase: 0 } },
  { id: '2s', label: 'Add 2s', component: { n: 2, l: 0, m: 0, magnitude: 1, phase: 0 } },
]

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
  element.setAttribute?.('aria-label', 'Orbital controls')

  let currentState = cloneState(state)
  let currentDiagnostics = { ...diagnostics }

  const intro = documentRef.createElement('section')
  intro.className = 'panel-section panel-intro'

  const introEyebrow = documentRef.createElement('p')
  introEyebrow.className = 'section-eyebrow'
  introEyebrow.textContent = 'Explore'

  const introHeading = documentRef.createElement('h2')
  introHeading.textContent = 'Choose a starting orbital and refine it from there.'

  const introText = documentRef.createElement('p')
  introText.className = 'section-copy'
  introText.textContent = 'Start with a known state, then adjust motion and appearance while the viewer stays in frame.'

  intro.append(introEyebrow, introHeading, introText)

  const stateSection = createSection(documentRef, {
    eyebrow: 'State',
    title: 'Orbital mix',
    description: 'Presets get you started quickly. Component controls stay normalized automatically.',
  })
  const presetGrid = documentRef.createElement('div')
  presetGrid.className = 'preset-grid'
  const presetButtons = MIX_PRESETS.map((preset) => {
    const button = documentRef.createElement('button')
    button.type = 'button'
    button.className = 'preset-card'

    const title = documentRef.createElement('strong')
    title.textContent = preset.title

    const description = documentRef.createElement('span')
    description.textContent = preset.description

    button.append(title, description)
    button.addEventListener('click', () => {
      const nextState = onRegenerationUpdate({
        superposition: preset.superposition.map((component) => ({ ...component })),
      })
      syncState(nextState)
    })
    presetGrid.append(button)
    return { preset, button }
  })

  const activeMixSummary = documentRef.createElement('p')
  activeMixSummary.className = 'mix-summary'

  const addStateRow = documentRef.createElement('div')
  addStateRow.className = 'chip-row'
  const addStateButtons = ADDABLE_STATES.map((stateOption) => {
    const button = documentRef.createElement('button')
    button.type = 'button'
    button.className = 'chip-button'
    button.textContent = stateOption.label
    button.addEventListener('click', () => {
      const nextSuperposition = currentState.superposition.map((component) => ({ ...component }))
      nextSuperposition.push({ ...stateOption.component })
      const nextState = onRegenerationUpdate({ superposition: nextSuperposition })
      syncState(nextState)
    })
    addStateRow.append(button)
    return button
  })

  const componentsList = documentRef.createElement('div')
  componentsList.className = 'component-list'

  const customStateDetails = documentRef.createElement('details')
  customStateDetails.className = 'advanced-builder'
  const customStateSummary = documentRef.createElement('summary')
  customStateSummary.textContent = 'Build a custom state component'

  const customStateGrid = documentRef.createElement('div')
  customStateGrid.className = 'advanced-builder-grid'
  const nInput = createNumberControl(documentRef, {
    id: 'add-n',
    labelText: 'n',
    value: 1,
    min: 1,
    step: 1,
  })
  const lInput = createNumberControl(documentRef, {
    id: 'add-l',
    labelText: 'l',
    value: 0,
    min: 0,
    step: 1,
  })
  const mInput = createNumberControl(documentRef, {
    id: 'add-m',
    labelText: 'm',
    value: 0,
    step: 1,
  })
  const customStateButton = documentRef.createElement('button')
  customStateButton.type = 'button'
  customStateButton.textContent = 'Add custom component'
  customStateButton.addEventListener('click', () => {
    const n = Number(nInput.input.value)
    const l = Number(lInput.input.value)
    const m = Number(mInput.input.value)

    if (n > 0 && l >= 0 && l < n && m >= -l && m <= l) {
      const nextSuperposition = currentState.superposition.map((component) => ({ ...component }))
      nextSuperposition.push({ n, l, m, magnitude: 1, phase: 0 })
      const nextState = onRegenerationUpdate({ superposition: nextSuperposition })
      syncState(nextState)
    }
  })
  customStateGrid.append(nInput.field, lInput.field, mInput.field, customStateButton)
  customStateDetails.append(customStateSummary, customStateGrid)

  stateSection.content.append(presetGrid, activeMixSummary, addStateRow, componentsList, customStateDetails)

  const motionSection = createSection(documentRef, {
    eyebrow: 'Motion',
    title: 'Time and playback',
    description: 'Use time controls to scrub static states or animate a superposition.',
  })
  const playPauseGroup = createSegmentedButtonGroup(documentRef, {
    labelText: 'Playback',
    options: [
      { value: 'paused', text: 'Pause' },
      { value: 'playing', text: 'Play' },
    ],
    value: currentState.isPlaying ? 'playing' : 'paused',
    onChange(value) {
      const nextState = onVisualUpdate({ isPlaying: value === 'playing' })
      syncState(nextState)
    },
  })
  const timeScaleControl = createRangeControl(documentRef, {
    id: 'time-scale-input',
    labelText: 'Time scale',
    min: -4,
    max: 4,
    step: 0.1,
    value: currentState.timeScale ?? 1,
    formatValue(value) {
      return `${Number(value).toFixed(1)}x`
    },
  })
  timeScaleControl.input.addEventListener('input', () => {
    timeScaleControl.value.textContent = `${Number(timeScaleControl.input.value).toFixed(1)}x`
    const nextState = onVisualUpdate({ timeScale: Number(timeScaleControl.input.value) })
    syncState(nextState)
  })
  const timeReadout = documentRef.createElement('p')
  timeReadout.className = 'time-readout'
  timeReadout.setAttribute?.('aria-live', 'polite')
  timeReadout.textContent = formatTimeText(currentState.time ?? 0)
  motionSection.content.append(playPauseGroup.field, timeScaleControl.field, timeReadout)

  const appearanceSection = createSection(documentRef, {
    eyebrow: 'Appearance',
    title: 'Visual treatment',
    description: 'Tune the render style without changing the underlying probability model.',
  })
  const renderModeGroup = createSegmentedButtonGroup(documentRef, {
    labelText: 'Render mode',
    options: [
      { value: 'point_cloud', text: 'Point Cloud' },
      { value: 'volumetric', text: 'Volumetric' },
    ],
    value: currentState.renderMode ?? 'point_cloud',
    onChange(value) {
      const nextState = onVisualUpdate({ renderMode: value })
      syncState(nextState)
    },
  })
  const nucleusModeGroup = createSegmentedButtonGroup(documentRef, {
    labelText: 'Nucleus scale',
    options: [
      { value: 'visibleReference', text: 'Visible Reference' },
      { value: 'physical', text: 'Physical Scale' },
    ],
    value: currentState.nucleusMode,
    onChange(value) {
      const nextState = onVisualUpdate({ nucleusMode: value })
      syncState(nextState)
    },
  })
  const pointSizeControl = createRangeControl(documentRef, {
    id: 'point-size-input',
    labelText: 'Point size',
    min: config.minPointSize,
    max: 0.16,
    step: 0.001,
    value: currentState.pointSize,
    formatValue(value) {
      return Number(value).toFixed(3)
    },
  })
  pointSizeControl.input.addEventListener('input', () => {
    pointSizeControl.value.textContent = Number(pointSizeControl.input.value).toFixed(3)
    const nextState = onVisualUpdate({ pointSize: Number(pointSizeControl.input.value) })
    syncState(nextState)
  })
  const opacityControl = createRangeControl(documentRef, {
    id: 'opacity-input',
    labelText: 'Opacity',
    min: config.minOpacity,
    max: config.maxOpacity,
    step: 0.01,
    value: currentState.opacity,
    formatValue(value) {
      return `${Math.round(Number(value) * 100)}%`
    },
  })
  opacityControl.input.addEventListener('input', () => {
    opacityControl.value.textContent = `${Math.round(Number(opacityControl.input.value) * 100)}%`
    const nextState = onVisualUpdate({ opacity: Number(opacityControl.input.value) })
    syncState(nextState)
  })
  const scintillationControl = createRangeControl(documentRef, {
    id: 'scintillation-rate-input',
    labelText: 'Scintillation',
    min: config.minScintillationRate ?? 0,
    max: config.maxScintillationRate ?? 1,
    step: 0.01,
    value: currentState.scintillationRate ?? 0,
    formatValue(value) {
      return `${Math.round(Number(value) * 100)}%`
    },
  })
  scintillationControl.input.addEventListener('input', () => {
    scintillationControl.value.textContent = `${Math.round(Number(scintillationControl.input.value) * 100)}%`
    const nextState = onVisualUpdate({ scintillationRate: Number(scintillationControl.input.value) })
    syncState(nextState)
  })
  appearanceSection.content.append(
    renderModeGroup.field,
    nucleusModeGroup.field,
    pointSizeControl.field,
    opacityControl.field,
    scintillationControl.field,
  )

  const helpSection = createSection(documentRef, {
    eyebrow: 'Viewer',
    title: 'Camera',
    description: config.controlsHelpText,
  })
  const resetCameraButton = documentRef.createElement('button')
  resetCameraButton.type = 'button'
  resetCameraButton.className = 'secondary-action'
  resetCameraButton.textContent = 'Reset camera'
  resetCameraButton.addEventListener('click', () => {
    onResetCamera()
  })
  helpSection.content.append(resetCameraButton)

  const advancedSection = documentRef.createElement('details')
  advancedSection.className = 'advanced-panel'
  const advancedSummary = documentRef.createElement('summary')
  advancedSummary.textContent = 'Advanced diagnostics and reproducibility'
  const advancedContent = documentRef.createElement('div')
  advancedContent.className = 'advanced-panel-content'

  const sampleCountInput = createNumberControl(documentRef, {
    id: 'sample-count-input',
    labelText: 'Sample count',
    value: currentState.sampleCount,
    min: 1,
    step: 1,
  })
  sampleCountInput.input.addEventListener('change', () => {
    const nextState = onRegenerationUpdate({ sampleCount: Number(sampleCountInput.input.value) })
    syncState(nextState)
  })

  const seedInput = createNumberControl(documentRef, {
    id: 'seed-input',
    labelText: 'Seed',
    value: currentState.seed,
    min: 0,
    step: 1,
  })
  seedInput.input.addEventListener('change', () => {
    const nextState = onRegenerationUpdate({ seed: Number(seedInput.input.value) })
    syncState(nextState)
  })

  const diagnosticsSection = documentRef.createElement('section')
  diagnosticsSection.className = 'diagnostics'
  const diagnosticsHeading = documentRef.createElement('h3')
  diagnosticsHeading.textContent = 'Diagnostics'
  const diagnosticsBody = documentRef.createElement('dl')
  diagnosticsBody.className = 'diagnostics-grid'
  diagnosticsSection.append(diagnosticsHeading, diagnosticsBody)
  advancedContent.append(sampleCountInput.field, seedInput.field, diagnosticsSection)
  advancedSection.append(advancedSummary, advancedContent)

  element.append(
    intro,
    stateSection.element,
    motionSection.element,
    appearanceSection.element,
    helpSection.element,
    advancedSection,
  )

  function renderComponentCards() {
    componentsList.replaceChildren()

    const totalWeight = Math.sqrt(currentState.superposition.reduce((sum, component) => {
      return sum + (component.magnitude * component.magnitude)
    }, 0))

    currentState.superposition.forEach((component, index) => {
      const card = documentRef.createElement('article')
      card.className = 'component-card'

      const header = documentRef.createElement('div')
      header.className = 'component-card-header'

      const titleWrap = documentRef.createElement('div')
      const title = documentRef.createElement('h3')
      title.textContent = formatComponentLabel(component)
      const meta = documentRef.createElement('p')
      meta.className = 'component-meta'
      meta.textContent = `n=${component.n}, l=${component.l}, m=${component.m}`
      titleWrap.append(title, meta)

      const removeButton = documentRef.createElement('button')
      removeButton.type = 'button'
      removeButton.className = 'danger-action'
      removeButton.textContent = 'Remove'
      removeButton.addEventListener('click', () => {
        const nextSuperposition = currentState.superposition
          .map((entry) => ({ ...entry }))
          .filter((_, componentIndex) => componentIndex !== index)
        const nextState = onRegenerationUpdate({ superposition: nextSuperposition })
        syncState(nextState)
      })

      header.append(titleWrap, removeButton)

      const share = documentRef.createElement('p')
      share.className = 'component-share'
      const probabilityShare = totalWeight > 0
        ? ((component.magnitude / totalWeight) ** 2) * 100
        : 0
      share.textContent = `${probabilityShare.toFixed(1)}% of the normalized mix`

      const weightControl = createRangeControl(documentRef, {
        id: `weight-${index}`,
        labelText: 'Weight',
        min: 0,
        max: 1,
        step: 0.01,
        value: component.magnitude,
        formatValue(value) {
          return Number(value).toFixed(2)
        },
      })
      weightControl.input.addEventListener('input', () => {
        weightControl.value.textContent = Number(weightControl.input.value).toFixed(2)
        const nextSuperposition = currentState.superposition.map((entry, componentIndex) => {
          if (componentIndex !== index) {
            return { ...entry }
          }
          return {
            ...entry,
            magnitude: Number(weightControl.input.value),
          }
        })
        const nextState = onRegenerationUpdate({ superposition: nextSuperposition })
        syncState(nextState)
      })

      const phaseControl = createRangeControl(documentRef, {
        id: `phase-${index}`,
        labelText: 'Phase',
        min: 0,
        max: Math.PI * 2,
        step: 0.01,
        value: component.phase,
        formatValue(value) {
          return `${Number(value).toFixed(2)} rad`
        },
      })
      phaseControl.input.addEventListener('input', () => {
        phaseControl.value.textContent = `${Number(phaseControl.input.value).toFixed(2)} rad`
        const nextSuperposition = currentState.superposition.map((entry, componentIndex) => {
          if (componentIndex !== index) {
            return { ...entry }
          }
          return {
            ...entry,
            phase: Number(phaseControl.input.value),
          }
        })
        const nextState = onRegenerationUpdate({ superposition: nextSuperposition })
        syncState(nextState)
      })

      card.append(header, share, weightControl.field, phaseControl.field)
      componentsList.append(card)
    })
  }

  function updatePresetButtons() {
    const activePresetId = getActivePresetId(currentState.superposition)
    for (const { preset, button } of presetButtons) {
      button.className = preset.id === activePresetId ? 'preset-card is-active' : 'preset-card'
    }
  }

  function updateSegmentedGroups() {
    playPauseGroup.setValue(currentState.isPlaying ? 'playing' : 'paused')
    renderModeGroup.setValue(currentState.renderMode ?? 'point_cloud')
    nucleusModeGroup.setValue(currentState.nucleusMode)
  }

  function updateSummaryText() {
    activeMixSummary.textContent = `Active mix: ${formatMixSummary(currentState.superposition)}`
  }

  function syncState(nextState) {
    if (!nextState) {
      return
    }

    currentState = cloneState(nextState)
    updateSummaryText()
    updatePresetButtons()
    updateSegmentedGroups()
    renderComponentCards()

    timeScaleControl.input.value = String(currentState.timeScale ?? 1)
    timeScaleControl.value.textContent = `${Number(currentState.timeScale ?? 1).toFixed(1)}x`

    pointSizeControl.input.value = String(currentState.pointSize)
    pointSizeControl.value.textContent = Number(currentState.pointSize).toFixed(3)

    opacityControl.input.value = String(currentState.opacity)
    opacityControl.value.textContent = `${Math.round(Number(currentState.opacity) * 100)}%`

    scintillationControl.input.value = String(currentState.scintillationRate ?? 0)
    scintillationControl.value.textContent = `${Math.round(Number(currentState.scintillationRate ?? 0) * 100)}%`

    sampleCountInput.input.value = String(currentState.sampleCount)
    seedInput.input.value = String(currentState.seed)
  }

  function updateDiagnostics(nextDiagnostics) {
    currentDiagnostics = { ...nextDiagnostics }

    diagnosticsBody.replaceChildren(
      ...createDiagnosticsEntries(documentRef, [
        ['State mix', formatMixSummary(currentDiagnostics.superposition)],
        ['Sample count', String(currentDiagnostics.sampleCount)],
        ['Seed', String(currentDiagnostics.seed)],
        ['Truncation radius', `${currentDiagnostics.truncationRadius} a0`],
        ['Last sample attempts', String(currentDiagnostics.latestSampleAttemptCount)],
        ['Validation', currentDiagnostics.validationStatus],
        ['Checks available', `${currentDiagnostics.validationCheckCount}`],
        ['Diagnostics command', currentDiagnostics.validationCommand],
      ]),
    )
  }

  syncState(currentState)
  updateDiagnostics(currentDiagnostics)

  return {
    element,
    controls: {
      presetButtons: presetButtons.map(({ button }) => button),
      addStateButtons,
      sampleCountInput: sampleCountInput.input,
      seedInput: seedInput.input,
      pointSizeInput: pointSizeControl.input,
      opacityInput: opacityControl.input,
      scintillationRateInput: scintillationControl.input,
      timeScaleInput: timeScaleControl.input,
      playPauseGroup,
      renderModeGroup,
      nucleusModeGroup,
      resetCameraButton,
      addNInput: nInput.input,
      addLInput: lInput.input,
      addMInput: mInput.input,
      addComponentBtn: customStateButton,
      componentsList,
      advancedSection,
    },
    updateDiagnostics,
    updateTimeText(time) {
      timeReadout.textContent = formatTimeText(time)
    },
    syncState,
  }
}

function cloneState(state) {
  return {
    ...state,
    superposition: state.superposition.map((component) => ({ ...component })),
    truncation: { ...state.truncation },
  }
}

function createSection(documentRef, {
  eyebrow,
  title,
  description,
}) {
  const element = documentRef.createElement('section')
  element.className = 'panel-section'

  const header = documentRef.createElement('div')
  header.className = 'section-header'

  const eyebrowElement = documentRef.createElement('p')
  eyebrowElement.className = 'section-eyebrow'
  eyebrowElement.textContent = eyebrow

  const titleElement = documentRef.createElement('h2')
  titleElement.textContent = title

  const descriptionElement = documentRef.createElement('p')
  descriptionElement.className = 'section-copy'
  descriptionElement.textContent = description

  const content = documentRef.createElement('div')
  content.className = 'section-content'

  header.append(eyebrowElement, titleElement, descriptionElement)
  element.append(header, content)

  return {
    element,
    content,
  }
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
  field.className = 'number-control'

  const text = documentRef.createElement('span')
  text.textContent = labelText

  const input = documentRef.createElement('input')
  input.id = id
  input.type = 'number'
  input.value = String(value)
  if (min !== undefined) input.min = String(min)
  if (step !== undefined) input.step = String(step)
  if (max !== undefined) input.max = String(max)

  field.append(text, input)

  return { field, input }
}

function createRangeControl(documentRef, {
  id,
  labelText,
  value,
  min,
  max,
  step,
  formatValue = String,
}) {
  const field = documentRef.createElement('label')
  field.className = 'range-control'

  const topLine = documentRef.createElement('span')
  topLine.className = 'range-control-topline'

  const text = documentRef.createElement('span')
  text.textContent = labelText

  const valueText = documentRef.createElement('strong')
  valueText.className = 'range-value'
  valueText.textContent = formatValue(value)

  topLine.append(text, valueText)

  const input = documentRef.createElement('input')
  input.id = id
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(value)

  field.append(topLine, input)

  return {
    field,
    input,
    value: valueText,
  }
}

function createSegmentedButtonGroup(documentRef, {
  labelText,
  options,
  value,
  onChange,
}) {
  const field = documentRef.createElement('div')
  field.className = 'segmented-field'

  const label = documentRef.createElement('span')
  label.className = 'segmented-label'
  label.textContent = labelText

  const group = documentRef.createElement('div')
  group.className = 'segmented-group'

  const buttons = options.map((option) => {
    const button = documentRef.createElement('button')
    button.type = 'button'
    button.textContent = option.text
    button.addEventListener('click', () => {
      onChange(option.value)
    })
    group.append(button)
    return { option, button }
  })

  field.append(label, group)

  function setValue(nextValue) {
    for (const { option, button } of buttons) {
      button.className = option.value === nextValue ? 'is-active' : ''
      button.setAttribute?.('aria-pressed', option.value === nextValue ? 'true' : 'false')
    }
  }

  setValue(value)

  return {
    field,
    setValue,
    buttons: buttons.map(({ button }) => button),
  }
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

function formatComponentLabel(component) {
  if (component.l === 0) {
    return `${component.n}s`
  }
  if (component.l === 1) {
    return `${component.n}p`
  }
  return `n${component.n} l${component.l} m${component.m}`
}

function formatMixSummary(superposition = []) {
  if (!Array.isArray(superposition) || superposition.length === 0) {
    return 'No active state'
  }

  return superposition.map(formatComponentLabel).join(' + ')
}

function formatTimeText(time) {
  return `Time: ${Number(time).toFixed(2)} a.u.`
}

function getActivePresetId(superposition) {
  for (const preset of MIX_PRESETS) {
    if (matchesSuperposition(superposition, preset.superposition)) {
      return preset.id
    }
  }
  return null
}

function matchesSuperposition(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false
  }

  return left.every((component, index) => {
    const other = right[index]
    return component.n === other.n
      && component.l === other.l
      && component.m === other.m
      && Math.abs(component.magnitude - other.magnitude) < 1e-9
      && Math.abs(component.phase - other.phase) < 1e-9
  })
}
