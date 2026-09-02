export default class Player {
  #pos;

  constructor(pos) {
    this.#pos = pos;
  }

  get pos() {
    return this.#pos;
  }

  set pos(newPos) {
    this.#pos = newPos;
  }
}
