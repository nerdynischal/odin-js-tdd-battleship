import Gameboard from "../src/modules/Gameboard.js";
import Ship from "../src/modules/Ship.js";

test("Gameboard can place ship", () => {
  const board = Gameboard();
  board.placeShip(Ship(2), 0, 0, "horizontal");
  expect(board.ships.length).toBe(1);
});

test("receiveAttack hits ship", () => {
  const board = Gameboard();
  board.placeShip(Ship(1), 0, 0, "horizontal");
  board.receiveAttack(0, 0);
  expect(board.ships[0].ship.getHits()).toBe(1);
});

test("receiveAttack records missed shot", () => {
  const board = Gameboard();
  board.receiveAttack(5, 5);
  expect(board.missedAttacks).toContainEqual([5, 5]);
});
