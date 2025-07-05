import React from 'react';
import './Instructions.css';

export default function Instructions({ onBack }) {
  return (
    <div className="instructions-container">
      <h2>How to Play</h2>
      <ol>
        <li>Select Two Players or play against the Agent.</li>
        <li>Take turns placing one tile per turn on the board.</li>
        <li>Once placed, tiles cannot be moved in this mode.</li>
        <li>Click "Save Shape" to record the current pattern.</li>
      </ol>
      <button className="back-button" onClick={onBack}>Back to Menu</button>
    </div>
  );
}
