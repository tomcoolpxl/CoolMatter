import { describe, expect, it } from 'vitest'

import viteConfig from '../../vite.config.js'

describe('vite config', () => {
  it('uses relative asset paths for static hosting', () => {
    expect(viteConfig.base).toBe('./')
  })

  it('splits three.js into a dedicated vendor chunk', () => {
    const manualChunks = viteConfig.build.rollupOptions.output.manualChunks

    expect(manualChunks('/tmp/project/node_modules/three/build/three.module.js')).toBe('three-vendor')
    expect(manualChunks('/tmp/project/src/main.js')).toBeUndefined()
  })

  it('raises the chunk warning limit to fit the intentional three.js vendor chunk', () => {
    expect(viteConfig.build.chunkSizeWarningLimit).toBe(550)
  })
})
