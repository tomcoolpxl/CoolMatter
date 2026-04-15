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
