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

## Phase 1 chunk 3

Verified on April 15, 2026:

* implemented explicit `1s` and `2s` radial formulas in `src/physics/hydrogen/radial.js`
* implemented the `l = 0, m = 0` angular factor in `src/physics/hydrogen/angular.js`
* added the explicit state registry in `src/physics/hydrogen/states.js`
* added spherical and Cartesian density evaluators in `src/physics/hydrogen/density.js`
* added normalization checks in `src/validation/normalizationChecks.js`
* added radial node metadata and behavior checks in `src/validation/nodeChecks.js`
* documented that finite-cutoff normalization checks must compare against truncated mass, not blindly against `1`
* verified the scientific core with `npm test`
* verified the standard verification pass with `npm run check`

## Maintenance

Verified on April 15, 2026:

* added standard unit and integration test entrypoints to `package.json`
* added unit tests for coordinate utilities, radial formulas, state metadata, density evaluation, and validation helpers
* added an integration test for the end-to-end scientific validation runner
* updated `npm run check` to run build, unit tests, integration tests, and validation
* documented in `GEMINI.md` that every implementation chunk must add or update both unit and integration coverage

## Phase 1 chunk 4

Verified on April 15, 2026:

* implemented a deterministic seeded RNG in `src/sampling/rng.js`
* implemented explicit spherical truncation helpers in `src/sampling/truncation.js`
* added deterministic RNG validation in `src/validation/deterministicChecks.js`
* added truncation validation in `src/validation/truncationChecks.js`
* extended unit coverage for RNG and truncation behavior in `tests/unit/rng-and-truncation.test.js`
* extended integration coverage for the aggregated validation pipeline in `tests/integration/validation-runner.test.js`
* verified the standard verification pass with `npm run check`

## Phase 1 chunk 5

Verified on April 15, 2026:

* implemented the first truncated radial sampling pipeline in `src/sampling/sampleHydrogenState.js`
* kept the sampler explicit for Phase 1 `s` states with seeded reproducibility and inspectable metadata
* extended deterministic validation to include sampled-position reproducibility in `src/validation/deterministicChecks.js`
* added unit coverage for sampling metadata, reproducibility, and truncation-respecting positions in `tests/unit/sample-hydrogen-state.test.js`
* added integration coverage for the sampled pipeline boundary in `tests/integration/sampling-pipeline.test.js`
* updated the aggregated validation integration expectation in `tests/integration/validation-runner.test.js`
* verified the standard verification pass with `npm run check`

## Phase 1 chunk 6

Verified on April 15, 2026:

* implemented sampled radial histogram validation in `src/validation/histogramChecks.js`
* compared sampled radial behavior against the expected truncated radial structure for `1s` and `2s`
* extended the aggregated validation pipeline to include histogram checks in `src/validation/runValidation.js`
* added unit coverage for histogram validation in `tests/unit/histogram-checks.test.js`
* added integration coverage for histogram results in `tests/integration/sampling-pipeline.test.js`
* updated the aggregated validation integration expectation in `tests/integration/validation-runner.test.js`
* verified the standard verification pass with `npm run check`

## Phase 2 chunk 1

Verified on April 15, 2026:

* implemented the scene shell in `src/scene/createScene.js`, `src/scene/createCamera.js`, `src/scene/createRenderer.js`, `src/scene/createControls.js`, and `src/scene/createLights.js`
* added the minimal browser bootstrap in `src/app/createApp.js`
* updated `src/main.js` to launch the scene shell instead of the Phase 1 placeholder
* extended config with the scene background and camera projection defaults in `src/app/config.js`
* added unit coverage for the scene factories in `tests/unit/scene-shell.test.js`
* added integration coverage for app bootstrap composition in `tests/integration/app-bootstrap.test.js`
* documented the non-blocking Vite chunk-size warning as a deferred optimization review for Phase 4
* verified that `npm run check` still passes after rendering integration

## Maintenance

Verified on April 15, 2026:

* replaced `index.html` with a self-contained GitHub Pages landing page that does not depend on `/src/main.js`
* crafted the page so GitHub Pages can serve it directly as a static site with inline HTML and CSS only
* added unit coverage for the landing-page content in `tests/unit/gh-pages-index.test.js`
* added integration coverage for the GitHub Pages static-hosting contract in `tests/integration/gh-pages-contract.test.js`
* verified that `npm run check` still passes and that the build emits a standalone static `dist/index.html`

