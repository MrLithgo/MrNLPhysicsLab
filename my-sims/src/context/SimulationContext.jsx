import React, { createContext, useContext, useRef, useState } from 'react';

/**
 * SimulationContext
 * - simRef.current.objects: live mutable array for high-rate updates (position & velocity)
 * - addObject/updateObject/removeObject for UI actions
 */
const SimulationContext = createContext();

export function SimulationProvider({ children }) {
    const simRef = useRef({
        objects: [], // each object: { id, type, x, vx, mass, width }
        nextId: 1,
        time: 0,
    });

    const [running, setRunning] = useState(false);
    const [timeScale, setTimeScale] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    function addObject(obj) {
        const id = simRef.current.nextId++;
        const o = { id, ...obj };
        simRef.current.objects.push(o);
        return o;
    }

    function updateObject(id, patch) {
        const o = simRef.current.objects.find(o => o.id === id);
        if (!o) return null;
        Object.assign(o, patch);
        return o;
    }

    function removeObject(id) {
        simRef.current.objects = simRef.current.objects.filter(o => o.id !== id);
        if (selectedId === id) setSelectedId(null);
    }

    function snapshot() {
        return simRef.current.objects.map(o => ({ ...o }));
    }

    function reset() {
        simRef.current.objects = [];
        simRef.current.nextId = 1;
        simRef.current.time = 0;
        setSelectedId(null);
        setRunning(false);
    }

    return (
        <SimulationContext.Provider value={{
            simRef, addObject, updateObject, removeObject, snapshot,
            running, setRunning, timeScale, setTimeScale,
            selectedId, setSelectedId, reset
        }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    return useContext(SimulationContext);
}
