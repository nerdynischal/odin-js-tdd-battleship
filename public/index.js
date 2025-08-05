// public/index.js
import GameController from "../src/modules/GameController.js";
import Ship from "../src/modules/Ship.js";

/* ===== Globals ===== */
let game;
let playerGrid, opponentGrid, statusText;
let isPlacementPhase = true;
let direction = "horizontal";
const BOARD_SIZE = 10;
const SHIPS_TO_PLACE = [2, 3, 4]; // example ship lengths
let shipsToPlace = [2, 3];
let aiAvailableMoves = [];
let currentPreviewCoords = [];
let hoveredCell = null; // [x,y] of hovered player cell
let aiTargetQueue = [];

/* ===== Init ===== */
init();

function init() {
  // create new game controller
  game = GameController();

  // reset state
  isPlacementPhase = true;
  direction = "horizontal";
  aiAvailableMoves = [];
  currentPreviewCoords = [];
  hoveredCell = null;
  shipsToPlace = [...SHIPS_TO_PLACE];

  // grab DOM nodes
  playerGrid = document.querySelector("#player-board .grid");
  opponentGrid = document.querySelector("#opponent-board .grid");
  statusText = document.getElementById("status");

  // clear grids and status
  playerGrid.innerHTML = "";
  opponentGrid.innerHTML = "";
  statusText.textContent = "Place your ships";

  // create grids
  createBoards();

  // Place opponent ships randomly (attempt until valid)
  placeOpponentShipsRandomly([...shipsToPlace]); // clone array so both sides use same config

  // fill AI available moves
  for (let y = 0; y < BOARD_SIZE; y++)
    for (let x = 0; x < BOARD_SIZE; x++) aiAvailableMoves.push([x, y]);

  // hook rotate & restart (using onclick overwrites any previous handler so it's safe on re-init)
  document.getElementById("rotate-btn").onclick = () => {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
    statusText.textContent = `Direction: ${direction}`;
    // refresh preview if hovering
    if (hoveredCell && isPlacementPhase) {
      clearPreview();
      const [hx, hy] = hoveredCell;
      showPreview(hx, hy);
    }
  };

  document.getElementById("restart-btn").onclick = () => {
    init();
  };
}

/* ===== Create boards ===== */
function createBoards() {
  // Player grid
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Hover preview handlers
      cell.addEventListener("mouseenter", () => {
        hoveredCell = [x, y];
        if (isPlacementPhase) showPreview(x, y);
      });
      cell.addEventListener("mouseleave", () => {
        hoveredCell = null;
        if (isPlacementPhase) clearPreview();
      });

      // Click to place ship during placement phase
      cell.addEventListener("click", () => {
        if (isPlacementPhase) {
          placeShipAt(x, y);
          clearPreview();
        }
      });

      playerGrid.appendChild(cell);
    }
  }

  // Opponent grid
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Click to attack only after placement phase ends
      cell.addEventListener("click", () => {
        if (!isPlacementPhase) playerAttack(x, y, cell);
      });

      opponentGrid.appendChild(cell);
    }
  }
}

/* ===== Placement helpers ===== */
function showPreview(x, y) {
  // preview only during placement and when there's a ship to place
  if (!isPlacementPhase || shipsToPlace.length === 0) return;

  const length = shipsToPlace[0];
  const coords = calculateCoordinates(x, y, length, direction);

  // check out-of-bounds
  const outOfBounds = coords.some(
    ([cx, cy]) => cx < 0 || cy < 0 || cx >= BOARD_SIZE || cy >= BOARD_SIZE
  );

  // check overlap with existing placed ships
  const overlap = game
    .getCurrentPlayer()
    .gameboard.ships.some(({ coordinates }) =>
      coordinates.some(([sx, sy]) =>
        coords.some(([cx, cy]) => cx === sx && cy === sy)
      )
    );

  const valid = !outOfBounds && !overlap;

  // clear previous preview
  clearPreview();

  // apply preview classes and remember coords for clearing later
  coords.forEach(([cx, cy]) => {
    const idx = cy * BOARD_SIZE + cx;
    const cell = playerGrid.children[idx];
    if (!cell) return;
    cell.classList.add(valid ? "preview-valid" : "preview-invalid");
    currentPreviewCoords.push([cx, cy]);
  });
}

function clearPreview() {
  if (!currentPreviewCoords.length) return;
  currentPreviewCoords.forEach(([cx, cy]) => {
    const idx = cy * BOARD_SIZE + cx;
    const cell = playerGrid.children[idx];
    if (!cell) return;
    cell.classList.remove("preview-valid", "preview-invalid");
  });
  currentPreviewCoords = [];
}

