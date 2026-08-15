export default class Node {
  constructor(x, y, previousNode = null) {
    this.x = x;
    this.y = y;
    this.possiblePaths = ["up", "right", "down", "left"];
    this.previousNode = previousNode;
  }
}
