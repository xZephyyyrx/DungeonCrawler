import Player from './player.js';
import Vector from './vector.js';

export default class Game {
  #mapGenerator;
  #grid;
  #player;
  #directionalInputs;

  constructor(mapGenerator, directionalInputs) {
    this.#mapGenerator = mapGenerator;
    this.#directionalInputs = directionalInputs;
  }

  // Basic initialize function to create a maze 
  // and place a player in it for testing purposes
  start() {
    const numberOfRows = 10;
    const numberOfColumns = 10;

    this.#grid = this.#mapGenerator.generateMaze(numberOfRows, numberOfColumns);
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

  // For now, simply moves the player in the given direction
  readInput(input) {
    this.movePlayer(input);
  }

  // Moves the player in the passed direction if the path is clear 
  movePlayer(direction) {
    if (this.isPathClear(direction)) {

      switch (direction) {
        case this.#directionalInputs.UP:
          this.#player.pos.y--;
          break;
        case this.#directionalInputs.RIGHT:
          this.#player.pos.x++;
          break;
        case this.#directionalInputs.DOWN:
          this.#player.pos.y++;
          break;
        case this.#directionalInputs.LEFT:
          this.#player.pos.x--;
          break;
        default:
          break;
      }
    }
  }

  // Returns true if no wall is present on the new target
  // player tile
  isPathClear(direction) {
    let x = this.#player.pos.x;
    let y = this.#player.pos.y;

    switch (direction) {
      case this.#directionalInputs.UP:
        y--;
        break;
      case this.#directionalInputs.RIGHT:
        x++;
        break;
      case this.#directionalInputs.DOWN:
        y++;
        break;
      case this.#directionalInputs.LEFT:
        x--;
        break;
      default:
        break;
    }

    return !this.#grid[y][x].isWall;
  }

  getPlayerPos() {
    return this.#player.pos;
  }

  get grid() {
    return this.#grid;
  }
}
