export default function ParseGrid(grid) {
  const block = "█";

  const gridRows = grid.length;
  const gridColumns = grid[0].length;
  for (let y = 0; y < gridRows; y++) {
    let string = "";
    for (let x = 0; x < gridColumns; x++) {
      if (grid[y][x] === "x") {
        string += block;
      } else {
        string += " ";
      }
    }
    console.log(string);
  }
}
