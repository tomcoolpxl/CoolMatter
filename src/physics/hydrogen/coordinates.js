import {
  FULL_ROTATION_RADIANS,
  NUMERIC_EPSILON,
} from '../constants.js'

export function cartesianToSpherical(x, y, z) {
  const r = Math.sqrt((x * x) + (y * y) + (z * z))

  if (r <= NUMERIC_EPSILON) {
    return { r: 0, theta: 0, phi: 0 }
  }

  const theta = Math.acos(clamp(z / r, -1, 1))
  const rawPhi = Math.atan2(y, x)
  const phi = rawPhi >= 0 ? rawPhi : rawPhi + FULL_ROTATION_RADIANS

  return { r, theta, phi }
}

export function sphericalToCartesian(r, theta, phi) {
  const sinTheta = Math.sin(theta)

  return {
    x: r * sinTheta * Math.cos(phi),
    y: r * sinTheta * Math.sin(phi),
    z: r * Math.cos(theta),
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
