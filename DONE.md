# Done

## Phase 1 chunk 1

Verified on April 15, 2026:

* scaffolded the Vite vanilla JavaScript app in the repository root
* installed `three`
* removed starter demo code instead of adapting it
* created the Phase 1 source directory skeleton
* added `src/app/config.js` as the single source of initial defaults
* verified the bootstrap with `npm run build`

## Phase 1 chunk 2

Verified on April 15, 2026:

* added named scientific constants and validation tolerances in `src/physics/constants.js`
* implemented explicit Cartesian/spherical coordinate conversion helpers in `src/physics/hydrogen/coordinates.js`
* added shared assertion helpers in `src/utils/assert.js`
* added a pure-Node validation entrypoint in `src/validation/runValidation.js`
* added origin-handling and coordinate round-trip checks in `src/validation/coordinateChecks.js`
* verified `npm run validate`
* re-verified `npm run build`

## Maintenance

Verified on April 15, 2026:

* standardized `package.json` around conventional npm entrypoints for development, testing, and verification
* added `start`, `test`, and `check` scripts while keeping the existing Vite defaults
* pinned the npm version in `packageManager` and documented the required Node floor in `engines`
* documented the expected npm usage concisely in `GEMINI.md`
