# Design

## Purpose of this document

This document defines the technical design of the CoolMatter project.

It specifies the system structure, module boundaries, runtime data flow, scientific-computation boundaries, rendering approach, validation architecture, and extension strategy.

This document does not define development order, milestones, or task sequencing. Those belong in `IMPLEMENTATION.md`.

## Design goals

The design must:

* preserve a strict separation between scientific model and visual representation
* make the authoritative physical quantity explicit at every stage
* keep version 1 small and easy to reason about in plain JavaScript
* support later extension to more hydrogen states and rendering modes without reworking the core
* support later proton-related work without mixing hadronic modeling into the hydrogen code
* make scientific mistakes harder to introduce silently

The design must not:

* allow rendering code to invent orbital geometry independently of the model
* blur the meaning of point density, brightness, opacity, or scale
* couple validation to the live Three.js scene
* rely on hidden defaults for scientific behavior such as truncation or state normalization assumptions

## External stack choices

### Runtime stack

* Vite
* JavaScript
* Three.js

### Why this stack fits the project

Vite is appropriate because the project is a small browser-based application that benefits from a lightweight vanilla-JavaScript workflow, straightforward module structure, simple `vite.config.js` configuration, and direct asset handling for any later shader or reference files.

Three.js is appropriate because it provides the scene graph, camera handling, GPU-backed point rendering, and object lifecycle support needed for a scientific 3D viewer that starts with point clouds and may later grow into scalar-field and isosurface rendering.

## Binding scientific design decisions

The following decisions are fixed by this document:

* version 1 supports only hydrogen stationary eigenstates
* version 1 supports only `1s` and `2s`
* the authoritative quantity is spatial probability density `rho = |psi_nlm|^2`
* version 1 displays that quantity through Monte Carlo point samples drawn from the distribution
* the nucleus marker is a separate display object and not part of the scientific model
* the application must provide both physically scaled and visually enlarged nucleus display modes
* validation is a required subsystem, not an optional development convenience

## Core design principles

### One authoritative model source

All electron-distribution data must originate from the same scientific source:

* a selected hydrogen state `psi_nlm`
* a derived density function `rho = |psi_nlm|^2`

All future visual modes must derive from this same quantity or from explicitly documented quantities derived from it.

### Rendering is downstream of the model

The rendering system may only consume prepared data from the model and sampling layers.

Allowed pipeline:

* define state
* evaluate density
* generate samples or fields
* convert to renderable geometry
* render

Disallowed pipeline:

* invent orbital geometry by hand
* tune a visual effect first and treat it as scientific afterward
* hide physical assumptions inside material settings

### Validation is part of the architecture

The same scientific code used by the viewer must be usable from a non-rendering validation path.

That means:

* no dependence on Three.js in the scientific layer
* no dependence on DOM or UI state in validation
* no dependence on render-loop timing for any scientific computation

### Version 1 remains narrow

The design must be extensible, but the runtime behavior of version 1 should remain controlled:

* states: `1s`, `2s`
* rendering mode: point samples only
* control surface: small
* no proton internals
* no time dependence

## System decomposition

The application should be organized into the following subsystems:

* application bootstrap and lifecycle
* scene infrastructure
* scientific model
* sampling
* renderable construction
* UI state and controls
* validation
* shared utilities

### Subsystem responsibilities

#### Application bootstrap and lifecycle

Responsible for:

* locating the root DOM container
* creating the application object
* starting the render loop
* wiring resize handling
* disposing resources on teardown if needed

It must not contain physics formulas, geometry-building details, or control-panel logic.

#### Scene infrastructure

Responsible for:

* renderer creation
* camera creation
* controls creation
* scene creation
* light creation
* stable scene object ownership

It must not contain hydrogen formulas or sampling logic.

#### Scientific model

Responsible for:

* atomic constants and scale conventions
* hydrogen state definitions
* radial and angular evaluators
* density evaluation
* Cartesian-spherical coordinate conversions as needed for state evaluation

It must not know about Three.js scene objects.

#### Sampling

Responsible for:

* seeded random-number generation
* finite-domain handling
* drawing position samples from the chosen state density
* returning sample positions plus reproducibility metadata

It must not construct materials, meshes, or UI widgets.

#### Renderable construction

Responsible for:

* converting prepared sample buffers into `BufferGeometry`
* creating `Points` objects and nucleus marker objects
* owning material creation and safe disposal logic for those objects

It must not evaluate wavefunctions.

