import { config } from '../app/config.js'
import { createElectronPointCloud } from '../renderables/createElectronPointCloud.js'
import { createNucleusMarker } from '../renderables/createNucleusMarker.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
import { resampleBatch } from '../sampling/streamingSampler.js'
import { createSeededRng } from '../sampling/rng.js'
import { disposeObject3D } from '../utils/dispose.js'

export function createSceneController({
  scene,
  camera,
  controls,
  initialState,
}) {
  let currentState = cloneState(initialState)
  let currentSample = sampleCurrentState(currentState)
  let currentPointCloud = createElectronPointCloud(currentSample.positions)
  let currentNucleusMarker = createNucleusMarker(currentState.nucleusMode)
  let streamingRng = createSeededRng(Math.floor(Math.random() * 0xffffffff))

  applyPointCloudVisuals(currentPointCloud, currentState)
  scene.add(currentPointCloud, currentNucleusMarker)

  return {
    getCurrentState() {
      return cloneState(currentState)
    },
    getCurrentSample() {
      return currentSample
    },
    getCurrentObjects() {
      return {
        pointCloud: currentPointCloud,
        nucleusMarker: currentNucleusMarker,
      }
    },
    applyRegenerationUpdate(nextState) {
      currentState = cloneState(nextState)
      currentSample = sampleCurrentState(currentState)

      const nextPointCloud = createElectronPointCloud(currentSample.positions)

      applyPointCloudVisuals(nextPointCloud, currentState)
      scene.remove(currentPointCloud)
      disposeObject3D(currentPointCloud)
      scene.add(nextPointCloud)
      currentPointCloud = nextPointCloud

      return {
        sample: currentSample,
        pointCloud: currentPointCloud,
        nucleusMarker: currentNucleusMarker,
      }
    },
    applyVisualUpdate(nextState) {
      const previousNucleusMode = currentState.nucleusMode

      currentState = cloneState(nextState)
      applyPointCloudVisuals(currentPointCloud, currentState)

      if (currentState.nucleusMode !== previousNucleusMode) {
        const nextNucleusMarker = createNucleusMarker(currentState.nucleusMode)

        scene.remove(currentNucleusMarker)
        disposeObject3D(currentNucleusMarker)
        scene.add(nextNucleusMarker)
        currentNucleusMarker = nextNucleusMarker
      }

      return {
        pointCloud: currentPointCloud,
        nucleusMarker: currentNucleusMarker,
      }
    },
    update(time, delta) {
      // Delta time is typically in seconds. 
      // If we are paused, delta used for physics might be zero, or we might skip.
      currentState.time = time
      
      const isScintillating = currentState.scintillationRate > 0
      // Always allow scintillation even if paused, so users can see the point cloud
      // re-evaluate against the static |Psi|^2 at the frozen t!
      // But usually time is frozen so the distribution doesn't shift, it just scrambles.
      if (isScintillating) {
        // Delta from loop is real wall clock delta (or passed from app.js)
        const replaceCount = Math.floor(currentState.sampleCount * currentState.scintillationRate * delta)
        if (replaceCount > 0) {
          const positions = currentPointCloud.geometry.attributes.position.array
          resampleBatch(
            positions,
            currentState.superposition,
            currentState.time,
            replaceCount,
            currentState.truncation,
            streamingRng
          )
          currentPointCloud.geometry.attributes.position.needsUpdate = true
        }
      }

      // Scaffolding for when we migrate to ShaderMaterial
      if (currentPointCloud.material.uniforms?.time) {
        currentPointCloud.material.uniforms.time.value = time
      }
    },
    resetCamera() {
      camera.position.set(
        config.defaultCameraPosition.x,
        config.defaultCameraPosition.y,
        config.defaultCameraPosition.z,
      )
      controls.target?.set?.(0, 0, 0)
      camera.lookAt(0, 0, 0)
      controls.update()
    },
    destroy() {
      scene.remove(currentPointCloud, currentNucleusMarker)
      disposeObject3D(currentPointCloud)
      disposeObject3D(currentNucleusMarker)
    },
  }
}

function sampleCurrentState(state) {
  // If the sampler still only takes a stateId for now, we use the first component's ID heuristically
  // or we need to pass superposition if the sampler supports it. 
  // Let's pass superposition instead, and let sampleHydrogenState deal with it if we upgrade it,
  // or we just map it to the string id for now so it doesn't crash if the sampler is unmodified.
  const comp = state.superposition[0]
  const stateId = `${comp.n}s` // fallback heuristic, or we'll pass both
  
  return sampleHydrogenState({
    superposition: state.superposition,
    stateId, // keeping for compat if tests need it
    sampleCount: state.sampleCount,
    seed: state.seed,
    truncation: state.truncation,
  })
}

function applyPointCloudVisuals(pointCloud, state) {
  if (pointCloud.material.uniforms) {
    if (state.time !== undefined) {
      pointCloud.material.uniforms.time.value = state.time
    }
  } else {
    pointCloud.material.size = state.pointSize
    pointCloud.material.opacity = state.opacity
  }
  pointCloud.material.needsUpdate = true
}

function cloneState(state) {
  return {
    ...state,
    superposition: state.superposition ? state.superposition.map(comp => ({ ...comp })) : [],
    truncation: { ...state.truncation },
  }
}
