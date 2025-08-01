// src/modules/Ship.js

export default function Ship(length) {
  let hits = 0;

  function hit() {
    hits++;
  }

  function isSunk() {
    return hits >= length;
  }

  function getHits() {
    return hits;
  }

  return { length, hit, isSunk, getHits };
}
