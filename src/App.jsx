import React, { useState } from 'react';
import Menu from './components/Menu';
import Board from './components/Board';
import Gallery from './components/Gallery';
import Instructions from './components/Instructions';
import './App.css';
 
export default function App() {
  const [mode, setMode] = useState('menu');
  const [savedShapes, setSavedShapes] = useState([]);
 
  const handleSave = (positions, player) => {
    // tag each coord with the player
    const tagged = positions.map(p => ({ x: p.x, y: p.y, player }));
    setSavedShapes(prev => [...prev, tagged]);
  };
  const handleSelectMode = selectedMode => {
    setMode(selectedMode);
    setSavedShapes([]);
  };
  const handleBackToMenu = () => setMode('menu');
 
  return (
    <div className="app-container">
      {mode === 'menu' && <Menu onSelectMode={handleSelectMode} />}
      {mode === 'instructions' && <Instructions onBack={handleBackToMenu} />}
      {(mode === 'pvp' || mode === 'pve') && (
        <>
          <div className="app-header">
            <h1 className="app-title">Creative Foraging Game</h1>
            <p className="app-subtitle">Build patterns, save masterpieces</p>
          </div>
          <div className="app-content">
            <Board onSave={handleSave} mode={mode} />
            <Gallery shapes={savedShapes} />
          </div>
          <button className="back-button" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </>
      )}
    </div>
  );
}
