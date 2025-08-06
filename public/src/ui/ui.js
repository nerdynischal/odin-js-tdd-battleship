export default (function UI() {
  let playerGridEl, opponentGridEl, statusEl;
  let boardSize = 10;

  function createGrids(size = 10) {
    boardSize = size;
    playerGridEl = document.querySelector("#player-board .grid");
    opponentGridEl = document.querySelector("#opponent-board .grid");
    statusEl = document.querySelector("#status");

    playerGridEl.innerHTML = "";
    opponentGridEl.innerHTML = "";

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pCell = document.createElement("div");
        pCell.className = "cell";
        pCell.dataset.x = x;
        pCell.dataset.y = y;
        playerGridEl.appendChild(pCell);

        const oCell = document.createElement("div");
        oCell.className = "cell";
        oCell.dataset.x = x;
        oCell.dataset.y = y;
        opponentGridEl.appendChild(oCell);
      }
    }
  }

  function getPlayerCell(x, y) {
    return playerGridEl.children[y * boardSize + x];
  }
  function getOpponentCell(x, y) {
    return opponentGridEl.children[y * boardSize + x];
  }

  function markPlayerShip(coords) {
    coords.forEach(([x, y]) => {
      const c = getPlayerCell(x, y);
      if (c) {
        c.classList.add("ship");
        c.style.pointerEvents = "none";
      }
    });
  }

  function markOpponentHit(x, y) {
    const c = getOpponentCell(x, y);
    if (c) c.classList.add("hit");
  }
  function markOpponentMiss(x, y) {
    const c = getOpponentCell(x, y);
    if (c) c.classList.add("miss");
  }
  function markPlayerHit(x, y) {
    console.log(`markPlayerHit called with (${x}, ${y})`);
    const c = getPlayerCell(x, y);
    console.log(`Player cell found:`, c);
    if (c) {
      c.classList.add("hit");
      console.log(`Added 'hit' class to player cell (${x}, ${y})`);
    }
  }

  function markPlayerMiss(x, y) {
    console.log(`markPlayerMiss called with (${x}, ${y})`);
    const c = getPlayerCell(x, y);
    console.log(`Player cell found:`, c);
    if (c) {
      c.classList.add("miss");
      console.log(`Added 'miss' class to player cell (${x}, ${y})`);
    }
  }

  // preview helpers for placement
  function addPreview(x, y, cls = "preview-valid") {
    const c = getPlayerCell(x, y);
    if (c) c.classList.add(cls);
  }
  function removePreview(x, y) {
    const c = getPlayerCell(x, y);
    if (c) c.classList.remove("preview-valid", "preview-invalid");
  }
  function clearAllPreviews() {
    playerGridEl
      .querySelectorAll(".preview-valid, .preview-invalid")
      .forEach((el) => el.classList.remove("preview-valid", "preview-invalid"));
  }

  // attach handlers (input module will call these)
  function addPlayerHoverHandlers(onEnter, onLeave, onClick) {
    Array.from(playerGridEl.children).forEach((cell) => {
      const x = Number(cell.dataset.x),
        y = Number(cell.dataset.y);
      cell.onmouseenter = () => onEnter(x, y);
      cell.onmouseleave = () => onLeave();
      cell.onclick = () => onClick(x, y, cell);
    });
  }

  function addOpponentClickHandler(onClick) {
    Array.from(opponentGridEl.children).forEach((cell) => {
      const x = Number(cell.dataset.x),
        y = Number(cell.dataset.y);
      cell.onclick = () => onClick(x, y, cell);
    });
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  return {
    createGrids,
    getPlayerCell,
    getOpponentCell,
    markPlayerShip,
    markOpponentHit,
    markOpponentMiss,
    markPlayerHit,
    markPlayerMiss,
    addPreview,
    removePreview,
    clearAllPreviews,
    addPlayerHoverHandlers,
    addOpponentClickHandler,
    setStatus,
  };
})();