#### UI state and controls

Responsible for:

* holding user-adjustable state
* exposing controls for supported version 1 parameters
* dispatching regeneration or visual-update actions

It must not evaluate hydrogen formulas directly.

#### Validation

Responsible for:

* normalization checks
* histogram checks
* node checks
* deterministic sampling checks
* reporting summaries in a form independent of rendering

It must not depend on the live scene.

## Proposed repository structure

This is the intended conceptual structure, not a frozen final tree.

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
    sampleStrategies.js
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
    dispose.js
    assert.js
    format.js
```

## Runtime data flow

### Main interactive flow

The normal runtime path should be:

1. application starts with config defaults
2. a supported hydrogen state is selected
3. the sampling subsystem receives the state, sample count, seed, and truncation settings
4. the sampling subsystem returns Cartesian sample positions and metadata
5. the renderable-construction subsystem builds a `BufferGeometry`
6. a `Points` object is created or replaced in the scene
7. the nucleus marker is created independently using the chosen scale mode
8. the render loop updates controls and draws the scene

### Parameter update flow

Two kinds of updates must be distinguished.

Visual-only updates:

* point size
* opacity
* nucleus scale mode
* camera reset

These should not regenerate the sample set unless necessary.

Regeneration updates:

* selected state
* sample count
* seed
* truncation configuration

These must trigger a new sample generation step and replacement of the point-cloud geometry.

### Validation flow

The validation path should be separate:

1. import the same hydrogen state definitions
2. run checks using deterministic numeric procedures
3. produce summaries independent of Three.js
4. fail loudly during development if scientific checks are not satisfied

## Application composition design

## `main.js`

`main.js` should remain minimal.

Responsibilities:

* obtain the host element
* call `createApp()`
* mount or start the app

This file should be close to glue code only.

## `createApp.js`

`createApp.js` should compose the subsystems.

Responsibilities:

* create renderer, camera, scene, and controls
* create initial scene objects from config
* create the control panel and connect it to app state
* start the animation loop
* expose minimal hooks for update and disposal

This module should coordinate subsystems, not implement their internal logic.

## Scene design

### Scene contents in version 1

The scene should contain only:

* perspective camera
* minimal light sources, if needed
* nucleus marker at the origin
* electron point cloud

The scene should exclude by default:

* axes helpers
  n- grids
* labels inside the 3D world
* decorative effects
* unused post-processing

### Camera

Use a perspective camera.

Reasoning:

* it fits exploratory 3D inspection well
* it preserves intuitive depth cues
* it works naturally with orbit-style interaction around an origin-centered object

The default camera target must be the origin.

### Controls

Use `OrbitControls` for version 1.

Expected behavior from the current Three.js control model:

* orbiting around a target
* dolly-style zooming
* optional panning
* preservation of the camera up direction

Design decision:

* orbit is the default interaction mode
* panning should be disabled initially unless later testing shows a strong need for it
* damping may be enabled only if it does not make precise inspection worse
* reset must restore a known camera pose and target

### Renderer

Use the standard Three.js WebGL renderer path.

Responsibilities:

* create a renderer bound to the app canvas
* size it to the container
* respond to device-pixel-ratio and resize policy through configuration

The renderer must not become a place where scientific assumptions are hidden.

### Lighting

The point cloud should not rely on scene lighting for its main interpretability.

Design decision:

* use minimal ambient or directional lighting only if the nucleus marker uses shaded materials
* keep the point cloud visually readable through point material settings rather than lighting complexity

This reduces ambiguity about whether bright or dark regions have scientific meaning.

## Scientific model design

## Coordinate conventions

The scientific model should primarily use spherical coordinates because the hydrogen stationary states separate naturally in that form.

Scientific coordinates:

* `r`
* `theta`
* `phi`

Rendering coordinates:

* `x`
* `y`
* `z`

Policy:

* state formulas may be expressed in spherical form
* sampling code may convert between coordinate systems as needed
* rendering receives Cartesian positions only

## Unit conventions

Use atomic units where practical, with length expressed in units of the Bohr radius `a0`.

Policy:

* all internal state evaluation and sample generation should assume `a0` as the unit length unless explicitly stated otherwise
* any future SI conversion must be isolated in utility code
* visual scale controls must not change the underlying physical units, only the display transformation

## State abstraction

Each state definition should expose enough information for both rendering and validation.

Required state interface shape:

* stable ID such as `1s` or `2s`
* quantum numbers `n`, `l`, `m`
* spherical wavefunction evaluator or density evaluator
* Cartesian density evaluator
* metadata about expected nodal structure

Conceptual example:

```js
{
  id: '2s',
  n: 2,
  l: 0,
  m: 0,
  evaluatePsiSpherical({ r, theta, phi }) { ... },
  evaluateDensityCartesian({ x, y, z }) { ... },
  expectedNodes: {
    radial: 1,
    angular: 0,
  },
}
```

## Formula ownership

Formula ownership should be split clearly.

* `radial.js` owns radial factors
* `angular.js` owns angular factors
* `density.js` owns composition into `|psi|^2`
* `states.js` owns supported-state registration and metadata

This helps testing and extension.

## Sampling design

## Meaning of the point cloud

Version 1 uses a point cloud as a visualization of sampled outcomes drawn from the spatial probability density `|psi|^2`.

Meaning:

* each point is a sample from the distribution
* local concentration of points should reflect the density statistically
* the point cloud is not a literal electron trajectory or a literal material cloud

This interpretation must remain consistent in code comments and UI language.

## Sampling API

The sampling subsystem should expose a single clear entry point for version 1, conceptually like:

```js
sampleHydrogenState({
  state,
  sampleCount,
  seed,
  truncation,
  method,
})
```

Return shape:

```js
{
  positions,
  metadata,
}
```

Where metadata includes at least:

* state ID
* sample count
* seed
* truncation settings
* sampling method identifier

## Sampling-method strategy

The design should support pluggable methods even if version 1 uses only one.

Candidate categories:

* generic rejection sampling in a bounded domain
* analytically informed radial-plus-angular sampling when convenient
* future variance-reduced or low-discrepancy methods

Design rule:

* the chosen method must be explicit in metadata
* the method must not change the target distribution, only how samples are obtained

## Random-number generation

RNG must be isolated in its own module.

Requirements:

* deterministic seed support
* reproducible sequences for validation
* no hidden use of `Math.random()` inside scientific sampling logic

## Truncation

Hydrogen bound states have infinite support, so practical sampling requires finite truncation.

Design requirements:

* truncation must be explicit
* truncation config must live in app config or state, not hidden deep in sampling logic
* truncation settings must be returned in metadata
* validation must be able to inspect truncation settings used during sample generation

Conceptual shape:

```js
{
  type: 'radial-cutoff',
  rMax: number,
}
```

## Geometry and renderable construction

## Point-cloud geometry

Use `BufferGeometry` with a `position` attribute to store point coordinates.

Reasons:

* appropriate for large point sets
* standard fit for `Points`
* easy to dispose and rebuild on regeneration
* aligns with Three.js GPU-oriented geometry handling

The geometry-construction layer should accept prepared positions and produce a ready-to-render geometry object.

It must not evaluate physical formulas.

## Point-cloud object

Use `Points` for the electron sample cloud.

Responsibilities:

* bind geometry and point material
* expose lifecycle hooks for replacement and disposal
* remain visually simple and interpretable

## Point material

Start with `PointsMaterial` unless a concrete limitation forces an early shader.

Reasoning:

* version 1 only needs a uniform point size, configurable opacity, and clear visibility on a black background
* `PointsMaterial` is sufficient for uniform-sized point primitives in that situation
* a custom shader should be deferred until there is a demonstrated need such as per-point sizing, special attenuation behavior, or more advanced appearance control

Material policy:

* point brightness and opacity should be treated as display settings only
* no material setting should imply a different physical quantity than the documented one

## Nucleus marker design

The nucleus marker is a separate renderable.

Responsibilities:

* render a central reference object at the origin
* support physical-scale mode and visually enlarged mode
* expose its current mode to the UI layer

Rules:

* switching nucleus mode must not change sample generation
* the nucleus marker must not imply proton internal structure
* the UI must make visually enlarged mode explicit

## Scene controller design

A scene controller should own the mutable scene objects that change during normal interaction.

Responsibilities:

* create the initial nucleus marker and point cloud
* replace point-cloud geometry on regeneration changes
* apply visual-only updates without unnecessary regeneration
* dispose replaced geometries and materials safely
* keep stable scene objects intact across updates

This prevents regeneration logic from spreading through the app.

## UI design

## App state

Version 1 should maintain a small central app state object.

Required fields:

* selected state ID
* sample count
* point size
* opacity
* nucleus scale mode
* seed
* truncation settings

Optional future fields:

* rendering mode
* isosurface threshold
* diagnostics visibility

## Control panel

The control panel should live outside the WebGL canvas and remain small.

Required controls:

* state selection
* sample count
* point size
* opacity
* nucleus scale mode
* camera reset

Preferred control:

* seed input or seed reset

The control layer must classify updates correctly.

Visual-only:

* point size
* opacity
* nucleus scale mode
* camera reset

Regeneration-triggering:

* state selection
* sample count
* seed
* truncation changes

## Render loop design

Version 1 does not require simulation or time evolution.

The render loop should only:

* update controls when necessary
* render the current scene

No wavefunction evaluation, sampling, or geometry rebuilding should occur per frame.

This keeps runtime behavior easier to reason about and easier to validate.

## Resize and disposal design

## Resize handling

On resize, the application must:

* update camera aspect ratio
* update the projection matrix
* resize the renderer
* preserve existing scene state

## Disposal handling

A shared disposal utility should exist for safe cleanup of:

* point-cloud geometries
* materials
* control objects where applicable
* other scene resources that are replaced during regeneration

This matters because the application will regenerate point clouds repeatedly during experimentation.

## Validation subsystem design

## Role of validation

Validation must be runnable independently of the interactive viewer.

That means a validation entry point should be able to import the same state and sampling code and produce machine-readable summaries without any Three.js scene.

## Validation modules

Recommended split:

* `normalizationChecks.js`
* `histogramChecks.js`
* `nodeChecks.js`
* `deterministicChecks.js`
* `runValidation.js`

## Validation expectations

### Normalization checks

Should verify that the implemented wavefunctions behave consistently with expected normalization under the chosen numeric procedure.

### Histogram checks

Should compare sampled radial behavior against the expected radial probability distribution for the selected state.

### Node checks

Should verify expected node structure.

Version 1 expectations:

* `1s`: zero radial nodes
* `2s`: one radial node

### Deterministic checks

Should verify reproducibility from a fixed seed, either exactly or to the level appropriate for the selected sampling implementation.

## Configuration design

A central configuration module should define defaults for:

* initial state
* initial sample count
* default point size
* default opacity
* default nucleus mode
* default camera pose
* default seed
* default truncation settings

Scientific defaults must not be scattered silently across multiple files.

## Error handling and diagnostics

Version 1 does not need a full diagnostics framework, but it should fail loudly during development for scientific misuse.

Examples:

* unsupported state requested
* invalid sample count
* missing or invalid truncation settings
* sampling returned malformed buffers
* geometry creation failed

The system should prefer explicit failure over silently displaying misleading fallback visuals.

## Extensibility strategy

## Path to version 1.5

The current design must support adding:

* `2p` state definitions
* scalar-field generation on a 3D grid
* isosurface extraction from the scalar field
* optional diagnostics for nodal inspection

This is why state evaluation, sample generation, and renderable construction are separated.

## Path to later proton work

Future proton work should be treated as a separate domain module and likely a separate runtime mode.

Design consequences:

* hydrogen code remains under `physics/hydrogen/`
* proton or hadronic code should live in parallel modules later
* scene reuse is acceptable, but scientific models must remain separate

## Explicit non-goals of this design

This document does not define:

* exact implementation order
* milestone breakdown
* task lists
* estimated development time
* the final proton scientific model
* exact UI styling
* exact RNG algorithm choice
* exact first sampling algorithm choice
* exact default truncation radius
* whether built-in materials remain sufficient after version 1

Those belong in `IMPLEMENTATION.md` or later focused design documents.

## Review findings incorporated into this version

This version of the design intentionally corrects several weaknesses from the prior draft:

* removes citation and formatting contamination from the document body
* separates architecture decisions from implementation-order decisions more clearly
* treats Vite, Three.js, and OrbitControls as infrastructure choices rather than as places to hide scientific assumptions
* makes regeneration-triggering parameters explicit
* clarifies that `PointsMaterial` is acceptable initially because version 1 only needs uniform point appearance
* strengthens the requirement that truncation and seed handling remain explicit and inspectable

## Summary

The system is designed so that:

* hydrogen physics remains authoritative
* sampling converts physics into reproducible point data
* rendering displays that data without redefining its meaning
* UI updates are clearly separated into visual-only and regeneration-triggering changes
* validation uses the same scientific code but remains independent of the scene
* later rendering modes and later proton work can be added without corrupting version 1 architecture
