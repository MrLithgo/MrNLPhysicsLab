import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [components, setComponents] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  const handleCanvasClick = (e) => {
    if (!selectedTool) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent = {
      id: Date.now(),
      type: selectedTool,
      x,
      y
    };

    setComponents([...components, newComponent]);
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    const component = components.find(c => c.id === id);
    if (component) {
      setDragging(id);
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - component.x;
      const offsetY = e.clientY - rect.top - component.y;
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setComponents(components.map(comp =>
      comp.id === dragging ? { ...comp, x, y } : comp
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const componentTypes = [
    { type: 'battery', symbol: '🔋', label: 'Battery' },
    { type: 'resistor', symbol: '⏚', label: 'Resistor' },
    { type: 'bulb', symbol: '💡', label: 'Bulb' },
    { type: 'switch', symbol: '🔃', label: 'Switch' }
  ];

  return (
    <div className="App">
      <header className="app-header">
        <h1>Simple Circuit Simulator</h1>
        <p>Click a component, then click on the canvas to place it. Drag to move.</p>
      </header>

      <div className="simulator-container">
        <div className="component-palette">
          <h3>Components</h3>
          {componentTypes.map(comp => (
            <div
              key={comp.type}
              className={`tool-btn ${selectedTool === comp.type ? 'selected' : ''}`}
              onClick={() => setSelectedTool(comp.type)}
            >
              <span className="symbol">{comp.symbol}</span>
              <span>{comp.label}</span>
            </div>
          ))}
          <button
            className="clear-btn"
            onClick={() => setComponents([])}
          >
            Clear All
          </button>
        </div>

        <div
          ref={canvasRef}
          className="circuit-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {components.map(comp => (
            <div
              key={comp.id}
              className={`component ${comp.type} ${dragging === comp.id ? 'dragging' : ''}`}
              style={{ left: comp.x, top: comp.y }}
              onMouseDown={(e) => handleMouseDown(comp.id, e)}
            >
              {comp.type === 'battery' && '🔋'}
              {comp.type === 'resistor' && '⏚'}
              {comp.type === 'bulb' && '💡'}
              {comp.type === 'switch' && '🔃'}
            </div>
          ))}
          {!components.length && (
            <div className="canvas-placeholder">
              <p>Select a component from the left and click here to place it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;