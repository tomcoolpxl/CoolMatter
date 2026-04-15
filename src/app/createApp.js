import { createCamera } from '../scene/createCamera.js'
import { createControls } from '../scene/createControls.js'
import { createLights } from '../scene/createLights.js'
import { createRenderer } from '../scene/createRenderer.js'
import { createScene } from '../scene/createScene.js'
import { createElectronPointCloud } from '../renderables/createElectronPointCloud.js'
import { createNucleusMarker } from '../renderables/createNucleusMarker.js'
import { sampleHydrogenState } from '../sampling/sampleHydrogenState.js'
import { createSphericalTruncation } from '../sampling/truncation.js'
import { assert } from '../utils/assert.js'
import { config } from './config.js'

export function createApp(root) {
  assert(root, 'Expected app root element')

  const width = root.clientWidth || window.innerWidth
  const height = root.clientHeight || window.innerHeight
  const scene = createScene()
  const camera = createCamera({ width, height })
  const renderer = createRenderer({ width, height })
  const controls = createControls(camera, renderer.domElement)
  const { ambientLight, directionalLight } = createLights()
  const initialSample = sampleHydrogenState({
    stateId: config.initialStateId,
    sampleCount: config.initialSampleCount,
    seed: config.defaultSeed,
    truncation: createSphericalTruncation(config.defaultTruncationRadius),
  })
  const electronPointCloud = createElectronPointCloud(initialSample.positions)
  const nucleusMarker = createNucleusMarker(config.initialNucleusMode)

  root.replaceChildren(renderer.domElement)
  scene.add(ambientLight, directionalLight, electronPointCloud, nucleusMarker)

  function renderFrame() {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(renderFrame)
  }

  renderFrame()

  return {
    scene,
    camera,
    renderer,
    controls,
    lights: {
      ambientLight,
      directionalLight,
    },
    electronPointCloud,
    nucleusMarker,
    initialSample,
  }
}
