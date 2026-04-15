# Implementation Plan Phase 1

## Purpose

This document defines the first executable phase of CoolMatter.

Phase 1 is not "start rendering quickly."
Phase 1 is "establish a correct, testable scientific pipeline and a clean project scaffold so rendering can attach to validated data instead of guesses."

Because the repository is still at the document-only stage, this phase must cover:

* project bootstrap
* baseline app structure
* hydrogen `1s` and `2s` scientific core
* deterministic sampling
* non-visual validation entrypoints

Three.js scene work is intentionally deferred to the next phase.

## Milestone target

Phase 1 ends at Milestone 1:

* the scientific pipeline is validated independently of rendering

## Why this is the right next phase

The repository currently contains planning documents only.
There is no existing Vite app, no scientific kernel, no validation script, and no rendering shell.

That means the next practical phase is not a thin slice of graphics.
It is the minimum implementation slice that can prove:

* the project builds
* the hydrogen formulas are explicit
* the random sampling is reproducible
* the sampled distribution is checked before any visual interpretation is trusted

This matches the intent of `IMPLEMENTATION_PLAN.md`, `REQUIREMENTS.md`, and `DESIGN.md`.

## Online-verified assumptions

These implementation assumptions were checked against current official documentation on April 15, 2026:

* Vite still supports scaffolding a vanilla JavaScript app with `npm create vite@latest`.
* Current scaffolded Vite projects use the standard `dev`, `build`, and `preview` npm scripts.
* Current Three.js docs recommend importing orbit controls from `three/addons/controls/OrbitControls.js`.
* Node treats `.js` files as ES modules when `package.json` contains `"type": "module"`.

Implication for this phase:

* use the current Vite vanilla scaffold in the repo root
* keep the default Vite script shape
* prefer the modern Three.js addon import path in future code, even though Phase 1 does not implement controls yet
* keep validation code ESM-friendly from the start

## Phase 1 scope

Phase 1 includes:

1. scaffold the Vite vanilla JavaScript app in the repository root
2. install `three`
3. remove starter demo files and replace them with the target project structure
4. create `src/app/config.js` and centralize defaults
5. implement coordinate utilities and shared constants
6. implement explicit hydrogen-state math for `1s` and `2s`
7. implement state metadata and density evaluators
8. implement deterministic seeded RNG
9. implement explicit truncation policy
10. implement the first sampling pipeline for `|psi|^2`
11. implement non-rendering validation scripts for normalization, node checks, determinism, and radial histogram sanity
12. wire `npm run validate`

Phase 1 does not include:

* scene creation
* camera, controls, or lights
* point-cloud rendering
* DOM controls
* resize handling tied to a renderer

## Phase 1 deliverables

At the end of Phase 1, the repository should contain a runnable app scaffold plus a validated scientific pipeline.

Expected deliverables:

* `package.json` with working `dev`, `build`, `preview`, and `validate` scripts
* Vite app files in the repo root
* project source tree created under `src/`
* explicit hydrogen model modules for `1s` and `2s`
* deterministic sampling modules
* validation modules runnable in Node without launching the browser viewer
* console-readable validation output with pass/fail summaries

## Target file set for Phase 1

Phase 1 should create these files first:

```text
index.html
package.json
src/
  main.js
  app/
    config.js
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
  validation/
    runValidation.js
    normalizationChecks.js
    histogramChecks.js
    nodeChecks.js
    deterministicChecks.js
  utils/
    assert.js
    format.js
```

Files intentionally deferred to Phase 2:

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
    sceneController.js
  renderables/
    createElectronPointCloud.js
    createNucleusMarker.js
    materials.js
  ui/
    appState.js
    controlPanel.js
  utils/
    dispose.js
