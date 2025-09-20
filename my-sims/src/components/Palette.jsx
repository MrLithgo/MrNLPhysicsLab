import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export default function Palette() {
    const { addObject } = useSimulation();

    function addTrolley(opts = {}) {
        addObject({
            type: 'trolley',
            x: opts.x ?? 100,
            vx: opts.vx ?? 0.5,
            mass: opts.mass ?? 1,
            width: opts.width ?? 60
        });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => addTrolley({ x: 100, vx: 0.8, mass: 1 })}>Add trolley (1 kg)</button>
            <button onClick={() => addTrolley({ x: 300, vx: -0.5, mass: 2 })}>Add trolley (2 kg)</button>
            <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
                Tip: add two trolleys and press Play to watch collisions.
            </div>
        </div>
    );
}
