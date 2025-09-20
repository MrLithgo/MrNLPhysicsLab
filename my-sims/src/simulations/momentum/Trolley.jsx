// src/simulations/momentum/Trolley.jsx
import React, { useEffect, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import TrolleySVG from './TrolleySVG';

export default function Trolley({ obj }) {
    const elRef = useRef(null);
    const { selectedId, setSelectedId } = useSimulation();

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        // left in px is obj.x - width/2
        const leftPx = (obj.x || 0) - (obj.width || 80) / 2;
        el.style.left = `${leftPx}px`;
    }, [obj.x, obj.width]);

    const isSelected = selectedId === obj.id;

    return (
        <div
            ref={elRef}
            className="trolley"
            onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
            style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${obj.width || 80}px`,
                height: '50px',
                cursor: 'pointer',
                outline: isSelected ? '3px solid rgba(37,99,235,0.18)' : 'none',
                zIndex: isSelected ? 10 : 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title={`mass ${obj.mass} kg, v ${obj.vx.toFixed(2)} m/s`}
        >
            <TrolleySVG label={obj.label || `T${obj.id}`} color={obj.color || '#E74C3C'} />
        </div>
    );
}
