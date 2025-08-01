import Player from "./Player.js";

const GameController = (playerOne = Player(), playerTwo = Player()) => {
  let currentPlayer = playerOne;
  let opponent = playerTwo;
  let gameOver = false;

  const switchTurns = () => {
    [currentPlayer, opponent] = [opponent, currentPlayer];
  };

  const attack = (x, y) => {
    if (gameOver) {
      return "Game over";
    }

    const hitResult = opponent.gameboard.receiveAttack(x, y);

    const allSunk = opponent.gameboard.allShipsSunk();

    if (allSunk) {
      gameOver = true;
      const winner = currentPlayer === playerOne ? "Player 1" : "Player 2";
      const msg = `Game over - ${winner} wins!`;
      return msg;
    }

    switchTurns();

    return hitResult;
  };

  const getCurrentPlayer = () => currentPlayer;
  const getOpponent = () => opponent;
  const isGameOver = () => gameOver;

  return {
    attack,
    switchTurns,
    getCurrentPlayer,
    getOpponent,
    isGameOver,
  };
};

export default GameController;
