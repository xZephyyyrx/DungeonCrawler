export default class Input {
  #directionalInputs;
  #key;

  constructor(directionalInputs) {
    this.#directionalInputs = directionalInputs;
  }

  // Begins reading raw key inputs from the terminal
  // If a key is pressed by the player, it is assigned
  // to the #key variable and replaced when another key is pressed
  startInputReading() {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (key) => {
      if (key !== null) {
        this.#key = key.toString();
      }
    });
  }

  // Clean up process to allow the terminal to read full
  // inputs once the game loop has concluded
  endInputReading() {
    process.stdin.setRawMode(false);
  }

  // Returns the most recently pressed key then sets this.#key to undefined.
  // This is done to provide only a single instance of each key press
  getInput() {
    const key = this.#key;
    this.#key = undefined;

    switch (key) {
      case "8":
        return this.#directionalInputs.UP; 
        break;
      case "6":
        return this.#directionalInputs.RIGHT;
        break;
      case "2":
        return this.#directionalInputs.DOWN;
        break;
      case "4":
        return this.#directionalInputs.LEFT;
        break;
      default:
        return key;
        break;
    }
  }
}
