# Version 2 - Phase 1: Generalized Math & Superpositions

## Purpose
Phase 1 expands the physical bounds of the application from hardcoded stationary states (`1s`, `2s`) to a generalized mathematical engine capable of evaluating any valid hydrogen state $(n, l, m)$ and arbitrary time-dependent superpositions. 

This phase is strictly computational and validation-focused. It must bypass the browser rendering and verify correctly via `npm run validate` and unit tests before any Three.js work begins.

## Step 1: Complex Number Utilities
Hydrogen wavefunctions in superpositions require complex coefficients and complex time evolution ($e^{-i E_n t / \hbar}$).
*   **Create:** `src/math/complex.js` (or `src/utils/complex.js`).
*   **Requirements:**
    *   A simple lightweight `Complex` class or factory: `{ re: number, im: number }`.
    *   Implement addition: `add(c1, c2)`.
    *   Implement multiplication: `multiply(c1, c2)`.
    *   Implement scalar multiplication: `scale(c, scalar)`.
    *   Implement squared magnitude (probability density): `magnitudeSq(c) -> re*re + im*im`.
    *   Implement complex exponential (Euler's formula) for time evolution: `expImaginary(phase) -> { re: cos(phase), im: sin(phase) }`.
*   **Testing:** Add `tests/unit/complex.test.js` to assert standard complex arithmetic.

## Step 2: Generalized Radial Evaluator
The radial wavefunction $R_{nl}(r)$ requires generalized Laguerre polynomials.
*   **Refactor:** `src/physics/hydrogen/radial.js`.
*   **Implementation:**
    *   Add a factorial utility (can be memoized/cached up to $n=10$).
    *   Implement Generalized Laguerre Polynomials $L_{n-l-1}^{2l+1}(2r/n)$. 
    *   Implement the full radial function $R_{nl}(r) = \sqrt{\left(\frac{2}{n a_0}\right)^3 \frac{(n-l-1)!}{2n(n+l)!}} e^{-r/n a_0} \left(\frac{2r}{n a_0}\right)^l L_{n-l-1}^{2l+1}\left(\frac{2r}{n a_0}\right)$.
    *   *Note:* Ensure units remain in $a_0$.
*   **Validation:** 
    *   Assert that `evaluateRadial(1, 0, r)` matches the exact output of the V1 hardcoded `1s` function.
    *   Assert `evaluateRadial(2, 0, r)` matches the V1 `2s` function.

## Step 3: Generalized Angular Evaluator
The angular wavefunction relies on Spherical Harmonics $Y_l^m(\theta, \phi)$, which require Associated Legendre Polynomials $P_l^m(\cos\theta)$.
*   **Refactor:** `src/physics/hydrogen/angular.js`.
*   **Implementation:**
    *   Implement Associated Legendre Polynomials $P_l^m(x)$. Use standard recursive recurrence relations for numerical stability.
    *   Implement the normalization constant $N_l^m = \sqrt{\frac{2l+1}{4\pi} \frac{(l-m)!}{(l+m)!}}$.
    *   Implement the Complex Angular function: $Y_l^m(\theta, \phi) = N_l^m P_l^m(\cos\theta) e^{i m \phi}$.
    *   *Note:* This function must return a `Complex` object (from Step 1) because of the $e^{im\phi}$ term. If $m=0$, imaginary is 0.
*   **Validation:** Check against existing normalized real constraints where applicable.

## Step 4: Time-Evolution & Energy Levels
To animate superpositions, we need the energy levels of the states.
*   **Update:** `src/physics/hydrogen/constants.js`.
    *   Add energy scaler. In atomic units (Hartrees), $E_n = -1 / (2n^2)$.
*   **Time Evolution Function:** 
    *   Calculate phase $\phi(t) = -E_n t$. (Working in natural atomic units where $\hbar = 1$).
    *   Return the time evolution factor using the `complex.js` `expImaginary(phase)`.

## Step 5: Superposition Evaluator
*   **Create:** `src/physics/hydrogen/superposition.js`.
*   **Implementation:**
    *   Define a superposition state as an array of components: `[{ n, l, m, weight: Complex }]`.
    *   Ensure the sum of `magnitudeSq(weight)` across all components equals 1 (normalization).
    *   Implement `evaluateSuperposition(components, r, theta, phi, t)`:
        *   Initialize `totalPsi = {re: 0, im: 0}`.
        *   For each component:
            *   Compute $R = R_{nl}(r)$ (Real scalar).
            *   Compute $Y = Y_l^m(\theta, \phi)$ (Complex).
            *   Compute spatial part $\psi = R \times Y$.
            *   Compute time evolution $T = e^{-i E_n t}$ (Complex).
            *   Multiply together: `ComponentPsi = weight * psi * T`.
            *   Add to `totalPsi`.
        *   Return `totalPsi`.
    *   Implement `evaluateDensity(components, r, theta, phi, t)`:
        *   Return `magnitudeSq(totalPsi)`.

## Step 6: Expand Testing & Validation (Critical)
Before this phase is complete, pure-Node validations must pass.
*   **Update:** `src/validation/normalizationChecks.js`.
*   **Tasks:**
    *   Test standard eigenstates (e.g., `2p`, `3d`) by numerically integrating `evaluateDensity` over spatial volume and returning $1.0$.
    *   Test a 50/50 superposition of `1s` and `2p` at $t=0$ and $t=10$. The volumetric integral must STILL equal $1.0$ at all times regardless of component interference.
*   **Update:** `src/validation/manifest.js` & `runValidation.js` to seamlessly include and run these superposition checks.

## Phase 1 Completion Criteria
1. The mathematical evaluations for any generic $(n, l, m)$ state work and match V1 hardcoded outputs for $n=1,2, l=0, m=0$.
2. The application computes accurate real and imaginary components for superposition states evaluated at variable time `t`.
3. `npm run validate` executes complete numeric spatial integrals ensuring probabilities always sum to exactly 1.0 across varying time intervals.
