export default function AI(boardSize = 10) {
  let available = [];
  let queue = [];

  function init() {
    available = [];
    queue = [];
    for (let y = 0; y < boardSize; y++)
      for (let x = 0; x < boardSize; x++) available.push([x, y]);
  }

  function removeFromAvailable([x, y]) {
    available = available.filter(([ax, ay]) => !(ax === x && ay === y));
  }

  function getNextMove() {
    if (queue.length > 0) {
      const move = queue.shift();
      removeFromAvailable(move); // Ensure it's not available anymore
      return move;
    }
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available.splice(idx, 1)[0];
  }

  function enqueueAdjacent(x, y) {
    const adj = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    adj.forEach(([ax, ay]) => {
      if (ax < 0 || ay < 0 || ax >= boardSize || ay >= boardSize) return;
      // don't enqueue duplicates
      if (queue.some(([qx, qy]) => qx === ax && qy === ay)) return;
      // only enqueue if still available
      if (available.some(([vx, vy]) => vx === ax && vy === ay)) {
        queue.push([ax, ay]);
        removeFromAvailable([ax, ay]);
      }
    });
  }

  return { init, getNextMove, enqueueAdjacent, removeFromAvailable };
}
