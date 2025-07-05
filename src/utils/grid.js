/**
 * Check if a set of positions (with {x,y}) is 4-connected.
 */
export function isContiguous(positions) {
  const items = new Set(positions.map(p => `${p.x},${p.y}`));
  if (items.size === 0) return true;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const [start] = positions;
  const fringe = [start];
  const visited = new Set();

  while (fringe.length) {
    const { x, y } = fringe.pop();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    for (let [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const nkey = `${nx},${ny}`;
      if (items.has(nkey) && !visited.has(nkey)) {
        fringe.push({ x: nx, y: ny });
      }
    }
  }

  return visited.size === items.size;
}

/**
 * For a given tile index, return all valid adjacent moves that keep contiguity.
 */
export function allowedMoves(allPos, targetIndex) {
  const target = allPos[targetIndex];
  const deltas = [[1,0],[-1,0],[0,1],[0,-1]];
  const occupied = new Set(allPos.map(p => `${p.x},${p.y}`));
  const moves = [];

  for (let [dx, dy] of deltas) {
    const nx = target.x + dx;
    const ny = target.y + dy;
    const key = `${nx},${ny}`;
    if (!occupied.has(key)) {
      const newPositions = allPos.map((p, i) =>
        i === targetIndex ? { x: nx, y: ny } : p
      );
      if (isContiguous(newPositions)) {
        moves.push({ x: nx, y: ny });
      }
    }
  }

  return moves;
}
