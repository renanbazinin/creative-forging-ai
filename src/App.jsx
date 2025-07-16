import React, { useState } from 'react';
import Board from './components/Board';
import Gallery from './components/Gallery';
import './App.css';
 
export default function App() {
  const [shapes, setShapes] = useState([]);
  const handleSave = (shape) => {
    setShapes(prev => [...prev, shape]);
  };
  return (
    <div className="app-container">
      <h1 className="app-title">Shifting Shapes</h1>
      <Board onSave={handleSave} />
      <Gallery shapes={shapes} />
    </div>
  );
}
