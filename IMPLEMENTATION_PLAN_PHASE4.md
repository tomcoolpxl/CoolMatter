# Implementation Plan Phase 4

## Purpose

This document defines Phase 4 of version 1.

Phase 4 is the hardening-and-signoff phase.
Its job is to make the usable prototype stable enough to call version 1 complete for its defined scope.

## Milestone target

Phase 4 ends at Milestone 4:

* validation still passes after full integration
* resize handling works
* point-cloud regeneration disposes old geometry correctly
* visual-only updates do not regenerate samples accidentally
* diagnostics expose current run metadata

## Entry assumptions

Phase 4 assumes Phase 3 is complete.

Required inputs:

* the viewer is already interactively usable
* regeneration logic already exists
* the app can already display both `1s` and `2s`

## Online-verified assumptions

These implementation assumptions were checked against current official documentation on April 15, 2026:

* Three.js still expects explicit disposal of obsolete geometry and material resources.
* `WebGLRenderer.setPixelRatio()` and `WebGLRenderer.setSize()` remain the standard resize hooks.

Implications for Phase 4:

* make resize ownership explicit
* make resource disposal ownership explicit

## Phase 4 scope

Phase 4 includes:

1. resize handling
2. disposal helpers
3. metadata and diagnostics review
4. manual reproducibility verification
5. rerunning validation after full integration
6. final review against version 1 acceptance criteria

Phase 4 does not include:

* new scientific states
* new rendering modes
* UI redesign
* performance tuning beyond obvious correctness and leak issues

## Target file set

Phase 4 should create:

```text
src/
  utils/
    dispose.js
```

Phase 4 should update:

```text
src/
  app/
    createApp.js
  scene/
    sceneController.js
  ui/
    controlPanel.js
```

Only touch other files if the hardening path clearly requires it.

## Execution order

### Step 1: implement resize handling

Update app composition so that resize handling is explicit.

Requirements:

* update camera aspect on resize
* update camera projection matrix on resize
* update renderer size on resize
* set renderer pixel ratio deliberately

### Step 2: implement disposal helpers

Create `utils/dispose.js`.

Requirements:

* dispose obsolete point-cloud geometry when clouds are replaced
* dispose obsolete materials when no longer owned
* keep disposal ownership obvious from code structure

### Step 3: review metadata flow and diagnostics

Keep diagnostics minimal and developer-facing.

Useful outputs:

* current state ID
* current sample count
* current seed
* truncation radius
* latest regeneration metadata
* latest validation summary

### Step 4: rerun verification

Required checks:

* `npm run build`
* `npm run validate`
* manual check for `1s`
* manual check for `2s`
* manual seed reproducibility spot check

## Success criteria

Phase 4 is done when all of the following are true:

* resize handling works
* regenerated clouds replace previous geometry cleanly
* no obvious leak path remains in normal regeneration flow
* diagnostics expose useful current-run metadata
* validation still passes after integration
* the implementation satisfies the version 1 checklist in `IMPLEMENTATION_PLAN.md`

## Review checklist

Before marking Phase 4 complete, verify:

* visual-only updates do not trigger regeneration
* obsolete geometries are disposed
* obsolete materials are disposed when truly unused
* the enlarged nucleus mode remains clearly labeled as not to scale
* the app still respects the validated scientific pipeline

## Recommended first TODO after this plan is accepted

Use one small reviewable chunk:

* implement resize handling plus `utils/dispose.js`, then verify repeated regeneration does not leave duplicate scene objects

That is the smallest hardening slice with the highest risk reduction.
