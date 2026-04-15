# Implementation

## Purpose of this document

This document translates the requirements and design into a concrete build plan for the first implementation.

It defines:

* what to build first
* which files to create
* which decisions to make immediately
* which checks to run before expanding scope
* what counts as done at each stage

This document is intentionally practical. It is not another architecture document.

## Implementation strategy

The implementation should proceed from scientific correctness outward.

Build order priority:

1. project setup
2. scientific constants and hydrogen-state formulas
3. validation utilities for those formulas
4. deterministic sampling
5. rendering of sampled points
6. UI controls and regeneration handling
7. cleanup, documentation, and hardening

This order is mandatory in spirit even if some files are created in parallel.

Reason:

* rendering a wrong distribution beautifully is worse than rendering a correct distribution simply
* validation must exist before visual confidence grows
* the point cloud should be the last step of a correct data pipeline, not the first step of a visual experiment

## Version 1 milestone and phase map

Version 1 should not be treated as one long undifferentiated build.

It should be delivered through four explicit phases, each with a concrete milestone.

### Phase 1: validated scientific foundation

Scope:

* project bootstrap
* config baseline
* `1s` and `2s` formulas
* deterministic RNG
* truncation policy
* first sampling pipeline
* non-rendering validation

Milestone 1 outcome:

* a validated scientific pipeline exists and runs without launching the viewer

### Phase 2: rendering shell and first visible viewer

Scope:

* Three.js scene, camera, renderer, controls, and lights
* first point-cloud renderable
* first nucleus marker
* initial app composition that displays sampled output

Milestone 2 outcome:

* the app can render a black scene with orbit controls, a nucleus marker, and a sampled electron cloud

### Phase 3: interaction and regeneration

Scope:

* app state
* plain-DOM control panel
* explicit regeneration versus visual-only update handling
* scene-controller ownership of cloud replacement

Milestone 3 outcome:

* the viewer is interactively usable for version 1 core parameters without breaking reproducibility or mixing UI logic into the model layer

### Phase 4: hardening and version 1 signoff

Scope:

* resize handling
* disposal paths
* minimal diagnostics
* post-integration validation rerun
* final review against version 1 done criteria

Milestone 4 outcome:

* version 1 is stable enough to call complete for its defined scope

### Phase dependency rule

These phases are sequential in intent:

* Phase 2 assumes Phase 1 is complete
* Phase 3 assumes Phase 2 is complete
* Phase 4 assumes Phase 3 is complete

Some file creation can overlap, but milestone completion should not.

## Immediate implementation decisions

The following choices are fixed for the first implementation.

### Tooling

* package manager: npm
* app scaffold: Vite vanilla JavaScript template
* 3D library: `three`
* controls import: `three/addons/controls/OrbitControls.js`

### Runtime choices

* rendering primitive: `THREE.Points`
* point material: `THREE.PointsMaterial`
* camera control: `OrbitControls`
* background: black
* nucleus display object: simple sphere mesh
* default interaction: orbit only, no free-fly

### Scientific choices

* internal length unit: Bohr radius `a0`
* supported states in first release: `1s`, `2s`
* authoritative quantity: spatial probability density `|psi_nlm|^2`
* first display method: Monte Carlo point samples drawn from `|psi|^2`
* fixed-seed reproducibility required

### Version 1 default posture

* favor correctness of data over visual richness
* use simple render materials first
* keep controls minimal
* do not implement `2p`, isosurfaces, shaders, or proton internals yet

## Project bootstrap

## Step 1: scaffold the project

Create the project with the Vite vanilla JavaScript template.

Expected commands:

```bash
npm create vite@latest hydrogen-orbital-viewer -- --template vanilla
cd hydrogen-orbital-viewer
npm install
npm install three
```

Do not add extra libraries initially unless a concrete need appears.

Not needed at first:

* React
* Vue
* dat.gui or lil-gui
* state-management libraries
* shader helper libraries
* test runners beyond what is needed for simple validation scripts

## Step 2: normalize project layout

Reorganize the default Vite scaffold immediately into the structure established in `DESIGN.md`.

Target structure for the first implementation:

