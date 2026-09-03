export default class Controller {
  #game;
  #view;
  #input;
  #directionalInputs;
  #targetFramesPerSecond = 120;
  #coreGameLoop;

  constructor(game, view, input, directionalInputs) {
    this.#game = game;
    this.#view = view;
    this.#input = input;
    this.#input.startInputReading();
    this.#directionalInputs = directionalInputs;
  }

  // Basic function to initialize the game map and player
  // and render the game
  run() {
    this.#game.start();
    this.fullRender();
    this.#coreGameLoop = setInterval(() => {
      this.runGame();
    }, 1000 / this.#targetFramesPerSecond);
  }

  // Clears the view, renders the map, and renders the player
  fullRender() {
    this.#view.prepareView();
    this.#view.renderMap(
      this.#game.grid
    );

    this.renderPlayer();
  }

  // Updates the player position in the view but does not
  // redraw the whole map
  renderPlayer() {
    this.#view.renderPlayer(
      this.#game.getPlayerPos()
    )
  }

  // When a directional input is passed, clears the player render
  // from the terminal and redraws the floor tile below
  clearPlayerRender() {
    this.#view.clearPlayerTile(
      this.#game.getPlayerPos()
    )
  }

  // Core game loop
  runGame() {
    this.readInput();
    this.renderPlayer();
  }

  // If the quit key - "q" has been pressed, ends the game
  // otherwise passes the pressed key to the game loop
  readInput() {
    const key = this.#input.getInput();

    if (key === "q") {
      this.closeGame();
    } else if (
      Object.values(this.#directionalInputs).includes(key)
    ) {
      this.clearPlayerRender();
      this.#game.readInput(key);
    }
  }

  // Returns the view to it's initial state and
  // ends the game loop
  closeGame() {
    clearInterval(this.#coreGameLoop);
    this.#input.endInputReading();
    this.#view.closeView();
  }
}
