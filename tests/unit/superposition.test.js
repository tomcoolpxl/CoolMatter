import { describe, it, expect } from 'vitest';
import { calculateEnergyHartree, PI } from '../../src/physics/constants.js';
import { createComplex } from '../../src/utils/complex.js';
import { evaluateSuperpositionDensity } from '../../src/physics/hydrogen/superposition.js';
import { evaluateRadial1s, evaluateRadial2s } from '../../src/physics/hydrogen/radial.js';
import { evaluateAngularFactor00 } from '../../src/physics/hydrogen/angular.js';

describe('physics/hydrogen/superposition evaluator', () => {
  it('calculates energy in Hartrees correctly', () => {
    expect(calculateEnergyHartree(1)).toBeCloseTo(-0.5);
    expect(calculateEnergyHartree(2)).toBeCloseTo(-0.125);
  });

  it('matches individual evaluators for a static pure state at t=0', () => {
    const components = [
      { n: 1, l: 0, m: 0, weight: createComplex(1, 0) }
    ];

    const r = 1.5;
    const theta = 0;
    const phi = 0;

    const R = evaluateRadial1s(r);
    const Y = evaluateAngularFactor00(theta, phi);
    const expectedDensity = (R * Y) * (R * Y);

    const density = evaluateSuperpositionDensity(components, r, theta, phi, 0);
    expect(density).toBeCloseTo(expectedDensity);
  });

  it('integrates a 50/50 superposition across time and maintains constant probability', () => {
    const normFactor = 1 / Math.sqrt(2);
    const components = [
      { n: 1, l: 0, m: 0, weight: createComplex(normFactor, 0) },
      { n: 2, l: 0, m: 0, weight: createComplex(normFactor, 0) }
    ];

    const radialCutoff = 20.0;
    const RADIAL_STEPS = 5000;
    const deltaR = radialCutoff / RADIAL_STEPS;

    function numericIntegrate(t) {
      let integral = 0;
      for (let step = 0; step < RADIAL_STEPS; step++) {
        const r = (step + 0.5) * deltaR;
        const density = evaluateSuperpositionDensity(components, r, 0, 0, t);
        integral += 4 * PI * r * r * density * deltaR;
      }
      return integral;
    }

    const intT0 = numericIntegrate(0);
    const intT10 = numericIntegrate(10);

    // Probability mass contained within 20a0 for 1s+2s should be almost exactly 1.0.
    expect(intT0).toBeGreaterThan(0.99);
    expect(intT0).toBeLessThan(1.0);

    // Evolving time MUST perfectly preserve the total integrated spatial probability
    expect(intT10).toBeCloseTo(intT0, 5);
  });
});
