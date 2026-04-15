# CoolMatter - Version 2 Plan

## Overview
This document outlines the planned features and architectural extensions for Version 2 of the CoolMatter project. It builds upon the stable, scientifically validated foundation established in Version 1 and the scalar/isosurface extensions of Version 1.5.

## Planned Features

According to the project `REQUIREMENTS.md`, Version 2 introduces advanced quantum mechanical visualizations and transitions into hadronic physics:

*   **Expanded Eigenstates:** Support for more hydrogen eigenstates beyond 1s, 2s, and 2p.
*   **Controlled Superpositions:** Visualization of combinations of different eigenstates (e.g., mixing 1s and 2p states).
*   **Time Dependence:** Adding visual evolution where physically justified (e.g., observing the time-evolution of superposition states).
*   **Volumetric Rendering:** Moving beyond point clouds and basic isosurfaces to true volumetric rendering experiments.
*   **Advanced Atomic-Core Handling:** A more detailed representation of the nucleus moving beyond a simple visual marker.
*   **Proton-Related Exploration:** Introducing hadronic physics models (quarks, gluons) in a clearly separate operational mode.

## Architectural Implications & Guidelines

According to the project `DESIGN.md`, incorporating these Version 2 features must follow strict separation rules:

### 1. Hadronic/Proton Isolation
Future proton work must be treated as a separate domain module and likely a completely separate runtime mode.
*   Hydrogen code remains strictly under `physics/hydrogen/`.
*   Proton or hadronic code will live in parallel modules (e.g., `physics/proton/`).
*   Scene infrastructure reuse is acceptable, but the scientific models must remain physically and programmatically separated.

### 2. Time Evolution & The Render Loop
Version 1 explicitly excluded time evolution, allowing for a static render loop that only updates on parameter changes. 
*   Introducing time dependence for superpositions will require updating the render loop to evaluate time-dependent wavefunctions (or their densities) per frame.
*   This must be done without breaking the static visualization modes of Version 1 eigenstates.

### 3. Rendering Extensibility
The separation of wave mathematics, sampling, and rendering primitives was designed precisely for this version.
*   Volumetric rendering must consume the same fundamental `|psi|^2` density evaluators or field generators, ensuring the underlying physics remains authoritative.
*   Implementation of advanced shaders (e.g., raymarching) must remain within the `renderables/` boundary and not leak into the `physics/` layer.
