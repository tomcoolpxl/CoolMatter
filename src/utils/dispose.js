export function disposeObject3D(object) {
  if (!object) {
    return
  }

  if (object.geometry?.dispose) {
    object.geometry.dispose()
  }

  if (Array.isArray(object.material)) {
    for (const material of object.material) {
      material?.dispose?.()
    }

    return
  }

  object.material?.dispose?.()
}
