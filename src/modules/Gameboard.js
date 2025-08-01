import Ship from "./Ship.js";

export default function Gameboard() {
  const ships = [];
  const missedAttacks = [];

  function placeShip(ship, x, y, direction = "horizontal") {
    function calculateCoordinates(x, y, length, direction) {
      const coords = [];
      for (let i = 0; i < length; i++) {
        if (direction === "horizontal") {
          coords.push([x + i, y]);
        } else {
          coords.push([x, y + i]);
        }
      }
      return coords;
    }

    const coordinates = calculateCoordinates(x, y, ship.length, direction);

    ships.push({
      ship: ship,
      coordinates: coordinates,
    });
  }

  const receiveAttack = (x, y) => {
    const hitShip = ships.find(
      ({ coordinates, ship }) =>
        Array.isArray(coordinates) &&
        coordinates.some((coord) => coord[0] === x && coord[1] === y)
    );

    if (hitShip) {
      hitShip.ship.hit();
      return "hit";
    } else {
      missedAttacks.push([x, y]);
      return "miss";
    }
  };

  function allShipsSunk() {
    return ships.every(({ ship }) => ship.isSunk());
  }

  return { ships, missedAttacks, placeShip, receiveAttack, allShipsSunk };
}
