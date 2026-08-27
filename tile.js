export default class Tile {
  
  constructor(isWall, pos = undefined, isDeadEnd = false) {
    this.pos = pos;
    this.isWall = isWall;
    this.isDeadEnd = isDeadEnd;
    this.isEntrance = false;
    this.isExit = false;
    this.isTreasure = false;
  }
}
