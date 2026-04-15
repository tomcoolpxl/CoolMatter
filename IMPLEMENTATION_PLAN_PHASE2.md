# Implementation Plan Phase 2

## Purpose

This document defines Phase 2 of version 1.

Phase 2 is the rendering-shell phase.
Its job is to produce the first visible viewer from the already validated scientific pipeline.

Phase 2 is intentionally narrower than "build the whole app."
It should stop at the first-render milestone, before control-panel work and before hardening work.

## Milestone target

Phase 2 ends at Milestone 2:

* a black scene appears
* the camera orbits and zooms
* a nucleus marker is visible
* a sampled electron cloud is visible

If interaction, regeneration orchestration, or hardening starts to dominate the work, that belongs to later phases.

## Entry assumptions

Phase 2 assumes Phase 1 is complete.

Required inputs:

* the Vite app scaffold exists
* `npm run build` succeeds
* `npm run validate` succeeds
* `1s` and `2s` density evaluation exists
* deterministic sampling exists
* the sampling pipeline already returns Cartesian positions and metadata

If those conditions are not true, Phase 2 should pause and complete Phase 1 first.

## Online-verified assumptions

These implementation assumptions were checked against current official documentation on April 15, 2026:

* Three.js currently documents addon imports via `three/addons/...`, including `OrbitControls`.
* `OrbitControls` still requires `controls.update()` after manual camera changes, and in the animation loop when damping is enabled.
* `WebGLRenderer.setPixelRatio()` and `WebGLRenderer.setSize()` remain the standard hooks for initial sizing and later resize support.
* `THREE.Points` plus `THREE.PointsMaterial` remains the simplest correct starting point for a point cloud.
* Vite still uses `index.html` in the project root as the app entry.

Implications for Phase 2:

* use `three/addons/controls/OrbitControls.js`
* keep the first render path simple and built from prepared positions
* defer advanced rendering and UI complexity

## Phase 2 scope

Phase 2 includes:

1. scene creation
2. camera creation
3. renderer creation
4. orbit controls
5. minimal lights
6. electron point-cloud renderable creation
7. nucleus marker creation
8. minimal app composition to render the initial sampled state

Phase 2 does not include:

* app state management
* control panel creation
* regeneration-versus-visual-update orchestration
* resize hardening beyond what the scene shell needs to function
* disposal helpers beyond immediate obvious ownership in the first render path
* developer diagnostics

Those belong to later phases.

## Target file set

Phase 2 should create:

```text
src/
  app/
    createApp.js
  scene/
    createScene.js
    createCamera.js
    createRenderer.js
    createControls.js
    createLights.js
  renderables/
    createElectronPointCloud.js
    createNucleusMarker.js
    materials.js
```

Phase 2 should update:

```text
src/
  main.js
  app/
    config.js
```

Files intentionally deferred:

```text
src/
  scene/
    sceneController.js
  ui/
    appState.js
    controlPanel.js
  utils/
    dispose.js
```

## Execution order

### Step 1: implement the scene shell

Create:

* `scene/createScene.js`
* `scene/createCamera.js`
* `scene/createRenderer.js`
* `scene/createControls.js`
* `scene/createLights.js`

Requirements:

* scene background is black
* camera is perspective-based and positioned from config
* orbit controls are attached to the renderer element
* panning is disabled initially
* lighting remains minimal and is only present to support nucleus visibility if needed

Verification:

* the app can render an empty black scene
* orbit and zoom work

### Step 2: implement materials and renderables

Create:

* `renderables/materials.js`
* `renderables/createElectronPointCloud.js`
* `renderables/createNucleusMarker.js`

Requirements:

* the point-cloud renderable accepts prepared Cartesian positions only
* the point-cloud renderable builds `BufferGeometry` plus `PointsMaterial`
* the nucleus marker is a simple sphere at the origin
* the nucleus renderable supports both physical and visually enlarged display modes

Verification:

* a point cloud is visible when given sample positions
* a nucleus marker is visible independently of the cloud

### Step 3: implement the initial app composition

Create `app/createApp.js` and update `main.js`.

Responsibilities:

* create scene infrastructure
* request the initial sampled data using the validated Phase 1 pipeline
* create the point cloud and nucleus marker
* add them to the scene
* start the render loop

Constraints:

* keep `main.js` minimal
* keep hydrogen formulas out of rendering code
* do not build a full scene controller yet

Verification:

* the app launches into a visible first-render state
* the rendered cloud comes from the scientific pipeline rather than placeholder geometry

## Success criteria

Phase 2 is done when all of the following are true:

* the app launches a black Three.js scene
* orbit controls work
* a nucleus marker is visible
* a sampled point cloud is visible
* the initial rendered output is driven by the validated scientific pipeline
* `npm run validate` still succeeds after rendering integration

## Review checklist

Before marking Phase 2 complete, verify:

* no rendering module evaluates hydrogen formulas
* the point cloud is built from prepared Cartesian sample positions only
* the render loop does not recompute scientific data every frame
* the first-render path remains small and understandable
* no control-panel or app-state abstractions were introduced prematurely

## Recommended first TODO after this plan is accepted

Use one small reviewable chunk:

* implement the scene shell and minimal app bootstrap needed to render an empty black scene with orbit controls

That verifies the browser-side infrastructure before mixing in renderables or sampled data.
