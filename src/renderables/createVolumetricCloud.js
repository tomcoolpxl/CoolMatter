import * as THREE from 'three'
import { volumetricVertexShader, volumetricFragmentShader } from './shaders/volumetric.js'

export function createVolumetricCloud() {
  const boxGeometry = new THREE.BoxGeometry(40, 40, 40)
  
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: volumetricVertexShader,
    fragmentShader: volumetricFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide, // raymarching starts from geometry bounds
    uniforms: {
      time: { value: 0 },
      colorCenter: { value: new THREE.Color(0xffffff) },
      activeStates: { value: 0 },
      u_n: { value: new Float32Array([1,0,0,0]) },
      u_l: { value: new Float32Array([0,0,0,0]) },
      u_m: { value: new Float32Array([0,0,0,0]) },
      u_weights: { value: new Float32Array([1,0, 0,0, 0,0, 0,0]) }
    }
  })

  const cloudMesh = new THREE.Mesh(boxGeometry, shaderMaterial)
  cloudMesh.name = 'volumetricCloud'
  
  return cloudMesh
}