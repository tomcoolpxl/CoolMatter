# Implementation Plan Phase 3

## Purpose

This document defines Phase 3 of version 1.

Phase 3 is the interaction-and-regeneration phase.
Its job is to turn the first visible viewer into a usable prototype without collapsing rendering, UI, and scientific logic into one module.

## Milestone target

Phase 3 ends at Milestone 3:

* user can switch between `1s` and `2s`
* user can change point size and opacity
* user can change sample count and regenerate
* user can switch nucleus scale mode
* the same seed gives reproducible output

## Entry assumptions

Phase 3 assumes Phase 2 is complete.

Required inputs:

* the app already renders an initial nucleus marker and sampled cloud
* orbit controls already work
* the scientific pipeline remains validated

## Online-verified assumptions

These implementation assumptions were checked against current official documentation on April 15, 2026:

* Vite still supports a plain DOM application structure without requiring framework state tooling.
* Three.js render objects can be replaced cleanly as long as ownership is explicit and obsolete geometry and materials are later disposed.

Implications for Phase 3:

* use plain DOM controls
* centralize regeneration decisions instead of spreading them across UI handlers

## Phase 3 scope

Phase 3 includes:

1. app state
2. scene controller
3. plain-DOM control panel
4. explicit separation between regeneration-triggering updates and visual-only updates
5. camera reset wiring

Phase 3 does not include:

* full hardening of disposal and teardown paths
* resize hardening
* developer diagnostics beyond what is necessary to finish the interaction flow

## Target file set

Phase 3 should create:

```text
src/
  scene/
    sceneController.js
  ui/
    appState.js
    controlPanel.js
```

Phase 3 should update:

```text
src/
  app/
    createApp.js
    config.js
```

## Execution order

### Step 1: implement app state

Create `ui/appState.js`.

Required state fields:

* selected state ID
* sample count
* point size
* opacity
* nucleus mode
* seed
* truncation settings

Requirements:

* state remains small and explicit
* there is one readable source of truth for current viewer settings

### Step 2: implement the scene controller

Create `scene/sceneController.js`.

Responsibilities:

* own current scene object references
* replace the point cloud when regeneration-triggering parameters change
* apply visual-only updates without regeneration
* expose a small API back to app composition

Required update split:

* regeneration updates:
  * state ID
  * sample count
  * seed
  * truncation
* visual-only updates:
  * point size
  * opacity
  * nucleus mode
  * camera reset

### Step 3: implement the plain-DOM control panel

Create `ui/controlPanel.js`.

Required controls:

* state selector
* sample-count input
* point-size input
* opacity input
* nucleus-mode toggle
* seed input or reseed action
* reset camera button

Requirements:

* use plain DOM
* keep the panel small
* label enlarged nucleus mode clearly as not to scale

### Step 4: wire interaction into app composition

Update `app/createApp.js`.

Responsibilities:

* connect app state, control panel, and scene controller
* ensure regeneration happens only for the correct settings
* ensure visual-only updates do not trigger fresh sampling

## Success criteria

Phase 3 is done when all of the following are true:

* user can switch between `1s` and `2s`
* user can change point size and opacity without regeneration
* user can change sample count and seed with regeneration
* user can toggle nucleus mode without changing electron data
* camera reset works
* identical settings plus seed produce reproducible output

## Review checklist

Before marking Phase 3 complete, verify:

* UI modules do not evaluate hydrogen formulas
* visual-only controls do not resample
* regeneration-triggering controls do not reuse stale sample data
* the scene controller, not the control panel, owns cloud replacement decisions

## Recommended first TODO after this plan is accepted

Use one small reviewable chunk:

* implement `ui/appState.js` and `scene/sceneController.js` with the regeneration-versus-visual-update split, but without the full control panel yet

That isolates the most important architectural decision before adding UI wiring noise.
