import { config } from '../app/config.js'
import { createElectronPointCloud } from '../renderables/createElectronPointCloud.js'
import { createNucleusMarker } from '../renderables/createNucleusMarker.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
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
    resetCamera() {
      camera.position.set(
        config.defaultCameraPosition.x,
        config.defaultCameraPosition.y,
        config.defaultCameraPosition.z,
      )
      camera.lookAt(0, 0, 0)
      controls.update()
    },
  }
}

function sampleCurrentState(state) {
  return sampleHydrogenState({
    stateId: state.selectedStateId,
    sampleCount: state.sampleCount,
    seed: state.seed,
    truncation: state.truncation,
  })
}

function applyPointCloudVisuals(pointCloud, state) {
  pointCloud.material.size = state.pointSize
  pointCloud.material.opacity = state.opacity
  pointCloud.material.needsUpdate = true
}

function cloneState(state) {
  return {
    ...state,
    truncation: { ...state.truncation },
  }
}
