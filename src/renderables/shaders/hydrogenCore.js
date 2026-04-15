const hydrogenCoreGLSL = `
#define PI 3.1415926535897932384626433832795
#define BOHR_RADIUS_A0 1.0

// GLSL Complex Number Math
vec2 cMult(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}
vec2 cExp(float pos) {
    return vec2(cos(pos), sin(pos));
}
vec2 cAdd(vec2 a, vec2 b) {
    return a + b;
}
vec2 cScale(vec2 a, float scale) {
    return a * scale;
}
float cMagSq(vec2 a) {
    return a.x * a.x + a.y * a.y;
}

// Polynomial evaluation
float factorial(int n) {
    float res = 1.0;
    for(int i = 2; i <= 20; ++i) {
        if(i > n) break;
        res *= float(i);
    }
    return res;
}

float evaluateLaguerre(int n, float alpha, float x) {
    if (n == 0) return 1.0;
    if (n == 1) return 1.0 + alpha - x;
    float L0 = 1.0;
    float L1 = 1.0 + alpha - x;
    float L2 = L1;
    for (int k = 1; k < 20; k++) {
        if (k >= n) break;
        L2 = ((2.0 * float(k) + 1.0 + alpha - x) * L1 - (float(k) + alpha) * L0) / float(k + 1);
        L0 = L1;
        L1 = L2;
    }
    return L2;
}

float evaluateRadial(int n, int l, float r) {
    float scaledRadius = r / (float(n) * BOHR_RADIUS_A0);
    float rho = 2.0 * scaledRadius;
    float normFactor = sqrt(
        pow(2.0 / (float(n) * BOHR_RADIUS_A0), 3.0) *
        (factorial(n - l - 1) / (2.0 * float(n) * factorial(n + l)))
    );
    return normFactor * exp(-scaledRadius) * pow(rho, float(l)) * evaluateLaguerre(n - l - 1, 2.0 * float(l) + 1.0, rho);
}

float evaluateLegendre(int l, int m, float x) {
    float pmm = 1.0;
    if (m > 0) {
        float somx2 = sqrt((1.0 - x) * (1.0 + x));
        float fact = 1.0;
        for (int i = 1; i <= 20; i++) {
            if (i > m) break;
            pmm *= -fact * somx2;
            fact += 2.0;
        }
    }
    if (l == m) return pmm;

    float pmmp1 = x * (2.0 * float(m) + 1.0) * pmm;
    if (l == m + 1) return pmmp1;

    float pll = 0.0;
    for (int ll = 0; ll <= 20; ll++) {
        if (ll < m + 2) continue;
        if (ll > l) break;
        pll = ((2.0 * float(ll) - 1.0) * x * pmmp1 - (float(ll) + float(m) - 1.0) * pmm) / float(ll - m);
        pmm = pmmp1;
        pmmp1 = pll;
    }
    return pll;
}

vec2 evaluateAngular(int l, int m, float theta, float phi) {
    int m_abs = int(abs(float(m)));
    float legendre = evaluateLegendre(l, m_abs, cos(theta));
    
    float normFactor = sqrt(
        ((2.0 * float(l) + 1.0) / (4.0 * PI)) *
        (factorial(l - m_abs) / factorial(l + m_abs))
    );

    float realFactor = normFactor * legendre;
    // Apply Condon-Shortley phase for odd negative m
    if (m < 0 && (m_abs - (m_abs / 2) * 2) != 0) {
        realFactor = -realFactor;
    }

    vec2 phase = cExp(float(m) * phi);
    return cScale(phase, realFactor);
}

vec2 evaluateState(int n, int l, int m, vec3 pos) {
    float r = max(length(pos), 0.000000001);

    // Exact parity with cartesianToSpherical in coordinates.js
    float theta = acos(clamp(pos.z / r, -1.0, 1.0));
    float phi = atan(pos.y, pos.x);
    if (phi < 0.0) phi += 2.0 * PI;
    
    float radial = evaluateRadial(n, l, r);
    vec2 angular = evaluateAngular(l, m, theta, phi);
    
    return cScale(angular, radial);
}
`

export { hydrogenCoreGLSL }
