# Code Review

Review date: 2026-04-15

Scope reviewed:
- implementation code under `src/`
- test suite under `tests/`
- deployment/runtime entrypoints in `index.html`, `package.json`, and `playwright.config.js`
- repo guidance in `README.md` and `GEMINI.md`

External references checked:
- Vite static deploy guidance for GitHub Pages: https://v4.vite.dev/guide/static-deploy
- Three.js `OrbitControls` docs: https://threejs.org/docs/examples/en/controls/OrbitControls.html
- Playwright `webServer` / config docs: https://playwright.dev/docs/test-webserver and https://playwright.dev/docs/test-configuration

## Findings

### 1. High: the built GitHub Pages artifact is not repo-subpath safe

Files:
- `package.json:8-18`
- `index.html:171-208`
- `tests/integration/gh-pages-contract.test.js:7-24`

Why this matters:
- The repository is explicitly optimized for GitHub Pages, but there is no `vite.config.js` with a `base` setting.
- Vite’s GitHub Pages guidance still requires `base: '/<REPO>/'` when deploying under `https://<user>.github.io/<repo>/`.
- The built artifact currently emits an absolute asset path. After `npm run build`, `dist/index.html` contains `src="/assets/index-....js"`, which will break on a repo-subpath deployment.

What is happening:
- The source `index.html` is manually written to be repo-subpath safe via `./src/main.js`.
- The production build is not held to the same contract, and the tests only inspect the source HTML rather than the built output.
- `vite preview` at `/` hides this bug because it does not simulate the Pages subpath.

Recommendation:
- Add `vite.config.js` and set `base` explicitly for the actual Pages target.
- Add an integration test that inspects `dist/index.html` after build and fails if it contains root-absolute asset URLs for a repo deployment.
- Decide on one authoritative hosting model: source-served import-map HTML or Vite-built artifact. Right now the repo is trying to support both and they disagree.

### 2. High: initial camera aspect and renderer sizing are computed before layout settles

Files:
- `src/app/createApp.js:17-22`
- `src/app/createApp.js:47-48`
- `src/app/createApp.js:70-83`
- `tests/integration/app-bootstrap.test.js:162-246`

Why this matters:
- The renderer and camera are created from `root.clientWidth` / `root.clientHeight` before `controlPanel` and `viewport` are mounted into the grid layout.
- In the real UI, the viewport is narrower than the root because the control panel occupies a column.
- `handleResize()` is registered, but it is not called once after mount.

User-visible effect:
- The first rendered frame can start with the wrong aspect ratio and canvas sizing until the user manually resizes the window.
- That is a credible explanation for the reported “point cloud is not centered properly” feeling even when the sampled centroid is near zero.

Recommendation:
- Mount first, then immediately measure `viewport` and call `handleResize()` once before or right after the first render loop iteration.
- Add a regression test that asserts the initial renderer size is derived from `viewport`, not just the root.

### 3. High: `npm run validate` can report success even if a check returns `pass: false`

Files:
- `src/validation/runValidation.js:19-30`
- `tests/integration/validation-runner.test.js:5-20`

Why this matters:
- `runValidation()` prints `PASS` or `FAIL` based on `result.pass`, but it never turns a failed result into a non-zero exit.
- It always ends with `Validation complete: ${results.length} checks passed.`
- The current implementation only fails when a check throws, so the `pass` field is effectively unused for process correctness.

Impact:
- The validation API is internally inconsistent.
- A future check implementation that returns `{ pass: false }` instead of throwing will silently pass CI.

Recommendation:
- Make the validation contract single-path:
  either all checks throw on failure and drop `pass`,
  or allow returned failures and make `runValidation()` aggregate them into a failing exit code and accurate summary.
- Add a failure-path test for the runner.

### 4. Medium: invalid control input can crash the app or leave it in an invalid state

Files:
- `src/ui/controlPanel.js:78-101`
- `src/ui/appState.js:23-40`
- `src/app/createApp.js:53-63`

Why this matters:
- Numeric fields are pushed through `Number(...)` directly from DOM inputs.
- `appState` only validates allowed keys, not values.
- `sampleHydrogenState()` asserts later for some invalid values, but those errors are not caught at the UI boundary.

Examples:
- Clearing `Sample count` or `Seed` can produce `0` or `NaN`.
- Negative or non-integer values can make sampling throw during an event handler.
- `pointSize` and `opacity` are not clamped in state, so invalid values can propagate into Three.js materials.

Impact:
- A normal user editing a number field can produce a hard runtime error instead of inline validation or rollback.

Recommendation:
- Validate and clamp at the UI/state boundary before mutating application state.
- Keep the scientific assertions in place, but do not rely on them for user-input handling.
- Add unit tests for invalid and partial input values.

### 5. Medium: interaction model is under-specified and currently mismatched with user expectations

