import { BOHR_RADIUS_A0 } from '../constants.js'

export function factorial(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

export function evaluateLaguerre(n, alpha, x) {
  if (n === 0) return 1.0;
  if (n === 1) return 1.0 + alpha - x;
  let L0 = 1.0;
  let L1 = 1.0 + alpha - x;
  let L2 = L1;
  for (let k = 1; k < n; k++) {
    L2 = ((2 * k + 1 + alpha - x) * L1 - (k + alpha) * L0) / (k + 1);
    L0 = L1;
    L1 = L2;
  }
  return L2;
}

export function evaluateRadial(n, l, r) {
  const scaledRadius = r / (n * BOHR_RADIUS_A0);
  const rho = 2 * scaledRadius;
  const normFactor = Math.sqrt(
    Math.pow(2 / (n * BOHR_RADIUS_A0), 3) *
    (factorial(n - l - 1) / (2 * n * factorial(n + l)))
  );
  return normFactor * Math.exp(-scaledRadius) * Math.pow(rho, l) * evaluateLaguerre(n - l - 1, 2 * l + 1, rho);
}

export function evaluateRadial1s(r) { return evaluateRadial(1, 0, r); }
export function evaluateRadial2s(r) { return evaluateRadial(2, 0, r); }
