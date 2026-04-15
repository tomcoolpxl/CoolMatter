# CoolMatter

CoolMatter is a browser-based 3D project focused on visualizing hydrogen stationary states.

It is intended as a small, physics-driven viewer for exploring hydrogen orbital probability distributions with a simple web stack.

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
- Seeded electron point-cloud sampling
- Plain DOM controls
- Three.js inspection viewer

## Controls

- Drag to orbit the cloud
- Right-drag or `W`, `A`, `S`, `D` to pan
- Scroll to zoom
- `Reset camera` restores the default framing and origin target

## Deployment

GitHub Pages should deploy the built `dist/` output, not the raw repository source files.
The Vite build is the authoritative static artifact for hosting.
