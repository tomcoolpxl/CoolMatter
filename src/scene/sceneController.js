import { config } from '../app/config.js'
import { createElectronPointCloud } from '../renderables/createElectronPointCloud.js'
import { createNucleusMarker } from '../renderables/createNucleusMarker.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
import { resampleBatch } from '../sampling/streamingSampler.js'
import { createSeededRng } from '../sampling/rng.js'
import { disposeObject3D } from '../utils/dispose.js'

import { createVolumetricCloud } from '../renderables/createVolumetricCloud.js'

export function createSceneController({
  scene,
  camera,
  controls,
  initialState,
}) {
  let currentState = cloneState(initialState)
  let currentSample = sampleCurrentState(currentState)
  let currentPointCloud = createElectronPointCloud(currentSample.positions)
  let currentVolumetricCloud = createVolumetricCloud()
  let currentNucleusMarker = createNucleusMarker(currentState.nucleusMode)
  let streamingRng = createSeededRng(Math.floor(Math.random() * 0xffffffff))

  applyPointCloudVisuals(currentPointCloud, currentState)
  applyVolumetricVisuals(currentVolumetricCloud, currentState)
  
  if (currentState.renderMode === 'volumetric') {
    scene.add(currentVolumetricCloud, currentNucleusMarker)
  } else {
    scene.add(currentPointCloud, currentNucleusMarker)
  }

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
      applyVolumetricVisuals(currentVolumetricCloud, currentState)

      if (currentState.renderMode !== 'volumetric') {
        scene.remove(currentPointCloud)
        disposeObject3D(currentPointCloud)
        scene.add(nextPointCloud)
      } else {
        scene.remove(currentPointCloud)
        disposeObject3D(currentPointCloud)
      }
      
      currentPointCloud = nextPointCloud

      return {
        sample: currentSample,
        pointCloud: currentPointCloud,
        volumetricCloud: currentVolumetricCloud,
        nucleusMarker: currentNucleusMarker,
      }
    },
    applyVisualUpdate(nextState) {
      const previousNucleusMode = currentState.nucleusMode
      const previousRenderMode = currentState.renderMode

      currentState = cloneState(nextState)
      applyPointCloudVisuals(currentPointCloud, currentState)
      applyVolumetricVisuals(currentVolumetricCloud, currentState)

      if (currentState.renderMode !== previousRenderMode) {
        if (currentState.renderMode === 'volumetric') {
          scene.remove(currentPointCloud)
          scene.add(currentVolumetricCloud)
        } else {
          scene.remove(currentVolumetricCloud)
          scene.add(currentPointCloud)
        }
      }

      if (currentState.nucleusMode !== previousNucleusMode) {
        const nextNucleusMarker = createNucleusMarker(currentState.nucleusMode)

        scene.remove(currentNucleusMarker)
        disposeObject3D(currentNucleusMarker)
        scene.add(nextNucleusMarker)
        currentNucleusMarker = nextNucleusMarker
      }

      return {
        pointCloud: currentPointCloud,
        volumetricCloud: currentVolumetricCloud,
        nucleusMarker: currentNucleusMarker,
      }
    },
    update(time, delta) {
      // Delta time is typically in seconds. 
      // If we are paused, delta used for physics might be zero, or we might skip.
      currentState.time = time
      
      const isScintillating = currentState.scintillationRate > 0 && currentState.renderMode === 'point_cloud'
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

      // Update volumetric cloud time
      if (currentVolumetricCloud.material.uniforms?.time) {
        currentVolumetricCloud.material.uniforms.time.value = time
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
      scene.remove(currentPointCloud, currentNucleusMarker, currentVolumetricCloud)
      disposeObject3D(currentPointCloud)
      disposeObject3D(currentNucleusMarker)
      disposeObject3D(currentVolumetricCloud)
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

function applyVolumetricVisuals(volumetricCloud, state) {
  if (!volumetricCloud || !volumetricCloud.material.uniforms) return
  
  const uniforms = volumetricCloud.material.uniforms
  
  if (state.time !== undefined) {
    uniforms.time.value = state.time
  }
  
  uniforms.activeStates.value = Math.min(state.superposition.length, 4)
  
  for (let i = 0; i < uniforms.activeStates.value; i++) {
    const comp = state.superposition[i]
    uniforms.u_n.value[i] = comp.n
    uniforms.u_l.value[i] = comp.l
    uniforms.u_m.value[i] = comp.m
    uniforms.u_weights.value[i*2] = comp.magnitude * Math.cos(comp.phase)
    uniforms.u_weights.value[i*2 + 1] = comp.magnitude * Math.sin(comp.phase)
  }
}

function cloneState(state) {
  return {
    ...state,
    superposition: state.superposition ? state.superposition.map(comp => ({ ...comp })) : [],
    truncation: { ...state.truncation },
  }
}
