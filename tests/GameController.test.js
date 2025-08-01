import GameController from "../src/modules/GameController.js";
import Ship from "../src/modules/Ship.js";

test("GameController alternates turns and ends game when all ships sunk", () => {
  const game = GameController();

  game.getOpponent().gameboard.placeShip(Ship(2), 0, 0, "horizontal");

  // Player 1 attacks
  let result = game.attack(0, 0);
  expect(result).toBe("hit");
  expect(game.isGameOver()).toBe(false);

  // Player 2 attacks, sinks last ship
  result = game.attack(1, 0);
  expect(result).toBe("Game over - Player 2 wins!");
  expect(game.isGameOver()).toBe(true);
});