## Phase 2 chunk 2

Verified on April 15, 2026:

* implemented renderable materials in `src/renderables/materials.js`
* implemented the first electron point-cloud renderable in `src/renderables/createElectronPointCloud.js`
* implemented the nucleus marker renderable in `src/renderables/createNucleusMarker.js`
* updated `src/app/createApp.js` to request the validated sampled data and add the first visible cloud and nucleus marker to the scene
* extended config with electron and nucleus render defaults in `src/app/config.js`
* added unit coverage for materials and renderables in `tests/unit/renderables.test.js`
* extended integration coverage for app composition to include sampled data and visible renderables in `tests/integration/app-bootstrap.test.js`
* verified that `npm run check` still passes after the first visible render integration

## Phase 3 chunk 1

Verified on April 15, 2026:

* implemented explicit app state in `src/ui/appState.js`
* implemented scene-object ownership and the regeneration-versus-visual-update split in `src/scene/sceneController.js`
* updated `src/app/createApp.js` to delegate viewer object ownership to the scene controller and use app state as the current settings source
* added unit coverage for app state in `tests/unit/app-state.test.js`
* added unit coverage for scene-controller replacement and visual-update behavior in `tests/unit/scene-controller.test.js`
* updated integration coverage in `tests/integration/app-bootstrap.test.js` for the new bootstrap wiring
* verified that `npm run check` still passes after the Phase 3 architectural split

## Phase 3 chunk 2

Verified on April 15, 2026:

* implemented the plain-DOM control panel in `src/ui/controlPanel.js`
* updated `src/app/createApp.js` to wire control-panel events through app state and the scene-controller split
* extended config with explicit supported state IDs for UI option creation in `src/app/config.js`
* added unit coverage for control-panel event routing in `tests/unit/control-panel.test.js`
* extended integration coverage in `tests/integration/app-bootstrap.test.js` for control-panel wiring and update dispatch
* verified that `npm run check` still passes after the full Phase 3 interaction wiring

## Maintenance

Verified on April 15, 2026:

* added Playwright as a proper end-to-end test layer with `@playwright/test`
* added `playwright.config.js` with a real browser target and `vite preview` web-server integration
* added the browser smoke test in `tests/e2e/app.spec.js`
* updated `package.json` with `preview:e2e`, `test:e2e`, and a `check` flow that includes Playwright
* updated `GEMINI.md` so Playwright coverage is part of the repo testing rules when the browser-facing flow changes
* verified `npm run test:e2e`
* verified `npm run check`

## Phase 4 chunk 1

Verified on April 15, 2026:

* implemented explicit object disposal in `src/utils/dispose.js`
* updated `src/scene/sceneController.js` to dispose replaced point-cloud and nucleus resources during replacement paths
* updated `src/app/createApp.js` to own explicit resize handling for camera aspect, projection updates, renderer pixel ratio, and renderer size
* added unit coverage for disposal helpers in `tests/unit/dispose.test.js`
* extended unit coverage for scene-controller disposal behavior in `tests/unit/scene-controller.test.js`
* extended integration coverage for resize ownership in `tests/integration/app-bootstrap.test.js`
* verified `npm run check` including unit, integration, Playwright, and validation flows

## Phase 4 chunk 2

Verified on April 15, 2026:

* added minimal developer-facing diagnostics for current state, sample metadata, and validation context in `src/ui/controlPanel.js`
* updated `src/app/createApp.js` to keep diagnostics synchronized with state and regeneration updates
* added the shared validation summary manifest in `src/validation/manifest.js`
* extended unit coverage for diagnostics updates in `tests/unit/control-panel.test.js`
* extended integration coverage for diagnostics wiring and viewport ownership in `tests/integration/app-bootstrap.test.js`
* extended Playwright coverage in `tests/e2e/app.spec.js` to verify the diagnostics block in the live browser flow
* reran the full verification pass and confirmed `npm run check` succeeds for version 1
* reviewed the deferred build-size warning and left it documented rather than optimizing it now because it is not blocking correctness, static hosting, or version 1 scope
