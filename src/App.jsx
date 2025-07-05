import React from 'react';
import Board from './components/Board';
import './App.css';
 
export default function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Shifting Shapes</h1>
      <Board />
    </div>
  );
}
