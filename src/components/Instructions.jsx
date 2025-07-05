import React from 'react';

export default function Instructions() {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', fontFamily: 'Segoe UI', padding: '1rem' }}>
      <h2>How to Play Shifting Shapes</h2>
      <ol>
        <li>Your board is a 10×10 grid.</li>
        <li>There are exactly 10 green blocks forming one connected shape.</li>
        <li>Click on any edge block (perimeter of the shape) to select it.</li>
        <li>Then click an adjacent empty cell highlighted in blue to move the block.</li>
        <li>After each move, the blocks must remain a single continuous shape.</li>
      </ol>
      <p>Try morphing the line into interesting configurations!</p>
    </div>
  );
}
