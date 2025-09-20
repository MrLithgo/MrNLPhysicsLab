// src/simulations/momentum/Momentum.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import useAnimationFrame from '../../hooks/useAnimationFrame';
import Trolley from './Trolley';
import { resolveElasticCollision, totalMomentum, kineticEnergy } from './physics';

/**
 * Convert of your original momentum/dist/script.js into a React component.
 * - Keeps same behaviour: two trolleys, velocity/mass controls, play/pause/reset.
 * - Uses simRef from SimulationContext as mutable store (positions & velocities).
 *
 * Notes:
 * - pxPerMeter chosen to make velocities visually similar to the original sim.
 * - Initial positions are set as percentages approximating the original left/right.
 */

export default function Momentum() {
    const { simRef, addObject, updateObject, snapshot, running, timeScale, setRunning, reset } = useSimulation();

    const containerRef = useRef(null);
    const pxPerMeterRef = useRef(120); // visual scaling (px/m)
    const widthRef = useRef(800);
    const height = 220;
    const [tick, setTick] = useState(0);

    // Initialize trolleys once (if not present) with same feel as original sim
    useEffect(() => {
        if (simRef.current.objects.length === 0) {
            // create two trolleys in similar starting positions
            const cw = containerRef.current ? containerRef.current.getBoundingClientRect().width : 800;
            const leftX = (cw || 800) * 0.2;   // 20%
            const rightX = (cw || 800) * 0.8;  // 80%
            addObject({ type: 'trolley', x: leftX, vx: 1.2, mass: 1, width: 80, label: 'T1', color: '#E74C3C' });
            addObject({ type: 'trolley', x: rightX, vx: -0.6, mass: 2, width: 80, label: 'T2', color: '#3498DB' });
            setTick(t => t + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // resize handler
    useEffect(() => {
        const c = containerRef.current;
        function recompute() {
            if (!c) return;
            widthRef.current = c.getBoundingClientRect().width;
        }
        recompute();
        window.addEventListener('resize', recompute);
        return () => window.removeEventListener('resize', recompute);
    }, []);

    // animation update loop (mutates simRef)
    useAnimationFrame((dt) => {
        if (!running) return;
        const scaledDt = dt * timeScale;
        const pxPerMeter = pxPerMeterRef.current;

        const objs = simRef.current.objects;

        // update positions: x += vx * dt * pxPerMeter
        objs.forEach(o => {
            o.x = (o.x || 0) + (o.vx || 0) * scaledDt * pxPerMeter;
        });

        // pairwise collision detection (AABB) and resolve with elastic formula
        for (let i = 0; i < objs.length; i++) {
            for (let j = i + 1; j < objs.length; j++) {
                const a = objs[i], b = objs[j];
                const aLeft = a.x - (a.width / 2);
                const aRight = a.x + (a.width / 2);
                const bLeft = b.x - (b.width / 2);
                const bRight = b.x + (b.width / 2);

                if (aRight >= bLeft && bRight >= aLeft) {
                    // resolve velocities using physics helper (treat vx in m/s)
                    // convert to m/s is not needed because vx stored as m/s already
                    const [v1p, v2p] = resolveElasticCollision(a, b);
                    a.vx = v1p;
                    b.vx = v2p;

                    // separate them slightly to avoid sticking
                    const overlap = Math.min(aRight - bLeft, bRight - aLeft);
                    if (overlap > 0) {
                        const sep = overlap / 2 + 0.5;
                        a.x -= sep;
                        b.x += sep;
                    }
                }
            }
        }

        // walls: reflect off edges
        objs.forEach(o => {
            const half = o.width / 2;
            if (o.x - half < 0) {
                o.x = half;
                o.vx = -o.vx;
            } else if (o.x + half > widthRef.current) {
                o.x = widthRef.current - half;
                o.vx = -o.vx;
            }
        });

        // small tick to force React updates for UI
        setTick(t => t + 1);
    }, true);

    // readouts derived from snapshot
    const snap = snapshot();
    const momentum = totalMomentum(snap);
    const energy = kineticEnergy(snap);

    // handlers for controls (these mirror the DOM handlers in the original script)
    function setMass(id, value) {
        updateObject(id, { mass: value });
        setTick(t => t + 1);
    }
    function setVelocity(id, value) {
        updateObject(id, { vx: value });
        setTick(t => t + 1);
    }

    function handleReset() {
        // reset positions & velocities to initial defaults (closest approximation)
        reset();
        // re-add initial trolleys
        const cw = containerRef.current ? containerRef.current.getBoundingClientRect().width : 800;
        const leftX = (cw || 800) * 0.2;
        const rightX = (cw || 800) * 0.8;
        addObject({ type: 'trolley', x: leftX, vx: 1.2, mass: 1, width: 80, label: 'T1', color: '#E74C3C' });
        addObject({ type: 'trolley', x: rightX, vx: -0.6, mass: 2, width: 80, label: 'T2', color: '#3498DB' });
        setTick(t => t + 1);
    }

    // UI: we will render sliders/inputs similar to your original page
    return (
        <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
                {/* readouts row */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <div>Total momentum: <strong>{momentum.toFixed(2)}</strong> kg·m/s</div>
                    <div>KE: <strong>{energy.toFixed(2)}</strong> J</div>
                </div>

                {/* stage */}
                <div
                    ref={containerRef}
                    className="sim-canvas"
                    style={{ height: `${height}px`, position: 'relative', width: '100%' }}
                    onClick={() => { /* deselect on background click */ }}
                >
                    {/* track background */}
                    <div style={{
                        position: 'absolute', left: 0, right: 0, top: height / 2 - 6, height: 12, background: '#f1f1f1'
                    }} />

                    {snap.map(obj => (
                        <Trolley key={obj.id} obj={obj} />
                    ))}
                </div>

            </div>

            {/* right panel with controls for each trolley */}
            <aside style={{ width: 300 }}>
                <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Trolley controls</div>

                    {snap.map(o => (
                        <div key={o.id} style={{ marginBottom: 12, padding: 8, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600 }}>{o.label || `T${o.id}`}</div>
                                <div style={{ fontSize: 13, color: '#666' }}>m = {o.mass.toFixed(1)} kg</div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <label style={{ fontSize: 13, color: '#555' }}>Mass (kg)</label>
                                <input type="range" min="0.1" max="10" step="0.1" value={o.mass}
                                    onChange={(e) => setMass(o.id, Number(e.target.value))}
                                    style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <label style={{ fontSize: 13, color: '#555' }}>Velocity (m/s)</label>
                                <input type="range" min="-3" max="3" step="0.05" value={o.vx}
                                    onChange={(e) => setVelocity(o.id, Number(e.target.value))}
                                    style={{ width: '100%' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                    <div style={{ fontSize: 13 }}>v = {o.vx.toFixed(2)} m/s</div>
                                    <div style={{ fontSize: 13, color: '#999' }}>{o.mass.toFixed(1)} kg</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => setRunning(!running)} style={{ padding: '6px 10px' }}>{running ? 'Pause' : 'Play'}</button>
                        <button onClick={handleReset} style={{ padding: '6px 10px' }}>Reset</button>
                        <button onClick={() => {
                            // capture / snapshot placeholder - could wire html2canvas in future
                            alert('Capture not yet implemented in React port — I can add this next.');
                        }}>Capture</button>
                    </div>

                </div>
            </aside>
        </div>
    );
}
