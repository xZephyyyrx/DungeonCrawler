import MapGenerator from './map_generator.js';

// Temporary Parser function to visualize changes
import ParseGrid from './old_version/parser.js';

const generator = new MapGenerator();

// Defines the size of the map
const numberOfRows = 10;
const numberOfColumns = 10;

const gameboard = generator.generateMaze(numberOfRows, numberOfColumns);

ParseGrid(gameboard);
