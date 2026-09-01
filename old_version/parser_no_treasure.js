export default function ParseGrid(grid) {
  const block = "█";

  // ANSI Escape Codes for colouring
  const goldText = "\x1b[93m";
  const wallColor = "\x1b[35m";
  const plainText = "\x1b[0m";
  const floorColor = "\x1b[30m";
  const entranceColor = "\x1b[0m";
  const exitColor = "\x1b[0m";

  const gridRows = grid.length;
  const gridColumns = grid[0].length;
  for (let y = 0; y < gridRows; y++) {
    let string = "";
    for (let x = 0; x < gridColumns; x++) {
      if (grid[y][x].isEntrance) {
        string += entranceColor;
        string += block;
      } else if (grid[y][x].isExit) {
        string += exitColor;
        string += block;
      } else if (grid[y][x].isDeadEnd) {
        string += floorColor;
        string += block;
      } else if (grid[y][x].isWall) {
          string += wallColor
          string += block;
      } else {
        string += floorColor;
        string += block;
      }
      string += plainText;
    }
    console.log(string);
  }
}
