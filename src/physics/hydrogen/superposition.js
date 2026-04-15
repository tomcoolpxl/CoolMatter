import { calculateEnergyHartree } from '../constants.js'
import { createComplex, add, multiply, scale, magnitudeSq, expImaginary } from '../../utils/complex.js'
import { evaluateRadial } from './radial.js'
import { evaluateAngular } from './angular.js'

/**
 * Superposition definition: array of { n, l, m, weight: {re, im} } components
 * Ensure the sum of magnitudeSq(weight) = 1.0 for normalized density.
 */
export function evaluateSuperposition(components, r, theta, phi, t = 0) {
  let totalPsi = createComplex(0, 0);

  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    
    // Evaluate Real Radial and Complex Angular
    const R = evaluateRadial(comp.n, comp.l, r);
    const Y = evaluateAngular(comp.l, comp.m, theta, phi);
    
    // Scale angular output by real radial part gives full spatial wavefunction
    const spatialPsi = scale(Y, R);

    // Apply time evolution phase = - E_n * t (in atomic units hbar = 1)
    const energy = calculateEnergyHartree(comp.n);
    const phase = -energy * t;
    const timeEvo = expImaginary(phase);

    const termWave = multiply(spatialPsi, timeEvo);
    const weightedTerm = multiply(comp.weight, termWave);

    totalPsi = add(totalPsi, weightedTerm);
  }

  return totalPsi;
}

export function evaluateSuperpositionDensity(components, r, theta, phi, t = 0) {
  const psi = evaluateSuperposition(components, r, theta, phi, t);
  return magnitudeSq(psi);
}
