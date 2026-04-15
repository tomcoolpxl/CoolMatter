# Version 2 - Phase 4: Volumetric Rendering Pipeline

## Purpose
Phase 4 introduces true real-time volumetric rendering. While Phase 3 successfully animated the V1 Point Cloud, sampling thousands of points via rejection sampling on the CPU every frame limits performance. 

To visualize continuous, fluid probability shifts of time-dependent superpositions optimally, we must implement Raymarching. This means relaxing the `DESIGN.md` rule against physics in rendering classes by translating the Generalized Mathematical Foundation (from Phase 1) directly into a WebGL Fragment Shader.

## Step 1: The GLSL Mathematical Foundation
We must translate the hydrogen wavefunction mathematics into GLSL to run per-pixel natively on the GPU.
*   **Create:** `src/renderables/shaders/hydrogenCore.glsl`.
*   **Implementation:**
    *   Implement factorial, permutations, and powers (or use precomputed coefficients passed via uniforms).
    *   Implement GLSL functions for Generalized Laguerre Polynomials $L_{n-l-1}^{2l+1}(2r/n)$. 
    *   Implement GLSL functions for Associated Legendre Polynomials $P_l^m(\cos\theta)$.
    *   Implement complex number arithmetic natively: `vec2 add(vec2 a, vec2 b)`, `vec2 multiply(vec2 a, vec2 b)`, `vec2 expImaginary(float phase)`.
    *   Implement the core spatial component scaling combining the radial and angular components.

## Step 2: The Raymarching Volume Shader
Create the actual shader material that acts as the bounding box for the hydrogen atom.
*   **Create:** `src/renderables/shaders/volumetric.glsl` (Fragment & Vertex).
*   **Create:** `src/renderables/createVolumetricCloud.js`.
*   **Implementation:**
    *   Create a simple `THREE.BoxGeometry` to act as the rendering boundary.
    *   The Vertex shader simply sets `gl_Position` and passes the world-space or object-space coordinates to the varying variables.
    *   The Fragment shader performs the **Raymarch**:
        *   Determine the camera ray direction through the bounding box.
        *   Step along the ray `N` times (e.g., 64-128 steps).
        *   At each step, calculate $r, \theta, \phi$.
        *   Iterate through a uniform array of active quantum states up to `MAX_STATES` (e.g., 4).
        *   For each state, evaluate the full spatial and time evolution functions from `hydrogenCore.glsl`.
        *   Accumulate the resulting density (`magnitudeSq`) and map it to an RGBA color and opacity value using a transfer function.
        *   Accumulate opacity along the ray (using standard back-to-front or front-to-back alpha blending).

## Step 3: Uniform Data Pipeline
The mathematical variables managed in `appState` need to pipe into the shader's memory seamlessly every frame.
*   **Update:** `src/scene/sceneController.js`.
*   **Implementation:**
    *   If mounted, obtain the active `ShaderMaterial`.
    *   On `onTimeUpdate(t)`:
        *   Pass `t` to the uniform `u_time`.
    *   On `onRegenerate()`:
        *   Serialize the `appState.superposition` array (e.g., extract arrays for `u_n[4]`, `u_l[4]`, `u_m[4]`, and `u_weights[4]`).
        *   Pass these arrays to the shader uniforms.
        *   Pass the number of active states to `u_activeStates`.
        *   Pass visual parameters like `u_opacityScale` and `u_colorMap`.

## Step 4: Display Mode Toggling
The user must be able to switch between the historical Point Cloud representation and the new Volumetric representation depending on their hardware capability or physical preference.
*   **Update:** `src/ui/appState.js` & `src/ui/controlPanel.js`.
*   **New State & UI Control:** `renderMode: 'point_cloud' | 'volumetric'`.
*   **Update:** `src/scene/sceneController.js`.
*   **Implementation:**
    *   Implement `switchRenderMode(mode)` logic. 
    *   If switching to volumetric: Use `utils/dispose.js` to clear the `THREE.Points` geometry and materials from memory, construct the `createVolumetricCloud` bounding box, attach the uniforms, and mount it to the scene origin.
    *   If switching to point cloud: Dispose of the volume material, pause `u_time` execution on the shader, and mount the V1 points logic natively. Note that switching back triggers a full Monte-Carlo rejection sample regeneration on the CPU.

## Phase 4 Completion Criteria
1. The complex arithmetic and Legendre/Laguerre functions operate identically (visually) in the GLSL shader as they do in the pure Node JS phase 1 math engine.
2. The user can switch the visualizer smoothly from a streaming Point Cloud over to a solid Volumetric raymarched glowing cloud.
3. The GLSL Volumetric mode dynamically pulls $n, l, m$, and weight values directly from the UI State Mixer.
4. When "Play" is pressed, the Superposition interference patterns smoothly wave and evolve at 60 FPS natively on the GPU.
5. The `THREE.ShaderMaterial` manages scaling, clipping, and culling seamlessly without crashing the V1 scene setup.