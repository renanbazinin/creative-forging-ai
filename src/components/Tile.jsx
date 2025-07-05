import React from 'react';

export default function Tile({ pos, onSelect, canMove, isSelected }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); if (canMove) onSelect(); }}
      style={{
        width: 40,
        height: 40,
        background: isSelected ? 'orange' : canMove ? 'skyblue' : 'green',
        position: 'absolute',
        left: pos.x * 40 + 200,
        top: -pos.y * 40 + 200,
        cursor: canMove ? 'pointer' : 'default',
        transition: 'left 0.2s, top 0.2s',
      }}
    />
  );
}
