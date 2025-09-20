// src/simulations/momentum/TrolleySVG.jsx
import React from 'react';

export default function TrolleySVG({ label = 'T', color = '#E74C3C' }) {
    // keep SVG identical to your original for visual fidelity
    return (
        <svg width="80" height="50" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="5" y="5" width="70" height="40" rx="4" fill={color} stroke="#C0392B" strokeWidth="2" />
            <circle cx="20" cy="40" r="10" fill="#2C3E50" />
            <circle cx="60" cy="40" r="10" fill="#2C3E50" />
            <text x="40" y="30" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{label}</text>
        </svg>
    );
}
