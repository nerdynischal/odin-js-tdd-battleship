import Player from "../src/modules/Player.js";
import Ship from "../src/modules/Ship.js";

test("Player can attack enemy board", () => {
  const player = Player();
  const enemy = Player();
  enemy.gameboard.placeShip(Ship(1), 0, 0, "horizontal");
  player.attack(0, 0, enemy.gameboard);
  expect(enemy.gameboard.ships[0].ship.getHits()).toBe(1);
});
