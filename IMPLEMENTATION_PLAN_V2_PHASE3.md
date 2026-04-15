# Version 2 - Phase 3: Scintillating Point Cloud

## Purpose
Phase 3 converts the static point cloud from Version 1 into a living, animating "scintillating" visualization. When a user creates a time-dependent superposition, the probability density shifts continuously. Instead of destroying and rebuilding the entire point cloud geometry every frame (which would destroy performance), we will update a small fraction of the points every frame.

This continuous partial-resampling produces a bubbling or "scintillating" effect where the cloud appears to flow and morph naturally, tracking the analytical physics model at time $t$.

## Step 1: Implement Dynamic Point Cloud Geometry
Three.js uses `THREE.StaticDrawUsage` by default for buffer attributes, optimizing them for data that never changes. We need to modify this.
*   **Update:** `src/renderables/createElectronPointCloud.js`.
*   **Implementation:**
    *   Set the position attribute's usage to `THREE.DynamicDrawUsage` (or `StreamDrawUsage`):
        `geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));`
    *   Return the original `Float32Array` attached to the mesh so it can be mutated directly by the sampling engine later.

## Step 2: Streaming Batch Resampler
The core sampling function must be expanded to mutate an existing array of points in-place, rather than returning a newly allocated array.
*   **Update:** `src/sampling/sampleHydrogenState.js` (or add `streamingSampler.js`).
*   **Implementation:**
    *   Implement `resampleBatch(positions, superposition, time, replaceCount, truncationData, rng)`.
    *   Instead of replacing all $N$ points, the method only loops `replaceCount` times (e.g., $1\%$ to $5\%$ of the total points).
    *   Randomly pick an index in the `positions` array (which represents an $x, y, z$ coordinate).
    *   Generate a *new* valid sample using the existing Rejection Sampling logic evaluated against the mathematical density at the current `time`.
    *   Overwrite the old $x, y, z$ values at the chosen index with the new ones.
    *   *Optimization Check:* Ensure the maximum density bound ($M$) used for rejection sampling is accurately recalculated or safely bounded for the specific superposition at time $t$.

## Step 3: Scene Controller Streaming Updates
Now it's time to connect the `requestAnimationFrame` loop to the batch resampler.
*   **Update:** `src/scene/sceneController.js`.
*   **Implementation:**
    *   Implement the `onTimeUpdate(t, delta)` method.
    *   Calculate how many points should be replaced this frame: `const replaceCount = Math.floor(totalPoints * scintillationRate * delta)`.
    *   Retrieve the current `Float32Array` of positions from the active `THREE.Points` geometry.
    *   Pass the array, active superposition, time `t`, and `replaceCount` to `resampleBatch`.
    *   After mutation, flag the geometry attribute to be pushed to the GPU:
        `points.geometry.attributes.position.needsUpdate = true;`

## Step 4: Control Panel Extensibility
Allow the user to control how "fast" the cloud boils/scintillates.
*   **Update:** `src/ui/appState.js` & `src/ui/controlPanel.js`.
*   **New App State:** `scintillationRate: 0.05` (e.g., replace 5% of points per second).
*   **New UI Control:** Add a "Scintillation Rate" slider in the DOM to let the user tune the visual activity. A fast rate looks fluid but burns CPU; a slow rate looks chunky but is highly performant.

## Step 5: Testing & Memory Validation (Critical)
Because Phase 3 introduces high-frequency per-frame mutations, memory leaks must be prevented.
*   **Tasks:**
    *   Audit the `resampleBatch` loop to ensure absolutely **zero** object or array allocations occur inside the per-frame loop (`new Float32Array()`, `new THREE.Vector3()`, etc. are strictly forbidden here). Everything must be done with primitive numbers and in-place array mutation.
    *   Add a test in `tests/integration/sampling-pipeline.test.js` that calls `resampleBatch` 1,000 times on an existing array and verifies that the modified elements match the new time-dependent distribution.
    *   Verify that `needsUpdate` successfully passes the modified buffers to WebGL without crashing the GPU context.

## Phase 3 Completion Criteria
1. The `THREE.Points` buffer is successfully configured for dynamic streaming.
2. The core sampling logic can partially mutate a pre-allocated `Float32Array` in place using the superposition density evaluated at time $t$.
3. When the user sets a superposition of two states and presses "Play", the static point cloud begins to continuously morph and flow across the screen.
4. CPU profiling shows stable garbage collection (no per-frame object allocation spikes).