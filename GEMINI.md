# Browser Game Project Rules

This repository builds the CoolMatter project.
Do not start a different project unless the course instructions explicitly change the project.

Authoritative project files:

- `REQUIREMENTS.md`
- `DESIGN.md`
- `IMPLEMENTATION.md`
- `IMPLEMENTATION_PLAN.md`
- `TODO.md`
- `DONE.md`

Project rules:

- Keep one `TODO.md` item small enough for one review cycle.
- Refresh `TODO.md` from the current phase in `IMPLEMENTATION_PLAN.md`.
- Update `TODO.md` before starting a new implementation chunk.
- Update `TODO.md` and `DONE.md` after implementation.
- Move an item to `DONE.md` only after the required checks, review, and doc updates are complete.
- `DONE.md` holds only verified work.
- Update `REQUIREMENTS.md` when scope or acceptance criteria change.
- Update `IMPLEMENTATION_PLAN.md` when the order or grouping of work changes.
- For narrow tasks, pass the exact authoritative files in the prompt instead of retyping context.
- Ask before making a large refactor, changing the directory structure, or removing tests.
- Before moving work to `DONE.md`, review the diff, run the required checks, and update docs if the change affected scope or structure.
- Use the standard npm entrypoints in `package.json` instead of ad hoc commands:
  `npm run dev` or `npm start` for local development,
  `npm run test:unit` for unit tests,
  `npm run test:integration` for integration tests,
  `npm run test:e2e` for Playwright end-to-end tests,
  `npm run test` for the full test suite,
  `npm run validate` for the pure-Node scientific validation script,
  `npm run build` for production build verification,
  `npm run check` to run the standard verification pass before marking work done.
- Playwright setup is part of the repository contract:
  keep `playwright.config.js` as the authoritative e2e config,
  use `npm run preview:e2e` as the local preview server command for browser tests,
  and install the required browser with `npx playwright install chromium` when setting up a fresh environment.
- GitHub Pages deployment must be validated against the built `dist/` artifact, not just the source `index.html`.
  Treat the Vite build output as the authoritative deployment artifact for static hosting.
- For normalization checks over a finite radial cutoff, compare the numerical integral to the expected truncated probability mass for that state and cutoff.
  Do not assume the result should be `1` unless the domain is actually untruncated.
- Every implementation phase or chunk must add or update both unit and integration tests for the behavior introduced in that chunk, and add or extend Playwright coverage when the browser-facing flow changes.
- Browser-facing changes include, at minimum:
  app bootstrap changes,
  rendered scene composition changes,
  control-panel behavior changes,
  GitHub Pages hosting changes,
  and any workflow that changes what a user can do or see in the browser.
- New implementation work is not complete until the relevant automated coverage is in place and `npm run check` passes.
- If `npm run test:e2e` cannot run in the current environment because a local server bind or browser launch is restricted, document that clearly and rerun it in an environment where Playwright is allowed before treating the work as fully verified.
- If a build emits a non-blocking optimization warning, document the follow-up plan in the phase docs or hardening plan instead of quietly dropping it.
  Keep the current chunk narrow unless the optimization is required for correctness.
- User-facing controls must be explicit.
  If camera interaction is orbit-only, say so in the UI and docs.
  If panning or keyboard movement is supported, test it and document the exact input model.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
