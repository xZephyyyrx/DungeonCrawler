import MapGenerator from './map_generator.js';
import View from './view.js';
import Game from './game.js';

const generator = new MapGenerator();
const view = new View();

// Defines the size of the map
const numberOfRows = 20;
const numberOfColumns = 20;

// Generates the maze
const gameboard = generator.generateMaze(numberOfRows, numberOfColumns);

// Starts the basic game
const currentGame = new Game(gameboard);

// Output rendering
console.clear();
view.renderMap(gameboard);
view.renderPlayer(currentGame.getPlayerPos());
view.hideCursor();

// Temporary placeholder gameloop to prevent process
// ending abruptly
while (numberOfRows > 0) {}

