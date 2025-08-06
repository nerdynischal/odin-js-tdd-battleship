export default function Input({ game, ui, placement, ai, boardSize = 10 }) {
  let attacksEnabled = false;

  // Player placement hover/click wiring
  ui.addPlayerHoverHandlers(
    (x, y) => placement.showPreview(x, y),
    () => placement.clearPreview(),
    (x, y) => {
      const placed = placement.placeAt(x, y);
      if (
        placed &&
        !attacksEnabled &&
        game.getCurrentPlayer() &&
        game.getCurrentPlayer().gameboard.ships.length === 0
      ) {
        // nothing needed; placement manages onAllPlaced
      }
    }
  );

  // opponent clicks / attacks
  ui.addOpponentClickHandler(async (x, y, cell) => {
    if (!attacksEnabled) {
      ui.setStatus("Finish placing ships first.");
      return;
    }
    if (game.isGameOver()) return;

    // prevent duplicate clicks
    if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
      ui.setStatus("Already attacked there!");
      return;
    }

    // Player attacks using GameController (which handles turn switching)
    const result = game.attack(x, y);

    // UPDATE UI FIRST - always show the player's move
    if (result === "hit" || result.includes("Game over")) {
      ui.markOpponentHit(x, y);
    } else if (result === "miss") {
      ui.markOpponentMiss(x, y);
    }

    // Check if game ended with player's move
    if (game.isGameOver()) {
      ui.setStatus(result); // Game over message
      return;
    }

    // Set status for ongoing game
    if (result === "hit") {
      ui.setStatus("Hit! Opponent's turn...");
    } else if (result === "miss") {
      ui.setStatus("Miss! Opponent's turn...");
    }

    // Only schedule AI turn if game is not over
    setTimeout(() => {
      let aiMove = ai.getNextMove();
      if (aiMove && !game.isGameOver()) {
        const [ax, ay] = aiMove;

        console.log(`AI attacking at (${ax}, ${ay})`);

        const ares = game.attack(ax, ay);

        console.log(`AI attack result: ${ares}`);

        // UPDATE UI FIRST, before checking game over status
        if (ares === "hit" || ares.includes("Game over")) {
          console.log(`Marking player hit at (${ax}, ${ay})`);
          ui.markPlayerHit(ax, ay);
          if (ares === "hit") {
            ai.enqueueAdjacent(ax, ay);
          }
        } else if (ares === "miss") {
          console.log(`Marking player miss at (${ax}, ${ay})`);
          ui.markPlayerMiss(ax, ay);
        }

        // NOW check if game is over and set status
        if (game.isGameOver()) {
          ui.setStatus(ares);
        } else {
          // Set status for ongoing game
          if (ares === "hit") {
            ui.setStatus("Opponent hit your ship! Your turn.");
          } else if (ares === "miss") {
            ui.setStatus("Opponent missed! Your turn.");
          }
        }
      }
    }, 1000); // 1 second delay
  });

  function enableAttacks() {
    attacksEnabled = true;
  }

  return { enableAttacks };
}
