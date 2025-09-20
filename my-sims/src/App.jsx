import React from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Palette from './components/Palette';
import Momentum from './simulations/momentum/Momentum';

import './styles.css';

export default function App() {
  return (
    <div className="app-shell">
      <Header title="Physics Simulations — Momentum" />
      <div className="main-row">
        <aside className="left-panel">
          <div className="panel-title">Palette</div>
          <Palette />
        </aside>

        <div className="center-panel">
          <Toolbar />
          <Momentum />
        </div>

        <aside className="right-panel">
          <div className="panel-title">Readouts</div>
          <div id="readouts" style={{ fontSize: 14 }}>
            (Play the sim to see momentum values)
          </div>
        </aside>
      </div>
    </div>
  );
}
