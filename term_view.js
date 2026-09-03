export default class View {
  // ANSI escape characters for terminal color output
  // Darker varients of each color are specified with a "D" prefix
  #colors = Object.freeze({
    DEFAULT: "\x1b[0m",
    DBLACK: "\x1b[30m",
    BLACK: "\x1b[90m",
    DRED: "\x1b[31m",
    RED: "\x1b[91m",
    DGREEN: "\x1b[32m",
    GREEN: "\x1b[92m",
    DYELLOW: "\x1b[33m",
    YELLOW: "\x1b[93m",
    DBLUE: "\x1b[34m",
    BLUE: "\x1b[94m",
    DMAGENTA: "\x1b[35m",
    MAGENTA: "\x1b[95m",
    DCYAN: "\x1b[36m",
    CYAN: "\x1b[96m",
    DWHITE: "\x1b[37m",
    WHITE: "\x1b[97m"
  });

  // Clears the terminal and hides the cursor from view
  prepareView() {
    console.clear();
    process.stdout.write("\x1b[?25l");
  }

  // Clean up function to make the terminal cursor visible again
  // Called when the game loop has concluded
  closeView() {
    process.stdout.write("\x1b[?25h");
  }

  // Renders the map as a series of block characters denoting the 
  // maze walls
  renderMap(grid) {
    // Block char for rendering walls
    const blockChar = "█";
    const exitColor = this.#colors.WHITE;
    const wallColor = this.#colors.DMAGENTA;
    const floorColor = this.#colors.DBLACK;

    const rows = grid.length;
    const columns = grid[0].length;

    // Draws a line of characters to the terminal for each
    // row of the maze
    for (let y = 0; y < rows; y++) {

      let string = "";

      for (let x = 0; x < columns; x++) {
        const tile = grid[y][x];

        // Changes the output color based on the tile type
        if (tile.isExit) {
          string += exitColor;
        } else if (tile.isWall) {
          string += wallColor;
        } else {
          string += floorColor;
        }

        string += blockChar;

        // Resets the color to the default terminal text color
        // for any future terminal output
        string += this.#colors.DEFAULT;
      }
      console.log(string);
    }
  }

  // Renders the player
  renderPlayer(pos) {
    // Saves the terminal cursor position
    process.stdout.write("\x1b7");

    // Sets the cursor position to the player's position
    process.stdout.write(`\x1b[${pos.y + 1};${pos.x + 1}H`);

    // Draws the player
    process.stdout.write("@");

    // Loads the initial cursor position
    process.stdout.write("\x1b8")
  }

  // Used to clear the player from the view and redraw
  // the tile they were standing on. Called whenever a 
  // directional input is made by the player
  clearPlayerTile(pos) {
    const blockChar = "█";
    const floorColor = this.#colors.DBLACK;

    process.stdout.write("\x1b7");

    process.stdout.write(`\x1b[${pos.y + 1};${pos.x + 1}H`);

    process.stdout.write(floorColor);

    process.stdout.write(blockChar);

    process.stdout.write("\x1b8");
  }

  // Hides the terminal's flashing cursor for MAXIMUM immersion
  hideCursor() {
    process.stdout.write("\x1b[?25l");
  }
}
