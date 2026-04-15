import { describe, expect, it, vi } from 'vitest'

import { disposeObject3D } from '../../src/utils/dispose.js'

describe('disposeObject3D', () => {
  it('disposes geometry and a single material', () => {
    const geometryDispose = vi.fn()
    const materialDispose = vi.fn()

    disposeObject3D({
      geometry: { dispose: geometryDispose },
      material: { dispose: materialDispose },
    })

    expect(geometryDispose).toHaveBeenCalledOnce()
    expect(materialDispose).toHaveBeenCalledOnce()
  })

  it('disposes geometry and each material in a material array', () => {
    const geometryDispose = vi.fn()
    const firstDispose = vi.fn()
    const secondDispose = vi.fn()

    disposeObject3D({
      geometry: { dispose: geometryDispose },
      material: [
        { dispose: firstDispose },
        { dispose: secondDispose },
      ],
    })

    expect(geometryDispose).toHaveBeenCalledOnce()
    expect(firstDispose).toHaveBeenCalledOnce()
    expect(secondDispose).toHaveBeenCalledOnce()
  })
})
