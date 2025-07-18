import React, { useState, useEffect, useRef } from 'react';
import { allowedMoves } from '../utils/grid';
import { API_URL } from '../config';
import './Board.css';

export default function Board({ onSave }) {
  const gridSize = 10;
  const cellSize = 40;
  const tileMargin = 2; // margin around each tile for separation
  // Initial 10-block shape: single horizontal line centered
  const centerY = Math.floor(gridSize / 2);
  const initialTiles = Array.from({ length: gridSize }).map((_, i) => ({ x: i, y: centerY }));
  const [tiles, setTiles] = useState(initialTiles);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [moves, setMoves] = useState([]);
  const [timer, setTimer] = useState(2);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [debugContext, setDebugContext] = useState('');

  const timerRef = useRef(null);
  const isRequestPending = useRef(false); // Ref to track pending request

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer > 1) {
            return prevTimer - 1;
          } else {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            console.log('⏰ Timer finished.');
            sendBoard();
            return 0;
          }
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const sendBoard = async () => {
    if (isRequestPending.current) {
      console.log('A request is already in progress. Aborting new request.');
      return;
    }

    setIsWaiting(true);
    isRequestPending.current = true;
    setPredictions([]);
    setStatusMessage('Waiting for server...');
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    tiles.forEach(tile => {
      if (tile.y >= 0 && tile.y < gridSize && tile.x >= 0 && tile.x < gridSize) {
        grid[gridSize - 1 - tile.y][tile.x] = 1;
      }
    });

    console.log('🚀 Sending board to server:', JSON.stringify(grid, null, 2));

    try {
      // include debug flag and context when enabled
      const payload = { board: grid };
      if (debugMode) {
        payload.debug = 1;
        payload.context = debugContext;
      }
      const response = await fetch(`${API_URL}/getBoard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📝 Received raw response from server:', responseText);

      if (!response.ok) {
        // Handle HTTP errors like 500 Internal Server Error
        setStatusMessage(`Server error: ${response.status} ${response.statusText}`);
        try {
            // Try to parse the error response to show more details
            const errorData = JSON.parse(responseText);
            console.error('Server error details:', errorData);
            setStatusMessage(`Server error: ${errorData.details || 'See console for details.'}`);
        } catch (e) {
            console.error('Could not parse error response from server.');
        }
        return; // Stop further processing
      }

      // Clean the response to handle potential markdown fences from the API
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
      const cleanText = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : responseText;

      try {
        const data = JSON.parse(cleanText);
        console.log('🤖 Parsed server response:', data);

        if (data.board && data.predict) {
          const newTiles = [];
          data.board.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
              if (cell === 1) {
                newTiles.push({ x: cIdx, y: gridSize - 1 - rIdx });
              }
            });
          });
          setTiles(newTiles);
          setPredictions(Array.isArray(data.predict) ? data.predict : [data.predict]);
          setStatusMessage(''); // Clear status on success
        } else {
          console.error('Invalid data structure from server:', data);
          setStatusMessage('Received unexpected data from server.');
        }
      } catch (parseError) {
        console.error('Error parsing JSON from server:', parseError);
        console.error('Original response text:', responseText);
        setStatusMessage('Error reading server response.');
      }
    } catch (error) {
      console.error('Error sending board:', error);
      setStatusMessage('Error communicating with server. Check console.');
    } finally {
      setIsWaiting(false);
      isRequestPending.current = false;
      // Don't clear status message here to allow error messages to persist
    }
  };

  const handleCellClick = (col, row) => {
    if (isWaiting) return;

    if (selectedIndex !== null) {
      const move = moves.find(m => m.x === col && m.y === row);
      if (move) {
        const newTiles = tiles.map((t, i) => i === selectedIndex ? { x: col, y: row } : t);
        setTiles(newTiles);
        // In debug mode, delay auto-send by setting a long timer; else normal 2s
        const delay = debugMode ? 1000 : 2;
        setTimer(delay);
        setIsTimerRunning(true);
      }
      setSelectedIndex(null);
      setMoves([]);
      return;
    }

    const idx = tiles.findIndex(t => t.x === col && t.y === row);
    if (idx >= 0) {
      setIsTimerRunning(false); // Pause timer on selection
      const allowed = allowedMoves(tiles, idx);
      if (allowed.length > 0) {
        setSelectedIndex(idx);
        setMoves(allowed);
      }
    }
  };

  return (
    <div className="board-container">
       <div className="predictions">
        <h3>AI Predictions:</h3>
        {predictions.length > 0 ? (
          <ul>
            {predictions.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        ) : (
          <p>{isWaiting ? 'Analyzing...' : 'Make a move to see predictions!'}</p>
        )}
      </div>
      <div className="grid" style={{ 
        position: 'relative', 
        width: gridSize * cellSize, 
        height: gridSize * cellSize, 
        pointerEvents: isWaiting ? 'none' : 'auto',
        border: '2px solid #0f0',
        backgroundColor: '#000'
      }}>
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
                  width: cellSize - tileMargin * 2,
                  height: cellSize - tileMargin * 2,
                  boxSizing: 'border-box',
                  position: 'absolute',
                  left: col * cellSize + tileMargin,
                  top: (gridSize - 1 - row) * cellSize + tileMargin,
                  background: hasTile ? '#0f0' : isMoveOption ? '#004d00' : 'transparent',
                  cursor: hasTile || isMoveOption ? 'pointer' : 'default',
                  outline: isSelected ? '3px solid orange' : 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })
        )}
      </div>
      <div className="status-bar">
        {isTimerRunning && <p>Time remaining: {timer}s</p>}
        {isWaiting && <p>{statusMessage}</p>}
        {!isTimerRunning && !isWaiting && !statusMessage && <p>Click an edge block to select, then click a highlighted cell to move it.</p>}
        {statusMessage && !isWaiting && <p style={{color: 'red'}}>{statusMessage}</p>}
      </div>
      {/* Save control for gallery */}
      {/* Save control for gallery: pass full 2D grid */}
      <div className="board-controls">
        <button
          className="save-shape-button"
          onClick={() => {
            const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
            tiles.forEach(({ x, y }) => { grid[gridSize - 1 - y][x] = 1; });
            onSave(grid);
          }}
          disabled={isWaiting}
        >
          Save Shape
        </button>
        <div className="debug-controls">
          <label className="debug-toggle">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={() => setDebugMode(dm => !dm)}
              disabled={isWaiting}
            />
            Debug Mode
          </label>
          {debugMode && (
            <textarea
              className="debug-textarea"
              placeholder="Enter debug context…"
              value={debugContext}
              onChange={e => setDebugContext(e.target.value)}
              disabled={isWaiting}
            />
          )}
        </div>
        {/* AI Move button to immediately send board to AI */}
        <button
          className="ai-move-button"
          onClick={() => { setIsTimerRunning(false); sendBoard(); }}
          disabled={isWaiting}
        >
          Let AI Move Manually
        </button>
      </div>
    </div>
  );
}
