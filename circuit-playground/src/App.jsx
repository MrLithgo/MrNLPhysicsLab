import React, { useRef, useState } from "react";

/*
  Simple Circuit Playground (milestone 1)
  - Click a palette item (Resistor or Voltage)
  - Click the canvas to place the component
  - Drag placed components by dragging the part
  - Click a pin (small circle) to start a wire, click another pin to finish
  - Click a component (double-click) to open inspector to edit value or delete
  - "Show nets" analyzes connected pins via wires and prints them
*/

const PALETTE = [
  { type: "Resistor", label: "R", defaultValue: 1000 },
  { type: "VoltageSource", label: "V", defaultValue: 5 },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function App() {
  const [tool, setTool] = useState(null); // selected palette tool (type string)
  const [comps, setComps] = useState([]); // placed components
  const [wires, setWires] = useState([]); // wires array {id, from:{componentId,pinIndex}, to:{...}}
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingStart, setDrawingStart] = useState(null); // {componentId,pinIndex}
  const [tempPos, setTempPos] = useState(null); // {x,y} for temporary wire end
  const [selectedId, setSelectedId] = useState(null); // selected component for inspector
  const [nets, setNets] = useState(null); // nice-to-show nets result

  const svgRef = useRef(null);

  // convert client coords to SVG coords
  function clientToSvgPoint(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: transformed.x, y: transformed.y };
  }

  // find palette entry to get default value
  function paletteEntry(type) {
    return PALETTE.find((p) => p.type === type);
  }

  // place component on canvas by clicking canvas
  function handleSvgClick(e) {
    // if a palette tool is selected, place one
    if (!tool) {
      // if user clicks empty canvas we clear selection
      setSelectedId(null);
      return;
    }
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    const entry = paletteEntry(tool);
    const newComp = {
      id: uid(),
      type: entry.type,
      label: entry.label,
      x: pt.x,
      y: pt.y,
      value: entry.defaultValue,
      pins: 2,
      // rotation could be added later
    };
    setComps((c) => [...c, newComp]);
    setTool(null); // deselect palette after placement (simple UX)
  }

  // get absolute pin position for a component and pin index (0 or 1)
  function getPinPos(component, pinIndex) {
    // two pins horizontally either side of the component center
    const pinOffsetX = 30; // pixels from center to pin
    const x = component.x + (pinIndex === 0 ? -pinOffsetX : pinOffsetX);
    const y = component.y;
    return { x, y };
  }

  // start/finish a wire when clicking a pin
  function handlePinMouseDown(e, componentId, pinIndex) {
    e.stopPropagation(); // important so group dragging doesn't start
    const pin = { componentId, pinIndex };
    if (!drawingStart) {
      setDrawingStart(pin);
      // set temp pos to current pin (so line is visible)
      const comp = comps.find((c) => c.id === componentId);
      setTempPos(getPinPos(comp, pinIndex));
      setSelectedId(null);
    } else {
      // finalize wire between drawingStart and this pin
      // prevent wiring a pin to itself
      if (
        drawingStart.componentId === componentId &&
        drawingStart.pinIndex === pinIndex
      ) {
        // clicked same pin again -> cancel
        setDrawingStart(null);
        setTempPos(null);
        return;
      }
      const newWire = {
        id: uid(),
        from: drawingStart,
        to: { componentId, pinIndex },
      };
      setWires((w) => [...w, newWire]);
      setDrawingStart(null);
      setTempPos(null);
    }
  }

  // dragging placed components: we implement a simple drag by using svg onMouseMove when draggingId != null
  function handleCompMouseDown(e, compId) {
    e.stopPropagation(); // don't let svg click fire
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    const comp = comps.find((c) => c.id === compId);
    if (!comp) return;
    setDraggingId(compId);
    setDragOffset({ x: pt.x - comp.x, y: pt.y - comp.y });
    setSelectedId(compId); // select the component
  }

  function handleSvgMouseMove(e) {
    const pt = clientToSvgPoint(e.clientX, e.clientY);

    // if drawing a wire, update temp position (ghost line)
    if (drawingStart) {
      setTempPos({ x: pt.x, y: pt.y });
    }

    // if dragging a component, update its position
    if (draggingId) {
      setComps((cs) =>
        cs.map((c) =>
          c.id === draggingId
            ? { ...c, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y }
            : c
        )
      );
    }
  }

  function handleSvgMouseUp(e) {
    // stop dragging
    setDraggingId(null);
  }

  // inspector: update a component's numeric value
  function updateCompValue(id, newValue) {
    setComps((cs) => cs.map((c) => (c.id === id ? { ...c, value: newValue } : c)));
  }

  function deleteComp(id) {
    // remove component and any wires referencing its pins
    setComps((cs) => cs.filter((c) => c.id !== id));
    setWires((ws) => ws.filter((w) => w.from.componentId !== id && w.to.componentId !== id));
    setSelectedId(null);
  }

  // compute nets (connected groups of pins) from wires
  function computeNets() {
    // adjacency map: pinKey -> [neighborPinKey,...]
    // pinKey format: `${componentId}:${pinIndex}`
    const adj = {};
    function keyFor(pin) {
      return `${pin.componentId}:${pin.pinIndex}`;
    }
    // build adjacency from wires
    wires.forEach((w) => {
      const k1 = keyFor(w.from);
      const k2 = keyFor(w.to);
      adj[k1] = adj[k1] || new Set();
      adj[k2] = adj[k2] || new Set();
      adj[k1].add(k2);
      adj[k2].add(k1);
    });

    // collect all pin keys that appear in adjacency
    const allKeys = Object.keys(adj);
    const visited = new Set();
    const netsLocal = [];

    for (const k of allKeys) {
      if (visited.has(k)) continue;
      // BFS/DFS from k
      const stack = [k];
      const net = [];
      visited.add(k);
      while (stack.length) {
        const cur = stack.pop();
        net.push(cur);
        const neighbors = adj[cur] ? Array.from(adj[cur]) : [];
        for (const nb of neighbors) {
          if (!visited.has(nb)) {
            visited.add(nb);
            stack.push(nb);
          }
        }
      }
      netsLocal.push(net);
    }

    // store nets for display
    setNets(netsLocal);

    // also return mapping pinKey -> netIndex
    const pinToNet = {};
    netsLocal.forEach((net, idx) => {
      net.forEach((pinKey) => (pinToNet[pinKey] = idx));
    });
    console.log("Nets:", netsLocal);
    return { nets: netsLocal, pinToNet };
  }

  // small helper to pretty print a pin key
  function prettyPin(pinKey) {
    const [componentId, pinIndex] = pinKey.split(":");
    const c = comps.find((cc) => cc.id === componentId);
    return `${c ? c.label : "?"}(${componentId.slice(-4)}) pin${pinIndex}`;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: 220, borderRight: "1px solid #eee", padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Palette</h3>
        {PALETTE.map((p) => (
          <div key={p.type} style={{ marginBottom: 8 }}>
            <button
              onClick={() => setTool(p.type)}
              style={{
                padding: "8px 12px",
                width: "100%",
                background: tool === p.type ? "#333" : "#fff",
                color: tool === p.type ? "#fff" : "#000",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              {p.label} — {p.type}
            </button>
          </div>
        ))}

        <div style={{ marginTop: 18 }}>
          <strong>Instructions</strong>
          <ol style={{ paddingLeft: 18 }}>
            <li>Click a palette item to choose it.</li>
            <li>Click the canvas to place the component.</li>
            <li>Drag components by clicking and moving them.</li>
            <li>Click a pin to start a wire, then click another pin to finish.</li>
            <li>Double-click a component (or select) to edit/delete.</li>
          </ol>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              const res = computeNets();
              // keep nets state for UI
            }}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            Show nets (console & panel)
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Placed:</strong>
          <div style={{ fontSize: 13 }}>
            {comps.length === 0 && <div style={{ color: "#666" }}>No components yet</div>}
            {comps.map((c) => (
              <div key={c.id} style={{ marginTop: 6 }}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    border: "1px solid #eee",
                    background: selectedId === c.id ? "#f0f0f0" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {c.label} — id {c.id.slice(-4)} — {c.value}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Wires:</strong>
          <div style={{ fontSize: 13 }}>
            {wires.length === 0 && <div style={{ color: "#666" }}>No wires</div>}
            {wires.map((w) => (
              <div key={w.id} style={{ marginTop: 6 }}>
                {w.from.componentId.slice(-4)}:{w.from.pinIndex} → {w.to.componentId.slice(-4)}:{w.to.pinIndex}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, position: "relative" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          style={{ background: "#fafafa", display: "block" }}
        >
          {/* wires */}
          {wires.map((w) => {
            const compFrom = comps.find((c) => c.id === w.from.componentId);
            const compTo = comps.find((c) => c.id === w.to.componentId);
            if (!compFrom || !compTo) return null;
            const p1 = getPinPos(compFrom, w.from.pinIndex);
            const p2 = getPinPos(compTo, w.to.pinIndex);
            return (
              <line
                key={w.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#333"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {/* temporary (ghost) wire while drawing */}
          {drawingStart && tempPos && (() => {
            const comp = comps.find((c) => c.id === drawingStart.componentId);
            if (!comp) return null;
            const p1 = getPinPos(comp, drawingStart.pinIndex);
            const p2 = tempPos;
            return (
              <line
                key="temp-wire"
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#888"
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            );
          })()}

          {/* components */}
          {comps.map((c) => (
            <g
              key={c.id}
              transform={`translate(${c.x} ${c.y})`}
              onMouseDown={(e) => handleCompMouseDown(e, c.id)}
              onDoubleClick={() => setSelectedId(c.id)}
              style={{ cursor: "grab", userSelect: "none" }}
            >
              <rect x={-22} y={-12} width={44} height={24} rx={4} fill="#fff" stroke="#333" />
              <text x={0} y={6} textAnchor="middle" fontSize={12}>
                {c.label} {c.value ? c.value : ""}
              </text>

              {/* left pin */}
              <circle
                cx={-30}
                cy={0}
                r={6}
                fill="#333"
                onMouseDown={(e) => handlePinMouseDown(e, c.id, 0)}
                style={{ cursor: "crosshair" }}
              />

              {/* right pin */}
              <circle
                cx={30}
                cy={0}
                r={6}
                fill="#333"
                onMouseDown={(e) => handlePinMouseDown(e, c.id, 1)}
                style={{ cursor: "crosshair" }}
              />
            </g>
          ))}
        </svg>

        {/* floating inspector */}
        {selectedId && (() => {
          const comp = comps.find((c) => c.id === selectedId);
          if (!comp) return null;
          return (
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 260,
                background: "#fff",
                border: "1px solid #ddd",
                padding: 12,
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                fontSize: 13,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>{comp.label} — inspector</strong>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 6 }}>Value</label>
                <input
                  value={comp.value}
                  onChange={(e) => updateCompValue(comp.id, Number(e.target.value))}
                  style={{ width: "100%", padding: 6 }}
                  type="number"
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => deleteComp(comp.id)} style={{ padding: "6px 8px" }}>
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedId(null);
                  }}
                  style={{ padding: "6px 8px" }}
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}

        {/* nets panel (simple display) */}
        {nets && (
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              width: 320,
              background: "#fff",
              border: "1px solid #ddd",
              padding: 12,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Nets</strong>
            </div>
            {nets.length === 0 && <div style={{ color: "#666" }}>No nets (no wires)</div>}
            {nets.map((net, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 600 }}>Net {i}</div>
                {net.map((p) => (
                  <div key={p} style={{ fontSize: 12 }}>
                    {prettyPin(p)}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => {
                  setNets(null);
                }}
                style={{ padding: "6px 8px" }}
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
