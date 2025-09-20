// src/simulations/momentum/physics.js
export function resolveElasticCollision(a, b) {
    const m1 = a.mass, m2 = b.mass;
    const v1 = a.vx, v2 = b.vx;
    const denom = m1 + m2;
    if (denom === 0) return [v1, v2];
    const v1p = ((m1 - m2) / denom) * v1 + ((2 * m2) / denom) * v2;
    const v2p = ((2 * m1) / denom) * v1 + ((m2 - m1) / denom) * v2;
    return [v1p, v2p];
}

export function totalMomentum(objects) {
    return objects.reduce((s, o) => s + (o.mass || 0) * (o.vx || 0), 0);
}

export function kineticEnergy(objects) {
    return objects.reduce((s, o) => s + 0.5 * (o.mass || 0) * Math.pow(o.vx || 0, 2), 0);
}

