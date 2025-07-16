import React from 'react';
import './Gallery.css';

export default function Gallery({ shapes }) {
  // Generate and download an image of the shape from its 2D grid
  const downloadShape = (grid, idx) => {
    const gridSize = grid.length;
    const canvasSize = 120;
    const cellSize = canvasSize / gridSize;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    // fill background black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    // draw tiles
    ctx.fillStyle = '#0f0';
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) {
          ctx.fillRect(
            c * cellSize,
            r * cellSize,
            cellSize * 0.8,
            cellSize * 0.8
          );
        }
      });
    });
    // trigger download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `shape_${idx + 1}.png`;
    link.click();
  };
  if (shapes.length === 0) {
    return (
      <div className="gallery-container">
        <h2 className="gallery-title">Gallery</h2>
        <div className="empty-gallery">
          <div className="empty-gallery-icon"></div>
          <p>No shapes saved yet. Create some beautiful patterns!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery</h2>
      <div className="gallery-grid">
        {shapes.map((grid, idx) => {
          const gridSize = grid.length;
          const canvasSize = 120;
          const cellSize = canvasSize / gridSize;
          return (
            <div key={idx} className="shape-card">
              <div className="shape-canvas">
                {grid.map((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell === 1 ? (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="shape-tile"
                        style={{
                          left: cIdx * cellSize,
                          top: rIdx * cellSize,
                          width: cellSize * 0.8,
                          height: cellSize * 0.8,
                          background: '#0f0',
                        }}
                      />
                    ) : null
                  )
                )}
              </div>
              {/* Download button */}
              <button
                className="download-button"
                onClick={() => downloadShape(grid, idx)}
                title="Download shape"
              >
                ⬇️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
