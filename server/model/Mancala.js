const HOLES = 14;
const P1_DEST = HOLES / 2;
const P2_DEST = 0;
const START_STONES = 4;
const P1 = 0;
const P2 = 1;
const NOBODY = -1;

function round(i) {
  return i % HOLES;
}

function next(i) {
  return round(i + 1);
}

module.exports = class Mancala {
  constructor() {
    this.holes = [];
    for (let i = 0; i < HOLES; i++) {
      this.holes[i] = START_STONES;
    }
    this.holes[P1_DEST] = 0;
    this.holes[P2_DEST] = 0;
    this.turn = P1;
    this.won = NOBODY;
  }

  move(hole) {
    if (this.won === NOBODY) {
      if (this.belongsTo(hole, this.turn)) {
        let hit = [];
        let stones = this.holes[hole];
        let counter = hole;
        this.holes[hole] = 0;
        while (stones > 0) {
          counter = next(counter);
          hit.push(counter);
          this.holes[counter]++;
          stones--;
        }
        if (this.isEmpty(this.turn))
          this.won = this.turn;
        else if (!this.isDestHole(counter))
          this.switchTurn();
        return hit;
      } else throw new Error("That hole does not belong to the current player.");
    } else throw new Error("The game is over!");
  }

  whoOwns(hole) {
    if (hole < P1_DEST && hole > 0)
      return P1;
    else if (hole < HOLES && hole > P1_DEST)
      return P2;
    else return NOBODY;
  }

  belongsTo(hole, player) {
    return player === this.whoOwns(hole)
  }

  isDestHole(hole) {
    return hole === P1_DEST || hole === P2_DEST;
  }

  switchTurn() {
    this.turn = this.turn === P1 ? P2 : P1;
  }

  isEmpty(player) {
    let hole = round(((player === P1) ? P2_DEST : P1_DEST) + 1);
    while (this.belongsTo(hole, player)) {
      if (this.holes[hole] != 0) return false;
      hole = next(hole);
    }
    return true;
  }
}
