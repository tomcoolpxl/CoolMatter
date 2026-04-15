import { PI } from '../constants.js'
import { createComplex, scale, expImaginary } from '../../utils/complex.js'
import { factorial } from './radial.js'

export function evaluateLegendre(l, m, x) {
  let pmm = 1.0;
  if (m > 0) {
    const somx2 = Math.sqrt((1.0 - x) * (1.0 + x));
    let fact = 1.0;
    for (let i = 1; i <= m; i++) {
      pmm *= -fact * somx2;
      fact += 2.0;
    }
  }
  if (l === m) return pmm;

  let pmmp1 = x * (2.0 * m + 1.0) * pmm;
  if (l === m + 1) return pmmp1;

  let pll = 0.0;
  for (let ll = m + 2; ll <= l; ll++) {
    pll = ((2.0 * ll - 1.0) * x * pmmp1 - (ll + m - 1.0) * pmm) / (ll - m);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
}

export function evaluateAngular(l, m, theta, phi) {
  const m_abs = Math.abs(m);
  const legendre = evaluateLegendre(l, m_abs, Math.cos(theta));
  
  const normFactor = Math.sqrt(
    ((2 * l + 1) / (4 * PI)) *
    (factorial(l - m_abs) / factorial(l + m_abs))
  );

  let realFactor = normFactor * legendre;
  if (m < 0 && m % 2 !== 0) {
    realFactor = -realFactor;
  }

  const phase = expImaginary(m * phi);
  return scale(phase, realFactor);
}

export function evaluateAngularFactor00(theta, phi) {
  return evaluateAngular(0, 0, theta || 0, phi || 0).re;
}