```text
src/
  main.js
  app/
    createApp.js
    config.js
  scene/
    createScene.js
    createCamera.js
    createRenderer.js
    createControls.js
    createLights.js
    sceneController.js
  physics/
    constants.js
    hydrogen/
      states.js
      radial.js
      angular.js
      density.js
      coordinates.js
  sampling/
    rng.js
    truncation.js
    sampleHydrogenState.js
  renderables/
    createElectronPointCloud.js
    createNucleusMarker.js
    materials.js
  ui/
    appState.js
    controlPanel.js
  validation/
    runValidation.js
    normalizationChecks.js
    histogramChecks.js
    nodeChecks.js
    deterministicChecks.js
  utils/
    assert.js
    dispose.js
    format.js
```

Delete Vite starter demo content rather than adapting it.

## Configuration baseline

Create `src/app/config.js` early and centralize all defaults there.

Required initial config fields:

* initial state ID
* initial sample count
* initial point size
* initial opacity
* default seed
* default truncation radius
* initial nucleus mode
* default camera position
* renderer antialias setting

Do not scatter these values across files.

## Scientific core implementation

## Step 3: implement constants and coordinate utilities

Create:

* `physics/constants.js`
* `physics/hydrogen/coordinates.js`

`constants.js` should define:

* Bohr-radius-based scale conventions
* any normalization constants shared by the first states
* numeric tolerances used by validation where appropriate

`coordinates.js` should define:

* Cartesian to spherical conversion
* spherical to Cartesian conversion
* clear handling of edge cases near the origin

This module must be deterministic and free of rendering concerns.

## Step 4: implement hydrogen-state math for `1s` and `2s`

Create:

* `physics/hydrogen/radial.js`
* `physics/hydrogen/angular.js`
* `physics/hydrogen/density.js`
* `physics/hydrogen/states.js`

### Required implementation policy

* formulas must be explicit, not encoded as magic numbers without explanation
* code comments should state which formula is being implemented
* the state registry must expose metadata needed by validation

### Minimum functions to implement

In `radial.js`:

* radial evaluator for `1s`
* radial evaluator for `2s`

In `angular.js`:

* spherical-harmonic factor for `l = 0, m = 0`

In `density.js`:

* `evaluatePsiSpherical(stateId, r, theta, phi)`
* `evaluateDensitySpherical(stateId, r, theta, phi)`
* `evaluateDensityCartesian(stateId, x, y, z)`

In `states.js`:

* registry for `1s`
* registry for `2s`
* metadata for expected radial nodes

Keep the state registry small and explicit at first.

## Validation-first implementation

## Step 5: implement validation entry point before any Three.js rendering

Create:

* `validation/runValidation.js`
* `validation/normalizationChecks.js`
* `validation/histogramChecks.js`
* `validation/nodeChecks.js`
* `validation/deterministicChecks.js`

### Required principle

The app must be able to validate the scientific core without launching the 3D viewer.

### Practical approach

