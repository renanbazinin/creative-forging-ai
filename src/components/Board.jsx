import React, { useState } from 'react';
import { allowedMoves } from '../utils/grid';
import './Board.css';

export default function Board() {
  const gridSize = 10;
  const cellSize = 40;
  // Initial 10-block shape: single horizontal line centered
  const centerY = Math.floor(gridSize / 2);
  const initialTiles = Array.from({ length: gridSize }).map((_, i) => ({ x: i, y: centerY }));
  const [tiles, setTiles] = useState(initialTiles);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [moves, setMoves] = useState([]);

  const handleCellClick = (col, row) => {
    console.log('Cell clicked:', col, row);
    if (selectedIndex !== null) {
      console.log('Currently selected index:', selectedIndex);
      // execute move if valid
      const move = moves.find(m => m.x === col && m.y === row);
      console.log('Determined move option:', move);
      if (move) {
        console.log('Performing move to:', move);
        const newTiles = tiles.map((t, i) => i === selectedIndex ? { x: col, y: row } : t);
        setTiles(newTiles);
      }
      console.log('Resetting selection and moves');
      setSelectedIndex(null);
      setMoves([]);
      return;
    }
    console.log('No selection, attempting to select tile at:', col, row);
    // select tile and compute allowed moves
    const idx = tiles.findIndex(t => t.x === col && t.y === row);
    if (idx >= 0) {
      console.log('Tile index under click:', idx);
      const allowed = allowedMoves(tiles, idx);
      console.log('Allowed moves computed:', allowed);
      if (allowed.length > 0) {
        setSelectedIndex(idx);
        setMoves(allowed);
      }
    }
  };

  return (
    <div className="board-container">
      <div className="grid" style={{ position: 'relative', width: gridSize * cellSize, height: gridSize * cellSize }}>
        {Array.from({ length: gridSize }).flatMap((_, row) =>
          Array.from({ length: gridSize }).map((_, col) => {
            const tileIdx = tiles.findIndex(t => t.x === col && t.y === row);
            const hasTile = tileIdx >= 0;
            const isSelected = tileIdx === selectedIndex;
            const isMoveOption = moves.some(m => m.x === col && m.y === row);
            return (
              <div
                key={`${col}-${row}`}
                onClick={() => handleCellClick(col, row)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  boxSizing: 'border-box',
                  border: '1px solid #ccc',
                  position: 'absolute',
                  left: col * cellSize,
                  top: (gridSize - 1 - row) * cellSize,
                  background: hasTile ? 'green' : isMoveOption ? 'lightblue' : 'white',
                  cursor: hasTile || isMoveOption ? 'pointer' : 'default',
                  outline: isSelected ? '3px solid orange' : 'none',
                }}
              />
            );
          })
        )}
      </div>
      <p>Click an edge block to select, then click a highlighted cell to move it.</p>
    </div>
  );
}
