export const BOHR_RADIUS_A0 = 1
export const PI = Math.PI
export const FOUR_PI = 4 * PI
export const FULL_ROTATION_RADIANS = Math.PI * 2
export const NUMERIC_EPSILON = 1e-12

export const validationTolerances = {
  coordinateRoundTrip: 1e-9,
  originRadius: 1e-12,
  normalizationEstimate: 5e-5,
  nodeRadius: 1e-6,
  nodeAmplitude: 1e-8,
  histogramBinFrequency: 0.05,
}