```

## Execution order

### Step 1: bootstrap the project

Create the Vite vanilla JavaScript app directly in the repository root and install `three`.

Constraints:

* do not create a nested app directory
* do not add framework libraries
* keep the scaffold close to Vite defaults until project files replace the demo

Verification:

* `npm install` completes
* `npm run build` succeeds before any scientific code is added

### Step 2: replace starter content with the project skeleton

Delete Vite demo content rather than adapting it.
Create the Phase 1 directory layout immediately so later modules have stable homes.

Constraints:

* keep `main.js` minimal
* do not put scientific formulas in the bootstrap file

Verification:

* app still builds after demo removal
* all planned Phase 1 directories exist

### Step 3: establish central configuration

Create `src/app/config.js` with the initial constants needed by both validation and later rendering work.

Required fields:

* initial state ID
* default sample count
* default seed
* default truncation radius
* default point size
* default opacity
* default nucleus mode
* default camera position placeholder
* renderer antialias placeholder

Even if some values are not consumed until Phase 2, define them once now so defaults do not drift.

Verification:

* all defaults used by Phase 1 are imported from config, not duplicated

### Step 4: implement scientific constants and coordinate conversion

Create `physics/constants.js` and `physics/hydrogen/coordinates.js`.

Requirements:

* internal length unit is `a0`
* formulas and tolerances are named, not buried
* Cartesian-to-spherical conversion handles the origin cleanly
* spherical-to-Cartesian conversion is explicit and deterministic

Verification:

* simple coordinate round-trip checks pass inside validation helpers

### Step 5: implement hydrogen `1s` and `2s` formulas

Create the explicit wavefunction modules.

Requirements:

* `radial.js` contains separate evaluators for `1s` and `2s`
* `angular.js` contains the `l = 0, m = 0` spherical factor
* `density.js` exposes spherical and Cartesian density evaluation
* `states.js` exposes an explicit registry with node metadata

Implementation policy:

* prefer readable formulas over compact abstractions
* comments should identify the represented state or formula family
* do not add generic support for arbitrary `n`, `l`, `m` in Phase 1

Verification:

* `1s` remains non-negative everywhere
* `2s` changes sign in its radial factor once, but density remains non-negative
* state metadata matches expected radial nodes

### Step 6: implement deterministic RNG and truncation

Create `sampling/rng.js` and `sampling/truncation.js`.

Requirements:

* sampling code uses only the seeded generator
* truncation settings are explicit data, not hidden constants
* truncation helpers can be inspected in validation output

Verification:

* same seed gives identical random sequence
* invalid truncation settings fail fast with clear messages

### Step 7: implement the first sampling pipeline

Create `sampling/sampleHydrogenState.js`.

Initial policy:

* implement one simple documented method first
* optimize only if validation or interactive use later proves it necessary

The function should return:

* Cartesian positions suitable for later geometry creation
* metadata including state ID, sample count, seed, and truncation

Verification:

* requested sample count is returned
* metadata matches the request inputs
* repeated runs with the same seed reproduce identical output

### Step 8: implement validation before graphics

Create the validation entrypoint and checks.

Required checks:

* normalization estimate for `1s`
* normalization estimate for `2s`
* radial node check for `1s`
* radial node check for `2s`
* deterministic RNG and deterministic sampling summary checks
* radial histogram sanity check comparing sampled behavior to expected radial structure

Validation output should report:

* check name
* state ID when relevant
* tolerance
* measured result
* pass or fail

Normalization note:

* if a check uses a finite radial cutoff, compare against the expected truncated probability mass inside that cutoff
* do not treat `1` as the automatic reference value unless the integration domain is untruncated
* include the cutoff and the reference value in the reported result

Verification:

* `npm run validate` works without a browser
* failures stop the script with a non-zero exit code

## Success criteria

Phase 1 is done when all of the following are true:

* the repo contains a working Vite app scaffold
* `npm run build` succeeds
* `npm run validate` succeeds
* `1s` and `2s` density evaluation exists in isolated model modules
* the state registry is explicit and inspectable
* the sampler is seeded and reproducible
* no scientific code depends on Three.js, the DOM, or a render loop
* no rendering code is required to run validation

## Phase 1 review checklist

Before marking Phase 1 complete, verify:

* no `Math.random()` appears in the scientific pipeline
* no hydrogen formulas appear outside `src/physics/`
* no hidden radial cutoff appears outside config or truncation data
* `2s` node expectations are encoded in state metadata and checked in validation
* validation summaries include the actual cutoff and seed used
* the codebase is still small and direct, without speculative abstractions

## Risks to manage inside this phase

### Risk 1: over-generalizing the hydrogen formulas

Avoid building a symbolic or fully generic orbital framework now.
Version 1 needs `1s` and `2s`, not a complete hydrogen algebra package.

### Risk 2: choosing a sampler that is hard to verify

The first sampler should be explicit enough that the histogram and determinism checks can catch mistakes.
A clever but opaque sampler is the wrong trade.

### Risk 3: letting validation become visually coupled

Validation must remain runnable in pure Node.
Do not import Three.js into validation modules.

### Risk 4: mixing future render defaults into current scientific behavior

Camera and material defaults may live in config, but they must not shape the model or sampling logic.

## Explicit deferrals to Phase 2

Phase 2 should begin only after Phase 1 is verified.

Phase 2 will cover:

* scene creation
* camera and orbit controls
* nucleus marker
* point-cloud geometry construction
* scene controller regeneration logic
* minimal DOM controls

Phase 2 should not begin if Phase 1 validation is still unstable.

## Recommended first TODO after this plan is accepted

Use one small reviewable chunk:

* scaffold Vite in the repo root, install `three`, remove starter demo files, create the Phase 1 folder structure, and add `src/app/config.js`

That chunk is small enough for one review cycle and unlocks all later Phase 1 work.
