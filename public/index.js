import GameController from "../src/modules/GameController.js";
import Ship from "../src/modules/Ship.js";

let game;
let playerGrid, opponentGrid, statusText;
let isPlacementPhase = true;
let direction = "horizontal";
let shipsToPlace = [2, 3]; // Example ships
let aiAvailableMoves = [];

init();

function init() {
  game = GameController();
  isPlacementPhase = true;
  direction = "horizontal";
  aiAvailableMoves = [];
  playerGrid = document.querySelector("#player-board .grid");
  opponentGrid = document.querySelector("#opponent-board .grid");
  statusText = document.getElementById("status");
  playerGrid.innerHTML = "";
  opponentGrid.innerHTML = "";
  shipsToPlace = [2, 3];

  statusText.textContent = "Place your ships";

  createBoards();

  // Place opponent ships randomly
  shipsToPlace.forEach((len) => {
    const x = Math.floor(Math.random() * 3);
    const y = Math.floor(Math.random() * 5);
    game.getOpponent().gameboard.placeShip(Ship(len), x, y, "horizontal");
  });

  // Fill AI moves list (5x5 grid)
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      aiAvailableMoves.push([x, y]);
    }
  }

  document.getElementById("rotate-btn").onclick = () => {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
    statusText.textContent = `Direction: ${direction}`;
  };

  document.getElementById("restart-btn").onclick = () => {
    init();
  };
}

function createBoards() {
  // Player grid
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.onclick = () => {
        if (isPlacementPhase) placeShipAt(x, y);
      };
      playerGrid.appendChild(cell);
    }
  }

  // Opponent grid
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.onclick = () => {
        if (!isPlacementPhase) playerAttack(x, y, cell);
      };
      opponentGrid.appendChild(cell);
    }
  }
}

function placeShipAt(x, y) {
  if (shipsToPlace.length === 0) return;
  const length = shipsToPlace[0];
  const newShip = Ship(length);
  const coords = calculateCoordinates(x, y, length, direction);

  // Check bounds
  if (coords.some(([cx, cy]) => cx < 0 || cy < 0 || cx >= 5 || cy >= 5)) {
    statusText.textContent = "Ship out of bounds!";
    return;
  }

  // Check overlap
  const overlap = game
    .getCurrentPlayer()
    .gameboard.ships.some(({ coordinates }) =>
      coordinates.some(([sx, sy]) =>
        coords.some(([cx, cy]) => cx === sx && cy === sy)
      )
    );
  if (overlap) {
    statusText.textContent = "Cannot overlap ships!";
    return;
  }

  game.getCurrentPlayer().gameboard.placeShip(newShip, x, y, direction);
  coords.forEach(([cx, cy]) => {
    const idx = cy * 5 + cx;
    playerGrid.children[idx].classList.add("ship");
  });

  shipsToPlace.shift();
  if (shipsToPlace.length === 0) {
    isPlacementPhase = false;
    statusText.textContent = "All ships placed! Your turn to attack!";
  } else {
    statusText.textContent = `Place ship of length ${shipsToPlace[0]}`;
  }
}

function playerAttack(x, y, cell) {
  if (game.isGameOver()) return; // Prevent attack if game is already over

  if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
    statusText.textContent = "Already attacked there!";
    return;
  }

  const result = game.attack(x, y);

  if (result === "hit" || result === "miss") {
    cell.classList.add(result);
    statusText.textContent =
      result === "hit" ? "Hit! Opponent's turn..." : "Miss! Opponent's turn...";
  } else if (result.startsWith("Game over")) {
    // Last attack was a hit that sunk all ships
    cell.classList.add("hit");
    statusText.textContent = result;
    return; // Stop here, game over
  }

  if (game.isGameOver()) return; // Stop if game ended

  // AI turn only if game not over
  setTimeout(() => {
    aiTurn();
  }, 500);
}

function aiTurn() {
  if (game.isGameOver()) return;

  if (aiAvailableMoves.length === 0) return; // no moves left

  // Pick random index from aiAvailableMoves
  const idx = Math.floor(Math.random() * aiAvailableMoves.length);
  const [x, y] = aiAvailableMoves.splice(idx, 1)[0]; // remove from available moves

  const cell = playerGrid.querySelector(`[data-x='${x}'][data-y='${y}']`);
  if (!cell) {
    aiTurn(); // Just in case, pick again
    return;
  }

  const result = game.attack(x, y);

  if (result === "hit" || result === "miss") {
    cell.classList.add(result);
    statusText.textContent =
      result === "hit" ? "Opponent hit your ship!" : "Opponent missed!";
  } else if (result.startsWith("Game over")) {
    cell.classList.add("hit"); // or "miss" if you want to improve
    statusText.textContent = result;
  }
}

function calculateCoordinates(x, y, length, dir) {
  const coords = [];
  for (let i = 0; i < length; i++) {
    if (dir === "horizontal") coords.push([x + i, y]);
    else coords.push([x, y + i]);
  }
  return coords;
}
