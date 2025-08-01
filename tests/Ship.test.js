import Ship from "../src/modules/Ship.js";

test("Ship gets hit", () => {
  const ship = Ship(3);
  ship.hit();
  expect(ship.getHits()).toBe(1);
});

test("Ship is sunk after enough hits", () => {
  const ship = Ship(2);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});
