import Player from './player.js';
import Vector from './vector.js';

export default class Game {
  #grid;
  #player;

  constructor(grid) {
    this.#grid = grid;
    this.#player = this.createNewPlayer();
  }

  // Finds the entrance tile in the maze and creates a new
  // player at that position
  createNewPlayer() {
    const rows = this.#grid.length;
    const columns = this.#grid[0].length;
    let player;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (this.#grid[y][x].isEntrance) {
          player = new Player(new Vector(x, y));
        }
      }
    }
    return player;
  }

  getPlayerPos() {
    return this.#player.pos;
  }
}
