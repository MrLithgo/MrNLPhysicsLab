import React from 'react';

export default function Header({ title }) {
    return (
        <header className="header">
            <div style={{ fontWeight: 700 }}>{title}</div>
            <div style={{ color: '#666' }}>Neil's Physics Simulations</div>
        </header>
    );
}
