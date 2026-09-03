import MapGenerator from './map_generator.js';
import View from './term_view.js';
import Game from './game.js';
import Controller from './controller.js';
import Input from './term_input.js';

// Enum to allow consistent directional input communication
// between classes, will find a cleaner way to implement this at
// some point
const directionalInputs = Object.freeze({
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left"
})

const generator = new MapGenerator();
const game = new Game(generator, directionalInputs);
const view = new View();
const input = new Input(directionalInputs);

const controller = new Controller(game, view, input, directionalInputs);

controller.run();
