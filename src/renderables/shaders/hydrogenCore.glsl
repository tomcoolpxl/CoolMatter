// GLSL Mathematical Foundation for Hydrogen Wavefunctions

#define PI 3.141592653589793
#define MAX_STATES 4

// Complex number operations
vec2 cMult(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cExp(float phase) {
    return vec2(cos(phase), sin(phase));
}

// Factorial (precomputed/simplified for small ints up to n=4)
float factorial(int n) {
    if (n <= 1) return 1.0;
    if (n == 2) return 2.0;
    if (n == 3) return 6.0;
    if (n == 4) return 24.0;
    if (n == 5) return 120.0;
    if (n == 6) return 720.0;
    if (n == 7) return 5040.0;
    return 1.0; // Fallback
}

// Generalized Laguerre Polynomials L_{n-l-1}^{2l+1}(x)
// Hardcoded for n <= 4 for performance in GLSL
float laguerre(int n, int l, float x) {
    int alpha = 2 * l + 1;
    int degree = n - l - 1;
    
    if (degree == 0) return 1.0;
    if (degree == 1) return float(alpha + 1) - x;
    if (degree == 2) return 0.5 * (float((alpha + 1) * (alpha + 2)) - 2.0 * float(alpha + 2) * x + x * x);
    if (degree == 3) return (float((alpha + 1) * (alpha + 2) * (alpha + 3)) - 3.0 * float((alpha + 2) * (alpha + 3)) * x + 3.0 * float(alpha + 3) * x * x - x * x * x) / 6.0;
    
    return 0.0; // Unsupported
}

// Radial component R_{n,l}(r)
float radial(int n, int l, float r) {
    float a0 = 1.0; // Bohr radius normalized
    float rho = 2.0 * r / (float(n) * a0);
    
    // Normalization constant
    float term1 = pow(2.0 / (float(n) * a0), 3.0);
    float term2 = factorial(n - l - 1) / (2.0 * float(n) * factorial(n + l));
    float normalization = sqrt(term1 * term2);
    
    float exponential = exp(-rho / 2.0);
    float powerTerm = pow(rho, float(l));
    float laguerreTerm = laguerre(n, l, rho);
    
    return normalization * exponential * powerTerm * laguerreTerm;
}

// Associated Legendre Polynomials P_l^m(x) where x = cos(theta)
float legendre(int l, int m, float x) {
    int absM = abs(m);
    float p = 0.0;
    
    if (l == 0) {
        p = 1.0;
    } else if (l == 1) {
        if (absM == 0) p = x;
        else if (absM == 1) p = -sqrt(1.0 - x * x);
    } else if (l == 2) {
        if (absM == 0) p = 0.5 * (3.0 * x * x - 1.0);
        else if (absM == 1) p = -3.0 * x * sqrt(1.0 - x * x);
        else if (absM == 2) p = 3.0 * (1.0 - x * x);
    } else if (l == 3) {
        if (absM == 0) p = 0.5 * x * (5.0 * x * x - 3.0);
        else if (absM == 1) p = -1.5 * (5.0 * x * x - 1.0) * sqrt(1.0 - x * x);
        else if (absM == 2) p = 15.0 * x * (1.0 - x * x);
        else if (absM == 3) p = -15.0 * pow(1.0 - x * x, 1.5);
    }
    
    return p;
}

// Spherical Harmonics Y_l^m(theta, phi)
vec2 sphericalHarmonic(int l, int m, float theta, float phi) {
    float normalization_base = float(2 * l + 1) / (4.0 * PI);
    float f1 = factorial(l - abs(m));
    float f2 = factorial(l + abs(m));
    float normalization = sqrt(normalization_base * (f1 / f2));
    
    float p = legendre(l, m, cos(theta));
    
    float phase = float(m) * phi;
    vec2 phiComponent = cExp(phase);
    
    // Condon-Shortley phase for positive m
    float condon = (m > 0 && (m % 2 != 0)) ? -1.0 : 1.0;
    
    return cMult(vec2(normalization * p * condon, 0.0), phiComponent);
}

// Evaluate completely state
vec2 evaluateState(int n, int l, int m, float r, float theta, float phi) {
    float R = radial(n, l, r);
    vec2 Y = sphericalHarmonic(l, m, theta, phi);
    return cMult(vec2(R, 0.0), Y);
}