Files:
- `src/scene/createControls.js:3-9`
- `src/scene/sceneController.js:72-79`
- `src/ui/controlPanel.js:62-105`

Why this matters:
- `OrbitControls` panning is explicitly disabled via `controls.enablePan = false`.
- There is no keyboard movement implementation, no free-fly mode, and no UI text explaining the intended controls.
- The user explicitly expected “move the camera” behavior and asked about WASD.

External check:
- Three.js documents `OrbitControls` as orbit/pan/zoom controls, with panning enabled by default and keyboard panning based on arrow keys unless configured otherwise.

Impact:
- The current behavior is not wrong technically, but it is a UX mismatch.
- “Reset camera” exists, but there is no discoverable camera-navigation model.

Recommendation:
- Pick one of these and document it in the UI:
  1. orbit-only viewer: keep pan off and explicitly tell the user rotation + zoom are the intended controls,
  2. inspection viewer: enable pan and expose the supported input model,
  3. navigation viewer: add a real movement mode instead of implying one.
- Also reset `controls.target` explicitly in `resetCamera()` if camera reset is meant to be authoritative.

### 6. Medium: lifecycle cleanup is incomplete

Files:
- `src/app/createApp.js:83-91`
- `src/scene/sceneController.js:21-81`
- `src/utils/dispose.js:1-10`

Why this matters:
- `createApp()` installs a `resize` listener and starts an endless `requestAnimationFrame` loop, but returns no teardown function.
- `sceneController` disposes replaced objects, but there is no full-app disposal path for controls, renderer, current scene objects, or listeners.

Impact:
- This is acceptable for a single hard page load, but it becomes a leak in tests, hot reload, remounts, or future embedded usage.

Recommendation:
- Return `destroy()` from `createApp()` that:
  removes listeners,
  cancels the render loop,
  disposes controls/renderer,
  disposes current renderables.
- Add one lifecycle test around teardown.

### 7. Medium: the test suite is solid for happy paths, but it misses the most likely regressions

Files:
- `tests/e2e/app.spec.js:3-23`
- `tests/integration/gh-pages-contract.test.js:7-24`
- `tests/integration/app-bootstrap.test.js:224-246`

Gaps:
- No built-artifact GitHub Pages contract test.
- No test that initial mount performs a post-layout resize.
- No invalid-input tests at the UI/state boundary.
- No validation runner failure-path test.
- Playwright is only a smoke test; it does not verify interaction quality, first-render framing, or Pages subpath behavior.

Recommendation:
- Treat these as the next testing priorities, ahead of adding more feature coverage.

### 8. Low: repo onboarding is thinner than the implementation quality

Files:
- `README.md:1-5`

Why this matters:
- The codebase is more disciplined than the public docs.
- There is no concise setup section, no explanation of the test layers, no explanation of the Pages deployment model, and no control summary for users.

Recommendation:
- Expand `README.md` minimally:
  setup,
  standard commands,
  current feature scope,
  expected control scheme,
  deployment model.

## Strengths

- The physics scope is intentionally narrow and implemented explicitly instead of being prematurely generalized.
- Sampling, validation, and rendering are cleanly separated by directory and responsibility.
- The repo rules in `GEMINI.md` are unusually strong for a small project and they clearly improved implementation discipline.
- Unit and integration coverage are already better than typical for a prototype of this size.
- The truncation-normalization correction was the right scientific call and is now documented.

## High-level design assessment

What is working well:
- The architecture is understandable: config -> state -> sampling -> renderables -> scene/app wiring.
- The regeneration-versus-visual-update split is a good design choice for keeping expensive work explicit.
- The repo organization is coherent for current scope.

Where the design is currently weak:
- Deployment has split authority between source HTML and the Vite build output.
- Validation uses two failure models at once: thrown assertions and returned `pass` flags.
- The app lifecycle assumes a single permanent mount, which is fine for a demo but should be made explicit or cleaned up.
- UX intent is not explicit: the app behaves like an orbit-only inspection viewer, but some naming and user expectation now point toward a movable camera.

## Recommended next steps

1. Fix the Pages deployment contract properly with `vite.config.js` and a built-output test.
2. Fix initial sizing by measuring `viewport` after mount and running `handleResize()` immediately.
3. Harden the validation runner so failures cannot be silently reported as success.
4. Add input validation/clamping at the control/state boundary.
5. Decide and document the intended camera model: orbit-only, pan-enabled inspection, or true movement.
6. Add a minimal app teardown path.
7. Expand `README.md` so setup, controls, and deployment are not trapped in planning files.

## Bottom line

The project is in good shape for a scoped version 1 prototype. The main problems are not in the hydrogen math or the general code organization. They are in the seams: deployment, first-render sizing, input hardening, and interaction expectations. Those are the right things to fix next before adding more scientific or visual scope.
