# Implementation State and Architecture

## Purpose
This document describes the reality of the current project implementation. It serves as the authoritative source on the application's structure, design decisions, and testing boundaries for any AI agent interacting with the CoolMatter repository. 

All four initial implementation phases (Scientific Foundation, Rendering Shell, Interaction, Hardening) have been completed. 

## Current Architecture Overview

The project is a browser-based 3D hydrogen orbital viewer enforcing strict separation between scientific calculation (the "model") and visual representation (the "view"). 

### Key Technologies
- **App Scaffold**: Vite (vanilla JavaScript template)
- **3D Rendering**: Three.js (`three`), specifically `THREE.Points` and `THREE.PointsMaterial`.
- **Camera Controls**: `OrbitControls` (from `three/addons`).
- **Testing**: `vitest` for unit/integration testing, `playwright` for end-to-end browser testing.

### Directory Structure & Responsibilities

- `src/app/`
  - `config.js`: Centralized defaults (seeds, states, visual radii) to prevent magic numbers.
  - `createApp.js`: Ties the model, view, and controller together to launch the application.
- `src/physics/hydrogen/`
  - `constants.js`: Bohr radius scale conventions and scientific tolerances.
  - `coordinates.js`: Conversions between Cartesian and spherical coordinates.
  - `radial.js`, `angular.js`, `density.js`, `states.js`: Pure mathematical evaluators for `1s` and `2s` spatial probability densities. Free of rendering logic.
- `src/sampling/`
  - `rng.js`: Deterministic seeded pseudo-random number generator. MUST be used for all random samples.
  - `truncation.js`: Defines radial cutoffs for finite domain estimation.
  - `sampleHydrogenState.js`: Rejection-sampling pipeline using Monte Carlo methods over `|psi|^2`.
- `src/scene/`
  - `createScene.js`, `createCamera.js`, `createRenderer.js`, `createLights.js`, `createControls.js`: Pure Three.js object wrappers.
  - `sceneController.js`: Manages the visual lifecycle (mounting, disposing, and updating the point cloud and nucleus marker).
- `src/renderables/`
  - `materials.js`: Centralized visual material creation.
  - `createElectronPointCloud.js`: Processes `Float32Array` buffers into `BufferGeometry` for `THREE.Points`.
  - `createNucleusMarker.js`: The central origin marker, supporting multiple modes (physical scale vs. visually enlarged).
- `src/ui/`
  - `appState.js`: The central reactive state that emits events on change. 
  - `controlPanel.js`: Vanilla DOM-based control panel avoiding heavy frameworks like React or Vue. 
- `src/validation/`
  - Runs pure-Node structural checks via `npm run validate` bypassing the browser. Verifies norm, modes, truncations, and RNG determinism.
- `tests/`
  - Complete integration and unit test coverage matching the files in `src/`. e2e coverage checks UI/visual contract directly via Playwright.

## Implemented Flow (Data Pipeline)

1. **State Selection**: User selects parameter (e.g., `1s`, 10k samples) via `controlPanel.js`.
2. **State AppState Event**: `appState.js` updates and fires an event.
3. **Controller Handling**: `sceneController.js` handles the event.
   - If it's a visual-only update (e.g., point size), it edits the material directly.
   - If it's a regeneration update (e.g., seed, state, sample count), it calls the sampling pipeline.
4. **Sampling Data**: `sampleHydrogenState.js` gets the mathematical state from `states.js`, draws deterministic numbers from `rng.js`, tests them against `density.js`, and yields an array of positions.
5. **Geometry Construction**: The positions go to `createElectronPointCloud.js`. Old geometry is disposed via `utils/dispose.js`. The new model is mounted to the scene.

## Strict Rules

1. **Deterministic Randomness**: `Math.random()` is forbidden in the physical pipeline. Always use `rng.js`.
2. **No Visual Contamination**: The `src/physics/` layer must NEVER import `three` or interact with visual concerns.
3. **Re-runs are identical**: Two sampling passes with the same string seed must render the identical point geometry buffer.
4. **Validation First**: Numerical correctness is asserted numerically natively (`npm run validate`), separately from unit and e2e testing.
5. **No Speculative Abstraction**: Avoid adding flexible features not yet requested (`2p` capabilities, shaders, volumetrics).

## Completion Status
The version 1 milestones are DONE.

- 1s and 2s hydrogen densities are implemented and numerically verified.
- The viewer works via Vite preview and builds out successfully to GitHub pages.
- Memory management (disposal on regeneration) is tested and in place.
