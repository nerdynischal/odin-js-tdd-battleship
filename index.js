// public/index.js
import GameController from "./src/modules/GameController.js";
import UI from "./src/ui/ui.js";
import Placement from "./src/ui/placement.js";
import AI from "./src/ui/ai.js";
import Input from "./src/ui/input.js";

const BOARD_SIZE = 10;
const SHIP_LENGTHS = [2, 3, 4];

let game, ai, placement, input;

function initializeGame() {
  game = GameController(); // core game logic
  UI.createGrids(BOARD_SIZE); // render grids
  ai = AI(BOARD_SIZE); // AI module
  ai.init();
  placement = Placement({
    game,
    ui: UI,
    boardSize: BOARD_SIZE,
    ships: [...SHIP_LENGTHS],
  });
  input = Input({ game, ui: UI, placement, ai, boardSize: BOARD_SIZE });

  // When placement completes, ask placement to place opponent ships and enable attacks
  placement.onAllPlaced(() => {
    UI.setStatus("All ships placed! Your turn to attack.");
    placement.placeOpponentRandom([...SHIP_LENGTHS]); // auto-place opponent ships
    input.enableAttacks(); // start accepting attack clicks
  });

  // Set initial status
  UI.setStatus(`Place ship of length ${SHIP_LENGTHS[0]}`);
}

// Initialize the game
initializeGame();

// Add restart button functionality
document.getElementById("restart-btn").addEventListener("click", () => {
  initializeGame();
});

// Add rotate button functionality (if you want it to work)
document.getElementById("rotate-btn").addEventListener("click", () => {
  if (placement) {
    placement.onRotate();
  }
});

// expose for debugging if you want
window.__game = { game, ui: UI, placement, ai, input };
