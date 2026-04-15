# Implementation Plan - Version 2

## Purpose of this Document
This document translates the goals defined in `PLAN_V2.md` into a concrete, phased implementation plan. Version 2 fundamentally shifts the application from static, time-independent eigenstate visualizations into dynamic, time-evolving superposition states with high-performance rendering modes.

## Architectural Updates & Rule Deviations
Based on the demanding performance requirements of real-time time-dependent volumetric rendering, **the `DESIGN.md` restriction against "physics formulas in rendering classes" must be relaxed.** 
*   **Math in GLSL:** To evaluate volumetric fields at 60fps, a synchronized implementation of the hydrogen density mathematical and complex evaluation will be permitted directly inside custom Fragment Shaders (`ShaderMaterial`).
*   **Dynamic Sampling:** The `samplers/` layer will be refactored to support partial, streaming updates (a "scintillating" point cloud) to reflect changing probability densities over time, rather than completely disposing and rebuilding geometries.

---

## Phase 1: Generalized Mathematical Foundation & Superpositions
*The goal of this phase is to expand the physics engine to support arbitrary eigenstates, complex numbers, and multi-state superpositions over time.*

### Step 1: Implement Complex Number Utilities
*   Create a lightweight `utils/complex.js` helper.
*   Required operations: addition, multiplication, conjugates, and complex exponentials (Euler's formula) necessary for representing $\Psi = c_i e^{-iE_i t / \hbar}$.

### Step 2: Generalized Eigenstate Evaluator
*   Refactor `physics/hydrogen/radial.js` to calculate generalized associated Laguerre polynomials.
*   Refactor `physics/hydrogen/angular.js` to calculate generalized spherical harmonics ($Y_l^m$).
*   Update `states.js` to dynamically generate states for any valid $n, l, m$ tuple instead of hardcoding `1s` and `2s`.

### Step 3: Implement Superposition States
*   Create `physics/hydrogen/superposition.js`.
*   Handle an array of weighted eigenstates with complex coefficients $c_i$.
*   Implement a time-dependent density evaluation method: `evaluateDensityTimeDependent(x, y, z, t)`.

**Milestone 1 Completion:** The core logic can evaluate the probability density of a mixed state (e.g., $50\%~1s + 50\%~2p_z$) at any point in time $t$ via pure-Node tests bypassing the browser.

---

## Phase 2: Time-Evolution Architecture & UI
*The goal is to wire time $t$ into the application state and loop, giving users the ability to control and visualize evolution.*

### Step 4: Engine Loop Update
*   Update `app/createApp.js` and the `sceneController.js` to track `deltaTime` via `requestAnimationFrame`.
*   Pass a cumulative `t` (simulation time) to the controlling systems without breaking the static mode.

### Step 5: Extend Application State & Control Panel
*   Update `ui/appState.js` to store:
    *   `isPlaying: boolean`
    *   `timeScale: number`
    *   `superpositionWeights: Array`
*   Update `ui/controlPanel.js` to add playback controls (Play/Pause, scrub timeline) and sliders to blend multiple quantum states actively.

**Milestone 2 Completion:** The interface exposes time controls and the render loop successfully circulates a global physical time parameter without crashing.

---

## Phase 3: Scintillating Point Cloud Implementation
*The goal is to animate the existing Monte Carlo point cloud visualization gracefully as the probability density shifts over time.*

### Step 6: Streaming Buffer Regeneration
*   Update `sampling/sampleHydrogenState.js` to support a `resampleBatch(existingPositions, count, t)` method.
*   Instead of replacing all points on regeneration, the system randomly rolls a percentage of the points each frame. If a point is rejected by the new probability density at time $t$, it is moved to a newly sampled position.

### Step 7: Scene Geometry Updates
*   Update `renderables/createElectronPointCloud.js` to flag the `BufferAttribute` as dynamic (`.needsUpdate = true`).
*   Modify `sceneController.js` to stream coordinate updates per frame if the state is marked as time-dependent.

**Milestone 3 Completion:** Switching to a mixed superposition state and pressing "Play" causes the point cloud to bubble, shift, and oscillate smoothly, migrating density precisely tracking the analytical physics model at time $t$.

---

## Phase 4: Volumetric Rendering Pipeline
*The goal is to implement true volumetric rendering, pushing the physical equations into GLSL to bypass the CPU bottleneck.*

### Step 8: Custom Volumetric Raymarching Shader
*   Create `renderables/shaders/volumetric.js`.
*   Implement a full-screen quad or bounding-box cube `ShaderMaterial` designed to raymarch through space.
*   Translate the generalized mathematical functions (radial polynomials, spherical harmonics, complex exponentiation) natively into GLSL.

### Step 9: Uniform Data Pipeline
*   Bind the UI state to the Shader's Uniforms. 
*   Send active eigenstates as uniform arrays (e.g., array of $(n, l, m)$, weights, and energy levels).
*   Send the current simulation time `t` continuously to the shader.

### Step 10: Display Mode Toggling
*   Update the `sceneController.js` to easily destroy the point cloud and mount the Volumetric cube based on a "Render Mode" UI dropdown.
*   Ensure that resizing, camera orbit, and focal points remain strictly consistent between both Point Cloud and Volumetric modes.

**Milestone 4 (Version 2 Complete):** Users can seamlessly switch between the scintillating point cloud and gorgeous volumetric isosurfaces, witnessing the continuous, fluid probability shifts of a superposition of $1s$ and $2p$ changing in real time over phase $t$. Validation includes visual continuity matching the analytical tests in Milestone 1.