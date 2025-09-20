import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export default function Toolbar() {
    const { running, setRunning, timeScale, setTimeScale, reset } = useSimulation();
    return (
        <div className="toolbar">
            <button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Play'}</button>
            <button onClick={() => { reset(); }}>Reset</button>

            <label className="controls-row" style={{ gap: 6 }}>
                Speed
                <input type="range" min="0.1" max="3" step="0.1" value={timeScale}
                    onChange={e => setTimeScale(Number(e.target.value))} />
                <span style={{ width: 36, textAlign: 'right' }}>{timeScale}×</span>
            </label>
        </div>
    );
}
