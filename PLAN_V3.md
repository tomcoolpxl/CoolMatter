# CoolMatter - Version 3 Plan

## Overview
This document outlines the planned features and architectural extensions for Version 3 of the CoolMatter project. After solidifying the advanced electron cloud visualizations, time dependence, and volumetric rendering in Version 2, Version 3 shifts focus directly into the nucleus to explore hadronic physics modeling.

## Planned Features

*   **Advanced Atomic-Core Handling:** A more detailed representation of the nucleus, exploring its substructure.
*   **Proton-Related Exploration:** Introducing hadronic physics models (quarks, gluons) in a clearly separate operational mode.

## Architectural Implications & Guidelines

According to the project `DESIGN.md`, diving into the atomic nucleus requires a fundamental architectural shift:

### 1. Hadronic/Proton Isolation
Future proton work must be treated as a separate domain module and likely a completely separate runtime mode.
*   Hydrogen code remains strictly under `physics/hydrogen/`.
*   Proton or hadronic code will live in parallel modules (e.g., `physics/proton/`).
*   Scene infrastructure reuse is acceptable, but the scientific models must remain physically and programmatically separated.
*   The vast scale differences (Bohr radius vs. femtometers) and governing physical laws (Schrödinger equation vs. Quantum Chromodynamics) dictate that the electron and proton levels operate in decoupled physical simulators, even if they share UI scaffolding.
