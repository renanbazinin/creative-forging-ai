import React, { useState, useEffect, useRef } from 'react';
import './Board.css';

export default function Board({ onSave }) {
  const gridSize = 50; // increased grid size
  const [tiles, setTiles] = useState([]);
  const [prediction, setPrediction] = useState(null);
  // 'User': allow clicks; 'PendingAI': waiting 2s; 'AI': fetching/applying AI moves
  const [currentTurn, setCurrentTurn] = useState('User');
  const [isPainting, setIsPainting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  // refs for initial 5s delay and recurring timers
  const initialRef = useRef(true);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const tilesRef = useRef(tiles);
  useEffect(() => { tilesRef.current = tiles; }, [tiles]);

  // register global mouseup to end painting
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isPainting]);


  const paintCell = (x, y) => {
    if (currentTurn === 'AI') return;
    if (tilesRef.current.some(t => t.x === x && t.y === y)) return;
    setTiles(prev => [...prev, { x, y, player: 1 }]);
    // reset AI timer for 2s after each paint
    scheduleAITimer(2);
  };

  const startPaint = (x, y) => {
    paintCell(x, y);
    setIsPainting(true);
  };

  const handleMouseUp = () => {
    if (!isPainting) return;
    setIsPainting(false);
  };

  // schedule AI after delay seconds and show countdown
  const scheduleAITimer = (delay) => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    setTimeLeft(delay);
    setCurrentTurn('PendingAI');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setTimeLeft(0);
      setCurrentTurn('AI');
      setTimeLeft(null);
    }, delay * 1000);
  };

  // AI turn: send current board, receive new board, place AI blocks
  const triggerAI = async () => {
    // build binary grid (1 for any tile, else 0)
    const grid = Array.from({ length: gridSize }).map((_, row) =>
      Array.from({ length: gridSize }).map((_, col) => (
        tilesRef.current.find(t => t.x === col && t.y === row) ? 1 : 0
      ))
    );
    // AI turn begins
    clearTimeout(timerRef.current);
    console.log('AI turn: sending grid to AI');
    setCurrentTurn('AI');
    console.log('Sending to AI:', grid);
    try {
      const res = await fetch('http://localhost:3000/getBoard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grid)
      });
      const data = await res.json();
      console.log('Received from AI:', data);
      // find and apply new AI placements
      const aiMoves = [];
      data.forEach((rowArr, r) => rowArr.forEach((cell, c) => {
        if (cell === 1 && !tilesRef.current.find(t => t.x === c && t.y === r)) {
          aiMoves.push({ x: c, y: r, player: 2 });
        }
      }));
      if (aiMoves.length) {
        console.log('Applying AI moves:', aiMoves);
        setTiles(prev => [...prev, ...aiMoves]);
      }
      // run predict on AI response
      try {
        const res2 = await fetch('http://localhost:3000/predict', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const pred = await res2.json();
        console.log('Predict response:', pred);
        setPrediction(pred);
      } catch (err2) {
        console.error('Predict error:', err2);
      }
    } catch (err) {
      console.error('AI error:', err);
    }
    // return to user input
    console.log('AI turn complete. User may play now.');
    setCurrentTurn('User');
  };


  // initial AI trigger if no user action in first 5s
  useEffect(() => {
    // initial 5s countdown to AI start
    scheduleAITimer(5);
    return () => { clearTimeout(timerRef.current); clearInterval(intervalRef.current); };
  }, []);

  // whenever turn becomes 'AI', fire triggerAI
  useEffect(() => {
    if (currentTurn === 'AI') {
      triggerAI();
    }
  }, [currentTurn]);

  const handleSave = () => {
    // Log grid as JSON: 2D array of player numbers or null
    const grid = Array.from({ length: gridSize }).map((_, row) =>
      Array.from({ length: gridSize }).map((_, col) => {
        const tile = tiles.find(t => t.x === col && t.y === row);
        return tile ? tile.player : 0;
      })
    );
    console.log('Grid JSON:', JSON.stringify(grid));

    const lastPlayer = currentTurn === 'User' ? 2 : 1;
    onSave(tiles.map(t => ({ x: t.x, y: t.y, player: t.player })), lastPlayer);
    setTiles([]); // Clear the board after saving
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <div className={`current-player ${currentTurn === 'AI' ? 'ai-turn' : 'user-turn'}`}>
          {currentTurn === 'User' && "Your Turn"}
          {currentTurn === 'PendingAI' && `AI in ${timeLeft || 0}s`}
          {currentTurn === 'AI' && "AI's Turn"}
        </div>
        <div className="button-group">
          <button type="button" className="save-button" onClick={handleSave} disabled={tiles.length === 0}>
            Save Shape
          </button>
          <button type="button" className="predict-button" onClick={async () => {
             const grid = Array.from({ length: gridSize }).map((_, row) =>
               Array.from({ length: gridSize }).map((_, col) => (
                 tiles.find(t => t.x === col && t.y === row) ? 1 : 0
               ))
             );
             console.log('Manual predict send:', grid);
             try {
               const r = await fetch('http://localhost:3000/predict', {
                 method: 'POST', headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(grid)
               });
               const p = await r.json();
               console.log('Predict button response:', p);
               setPrediction(p);
             } catch (err) {
               console.error('Predict button error:', err);
             }
           }}>
            Predict
          </button>
        </div>
        {prediction && <div className="prediction">AI thinks: {JSON.stringify(prediction)}</div>}
      </div>
      
      <div className={`game-grid grid-${gridSize}`}>
        {Array.from({ length: gridSize }).flatMap((_, row) =>
          Array.from({ length: gridSize }).map((_, col) => {
            const tile = tiles.find(t => t.x === col && t.y === row);
            const cellClasses = [
              'grid-cell',
              tile ? 'occupied' : '',
              tile ? `player-${tile.player}` : ''
            ].filter(Boolean).join(' ');
            
            return (
              <div
                key={`${col}-${row}`}
                data-x={col} data-y={row}
                className={cellClasses}
                onMouseDown={() => startPaint(col, row)}
                onMouseEnter={() => isPainting && paintCell(col, row)}
                draggable={false}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
