# Version 2 - Phase 2: Time-Evolution Architecture & UI

## Purpose
Phase 2 focuses on transitioning the application from a static, event-driven visualization into a dynamic, time-evolving engine. This requires updating the central render loop to track simulation time and overhauling the user interface to manage playback and complex multi-state superpositions.

This phase bridges the pure mathematical engine built in Phase 1 with the advanced rendering systems that will be built in Phases 3 and 4.

## Step 1: AppState Expansion
The application state must be expanded to handle time and collections of quantum states, rather than a single hardcoded state ID.
*   **Update:** `src/ui/appState.js`.
*   **New State Variables:**
    *   `time: 0.0` (Current simulation time $t$).
    *   `isPlaying: false` (Whether time is currently advancing).
    *   `timeScale: 1.0` (Multiplier for real-time to simulation-time mapping).
    *   `superposition: []` (Replaces `selectedStateId`). An array of objects: `{ n, l, m, magnitude, phase }`.
*   **Reactivity:** Separate high-frequency state updates (like `time` changing every frame) from low-frequency updates (like changing a slider). High-frequency updates should preferably bypass the standard heavy event dispatcher to avoid DOM thrashing unless specifically needed by a UI element.

## Step 2: The Dynamic Render Loop
Version 1 intentionally avoided evaluating anything during `requestAnimationFrame` unless the camera moved. We must now introduce a universal clock.
*   **Update:** `src/app/createApp.js` and `src/scene/sceneController.js`.
*   **Implementation:**
    *   Instantiate a `THREE.Clock` or use `performance.now()` in the main animation loop.
    *   On each frame:
        *   If `appState.isPlaying` is true, calculate `delta = clock.getDelta() * appState.timeScale`.
        *   Update `appState.time += delta`.
        *   Call `sceneController.update(appState.time, delta)`.
    *   Ensure the camera controls (`OrbitControls`) continue to update independently of the simulation pause state.

## Step 3: Playback & Timeline Controls
The user needs to be able to pause, play, and scrub through quantum time.
*   **Update:** `src/ui/controlPanel.js`.
*   **New DOM Elements:**
    *   **Play/Pause Button:** Toggles `appState.isPlaying`.
    *   **Time Scale Slider:** Adjusts how fast the phase evolves (e.g., $0.1\times$ to $10\times$).
    *   **Time Readout/Scrubber:** A visual indicator of the current phase time $t$. (Optional scrubbing, but useful for debugging).

## Step 4: The Superposition Mixer (UI)
The simple "1s / 2s" dropdown from Version 1 is no longer sufficient. Users must be able to mix states to see interference patterns.
*   **Update:** `src/ui/controlPanel.js`.
*   **New DOM Elements:**
    *   **State List:** A dynamic list showing active quantum components.
    *   **Add Component:** Allow the user to input $n, l, m$ and add it to the superposition. (Include validation so $l < n$ and $|m| \le l$).
    *   **Weight Sliders:** For each component, provide a slider for **Magnitude** (amplitude) and **Phase** (starting angle offset).
*   **Auto-Normalization:** When a magnitude slider is adjusted, the UI or `appState` should automatically normalize the total probability to 1.0 (so $\sum |c_i|^2 = 1$). Provide visual feedback of the normalized percentage.

## Step 5: Wiring the Controller Hooks
`sceneController.js` must be prepared to handle continuous data streams.
*   **Update:** `src/scene/sceneController.js`.
*   **Implementation:**
    *   Create a clean separation between `onRegenerate()` (triggering a full rebuild of the scene) and `onTimeUpdate()` (triggering streaming updates to existing geometries or shader uniforms).
    *   If the superposition changes (adding/removing a state), trigger `onRegenerate`.
    *   If only `time` changes, trigger `onTimeUpdate` (which will be implemented fully in Phase 3/4).

## Phase 2 Completion Criteria
1. The application loop runs smoothly with a functional `isPlaying` toggle and `timeScale` multiplier.
2. The UI features a "State Mixer" allowing the user to seamlessly add multiple valid $(n, l, m)$ configurations, adjusting their relative magnitudes and phases.
3. The underlying `appState` correctly normalizes the weights and maintains a well-formed superposition array.
4. The system differentiates between heavy regeneration events (adding a state) and lightweight continuous events (time passing), establishing the scaffolding for the high-performance rendering phases.
