export function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

export function assertApproxEqual(actual, expected, tolerance, message) {
  const difference = Math.abs(actual - expected)

  if (difference > tolerance) {
    throw new Error(
      `${message} (expected ${expected}, got ${actual}, diff ${difference}, tolerance ${tolerance})`,
    )
  }
}