/* ===== Ship placement ===== */
function placeShipAt(x, y) {
  if (shipsToPlace.length === 0) return;
  const length = shipsToPlace[0];
  const newShip = Ship(length);
  const coords = calculateCoordinates(x, y, length, direction);

  // Bounds check
  if (
    coords.some(
      ([cx, cy]) => cx < 0 || cy < 0 || cx >= BOARD_SIZE || cy >= BOARD_SIZE
    )
  ) {
    statusText.textContent = "Ship out of bounds!";
    return;
  }

  // Overlap check
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

  // Place on gameboard
  game.getCurrentPlayer().gameboard.placeShip(newShip, x, y, direction);

  // Visuals: mark each cell as ship and disable pointer events for placed cells
  coords.forEach(([cx, cy]) => {
    const idx = cy * BOARD_SIZE + cx;
    const cell = playerGrid.children[idx];
    if (!cell) return;
    cell.classList.add("ship");
    cell.style.pointerEvents = "none"; // avoid hover/preview on placed tiles
  });

  // Remove placed ship from the list
  shipsToPlace.shift();

  // clear any preview highlights
  clearPreview();

  if (shipsToPlace.length === 0) {
    isPlacementPhase = false;
    statusText.textContent = "All ships placed! Your turn to attack!";
  } else {
    statusText.textContent = `Place ship of length ${shipsToPlace[0]}`;
  }
}

/* ===== Player attack flow ===== */
function playerAttack(x, y, cell) {
  if (game.isGameOver()) return;

  // prevent duplicate attack
  if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
    statusText.textContent = "Already attacked there!";
    return;
  }

  // perform attack through GameController
  const result = game.attack(x, y);

  // handle results
  if (result === "hit") {
    cell.classList.add("hit");
    statusText.textContent = "Hit! Opponent's turn...";
  } else if (result === "miss") {
    cell.classList.add("miss");
    statusText.textContent = "Miss! Opponent's turn...";
  } else if (typeof result === "string" && result.startsWith("Game over")) {
    // final attack that won the game
    cell.classList.add("hit");
    statusText.textContent = result;
    return; // stop further actions
  }

  // if game ended as side-effect (should be covered above), stop
  if (game.isGameOver()) return;

  // AI will act after a short delay
  setTimeout(() => {
    aiTurn();
  }, 500);
}

function aiTurn() {
  if (game.isGameOver()) return;

  let x, y;

  if (aiTargetQueue.length > 0) {
    // Take next target from queue
    [x, y] = aiTargetQueue.shift();

    // If cell already attacked, skip and try again recursively
    const idx = y * BOARD_SIZE + x;
    const cell = playerGrid.children[idx];
    if (
      !cell ||
      cell.classList.contains("hit") ||
      cell.classList.contains("miss")
    ) {
      // Try again with next in queue or fallback to random
      aiTurn();
      return;
    }
  } else {
    // No targets in queue, pick random move
    if (aiAvailableMoves.length === 0) return;
    const idx = Math.floor(Math.random() * aiAvailableMoves.length);
    [x, y] = aiAvailableMoves.splice(idx, 1)[0];
  }

  // Perform attack
  const result = game.attack(x, y);

  // Mark cell on player's grid
  const cellIdx = y * BOARD_SIZE + x;
  const cell = playerGrid.children[cellIdx];
  if (!cell) return;

  if (result === "hit") {
    cell.classList.add("hit");
    statusText.textContent = "Opponent hit your ship!";

    // Add adjacent cells to target queue (within bounds and not attacked)
    const adjacent = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    adjacent.forEach(([ax, ay]) => {
      if (ax >= 0 && ax < BOARD_SIZE && ay >= 0 && ay < BOARD_SIZE) {
        const adjIdx = ay * BOARD_SIZE + ax;
        const adjCell = playerGrid.children[adjIdx];
        // Only add if not attacked and not already in queue
        if (
          adjCell &&
          !adjCell.classList.contains("hit") &&
          !adjCell.classList.contains("miss") &&
          !aiTargetQueue.some(([tx, ty]) => tx === ax && ty === ay)
        ) {
          aiTargetQueue.push([ax, ay]);
        }
      }
    });
  } else if (result === "miss") {
    cell.classList.add("miss");
    statusText.textContent = "Opponent missed!";
  } else if (typeof result === "string" && result.startsWith("Game over")) {
    cell.classList.add("hit");
    statusText.textContent = result;
  }
}

/* ===== Helper utilities ===== */
function calculateCoordinates(x, y, length, dir) {
  const coords = [];
  for (let i = 0; i < length; i++) {
    if (dir === "horizontal") coords.push([x + i, y]);
    else coords.push([x, y + i]);
  }
  return coords;
}

/* ===== Place opponent ships randomly but ensure valid placement ===== */
function placeOpponentShipsRandomly(lengths) {
  // place each ship length by trying random positions until it fits
  lengths.forEach((len) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
      const maxX = dir === "horizontal" ? BOARD_SIZE - len : BOARD_SIZE - 1;
      const maxY = dir === "vertical" ? BOARD_SIZE - len : BOARD_SIZE - 1;
      const x = Math.floor(Math.random() * (maxX + 1));
      const y = Math.floor(Math.random() * (maxY + 1));

      const coords = calculateCoordinates(x, y, len, dir);

      // check overlap with existing opponent ships
      const overlap = game
        .getOpponent()
        .gameboard.ships.some(({ coordinates }) =>
          coordinates.some(([sx, sy]) =>
            coords.some(([cx, cy]) => cx === sx && cy === sy)
          )
        );
      if (overlap) continue;

      game.getOpponent().gameboard.placeShip(Ship(len), x, y, dir);
      placed = true;
    }
    if (!placed) {
      console.warn("Failed to place opponent ship of length", len);
    }
  });
}
