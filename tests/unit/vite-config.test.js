import { describe, expect, it } from 'vitest'

import viteConfig from '../../vite.config.js'

describe('vite config', () => {
  it('uses relative asset paths for static hosting', () => {
    expect(viteConfig.base).toBe('./')
  })
})