Add a validation script entry in `package.json`, for example:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "validate": "node src/validation/runValidation.js"
  }
}
```

If module-resolution details require a slightly different invocation, adapt the script, but keep the command simple.

## Step 6: implement normalization checks

Normalization checks should numerically verify that the implemented states are consistent with expected normalization under the chosen integration procedure.

Implementation guidance:

* use numeric integration in spherical coordinates
* integrate over a finite but configurable radial domain
* record the radial cutoff used
* compare against an acceptable tolerance

Required outputs:

* state ID
* computed normalization estimate
* tolerance used
* pass or fail

## Step 7: implement node checks

Node checks should verify expected radial behavior.

For version 1:

* `1s` should have zero radial nodes
* `2s` should have one radial node

The purpose is not only to test algebra but also to catch sign or scaling mistakes that still produce vaguely plausible clouds.

## Step 8: implement deterministic-sampling checks

Before building the live point cloud, implement seeded randomness.

Create `sampling/rng.js` with a deterministic seeded generator.

Requirements:

* same seed must reproduce the same sample sequence
* the generator must be the only random source used by sampling code
* do not use `Math.random()` inside the scientific pipeline

Validation should check that repeated runs with the same seed produce the same summary results.

## Sampling implementation

## Step 9: implement truncation policy

Create `sampling/truncation.js`.

Responsibilities:

* define the radial cutoff structure
* validate cutoff settings
* expose helper functions for checking whether a sample candidate is inside the allowed domain

The truncation policy must be explicit and inspectable.

## Step 10: implement first sampling pipeline

Create `sampling/sampleHydrogenState.js`.

### Initial implementation target

Implement one clear and documented sampling strategy first.

Minimum function shape:

```js
sampleHydrogenState({
  state,
  sampleCount,
  seed,
  truncation,
})
```

Return shape:

```js
{
  positions,
  metadata,
}
```

### What this module must do

* receive a state definition
* use the deterministic RNG
* sample from the selected state's spatial probability density
* convert accepted samples to Cartesian coordinates if needed
* return typed arrays or arrays suitable for geometry construction
* attach metadata including state ID, sample count, seed, and truncation settings

### Implementation caution

Do not over-engineer the sampler initially.

The first implemented method only needs to be:

* correct
* documented
* reproducible
* fast enough for interactive regeneration at moderate point counts

If the first method later proves too slow, replace it after validation rather than making the initial version complicated.

## Step 11: implement histogram validation for sampled output

With sampling in place, implement histogram-based checks.

Purpose:

* compare sampled radial behavior against the expected radial probability distribution
* confirm that the point cloud reflects the correct distribution statistically
* catch mistakes where the implementation accidentally samples the wrong radial quantity

Required outputs:

* state ID
* sample count
* seed
* radial histogram summary
* comparison summary
* pass or fail

At this stage, the scientific pipeline should already be useful even without graphics.

## Rendering implementation

## Step 12: implement the base Three.js scene infrastructure

Create:

* `scene/createScene.js`
* `scene/createCamera.js`
* `scene/createRenderer.js`
* `scene/createControls.js`
* `scene/createLights.js`

### Required behavior

`createScene.js`:

* create a black-background scene

`createCamera.js`:

* create the perspective camera
* use a config-driven default position
* target the origin conceptually

`createRenderer.js`:

* create the renderer
* size it correctly for the container
* support resize updates

`createControls.js`:

* instantiate `OrbitControls`
* disable panning initially
* provide reset support

`createLights.js`:

* create minimal lighting only for the nucleus marker if needed

At the end of this step, you should be able to render an empty black scene with a controllable camera.

## Step 13: implement renderables

Create:

* `renderables/materials.js`
* `renderables/createElectronPointCloud.js`
* `renderables/createNucleusMarker.js`

### `materials.js`

Should centralize material creation for:

* point cloud material
* nucleus material

### `createElectronPointCloud.js`

Should:

* accept prepared sample positions
* build a `BufferGeometry`
* attach a `PointsMaterial`
* return a `THREE.Points` object

### `createNucleusMarker.js`

Should:

* create a sphere mesh at the origin
* support physical mode and visually enlarged mode
* expose a clean update path for mode changes

## Step 14: implement the scene controller

Create `scene/sceneController.js`.

Responsibilities:

* create the initial point cloud and nucleus marker
* replace point clouds when regeneration-triggering parameters change
* apply visual-only updates when possible without regeneration
* dispose old geometry and material resources safely

This file is important because regeneration logic will otherwise leak everywhere.

## App assembly implementation

## Step 15: implement app state and app composition

Create:

* `ui/appState.js`
* `app/createApp.js`
* `main.js`

### `ui/appState.js`

Should hold:

* selected state ID
* sample count
* point size
* opacity
* nucleus mode
* seed
* truncation settings

### `app/createApp.js`

Should:

* create scene infrastructure
* create initial sample data using the scientific pipeline
* create the scene controller
* start the render loop
* wire UI events to scene updates

### `main.js`

Should stay small and only bootstrap the app.

## UI implementation

## Step 16: implement a minimal control panel with plain DOM first

Create `ui/controlPanel.js`.

Use plain DOM controls first.

Do not add a UI library unless plain DOM becomes genuinely cumbersome.

Required controls:

* state selector
* sample count input
* point-size input
* opacity input
* nucleus mode toggle
* seed input or reseed action
* reset camera button

### Update behavior

Visual-only updates:

* point size
* opacity
* nucleus mode
* camera reset

Regeneration updates:

* state change
* sample-count change
* seed change
* truncation change if exposed

This separation must be encoded explicitly in the control handlers.

## Integration hardening

## Step 17: implement resize and disposal paths

Create or finalize:

* resize handling in app composition
* `utils/dispose.js`

Requirements:

* update camera aspect and projection matrix on resize
* resize renderer correctly
* dispose old point-cloud geometry when regenerated
* dispose materials and controls safely when replaced or torn down

## Step 18: add developer-facing diagnostics

Keep diagnostics minimal but useful.

Useful outputs:

* current state ID
* current sample count
* current seed
* truncation radius in metadata
* latest validation result summary

This can remain console-based in the first implementation.

## Recommended concrete build order

Below is the recommended version 1 execution order grouped by milestone-bearing phases.

### Phase 1: validated scientific foundation

1. scaffold Vite app
2. install `three`
3. remove starter demo files
4. create target folder structure
5. add central config file
6. implement constants
7. implement coordinate utilities
8. implement `1s` and `2s` formulas
9. implement state registry
10. implement density evaluators
11. implement normalization checks
12. implement node checks
13. implement seeded RNG
14. implement deterministic checks
15. implement truncation policy
16. implement first sampling function
17. implement histogram checks
18. run validation and resolve failures before moving on

Milestone 1:

* the scientific pipeline is validated independently of rendering

### Phase 2: rendering shell and first visible viewer

19. implement scene, camera, renderer, controls, and lights
20. render empty scene
21. implement point-cloud and nucleus renderables
22. connect scientific sample output to point-cloud rendering
23. render the initial sampled state in the viewer

Milestone 2:

* a visible viewer exists with orbit controls, nucleus marker, and sampled cloud

### Phase 3: interaction and regeneration

24. implement app state
25. implement scene controller
26. implement control panel
27. wire visual-only updates
28. wire regeneration updates
29. add camera reset

Milestone 3:

* the viewer is interactively usable for version 1 parameters

### Phase 4: hardening and version 1 signoff

30. implement resize handling
31. implement disposal helpers
32. review metadata flow
33. add developer-facing diagnostics
34. verify reproducibility manually
35. rerun validation after full integration
36. review against the version 1 checklist before signoff

Milestone 4:

* version 1 is complete for the defined scope

## Milestone completion criteria

### Milestone 1: validated scientific foundation

Milestone 1 is done when:

* `1s` and `2s` density evaluators exist
* coordinate utilities are working
* the state registry is explicit and inspectable
* normalization checks run
* node checks run
* deterministic RNG checks run
* histogram checks run after sampling exists
* validation can be launched from a simple script command

### Milestone 2: first visible viewer

Milestone 2 is done when:

* a black scene appears
* the camera orbits and zooms
* a nucleus marker is visible
* a point cloud generated from sampled data is visible

### Milestone 3: usable version 1 prototype

Milestone 3 is done when:

* user can switch between `1s` and `2s`
* user can change point size and opacity
* user can change sample count and regenerate
* user can switch nucleus scale mode
* same seed gives reproducible output

### Milestone 4: version 1 complete

Milestone 4 is done when:

* validation still passes after integration
* resize handling works
* point-cloud regeneration disposes old geometry correctly
* visual-only updates do not regenerate samples accidentally
* diagnostics expose current run metadata

## Review checklist before calling version 1 complete

Before calling version 1 complete, verify all of the following:

* no rendering code contains hydrogen formulas
* no sampling code uses uncontrolled randomness
* no hidden truncation constants remain in the code
* `1s` and `2s` are both available from the same state-registry mechanism
* point-cloud regeneration disposes old geometry correctly
* visual-only updates do not regenerate samples accidentally
* nucleus enlarged mode is clearly marked as not to scale
* validation can run independently of the 3D app
* the UI remains small and does not dominate the viewer

## Explicit deferrals

Do not implement yet:

* `2p`
* isosurfaces
* volumetric rendering
* proton internals
* free-fly camera mode
* animation of any scientific quantity
* shader-based point rendering unless a clear limitation appears
* extra libraries for convenience without a strong reason

## Implementation philosophy summary

The first implementation should be conservative.

It should aim for:

* small modules
* explicit formulas
* explicit state and metadata
* deterministic behavior
* validation before visual confidence
* minimal but correct rendering

A simple correct viewer is the target. A clever but weakly validated viewer is not.
