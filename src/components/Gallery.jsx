import React from 'react';
import './Gallery.css';

export default function Gallery({ shapes }) {
  if (shapes.length === 0) {
    return (
      <div className="gallery-container">
        <h2 className="gallery-title">Gallery</h2>
        <div className="empty-gallery">
          <div className="empty-gallery-icon">🎨</div>
          <p>No shapes saved yet. Create some beautiful patterns!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery</h2>
      <div className="gallery-grid">
        {shapes.map((shapeArr, idx) => {
          // Calculate bounds for centering
          const minX = Math.min(...shapeArr.map(p => p.x));
          const maxX = Math.max(...shapeArr.map(p => p.x));
          const minY = Math.min(...shapeArr.map(p => p.y));
          const maxY = Math.max(...shapeArr.map(p => p.y));
          
          const width = maxX - minX + 1;
          const height = maxY - minY + 1;
          const scale = Math.min(100 / width, 100 / height, 10);
          
          const centerX = 60; // Center of 120px canvas
          const centerY = 60;
          const offsetX = centerX - (width * scale) / 2;
          const offsetY = centerY - (height * scale) / 2;

          return (
            <div key={idx} className="shape-card">
              <div className="shape-canvas">
                {shapeArr.map((p, i) => (
                  <div
                    key={i}
                    className={`shape-tile player-${p.player}`}
                    style={{
                      left: offsetX + (p.x - minX) * scale,
                      top: offsetY + (p.y - minY) * scale,
                      width: scale * 0.8,
                      height: scale * 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
