/**
 * Complex number utilities.
 * 
 * Represents a complex number as { re: number, im: number }.
 */

export function createComplex(re, im) {
  return { re, im };
}

export function add(c1, c2) {
  return { re: c1.re + c2.re, im: c1.im + c2.im };
}

export function multiply(c1, c2) {
  return {
    re: c1.re * c2.re - c1.im * c2.im,
    im: c1.re * c2.im + c1.im * c2.re,
  };
}

export function scale(c, scalar) {
  return { re: c.re * scalar, im: c.im * scalar };
}

export function magnitudeSq(c) {
  return c.re * c.re + c.im * c.im;
}

export function expImaginary(phase) {
  return { re: Math.cos(phase), im: Math.sin(phase) };
}
