import { describe, it, expect } from 'vitest';
import { createComplex, add, multiply, scale, magnitudeSq, expImaginary } from '../../src/utils/complex';

describe('utils/complex', () => {
  it('creates complex number', () => {
    const c = createComplex(1, 2);
    expect(c.re).toBe(1);
    expect(c.im).toBe(2);
  });

  it('adds complex numbers', () => {
    const c1 = createComplex(1, 2);
    const c2 = createComplex(3, 4);
    const result = add(c1, c2);
    expect(result.re).toBe(4);
    expect(result.im).toBe(6);
  });

  it('multiplies complex numbers', () => {
    const c1 = createComplex(1, 2);
    const c2 = createComplex(3, 4);
    const result = multiply(c1, c2);
    // (1+2i)(3+4i) = (3 - 8) + (4 + 6)i = -5 + 10i
    expect(result.re).toBe(-5);
    expect(result.im).toBe(10);
  });

  it('scales complex number by a scalar', () => {
    const c = createComplex(2, -3);
    const result = scale(c, 2);
    expect(result.re).toBe(4);
    expect(result.im).toBe(-6);
  });

  it('calculates squared magnitude', () => {
    const c = createComplex(3, 4);
    const result = magnitudeSq(c);
    expect(result).toBe(25);
  });

  it('calculates imaginary exponential e^(i * phase)', () => {
    const expZero = expImaginary(0);
    expect(expZero.re).toBeCloseTo(1);
    expect(expZero.im).toBeCloseTo(0);

    const expPiHalf = expImaginary(Math.PI / 2);
    expect(expPiHalf.re).toBeCloseTo(0);
    expect(expPiHalf.im).toBeCloseTo(1);

    const expPi = expImaginary(Math.PI);
    expect(expPi.re).toBeCloseTo(-1);
    expect(expPi.im).toBeCloseTo(0);
  });
});
