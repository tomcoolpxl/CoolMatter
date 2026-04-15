import { assert } from '../utils/assert.js'

const UINT32_MAX = 0x100000000

export function createSeededRng(seed) {
  assertValidSeed(seed)

  let state = seed >>> 0

  return {
    nextFloat() {
      state = (1664525 * state + 1013904223) >>> 0
      return state / UINT32_MAX
    },
    nextUint32() {
      state = (1664525 * state + 1013904223) >>> 0
      return state
    },
    getSeed() {
      return seed >>> 0
    },
  }
}

export function assertValidSeed(seed) {
  assert(Number.isInteger(seed), 'Seed must be an integer')
  assert(seed >= 0, 'Seed must be non-negative')
  assert(seed <= 0xffffffff, 'Seed must fit in an unsigned 32-bit integer')
}
