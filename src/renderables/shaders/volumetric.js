import { hydrogenCoreGLSL } from './hydrogenCore.js';

export const volumetricVertexShader = `
varying vec3 vWorldPosition;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const volumetricFragmentShader = `
precision highp float;

${hydrogenCoreGLSL}

varying vec3 vWorldPosition;
uniform float time;
uniform int activeStates;
uniform vec3 colorCenter;

// Arrays for superpositions
uniform float u_n[4];
uniform float u_l[4];
uniform float u_m[4];
uniform vec2 u_weights[4]; // real and imaginary parts

vec2 intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
    vec3 invDir = 1.0 / (rayDir + vec3(1e-8));
    vec3 t0 = (boxMin - rayOrigin) * invDir;
    vec3 t1 = (boxMax - rayOrigin) * invDir;
    vec3 tNear = min(t0, t1);
    vec3 tFar = max(t0, t1);
    float tNearMax = max(max(tNear.x, tNear.y), tNear.z);
    float tFarMin = min(min(tFar.x, tFar.y), tFar.z);
    return vec2(max(tNearMax, 0.0), tFarMin);
}

void main() {
    vec3 rayDir = normalize(vWorldPosition - cameraPosition);
    vec3 boxMin = vec3(-20.0);
    vec3 boxMax = vec3(20.0);
    
    vec2 tHit = intersectAABB(cameraPosition, rayDir, boxMin, boxMax);
    
    if (tHit.x > tHit.y) {
        discard;
    }
    
    float tMax = tHit.y;
    float t = tHit.x;
    
    float stepSize = 0.5; // Fine raymarch step for visual density
    float accumulatedDensity = 0.0;
    
    // Bounds limit based on scene (150 steps * 0.5 = cover 75 units, > max box diagonal 69)
    for (int i = 0; i < 150; i++) {
        if (t > tMax) break;
        
        vec3 currentPos = cameraPosition + rayDir * t;
        vec2 psi = vec2(0.0, 0.0);
        
        for (int s = 0; s < 4; s++) {
            if (s >= activeStates) break;
            
            int n = int(u_n[s]);
            int l = int(u_l[s]);
            int m = int(u_m[s]);
            
            vec2 stateVal = evaluateState(n, l, m, currentPos);
            
            // Add time evolution E = -1.0 / (2.0 * n^2).
            float energy = -1.0 / (2.0 * float(n * n));
            // Correct physical time evolution is e^{-iEt}
            vec2 evolved = cMult(stateVal, cExp(-energy * time));
            
            vec2 weighted = cMult(evolved, u_weights[s]);
            psi = cAdd(psi, weighted);
        }
        
        float probDensity = cMagSq(psi);
        accumulatedDensity += probDensity * stepSize;
        t += stepSize;
    }
    
    // Logarithmic or scaling visual transfer function
    float intensity = min(accumulatedDensity * 20.0, 1.0);
    vec3 color = vec3(0.2, 0.6, 1.0); // Simple blue plasma glow 
    float alpha = min(accumulatedDensity * 5.0, 1.0);
    
    if (alpha <= 0.01) discard;
    
    gl_FragColor = vec4(color * intensity, alpha);
}
`;