import MapGenerator from './map_generator.js';
import View from './view.js';
import Game from './game.js';

const generator = new MapGenerator();
const view = new View();

// Defines the size of the map
const numberOfRows = 15;
const numberOfColumns = 15;

// Used to gauge how many ms a map takes to generate
const genTimeStart = performance.now();

// Generates the maze
const gameboard = generator.generateMaze(numberOfRows, numberOfColumns);

// Used with genTimeStart to time map generation
const getTimeEnd = performance.now();

// Starts the basic game
const currentGame = new Game(gameboard);

// Initial output rendering
console.clear();
view.renderMap(gameboard);
view.renderPlayer(currentGame.getPlayerPos());
view.hideCursor();

// Temporary diagnostics
console.log(`Generation time was ${(getTimeEnd - genTimeStart).toFixed(2)}ms`)
console.log(`Generated a map ${numberOfRows} x ${numberOfColumns} tiles (${numberOfColumns * numberOfRows} total)`)

// Testing fetching user input
process.stdin.setRawMode(true);
process.stdin.on("data", (key) => {
  console.log(`You have pressed ${key}`);
  if (key == "q") {
    process.stdin.setRawMode(false);
  }
}); 
