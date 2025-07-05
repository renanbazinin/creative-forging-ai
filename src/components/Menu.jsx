import React from 'react';
import './Menu.css';

export default function Menu({ onSelectMode }) {
  return (
    <div className="menu-container">
      <h1 className="menu-title">Creative Tile Game</h1>
      <div className="menu-buttons">
        <button className="menu-button" onClick={() => onSelectMode('pvp')}>Two Players</button>
        <button className="menu-button" onClick={() => onSelectMode('pve')}>Play vs Agent</button>
        <button className="menu-button" onClick={() => onSelectMode('instructions')}>Instructions</button>
      </div>
    </div>
  );
}
