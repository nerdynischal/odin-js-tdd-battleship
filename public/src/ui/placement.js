import Ship from "../../src/modules/Ship.js";

export default function Placement({ game, ui, boardSize = 10, ships = [] }) {
  let remaining = [...ships];
  let direction = "horizontal";
  let previewCoords = [];
  let onAllPlacedCb = () => {};

  function calculate(x, y, len, dir) {
    const coords = [];
    for (let i = 0; i < len; i++) {
      coords.push(dir === "horizontal" ? [x + i, y] : [x, y + i]);
    }
    return coords;
  }

  function showPreview(x, y) {
    ui.clearAllPreviews();
    if (!remaining.length) return;
    const len = remaining[0];
    const coords = calculate(x, y, len, direction);

    const out = coords.some(
      ([cx, cy]) => cx < 0 || cy < 0 || cx >= boardSize || cy >= boardSize
    );
    const overlap = game
      .getCurrentPlayer()
      .gameboard.ships.some(({ coordinates }) =>
        coordinates.some(([sx, sy]) =>
          coords.some(([cx, cy]) => cx === sx && cy === sy)
        )
      );

    const valid = !out && !overlap;
    coords.forEach(([cx, cy]) =>
      ui.addPreview(cx, cy, valid ? "preview-valid" : "preview-invalid")
    );
    previewCoords = coords;
  }

  function clearPreview() {
    ui.clearAllPreviews();
    previewCoords = [];
  }

  function placeAt(x, y) {
    if (!remaining.length) return false;
    const len = remaining[0];
    const coords = calculate(x, y, len, direction);
    // validate bounds
    if (
      coords.some(
        ([cx, cy]) => cx < 0 || cy < 0 || cx >= boardSize || cy >= boardSize
      )
    ) {
      ui.setStatus("Ship out of bounds!");
      return false;
    }
    // overlap
    const overlap = game
      .getCurrentPlayer()
      .gameboard.ships.some(({ coordinates }) =>
        coordinates.some(([sx, sy]) =>
          coords.some(([cx, cy]) => cx === sx && cy === sy)
        )
      );
    if (overlap) {
      ui.setStatus("Cannot overlap ships!");
      return false;
    }

    // place gameboard ship
    game.getCurrentPlayer().gameboard.placeShip(Ship(len), x, y, direction);
    ui.markPlayerShip(coords);
    remaining.shift();
    clearPreview();

    if (remaining.length === 0) {
      onAllPlacedCb();
    } else {
      ui.setStatus(`Place ship of length ${remaining[0]}`);
    }
    return true;
  }

  function onRotate() {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
    if (previewCoords.length) {
      // refresh preview (use first preview cell as hovered)
      const [fx, fy] = previewCoords[0];
      clearPreview();
      showPreview(fx, fy);
    }
  }

  function onAllPlaced(cb) {
    onAllPlacedCb = cb;
  }

  function placeOpponentRandom(lengths) {
    // place ships for opponent ensuring no overlap
    lengths.forEach((len) => {
      let placed = false,
        attempts = 0;
      while (!placed && attempts++ < 500) {
        const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
        const maxX = dir === "horizontal" ? boardSize - len : boardSize - 1;
        const maxY = dir === "vertical" ? boardSize - len : boardSize - 1;
        const x = Math.floor(Math.random() * (maxX + 1));
        const y = Math.floor(Math.random() * (maxY + 1));
        const coords = calculate(x, y, len, dir);

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
      if (!placed) console.warn("Could not place opponent ship length", len);
    });
  }

  return {
    showPreview,
    clearPreview,
    placeAt,
    onRotate,
    onAllPlaced,
    placeOpponentRandom,
  };
}
