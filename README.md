# CoolMatter

CoolMatter is a browser-based 3D project focused on visualizing hydrogen stationary states.

It is intended as a small, physics-driven viewer for exploring hydrogen orbital probability distributions with a simple web stack and a viewer-first control surface.

## Setup

- `npm install`
- `npx playwright install chromium`

## Standard Commands

- `npm run dev` or `npm start`: local Vite development server
- `npm run build`: production build to `dist/`
- `npm run preview`: preview the built app locally
- `npm run validate`: pure-Node scientific validation
- `npm run test:unit`: unit tests
- `npm run test:integration`: integration tests
- `npm run test:e2e`: Playwright browser tests
- `npm run check`: standard verification pass

## Current Scope

- Hydrogen `1s` and `2s` stationary states
- Guided preset-first orbital selection, including a balanced `1s + 2s` mix
- Seeded electron point-cloud sampling
- Three.js inspection viewer with in-view playback and render-mode actions
- Progressive disclosure for reproducibility and diagnostics controls

## Controls

- Preset cards to jump between supported states and mixes
- Component cards for normalized weight and phase adjustment
- Drag to orbit the cloud
- Right-drag or `W`, `A`, `S`, `D` to pan
- Scroll to zoom
- Viewer toolbar `Play motion` toggles time evolution
- Viewer toolbar `Point Cloud` / `Volumetric` switches render mode
- `Reset camera` restores the default framing and origin target

## Deployment

GitHub Pages should deploy the built `dist/` output, not the raw repository source files.
The Vite build is the authoritative static artifact for hosting.
