import Gameboard from "./Gameboard.js";

export default function Player(name) {
  const gameboard = Gameboard();

  function attack(x, y, enemyGameboard) {
    return enemyGameboard.receiveAttack(x, y); // return the result!
  }

  return { name, gameboard, attack };
}
